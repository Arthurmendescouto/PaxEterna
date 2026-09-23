import type { Produto } from '../types/produto'

const API_URL = 'http://localhost:3000/api'

/**
 * Busca todos os produtos cadastrados.
 */
export async function listarProdutos(): Promise<Produto[]> {
  const resposta = await fetch(`${API_URL}/produtos`)

  if (!resposta.ok) {
    throw new Error('Não foi possível carregar os produtos.')
  }

  return resposta.json()
}

/**
 * Busca um produto pelo ID.
 */
export async function buscarProduto(
  id: number
): Promise<Produto> {
  const resposta = await fetch(`${API_URL}/produtos/${id}`)

  if (!resposta.ok) {
    throw new Error('Não foi possível consultar o produto.')
  }

  return resposta.json()
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
    throw new Error('Não foi possível cadastrar o produto.')
  }

  return resposta.json()
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
    throw new Error('Não foi possível atualizar o produto.')
  }

  return resposta.json()
}

/**
 * Exclui um produto.
 */
export async function excluirProduto(
  id: number
): Promise<void> {
  const resposta = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'DELETE',
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível excluir o produto.')
  }
}