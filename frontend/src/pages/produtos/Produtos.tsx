import { useMemo, useState } from 'react'

import type { Produto } from '../../types/produto'

import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'

type ProdutosProps = {
  onVoltar?: () => void
}

const produtosIniciais: Produto[] = [
  {
    id: 1,
    nome: 'Urna funerária padrão',
    tipo: 'Urna',
    valor: 1850.00,
    quantidade: 12,
  },
  {
    id: 2,
    nome: 'Urna funerária luxo',
    tipo: 'Urna',
    valor: 3200.00,
    quantidade: 5,
  },
  {
    id: 3,
    nome: 'Véu funerário',
    tipo: 'Acessório',
    valor: 120.00,
    quantidade: 18,
  },
  {
    id: 4,
    nome: 'Coroa de flores',
    tipo: 'Acessório',
    valor: 280.00,
    quantidade: 9,
  },
  {
    id: 5,
    nome: 'Tanatopraxia',
    tipo: 'Serviço',
    valor: 850.00,
    quantidade: 0,
  },
]

export default function Produtos({
  onVoltar,
}: ProdutosProps) {

  const [produtos, setProdutos] =
    useState<Produto[]>(produtosIniciais)

  const [busca, setBusca] = useState('')

  const [produtoSelecionado, setProdutoSelecionado] =
    useState<Produto | null>(null)

  /**
   * Filtra produtos pelo nome ou tipo.
   *
   * Conforme RF016, a consulta deve permitir
   * pesquisa por Nome ou Tipo.
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
   * Consulta o produto.
   *
   * Por enquanto apenas selecionamos o produto.
   * O modal será implementado posteriormente.
   */
  const handleConsultarProduto = (
    produto: Produto
  ) => {
    setProdutoSelecionado(produto)
  }

  /**
   * Fecha a consulta do produto.
   */
  const handleFecharConsulta = () => {
    setProdutoSelecionado(null)
  }

  /**
   * Edita o produto.
   *
   * O formulário de edição será criado posteriormente.
   */
  const handleEditarProduto = (
    produto: Produto
  ) => {
    console.log('Editar produto:', produto)
  }

  /**
   * Exclui o produto.
   *
   * A documentação determina que um produto não pode
   * ser excluído se ainda possuir quantidade em estoque.
   */
  const handleExcluirProduto = (
    produto: Produto
  ) => {

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
        (produtoAtual) =>
          produtoAtual.id !== produto.id
      )
    )

    /*
     * Futuramente:
     *
     * await excluirProduto(produto.id)
     *
     * A remoção definitiva será feita pelo backend.
     */
  }

  /**
   * Abre o formulário de cadastro.
   *
   * Será implementado posteriormente.
   */
  const handleCadastrarProduto = () => {
    console.log('Cadastrar produto')
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <header className="bg-[#2d5082] text-white shadow">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div>
            <h1 className="text-2xl font-bold">
              Gerenciar Produtos
            </h1>

            <p className="text-sm text-blue-100">
              Cadastro, edição e consulta
            </p>
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

            <table className="w-full min-w-[800px] text-left text-sm">

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

                    <td className="px-5 py-4 text-gray-700">
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
                            : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'
                        }
                      >
                        {produto.quantidade}
                      </span>

                    </td>

                    {/* Ações */}

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-1">

                        {/* Consultar */}

                        <button
                          type="button"
                          onClick={() =>
                            handleConsultarProduto(
                              produto
                            )
                          }
                          title="Consultar produto"
                          aria-label={`Consultar produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-blue-500 transition hover:bg-blue-50"
                        >
                          <VisibilityIcon
                            fontSize="small"
                          />
                        </button>

                        {/* Editar */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEditarProduto(
                              produto
                            )
                          }
                          title="Editar produto"
                          aria-label={`Editar produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-green-600 transition hover:bg-green-50"
                        >
                          <EditIcon
                            fontSize="small"
                          />
                        </button>

                        {/* Excluir */}

                        <button
                          type="button"
                          onClick={() =>
                            handleExcluirProduto(
                              produto
                            )
                          }
                          title="Excluir produto"
                          aria-label={`Excluir produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-red-500 transition hover:bg-red-50"
                        >
                          <DeleteIcon
                            fontSize="small"
                          />
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
                Nenhum resultado encontrado!
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Tente pesquisar utilizando outro nome
                ou tipo.
              </p>

            </div>

          )}

        </div>

      </main>

      {/* =====================================================
          CONSULTA DO PRODUTO
      ====================================================== */}

      {produtoSelecionado && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-xl font-semibold text-slate-800">
                Consultar Produto
              </h2>

              <button
                type="button"
                onClick={handleFecharConsulta}
                className="cursor-pointer rounded-md px-3 py-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Nome
                </p>

                <p className="text-sm text-gray-800">
                  {produtoSelecionado.nome}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Tipo
                </p>

                <p className="text-sm text-gray-800">
                  {produtoSelecionado.tipo}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Valor
                </p>

                <p className="text-sm text-gray-800">
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

                <p className="text-sm text-gray-800">
                  {produtoSelecionado.quantidade}
                </p>
              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                type="button"
                onClick={handleFecharConsulta}
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