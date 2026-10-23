import { useEffect, useMemo, useState } from 'react'

import CadastroProdutoModal from '../../components/produtos/CadastroProdutoModal'
import type { Produto } from '../../types/produto'
import {
  atualizarProduto as atualizarProdutoApi,
  cadastrarProduto as cadastrarProdutoApi,
  excluirProduto as excluirProdutoApi,
  listarProdutos,
} from '../../services/produtoService'

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

const PRODUTOS_POR_PAGINA = 10

const formatarValor = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const mensagemDeErro = (erro: unknown, padrao: string) =>
  erro instanceof Error ? erro.message : padrao

export default function Produtos({ onVoltar }: ProdutosProps) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)

  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  /* Texto do modal de sucesso (vazio = fechado). */
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  /*
   * ==========================================================
   * CARREGAR PRODUTOS DO BACKEND
   * ==========================================================
   */
  useEffect(() => {
    listarProdutos()
      .then(setProdutos)
      .catch((erroRequisicao: Error) => setErro(erroRequisicao.message))
      .finally(() => setCarregando(false))
  }, [])

  /*
   * ==========================================================
   * FILTRO (nome ou tipo) E PAGINAÇÃO
   * ==========================================================
   */
  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    if (!termo) return produtos

    return produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(termo) ||
        produto.tipo.toLowerCase().includes(termo)
    )
  }, [busca, produtos])

  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / PRODUTOS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const produtosDaPagina = produtosFiltrados.slice(
    (paginaAtual - 1) * PRODUTOS_POR_PAGINA,
    paginaAtual * PRODUTOS_POR_PAGINA
  )

  /*
   * ==========================================================
   * [RF013] CADASTRAR / [RF014] EDITAR
   * ==========================================================
   * Os erros lançados aqui são exibidos dentro do próprio modal.
   */
  const handleSalvarProduto = async (dados: Omit<Produto, 'id'>) => {
    if (produtoEmEdicao) {
      const produtoAtualizado = await atualizarProdutoApi(produtoEmEdicao.id, dados)
      setProdutos((atuais) =>
        atuais.map((produto) =>
          produto.id === produtoEmEdicao.id ? produtoAtualizado : produto
        )
      )
      setProdutoEmEdicao(null)
    } else {
      const produtoCriado = await cadastrarProdutoApi(dados)
      setProdutos((atuais) => [...atuais, produtoCriado])
      setCadastroAberto(false)
    }
    setMensagemSucesso('Operação realizada com sucesso!')
  }

  /*
   * ==========================================================
   * [RF015] DELETAR PRODUTO
   * ==========================================================
   * O backend recusa a exclusão se o produto ainda tiver estoque.
   */
  const confirmarExclusao = async () => {
    if (!produtoParaExcluir) return

    setExcluindo(true)
    try {
      await excluirProdutoApi(produtoParaExcluir.id)
      setProdutos((atuais) =>
        atuais.filter((produto) => produto.id !== produtoParaExcluir.id)
      )
      setMensagemSucesso('Produto excluído com sucesso!')
    } catch (erroRequisicao) {
      setErro(mensagemDeErro(erroRequisicao, 'Não foi possível excluir o produto.'))
    } finally {
      setExcluindo(false)
      setProdutoParaExcluir(null)
    }
  }

  /*
   * ==========================================================
   * RENDERIZAÇÃO
   * ==========================================================
   */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* CABEÇALHO */}
      <header className="bg-[#2d5082] text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <Inventory2Icon />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
              <p className="text-sm text-blue-100">Cadastro, edição e consulta do estoque</p>
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

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* PESQUISA (nome ou tipo) + CADASTRO */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon
              fontSize="small"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={busca}
              onChange={(event) => {
                setBusca(event.target.value)
                setPagina(1)
              }}
              placeholder="Pesquisar por nome ou tipo..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={() => setCadastroAberto(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <AddIcon fontSize="small" />
            Cadastrar Produto
          </button>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <span>{erro}</span>
            <button
              type="button"
              onClick={() => setErro('')}
              aria-label="Fechar aviso"
              className="cursor-pointer text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* QUANTIDADE */}
        {!carregando && (
          <p className="mb-3 text-sm text-gray-600">
            Exibindo <strong>{produtosFiltrados.length}</strong> produto(s)
          </p>
        )}

        {/* TABELA — colunas do RF016 */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 font-semibold">Quantidade</th>
                  <th className="px-5 py-3 font-semibold">Marca</th>
                  <th className="px-5 py-3 font-semibold">Descrição</th>
                  <th className="px-5 py-3 font-semibold">Fornecedor</th>
                  <th className="px-5 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {produtosDaPagina.map((produto) => (
                  <tr key={produto.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">{produto.nome}</td>
                    <td className="px-5 py-4 text-gray-600">{produto.tipo}</td>
                    <td className="px-5 py-4 text-gray-600">{formatarValor(produto.valor)}</td>
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
                    <td className="px-5 py-4 text-gray-600">{produto.marca || '—'}</td>
                    <td className="max-w-[220px] truncate px-5 py-4 text-gray-600" title={produto.descricao}>
                      {produto.descricao || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{produto.fornecedor || '—'}</td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setProdutoSelecionado(produto)}
                          title="Consultar"
                          aria-label={`Consultar produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-blue-500 transition hover:bg-blue-50"
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setProdutoEmEdicao(produto)}
                          title="Editar"
                          aria-label={`Editar produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-green-600 transition hover:bg-green-50"
                        >
                          <EditIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setProdutoParaExcluir(produto)}
                          title="Deletar"
                          aria-label={`Deletar produto ${produto.nome}`}
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

          {/* CARREGANDO / LISTA VAZIA / BUSCA SEM RESULTADO */}
          {carregando ? (
            <p className="px-6 py-12 text-center text-sm text-gray-500">Carregando produtos...</p>
          ) : produtos.length === 0 ? (
            !erro && (
              <p className="px-6 py-12 text-center text-sm font-medium text-gray-700">
                Não existem produtos cadastrados.
              </p>
            )
          ) : produtosFiltrados.length === 0 && (
            <p className="px-6 py-12 text-center text-sm font-medium text-gray-700">
              Nenhum resultado encontrado!
            </p>
          )}
        </div>

        {/* PAGINAÇÃO */}
        {totalPaginas > 1 && (
          <div className="mt-4 flex items-center justify-end gap-2 text-sm">
            <button
              type="button"
              onClick={() => setPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-gray-600">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              type="button"
              onClick={() => setPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </main>

      {/* MODAL DE CONSULTA */}
      {produtoSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Consultar Produto</h2>
                <p className="text-sm text-gray-500">Detalhes do produto</p>
              </div>
              <button
                type="button"
                onClick={() => setProdutoSelecionado(null)}
                className="cursor-pointer rounded-md px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              {[
                ['Nome', produtoSelecionado.nome],
                ['Tipo', produtoSelecionado.tipo],
                ['Valor', formatarValor(produtoSelecionado.valor)],
                ['Quantidade', String(produtoSelecionado.quantidade)],
                ['Marca', produtoSelecionado.marca],
                ['Fornecedor', produtoSelecionado.fornecedor],
              ].map(([label, valor]) => (
                <div key={label}>
                  <p className="text-xs font-medium text-gray-500">{label}</p>
                  <p className="mt-1 text-sm text-gray-900">{valor || '—'}</p>
                </div>
              ))}
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-gray-500">Descrição</p>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-900">
                  {produtoSelecionado.descricao || '—'}
                </p>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4">
              <button
                type="button"
                onClick={() => setProdutoSelecionado(null)}
                className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {produtoParaExcluir && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <DeleteIcon className="text-red-600" sx={{ fontSize: 23 }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Excluir produto</h2>
                <p className="text-sm text-gray-500">Confirmação de exclusão</p>
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-gray-600">
                Deseja realmente excluir este item?
              </p>
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{produtoParaExcluir.nome}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Tipo: {produtoParaExcluir.tipo} · Quantidade: {produtoParaExcluir.quantidade}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setProdutoParaExcluir(null)}
                disabled={excluindo}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                disabled={excluindo}
                className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <DeleteIcon fontSize="small" />
                {excluindo ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO */}
      {mensagemSucesso && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <span className="text-xl font-bold text-green-600">✓</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sucesso!</h2>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-gray-600">{mensagemSucesso}</p>
            </div>

            <div className="flex justify-end bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setMensagemSucesso('')}
                className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {(cadastroAberto || produtoEmEdicao) && (
        <CadastroProdutoModal
          produto={produtoEmEdicao ?? undefined}
          onClose={() => {
            setCadastroAberto(false)
            setProdutoEmEdicao(null)
          }}
          onSave={handleSalvarProduto}
        />
      )}
    </div>
  )
}
