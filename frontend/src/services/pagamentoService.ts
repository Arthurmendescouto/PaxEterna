import type {
  Pagamento,
  PagamentoAtualizacao,
  PagamentoFormulario,
  TipoPagamento,
  VinculoPagamento,
} from '../types/pagamento'

const API_URL = 'http://localhost:3001/api'

type PagamentoBackend = {
  id_pagamento: number
  tipo: TipoPagamento
  valor: string
  forma_pagamento: Pagamento['formaPagamento']
  status: Pagamento['status']
  data_pagamento: string | null
  id_compra: number | null
  id_contrato: number | null
  cpf: string | null
  nome: string | null
}

type VinculoPagamentoBackend = {
  id: number
  valor: string
  data_inicio: string
  data_termino: string | null
}

function normalizarPagamento(pagamento: PagamentoBackend): Pagamento {
  return {
    id: pagamento.id_pagamento,
    tipo: pagamento.tipo,
    valor: Number(pagamento.valor),
    formaPagamento: pagamento.forma_pagamento,
    status: pagamento.status,
    dataPagamento: pagamento.data_pagamento,
    idCompra: pagamento.id_compra,
    idContrato: pagamento.id_contrato,
    cpf: pagamento.cpf,
    nome: pagamento.nome,
  }
}

async function tratarErro(resposta: Response, mensagemPadrao: string): Promise<never> {
  let mensagem = mensagemPadrao
  try {
    const corpo = await resposta.json()
    mensagem = corpo.error ?? corpo.message ?? mensagemPadrao
  } catch {
    // resposta sem JSON: mantém a mensagem padrão
  }
  throw new Error(mensagem)
}

async function requisitar(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch {
    throw new Error('Erro de conexão. Tente novamente mais tarde.')
  }
}

export async function listarPagamentos(): Promise<Pagamento[]> {
  const resposta = await requisitar(`${API_URL}/pagamentos`)
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível carregar os pagamentos.')

  const pagamentos: PagamentoBackend[] = await resposta.json()
  return pagamentos.map(normalizarPagamento)
}

export async function listarVinculosPagamento(
  tipo: TipoPagamento,
  cpf: string
): Promise<VinculoPagamento[]> {
  const parametros = new URLSearchParams({ tipo, cpf })
  const resposta = await requisitar(`${API_URL}/pagamentos/vinculos?${parametros}`)
  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível carregar compras ou contratos.')
  }

  const vinculos: VinculoPagamentoBackend[] = await resposta.json()
  return vinculos.map((vinculo) => ({
    id: vinculo.id,
    valor: Number(vinculo.valor),
    dataInicio: vinculo.data_inicio,
    dataTermino: vinculo.data_termino,
  }))
}

export async function cadastrarPagamento(
  dados: PagamentoFormulario
): Promise<Pagamento> {
  const resposta = await requisitar(`${API_URL}/pagamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível cadastrar o pagamento.')

  const corpo: { pagamento: PagamentoBackend | null } = await resposta.json()
  if (!corpo.pagamento) throw new Error('A API não retornou o pagamento cadastrado.')
  return normalizarPagamento(corpo.pagamento)
}

export async function atualizarPagamento(
  tipo: TipoPagamento,
  id: number,
  dados: PagamentoAtualizacao
): Promise<Pagamento> {
  const resposta = await requisitar(`${API_URL}/pagamentos/${tipo}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível atualizar o pagamento.')

  const corpo: { pagamento: PagamentoBackend | null } = await resposta.json()
  if (!corpo.pagamento) throw new Error('A API não retornou o pagamento atualizado.')
  return normalizarPagamento(corpo.pagamento)
}
