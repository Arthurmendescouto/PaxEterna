import { useMemo, useState } from 'react'

import type { Produto } from '../../types/produto'

import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import Inventory2Icon from '@mui/icons-material/Inventory2'

type ProdutosProps = {
  onVoltar?: () => void
}

const produtosIniciais: Produto[] = [
  {
    id: 1,
    nome: 'Urna Funerária Luxo',
    tipo: 'Urna',
    valor: 3500,
    quantidade: 8,
    marca: 'Pax Premium',
    descricao: 'Urna funerária em madeira com acabamento especial.',
    fornecedor: 'Fornecedor Pax',
  },
  {
    id: 2,
    nome: 'Urna Funerária Simples',
    tipo: 'Urna',
    valor: 1800,
    quantidade: 15,
    marca: 'Pax Standard',
    descricao: 'Urna funerária de madeira com acabamento tradicional.',
    fornecedor: 'Fornecedor Central',
  },
  {
    id: 3,
    nome: 'Véu Funerário',
    tipo: 'Acessório',
    valor: 250,
    quantidade: 20,
    marca: 'Pax Care',
    descricao: 'Véu utilizado nos serviços funerários.',
    fornecedor: 'Distribuidora Vida',
  },
  {
    id: 4,
    nome: 'Coroa de Flores',
    tipo: 'Floricultura',
    valor: 450,
    quantidade: 6,
    marca: 'Flores da Paz',
    descricao: 'Coroa de flores para cerimônias funerárias.',
    fornecedor: 'Floricultura Esperança',
  },
]

