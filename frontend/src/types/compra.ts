// Uma compra (venda avulsa) pode ter produtos e serviços.
export type TipoItem = 'produto' | 'servico'

// Item que pode ser escolhido no cadastro da compra.
// Serviços não têm estoque (estoque = null).
export interface ItemDisponivel {
  id: number
  tipo: TipoItem
  nome: string
  valor: number
  estoque: number | null
}

// ItemCompra do diagrama de classes: quantidade, preço unitário e subtotal.
export interface ItemCompra {
  itemId: number
  tipo: TipoItem
  nome: string
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export interface Compra {
  id: number
  cpfCliente: string | null // RF009: CPF do cliente é opcional
  dataCompra: string // YYYY-MM-DD
  itens: ItemCompra[]
  valorTotal: number
}

// Dados enviados no cadastro (RF009). O Valor Total é calculado pelo sistema.
export interface CompraFormulario {
  cpfCliente: string | null
  dataCompra: string
  itens: { itemId: number; tipo: TipoItem; quantidade: number }[]
}
