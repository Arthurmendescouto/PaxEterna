// ARQUIVO TEMPORÁRIO — apagar após integração com o backend
// Para desfazer: em compraService.ts, trocar o import de './compraMock' de volta para fetch real

import type { Compra, ItemDisponivel } from '../types/compra'

export const itensDisponiveisMock: ItemDisponivel[] = [
  { id: 1, tipo: 'produto', nome: 'Urna Standard', valor: 1500, estoque: 5 },
  { id: 2, tipo: 'produto', nome: 'Coroa de flores', valor: 250, estoque: 10 },
  { id: 3, tipo: 'produto', nome: 'Mortalha', valor: 120, estoque: 0 },
  { id: 1, tipo: 'servico', nome: 'Tanatopraxia', valor: 800, estoque: null },
  { id: 2, tipo: 'servico', nome: 'Translado', valor: 300, estoque: null },
]

export const comprasMock: Compra[] = [
  {
    id: 1,
    cpfCliente: '52998224725',
    dataCompra: '2026-10-28',
    itens: [
      { itemId: 1, tipo: 'produto', nome: 'Urna Standard', quantidade: 1, precoUnitario: 1500, subtotal: 1500 },
      { itemId: 1, tipo: 'servico', nome: 'Tanatopraxia', quantidade: 1, precoUnitario: 800, subtotal: 800 },
    ],
    valorTotal: 2300,
  },
  {
    id: 2,
    cpfCliente: null,
    dataCompra: '2026-11-02',
    itens: [
      { itemId: 2, tipo: 'produto', nome: 'Coroa de flores', quantidade: 2, precoUnitario: 250, subtotal: 500 },
    ],
    valorTotal: 500,
  },
  {
    id: 3,
    cpfCliente: '11144477735',
    dataCompra: '2026-11-04',
    itens: [
      { itemId: 2, tipo: 'servico', nome: 'Translado', quantidade: 1, precoUnitario: 300, subtotal: 300 },
    ],
    valorTotal: 300,
    statusPagamento: 'pago', // para testar a exceção 10.2 do RF010
  },
]