export default function Produtos({ onVoltar }: ProdutosProps) {
  const [produtos, setProdutos] =
    useState<Produto[]>(produtosIniciais)

  const [busca, setBusca] = useState('')

  const [produtoSelecionado, setProdutoSelecionado] =
    useState<Produto | null>(null)

  /**
   * Filtra os produtos por Nome ou Tipo.
   *
   * Esse comportamento segue o RF016.
   */
  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()

    if (!termo) {
      return produtos
    }

    return produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(termo) ||
        produto.tipo.toLowerCase().includes(termo)
    )
  }, [busca, produtos])

  /**
   * Abre os detalhes do produto.
   */
  const handleConsultarProduto = (produto: Produto) => {
    setProdutoSelecionado(produto)
  }

  /**
   * Fecha o modal de consulta.
   */
  const handleFecharModal = () => {
    setProdutoSelecionado(null)
  }

  /**
   * Cadastro de produto.
   *
   * O formulário será criado posteriormente.
   */
  const handleCadastrarProduto = () => {
    console.log('Cadastrar produto')
  }

  /**
   * Edição de produto.
   *
   * O formulário de edição será criado posteriormente.
   */
  const handleEditarProduto = (produto: Produto) => {
    console.log('Editar produto:', produto)
  }

  /**
   * Exclusão de produto.
   *
   * Por enquanto a exclusão ocorre somente no estado local.
   *
   * Regra da documentação:
   * não deve ser possível excluir um produto
   * que ainda possua quantidade disponível em estoque.
   */
  const handleExcluirProduto = (produto: Produto) => {
    if (produto.quantidade > 0) {
      window.alert(
        'Não é possível excluir: este recurso ainda possui unidades em estoque!'
      )

      return
    }

    const confirmou = window.confirm(
      'Deseja realmente excluir este item?'
    )

    if (!confirmou) {
      return
    }

    setProdutos((produtosAtuais) =>
      produtosAtuais.filter(
        (produtoAtual) => produtoAtual.id !== produto.id
      )
    )

    window.alert('Produto excluído com sucesso!')

    /*
     * Futuramente:
     *
     * await excluirProduto(produto.id)
     *
     * e depois atualizar a lista.
     */
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          CABEÇALHO
      ====================================================== */}
      <header className="bg-[#2d5082] text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <Inventory2Icon />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Gerenciar Produtos
              </h1>

              <p className="text-sm text-blue-100">
                Cadastro, edição e consulta do estoque
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onVoltar}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-400 hover:shadow-md"
          >
            <ArrowBackIcon fontSize="small" />

            Voltar ao dashboard
          </button>

        </div>
      </header>

      {/* =====================================================
          CONTEÚDO
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ===================================================
            BUSCA E CADASTRO
        ==================================================== */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">

          {/* Pesquisa */}
          <div className="relative flex-1">

            <SearchIcon
              fontSize="small"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
              placeholder="Pesquisar por nome ou tipo..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Cadastro */}
          <button
            type="button"
            onClick={handleCadastrarProduto}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <AddIcon fontSize="small" />

            Cadastrar Produto
          </button>

        </div>

        {/* ===================================================
            QUANTIDADE
        ==================================================== */}
        <p className="mb-3 text-sm text-gray-600">
          Exibindo{' '}
          <strong>
            {produtosFiltrados.length}
          </strong>{' '}
          produto(s)
        </p>

        {/* ===================================================
            TABELA
        ==================================================== */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left text-sm">

              {/* Cabeçalho */}
              <thead className="bg-gray-50 text-gray-800">
                <tr>

                  <th className="px-5 py-3 font-semibold">
                    ID
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Nome
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Tipo
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Valor
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Quantidade
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Marca
                  </th>

                  <th className="px-5 py-3 text-center font-semibold">
                    Ações
                  </th>

                </tr>
              </thead>

              {/* Corpo */}
              <tbody className="divide-y divide-gray-100">

                {produtosFiltrados.map((produto) => (
                  <tr
                    key={produto.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* ID */}
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {produto.id}
                    </td>

                    {/* Nome */}
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {produto.nome}
                    </td>

                    {/* Tipo */}
                    <td className="px-5 py-4 text-gray-600">
                      {produto.tipo}
                    </td>

                    {/* Valor */}
                    <td className="px-5 py-4 text-gray-600">
                      {produto.valor.toLocaleString(
                        'pt-BR',
                        {
                          style: 'currency',
                          currency: 'BRL',
                        }
                      )}
                    </td>

                    {/* Quantidade */}
                    <td className="px-5 py-4">

                      <span
                        className={
                          produto.quantidade > 0
                            ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'
                            : 'rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700'
                        }
                      >
                        {produto.quantidade}
                      </span>

                    </td>

                    {/* Marca */}
                    <td className="px-5 py-4 text-gray-600">
                      {produto.marca}
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-1">

                        {/* Consultar */}
                        <button
                          type="button"
                          onClick={() =>
                            handleConsultarProduto(produto)
                          }
                          title="Consultar produto"
                          aria-label={`Consultar produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-blue-500 transition hover:bg-blue-50"
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>

                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() =>
                            handleEditarProduto(produto)
                          }
                          title="Editar produto"
                          aria-label={`Editar produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-green-600 transition hover:bg-green-50"
                        >
                          <EditIcon fontSize="small" />
                        </button>

                        {/* Excluir */}
                        <button
                          type="button"
                          onClick={() =>
                            handleExcluirProduto(produto)
                          }
                          title="Excluir produto"
                          aria-label={`Excluir produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-red-500 transition hover:bg-red-50"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

          {/* =================================================
              NENHUM RESULTADO
          ================================================== */}
          {produtosFiltrados.length === 0 && (
            <div className="px-6 py-12 text-center">

              <p className="text-sm font-medium text-gray-700">
                Nenhum recurso encontrado!
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Tente pesquisar utilizando outro nome ou tipo.
              </p>

            </div>
          )}

        </div>

      </main>

      {/* =====================================================
          MODAL DE CONSULTA
      ====================================================== */}
      {produtoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b px-6 py-4">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Consultar Produto
                </h2>

                <p className="text-sm text-gray-500">
                  Detalhes do produto
                </p>
              </div>

              <button
                type="button"
                onClick={handleFecharModal}
                className="cursor-pointer rounded-md px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fechar"
              >
                ×
              </button>

            </div>

            {/* Dados */}
            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Nome
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {produtoSelecionado.nome}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Tipo
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.tipo}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Valor
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.valor.toLocaleString(
                    'pt-BR',
                    {
                      style: 'currency',
                      currency: 'BRL',
                    }
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Quantidade
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.quantidade}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Marca
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.marca}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Fornecedor
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.fornecedor}
                </p>
              </div>

              <div className="sm:col-span-2">

                <p className="text-xs font-medium text-gray-500">
                  Descrição
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.descricao}
                </p>

              </div>

            </div>

            {/* Rodapé */}
            <div className="flex justify-end border-t px-6 py-4">

              <button
                type="button"
                onClick={handleFecharModal}
                className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                Fechar
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}