export interface Endereco {
  logradouro: string
  numEndereco: string
  bairro: string
  cep: string
  cidade: string
  uf: string
}

// Formato retornado pelo backend (CPF, telefone e CEP somente com dígitos,
// datas em YYYY-MM-DD).
export interface Cliente {
  cpf: string
  nome: string
  dataNascimento: string | null
  telefone: string
  email: string | null
  endereco: Endereco
  possuiContrato: boolean
  dataCriacao: string
  status: string
}

// Dados enviados no cadastro/atualização (CPF no formato 000.000.000-00).
// "Possui contrato" e "Data de criação" vêm do banco, não do formulário.
export type ClienteFormulario = Omit<
  Cliente,
  'possuiContrato' | 'dataCriacao' | 'status'
>
