import type { Compra, CompraFormulario, ItemDisponivel, TipoItem } from '../types/compra'

const API_URL = 'http://localhost:3001/api'

/*
 * O backend retorna os campos no formato do banco (`id_compra`,
 * `fk_Cliente_cpf`...) e os valores como texto decimal. Estas funções
 * convertem para o tipo `Compra` usado no frontend.
 */
type ItemCompraBackend = {
  itemId: number
  tipo: TipoItem
  nome: string
  quantidade: number
  precoUnitario: string
}

type CompraBackend = {
  id_compra: number
  fk_Cliente_cpf: string | null
  data_compra: string
  valor_total: string
  itens?: ItemCompraBackend[]
  statusPagamento?: 'pendente' | 'pago'
}

type ProdutoBackend = {
  id_produto: number
  nome: string
  valor: string
  quantidade: number
}

function normalizarCompra(compra: CompraBackend): Compra {
  return {
    id: compra.id_compra,
    cpfCliente: compra.fk_Cliente_cpf,
    dataCompra: compra.data_compra,
    itens: (compra.itens ?? []).map((item) => {
      const precoUnitario = Number(item.precoUnitario)
      return {
        itemId: item.itemId,
        tipo: item.tipo,
        nome: item.nome,
        quantidade: Number(item.quantidade),
        precoUnitario,
        subtotal: precoUnitario * Number(item.quantidade),
      }
    }),
    valorTotal: Number(compra.valor_total),
    statusPagamento: compra.statusPagamento,
  }
}

// Lê a mensagem de erro enviada pelo backend ({ error } ou { message }).
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

/**
 * Lista os itens que podem entrar numa compra.
 * Por enquanto só produtos: o backend ainda não tem rota de serviços.
 */
export async function listarItensDisponiveis(): Promise<ItemDisponivel[]> {
  const resposta = await requisitar(`${API_URL}/produtos`)
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível carregar os itens disponíveis.')

  const produtos: ProdutoBackend[] = await resposta.json()
  return produtos.map((produto) => ({
    id: produto.id_produto,
    tipo: 'produto' as const,
    nome: produto.nome,
    valor: Number(produto.valor),
    estoque: Number(produto.quantidade),
  }))
}

/**
 * [RF012] Lista as compras cadastradas.
 */
export async function listarCompras(): Promise<Compra[]> {
  const resposta = await requisitar(`${API_URL}/compras`)
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível carregar as compras.')

  const compras: CompraBackend[] = await resposta.json()
  return compras.map(normalizarCompra)
}

/**
 * [RF009] Cadastra uma compra. O backend valida o estoque e calcula o total.
 */
export async function cadastrarCompra(dados: CompraFormulario): Promise<Compra> {
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
 * [RF010] Atualiza uma compra. Compras já pagas não podem ser alteradas.
 */
export async function atualizarCompra(id: number, dados: CompraFormulario): Promise<Compra> {
  const resposta = await requisitar(`${API_URL}/compras/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível atualizar a compra.')

  const { compra } = await resposta.json()
  return normalizarCompra(compra)
}

/**
 * [RF011] Remove uma compra pelo ID.
 */
export async function removerCompra(id: number): Promise<void> {
  const resposta = await requisitar(`${API_URL}/compras/${id}`, { method: 'DELETE' })
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível remover a compra.')
}
