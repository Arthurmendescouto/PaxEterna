export interface Endereco {
  logradouro: string
  numEndereco: string
  bairro: string
  cep: string
  cidade: string
  uf: string
}

// Formato retornado pelo backend (CPF, telefones e CEP somente com dígitos,
// data de nascimento em YYYY-MM-DD).
export interface Cliente {
  cpf: string
  nome: string
  rg: string
  dataNascimento: string
  telefones: string[]
  endereco: Endereco
  status: string
  possuiContrato: boolean
}

// Dados enviados no cadastro/atualização (CPF no formato 000.000.000-00).
export type ClienteFormulario = Omit<Cliente, 'status' | 'possuiContrato'>
