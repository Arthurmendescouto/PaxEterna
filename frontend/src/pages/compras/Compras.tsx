import { useEffect, useMemo, useState } from 'react'

import CadastroCompraModal from '../../components/compras/CadastroCompraModal'
import type { Compra, CompraFormulario, ItemDisponivel } from '../../types/compra'
import {
  cadastrarCompra,
  listarCompras,
  listarItensDisponiveis,
  removerCompra,
} from '../../services/compraService'
import { formatarCpf, formatarData, formatarValor, somenteDigitos } from '../../utils/formatadores'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'

type ComprasProps = {
  onVoltar?: () => void
}

const COMPRAS_POR_PAGINA = 10

const resumoDosItens = (compra: Compra) =>
  compra.itens.length > 0
    ? compra.itens.map((item) => `${item.nome} (${item.quantidade})`).join(', ')
    : '—'

export default function Compras({ onVoltar }: ComprasProps) {
  const [compras, setCompras] = useState<Compra[]>([])
  const [itensDisponiveis, setItensDisponiveis] = useState<ItemDisponivel[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)

  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [compraParaRemover, setCompraParaRemover] = useState<Compra | null>(null)
  const [removendo, setRemovendo] = useState(false)

  const [mensagemSucesso, setMensagemSucesso] = useState('')

  /*
   * ==========================================================
   * CARREGAR COMPRAS
   * ==========================================================
   */
  useEffect(() => {
    listarCompras()
      .then(setCompras)
      .catch((erroRequisicao: Error) => setErro(erroRequisicao.message))
      .finally(() => setCarregando(false))
  }, [])

  /*
   * ==========================================================
   * FILTRO (ID ou CPF do cliente) E PAGINAÇÃO
   * ==========================================================
   */
  const comprasFiltradas = useMemo(() => {
    const termo = busca.trim()
    if (!termo) return compras

    const termoDigitos = somenteDigitos(termo)

    return compras.filter((compra) => {
      if (String(compra.id).includes(termo)) return true
      if (compra.cpfCliente) {
        if (compra.cpfCliente.includes(termoDigitos)) return true
        if (formatarCpf(compra.cpfCliente).includes(termo)) return true
      }
      return false
    })
  }, [busca, compras])

  const totalPaginas = Math.max(1, Math.ceil(comprasFiltradas.length / COMPRAS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const comprasDaPagina = comprasFiltradas.slice(
    (paginaAtual - 1) * COMPRAS_POR_PAGINA,
    paginaAtual * COMPRAS_POR_PAGINA
  )

  /*
   * ==========================================================
   * [RF009] CADASTRAR COMPRA
   * ==========================================================
   */
  const abrirCadastro = async () => {
    try {
      setItensDisponiveis(await listarItensDisponiveis())
      setCadastroAberto(true)
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : 'Não foi possível carregar os itens.'
      )
    }
  }

  const handleSalvarCompra = async (dados: CompraFormulario) => {
    const compraCriada = await cadastrarCompra(dados)
    setCompras((atuais) => [compraCriada, ...atuais])
    setCadastroAberto(false)
    setMensagemSucesso('Operação realizada com sucesso!')
  }

  /*
   * ==========================================================
   * [RF010] REMOVER COMPRA
   * ==========================================================
   */
  const confirmarRemocao = async () => {
    if (!compraParaRemover) return

    setRemovendo(true)
    try {
      await removerCompra(compraParaRemover.id)
      setCompras((atuais) => atuais.filter((c) => c.id !== compraParaRemover.id))
      setMensagemSucesso('Compra removida com sucesso!')
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : 'Não foi possível remover a compra.'
      )
    } finally {
      setRemovendo(false)
      setCompraParaRemover(null)
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
              <ShoppingCartIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Compras</h1>
              <p className="text-sm text-blue-100">Cadastro, consulta e remoção de vendas avulsas</p>
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

        {/* PESQUISA + CADASTRO */}
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
              placeholder="Pesquisar por ID ou CPF do cliente..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={abrirCadastro}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <AddIcon fontSize="small" />
            Cadastrar Compra
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
            Exibindo <strong>{comprasFiltradas.length}</strong> compra(s)
          </p>
        )}

        {/* TABELA */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">CPF do Cliente</th>
                  <th className="px-5 py-3 font-semibold">Itens</th>
                  <th className="px-5 py-3 font-semibold">Valor Total</th>
                  <th className="px-5 py-3 font-semibold">Data da Compra</th>
                  <th className="px-5 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {comprasDaPagina.map((compra) => (
                  <tr key={compra.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-600">{compra.id}</td>
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {compra.cpfCliente ? formatarCpf(compra.cpfCliente) : '—'}
                    </td>
                    <td
                      className="max-w-[280px] truncate px-5 py-4 text-gray-600"
                      title={resumoDosItens(compra)}
                    >
                      {resumoDosItens(compra)}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {formatarValor(compra.valorTotal)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{formatarData(compra.dataCompra)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => setCompraParaRemover(compra)}
                          title="Remover compra"
                          aria-label={`Remover compra ${compra.id}`}
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
            <p className="px-6 py-12 text-center text-sm text-gray-500">Carregando compras...</p>
          ) : compras.length === 0 ? (
            !erro && (
              <p className="px-6 py-12 text-center text-sm font-medium text-gray-700">
                Não existem compras cadastradas.
              </p>
            )
          ) : comprasFiltradas.length === 0 && (
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

      {/* MODAL DE CONFIRMAÇÃO DE REMOÇÃO */}
      {compraParaRemover && (
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
                <h2 className="text-lg font-semibold text-gray-900">Remover compra</h2>
                <p className="text-sm text-gray-500">Confirmação de remoção</p>
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-gray-600">
                Deseja realmente remover esta compra?
              </p>
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Compra #{compraParaRemover.id}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Cliente: {compraParaRemover.cpfCliente ? formatarCpf(compraParaRemover.cpfCliente) : '—'} ·{' '}
                  Valor: {formatarValor(compraParaRemover.valorTotal)} ·{' '}
                  Data: {formatarData(compraParaRemover.dataCompra)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setCompraParaRemover(null)}
                disabled={removendo}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRemocao}
                disabled={removendo}
                className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <DeleteIcon fontSize="small" />
                {removendo ? 'Removendo...' : 'Sim, remover'}
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

      {/* MODAL DE CADASTRO */}
      {cadastroAberto && (
        <CadastroCompraModal
          itensDisponiveis={itensDisponiveis}
          onClose={() => setCadastroAberto(false)}
          onSave={handleSalvarCompra}
        />
      )}
    </div>
  )
}
