import type { Compra, CompraFormulario, ItemDisponivel } from '../types/compra'

/*
 * ==========================================================
 * DADOS DE TESTE (o backend de compras ainda não existe)
 * ==========================================================
 *
 * As funções abaixo têm a mesma assinatura que terão na integração:
 * retornam Promises e lançam Error com a mensagem do RF.
 * Na integração, troque o corpo de cada uma por um fetch para a API
 * (ver produtoService.ts) e apague estes dados.
 */

const itensDisponiveis: ItemDisponivel[] = [
  { id: 1, tipo: 'produto', nome: 'Urna Standard', valor: 1500, estoque: 5 },
  { id: 2, tipo: 'produto', nome: 'Coroa de flores', valor: 250, estoque: 10 },
  { id: 3, tipo: 'produto', nome: 'Mortalha', valor: 120, estoque: 0 },
  { id: 4, tipo: 'produto', nome: 'Velas (kit)', valor: 45, estoque: 30 },
  { id: 1, tipo: 'servico', nome: 'Tanatopraxia', valor: 800, estoque: null },
  { id: 2, tipo: 'servico', nome: 'Translado', valor: 300, estoque: null },
  { id: 3, tipo: 'servico', nome: 'Velório', valor: 600, estoque: null },
]

let compras: Compra[] = [
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
]

const copiar = <T,>(dados: T): T => structuredClone(dados)

/**
 * Lista os produtos e serviços que podem ser vendidos.
 */
export async function listarItensDisponiveis(): Promise<ItemDisponivel[]> {
  return copiar(itensDisponiveis)
}

/**
 * [RF012] Lista as compras cadastradas.
 */
export async function listarCompras(): Promise<Compra[]> {
  return copiar(compras)
}

/**
 * [RF009] Cadastra uma compra. Calcula o Valor Total e baixa o estoque.
 */
export async function cadastrarCompra(dados: CompraFormulario): Promise<Compra> {
  const itens = dados.itens.map((itemPedido) => {
    const item = itensDisponiveis.find(
      (disponivel) => disponivel.id === itemPedido.itemId && disponivel.tipo === itemPedido.tipo
    )
    if (!item) {
      throw new Error('Preencha todos os campos obrigatórios!')
    }
    // RF009 exceção 9.2: falta de estoque
    if (item.estoque !== null && itemPedido.quantidade > item.estoque) {
      throw new Error('Estoque insuficiente para o item selecionado!')
    }
    return {
      itemId: item.id,
      tipo: item.tipo,
      nome: item.nome,
      quantidade: itemPedido.quantidade,
      precoUnitario: item.valor,
      subtotal: item.valor * itemPedido.quantidade,
    }
  })

  // baixa o estoque dos produtos vendidos
  for (const itemVendido of itens) {
    const item = itensDisponiveis.find(
      (disponivel) => disponivel.id === itemVendido.itemId && disponivel.tipo === itemVendido.tipo
    )
    if (item && item.estoque !== null) {
      item.estoque -= itemVendido.quantidade
    }
  }

  const compra: Compra = {
    id: Math.max(0, ...compras.map((c) => c.id)) + 1,
    cpfCliente: dados.cpfCliente,
    dataCompra: dados.dataCompra,
    itens,
    valorTotal: itens.reduce((total, item) => total + item.subtotal, 0),
  }
  compras = [...compras, compra]
  return copiar(compra)
}
