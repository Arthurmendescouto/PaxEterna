import type { Cliente, ClienteFormulario } from '../types/cliente'
import { somenteDigitos } from '../utils/formatadores'

const API_URL = 'http://localhost:3001/api'

// Lê a mensagem de erro enviada pelo backend ({ message }) ou usa a padrão.
async function tratarErro(resposta: Response, mensagemPadrao: string): Promise<never> {
  let mensagem = mensagemPadrao
  try {
    const corpo = await resposta.json()
    mensagem = corpo.message ?? corpo.error ?? mensagemPadrao
  } catch {
    // resposta sem JSON: mantém a mensagem padrão
  }
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
 * [RF004] Lista os clientes ativos.
 */
export async function listarClientes(): Promise<Cliente[]> {
  const resposta = await requisitar(`${API_URL}/clientes`)

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível carregar os clientes.')
  }

  return resposta.json()
}

/**
 * [RF004] Busca os detalhes de um cliente pelo CPF.
 */
export async function buscarCliente(cpf: string): Promise<Cliente> {
  const resposta = await requisitar(`${API_URL}/clientes/${somenteDigitos(cpf)}`)

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível consultar o cliente.')
  }

  return resposta.json()
}

/**
 * [RF001] Cadastra um novo cliente.
 */
export async function cadastrarCliente(cliente: ClienteFormulario): Promise<Cliente> {
  const resposta = await requisitar(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  })

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível cadastrar o cliente.')
  }

  const { cliente: clienteCriado } = await resposta.json()
  return clienteCriado
}

/**
 * [RF002] Atualiza um cliente. `cpfAtual` é o CPF antes da edição.
 */
export async function atualizarCliente(
  cpfAtual: string,
  cliente: ClienteFormulario
): Promise<Cliente> {
  const resposta = await requisitar(`${API_URL}/clientes/${somenteDigitos(cpfAtual)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  })

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível atualizar o cliente.')
  }

  const { cliente: clienteAtualizado } = await resposta.json()
  return clienteAtualizado
}

/**
 * [RF003] Deleta (desativa) um cliente.
 */
export async function excluirCliente(cpf: string): Promise<void> {
  const resposta = await requisitar(`${API_URL}/clientes/${somenteDigitos(cpf)}`, {
    method: 'DELETE',
  })

  if (!resposta.ok) {
    return tratarErro(resposta, 'Não foi possível deletar o cliente.')
  }
}
