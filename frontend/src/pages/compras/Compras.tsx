import { useEffect, useState } from 'react'

import CadastroCompraModal from '../../components/compras/CadastroCompraModal'
import type { Compra, CompraFormulario, ItemDisponivel } from '../../types/compra'
import {
  cadastrarCompra,
  listarCompras,
  listarItensDisponiveis,
} from '../../services/compraService'
import { formatarCpf, formatarData, formatarValor } from '../../utils/formatadores'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

type ComprasProps = {
  onVoltar?: () => void
}

const COMPRAS_POR_PAGINA = 10

// "Urna Standard (1), Tanatopraxia (1)"
const resumoDosItens = (compra: Compra) =>
  compra.itens.map((item) => `${item.nome} (${item.quantidade})`).join(', ')

export default function Compras({ onVoltar }: ComprasProps) {
  const [compras, setCompras] = useState<Compra[]>([])
  const [itensDisponiveis, setItensDisponiveis] = useState<ItemDisponivel[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [pagina, setPagina] = useState(1)

  const [cadastroAberto, setCadastroAberto] = useState(false)

  /* Texto do modal de sucesso (vazio = fechado). */
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  /*
   * ==========================================================
   * CARREGAR COMPRAS (por enquanto, dados de teste do compraService)
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
   * FILTRO E PAGINAÇÃO
   * ==========================================================
   *
   * TODO (Arthur — tarefa 3: "Codificação da página frontend de busca de Compra"):
   * a busca por ID ou CPF do cliente (RF009 fluxo alternativo / RF012) entra aqui.
   * Basta filtrar `compras` pelo termo digitado e trocar `compras` por
   * `comprasFiltradas` na paginação abaixo e na contagem "Exibindo X compra(s)".
   * Se a busca não encontrar nada, exibir "Nenhum resultado encontrado!"
   * (ver o bloco "LISTA VAZIA" na tabela). Mesmo padrão de Clientes.tsx e Produtos.tsx.
   */
  const comprasFiltradas = compras

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
   * Os itens são carregados ao abrir o cadastro, para mostrar o estoque atual.
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

  // Os erros lançados aqui são exibidos dentro do próprio modal.
  const handleSalvarCompra = async (dados: CompraFormulario) => {
    const compraCriada = await cadastrarCompra(dados)
    setCompras((atuais) => [...atuais, compraCriada])
    setCadastroAberto(false)
    setMensagemSucesso('Operação realizada com sucesso!')
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
              <p className="text-sm text-blue-100">Cadastro e consulta de vendas avulsas</p>
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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {/*
            TODO (Arthur — tarefa 3): campo "Pesquisar por ID ou CPF do cliente..."
            entra aqui, antes do botão, com `className="relative flex-1"`
            (copiar o campo de busca de Produtos.tsx). Ao digitar, voltar para a página 1.
          */}

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
                      className="max-w-[320px] truncate px-5 py-4 text-gray-600"
                      title={resumoDosItens(compra)}
                    >
                      {resumoDosItens(compra)}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {formatarValor(compra.valorTotal)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{formatarData(compra.dataCompra)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARREGANDO / LISTA VAZIA */}
          {/* TODO (Arthur — tarefa 3): incluir aqui o caso "Nenhum resultado encontrado!"
              para quando a busca não encontrar compras (ver Produtos.tsx). */}
          {carregando ? (
            <p className="px-6 py-12 text-center text-sm text-gray-500">Carregando compras...</p>
          ) : compras.length === 0 && !erro && (
            <p className="px-6 py-12 text-center text-sm font-medium text-gray-700">
              Não existem compras cadastradas.
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
