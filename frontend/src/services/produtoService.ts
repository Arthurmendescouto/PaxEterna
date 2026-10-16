import type { Produto } from '../types/produto'

const API_URL = 'http://localhost:3001/api'

/*
 * O backend retorna o campo `id_produto` (e `marca`/`descricao`/`fornecedor`
 * podem vir null quando não informados). Essas funções convertem entre o
 * formato do backend e o tipo `Produto` usado no frontend.
 */
type ProdutoBackend = Omit<Produto, 'id' | 'marca' | 'descricao' | 'fornecedor'> & {
  id_produto: number
  marca: string | null
  descricao: string | null
  fornecedor: string | null
}

function normalizarProduto(produto: ProdutoBackend): Produto {
  return {
    id: produto.id_produto,
    nome: produto.nome,
    tipo: produto.tipo,
    valor: Number(produto.valor),
    quantidade: Number(produto.quantidade),
    marca: produto.marca ?? '',
    descricao: produto.descricao ?? '',
    fornecedor: produto.fornecedor ?? '',
  }
}

async function tratarErro(resposta: Response, mensagemPadrao: string): Promise<never> {
  try {
    const corpo = await resposta.json()
    throw new Error(corpo.error ?? mensagemPadrao)
  } catch {
    throw new Error(mensagemPadrao)
  }
}

/**
 * Busca todos os produtos cadastrados.
 */
export async function listarProdutos(): Promise<Produto[]> {
  const resposta = await fetch(`${API_URL}/produtos`)

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível carregar os produtos.')
  }

  const produtos: ProdutoBackend[] = await resposta.json()
  return produtos.map(normalizarProduto)
}

/**
 * Busca um produto pelo ID.
 */
export async function buscarProduto(id: number): Promise<Produto> {
  const resposta = await fetch(`${API_URL}/produtos/${id}`)

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível consultar o produto.')
  }

  return normalizarProduto(await resposta.json())
}

/**
 * Cadastra um novo produto.
 */
export async function cadastrarProduto(
  produto: Omit<Produto, 'id'>
): Promise<Produto> {
  const resposta = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(produto),
  })

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível cadastrar o produto.')
  }

  const { produto: produtoCriado } = await resposta.json()
  return normalizarProduto(produtoCriado)
}

/**
 * Atualiza um produto existente.
 */
export async function atualizarProduto(
  id: number,
  produto: Omit<Produto, 'id'>
): Promise<Produto> {
  const resposta = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(produto),
  })

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível atualizar o produto.')
  }

  const { produto: produtoAtualizado } = await resposta.json()
  return normalizarProduto(produtoAtualizado)
}

/**
 * Exclui um produto.
 */
export async function excluirProduto(id: number): Promise<void> {
  const resposta = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'DELETE',
  })

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível excluir o produto.')
  }
}
