const API_URL = 'http://localhost:3000/api'

export async function excluirCliente(cpf: string): Promise<void> {
  const resposta = await fetch(`${API_URL}/clientes/${encodeURIComponent(cpf)}`, {
    method: 'DELETE',
  })

  if (!resposta.ok) {
    throw new Error('Não foi possível excluir o cliente.')
  }
}