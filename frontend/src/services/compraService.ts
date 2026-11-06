import type { Compra, CompraFormulario, ItemDisponivel } from '../types/compra'

// ⚠️  MOCK ATIVO — para integrar com o backend, troque USAR_MOCK para false.
import { comprasMock, itensDisponiveisMock } from './compraMock'
let _compras: Compra[] = structuredClone(comprasMock)
const USAR_MOCK = true

// ---------------------------------------------------------------------------

const API_URL = 'http://localhost:3001/api'

type CompraBackend = {
  id_compra: number
  fk_Cliente_cpf: string | null
  data_compra: string
  valor_total: string
}

function normalizarCompra(compra: CompraBackend): Compra {
  return {
    id: compra.id_compra,
    cpfCliente: compra.fk_Cliente_cpf,
    dataCompra: compra.data_compra,
    itens: [],
    valorTotal: Number(compra.valor_total),
  }
}

async function tratarErro(resposta: Response, mensagemPadrao: string): Promise<never> {
  let mensagem = mensagemPadrao
  try {
    const corpo = await resposta.json()
    mensagem = corpo.error ?? corpo.message ?? mensagemPadrao
  } catch { /* sem JSON */ }
  throw new Error(mensagem)
}

async function requisitar(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }
}

/**
 * Lista os itens disponíveis para venda.
 */
export async function listarItensDisponiveis(): Promise<ItemDisponivel[]> {
  if (USAR_MOCK) return structuredClone(itensDisponiveisMock)

  // VERSÃO REAL:
  const resposta = await requisitar(`${API_URL}/produtos`)
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível carregar os itens disponíveis.')
  const produtos: { id_produto: number; nome: string; valor: string; quantidade: number }[] = await resposta.json()
  return produtos.map((p) => ({ id: p.id_produto, tipo: 'produto' as const, nome: p.nome, valor: Number(p.valor), estoque: p.quantidade }))
}

/**
 * [RF012] Lista as compras cadastradas.
 */
export async function listarCompras(): Promise<Compra[]> {
  if (USAR_MOCK) return structuredClone(_compras)

  // VERSÃO REAL:
  const resposta = await requisitar(`${API_URL}/compras`)
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível carregar as compras.')
  const compras: CompraBackend[] = await resposta.json()
  return compras.map(normalizarCompra)
}

/**
 * [RF009] Cadastra uma compra.
 */
export async function cadastrarCompra(dados: CompraFormulario): Promise<Compra> {
  if (USAR_MOCK) {
    const itensDisponiveis = structuredClone(itensDisponiveisMock)
    const itens = dados.itens.map((itemPedido) => {
      const item = itensDisponiveis.find((d) => d.id === itemPedido.itemId && d.tipo === itemPedido.tipo)
      if (!item) throw new Error('Preencha todos os campos obrigatórios!')
      if (item.estoque !== null && itemPedido.quantidade > item.estoque)
        throw new Error('Estoque insuficiente para o item selecionado!')
      return { itemId: item.id, tipo: item.tipo, nome: item.nome, quantidade: itemPedido.quantidade, precoUnitario: item.valor, subtotal: item.valor * itemPedido.quantidade }
    })
    const novaCompra: Compra = {
      id: Math.max(0, ..._compras.map((c) => c.id)) + 1,
      cpfCliente: dados.cpfCliente,
      dataCompra: dados.dataCompra,
      itens,
      valorTotal: itens.reduce((t, i) => t + i.subtotal, 0),
    }
    _compras = [novaCompra, ..._compras]
    return structuredClone(novaCompra)
  }

  // VERSÃO REAL:
  const resposta = await requisitar(`${API_URL}/compras`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível cadastrar a compra.')
  const { compra } = await resposta.json()
  return normalizarCompra(compra)
}

/**
 * [RF010] Remove uma compra pelo ID.
 */
export async function removerCompra(id: number): Promise<void> {
  if (USAR_MOCK) {
    const existe = _compras.some((c) => c.id === id)
    if (!existe) throw new Error('Compra não encontrada.')
    _compras = _compras.filter((c) => c.id !== id)
    return
  }

  // VERSÃO REAL:
  const resposta = await requisitar(`${API_URL}/compras/${id}`, { method: 'DELETE' })
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível remover a compra.')
}
