import type { Cliente } from '../types/cliente'

const API_URL = 'http://localhost:3000/api'

export async function excluirCliente(id: number): Promise<void> {
  const resposta = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível excluir o cliente.')
  }
}