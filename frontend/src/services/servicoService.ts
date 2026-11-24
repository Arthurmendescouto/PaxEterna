import type { Servico } from '../types/servico'

// ⚠️  MOCK ATIVO — quando o backend de serviços estiver pronto,
//     substitua o corpo de cada função por fetch real (ver produtoService.ts)
//     e troque USAR_MOCK para false.
const USAR_MOCK = true

let _servicos: Servico[] = [
  { id: 1, nome: 'Tanatopraxia', descricao: 'Preparação e conservação do corpo.', valor: 800 },
  { id: 2, nome: 'Translado', descricao: 'Transporte do corpo até o local de velório.', valor: 300 },
  { id: 3, nome: 'Velório', descricao: 'Sala de velório por 24h.', valor: 600 },
]

const API_URL = 'http://localhost:3001/api'

type ServicoBackend = {
  id_recurso: number
  nome: string
  descricao: string | null
  valor: string
}

function normalizarServico(s: ServicoBackend): Servico {
  return {
    id: s.id_recurso,
    nome: s.nome,
    descricao: s.descricao ?? '',
    valor: Number(s.valor),
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

export async function listarServicos(): Promise<Servico[]> {
  if (USAR_MOCK) return structuredClone(_servicos)

  const resposta = await requisitar(`${API_URL}/servicos`)
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível carregar os serviços.')
  const servicos: ServicoBackend[] = await resposta.json()
  return servicos.map(normalizarServico)
}

export async function cadastrarServico(dados: Omit<Servico, 'id'>): Promise<Servico> {
  if (USAR_MOCK) {
    const novoServico: Servico = {
      id: Math.max(0, ..._servicos.map((s) => s.id)) + 1,
      ...dados,
    }
    _servicos = [..._servicos, novoServico]
    return structuredClone(novoServico)
  }

  const resposta = await requisitar(`${API_URL}/servicos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível cadastrar o serviço.')
  const { servico } = await resposta.json()
  return normalizarServico(servico)
}

export async function atualizarServico(id: number, dados: Omit<Servico, 'id'>): Promise<Servico> {
  if (USAR_MOCK) {
    _servicos = _servicos.map((s) => (s.id === id ? { id, ...dados } : s))
    return structuredClone({ id, ...dados })
  }

  const resposta = await requisitar(`${API_URL}/servicos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!resposta.ok) return tratarErro(resposta, 'Não foi possível atualizar o serviço.')
  const { servico } = await resposta.json()
  return normalizarServico(servico)
}
