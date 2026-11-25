export type TipoPagamento = 'avulso' | 'assinatura'

export type FormaPagamento =
  | 'dinheiro'
  | 'cartao de credito'
  | 'cartao de debito'
  | 'pix'
  | 'boleto'

export type StatusPagamento = 'pago' | 'cancelado' | 'pendente'

export interface Pagamento {
  id: number
  tipo: TipoPagamento
  valor: number
  formaPagamento: FormaPagamento | null
  status: StatusPagamento
  dataPagamento: string | null
  idCompra: number | null
  idContrato: number | null
  cpf: string | null
  nome: string | null
}

export interface VinculoPagamento {
  id: number
  valor: number
  dataInicio: string
  dataTermino: string | null
}

export interface PagamentoFormulario {
  tipo: TipoPagamento
  fk_id: number
  valor: number
  dataPagamento: string | null
  formaPagamento: FormaPagamento | null
  status: StatusPagamento
}

export type PagamentoAtualizacao = Omit<PagamentoFormulario, 'tipo' | 'fk_id'>
