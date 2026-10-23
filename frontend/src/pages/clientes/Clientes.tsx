import { useEffect, useMemo, useState } from 'react'

import ClienteModal from '../../components/clientes/ClienteModal'
import CadastroClienteModal from '../../components/clientes/CadastroClienteModal'
import type { Cliente, ClienteFormulario } from '../../types/cliente'
import {
  atualizarCliente,
  buscarCliente,
  cadastrarCliente,
  excluirCliente,
  listarClientes,
} from '../../services/clienteService'
import {
  formatarCpf,
  formatarData,
  formatarTelefone,
  somenteDigitos,
} from '../../utils/formatadores'

import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import PeopleIcon from '@mui/icons-material/People'

interface ClientesProps {
  onVoltar?: () => void
}

const CLIENTES_POR_PAGINA = 10

const mensagemDeErro = (erro: unknown, padrao: string) =>
  erro instanceof Error ? erro.message : padrao

export default function Clientes({ onVoltar }: ClientesProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)

  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [clienteEmEdicao, setClienteEmEdicao] = useState<Cliente | null>(null)
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  /* Texto do modal de sucesso (vazio = fechado). */
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  /*
   * ==========================================================
   * CARREGAR CLIENTES DO BACKEND
   * ==========================================================
   */
  /* Recarrega a lista após cadastrar/atualizar. */
  const carregarClientes = async () => {
    try {
      setClientes(await listarClientes())
      setErro('')
    } catch (erroRequisicao) {
      setErro(mensagemDeErro(erroRequisicao, 'Não foi possível carregar os clientes.'))
    }
  }

  useEffect(() => {
    listarClientes()
      .then(setClientes)
      .catch((erroRequisicao: Error) => setErro(erroRequisicao.message))
      .finally(() => setCarregando(false))
  }, [])

  /*
   * ==========================================================
   * FILTRO (nome ou CPF) E PAGINAÇÃO
   * ==========================================================
   */
  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    if (!termo) return clientes

    const termoCpf = somenteDigitos(termo)
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo) ||
        (termoCpf !== '' && cliente.cpf.includes(termoCpf))
    )
  }, [busca, clientes])

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / CLIENTES_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const clientesDaPagina = clientesFiltrados.slice(
    (paginaAtual - 1) * CLIENTES_POR_PAGINA,
    paginaAtual * CLIENTES_POR_PAGINA
  )

  /*
   * ==========================================================
   * [RF004] CONSULTAR CLIENTE
   * ==========================================================
   */
  const handleConsultarCliente = async (cliente: Cliente) => {
    try {
      setClienteSelecionado(await buscarCliente(cliente.cpf))
    } catch (erroRequisicao) {
      setErro(mensagemDeErro(erroRequisicao, 'Não foi possível consultar o cliente.'))
    }
  }

  /*
   * ==========================================================
   * [RF001] CADASTRAR / [RF002] ATUALIZAR
   * ==========================================================
   * Os erros lançados aqui são exibidos dentro do próprio modal.
   */
  const handleSalvarCliente = async (dados: ClienteFormulario) => {
    await cadastrarCliente(dados)
    setCadastroAberto(false)
    setMensagemSucesso('Operação realizada com sucesso!')
    await carregarClientes()
  }

  const handleAtualizarCliente = async (cpfAtual: string, dados: ClienteFormulario) => {
    await atualizarCliente(cpfAtual, dados)
    setClienteEmEdicao(null)
    setMensagemSucesso('Operação realizada com sucesso!')
    await carregarClientes()
  }

  /*
   * ==========================================================
   * [RF003] DELETAR CLIENTE (o backend marca como inativo)
   * ==========================================================
   */
  const confirmarExclusao = async () => {
    if (!clienteParaExcluir) return

    setExcluindo(true)
    try {
      await excluirCliente(clienteParaExcluir.cpf)
      setClientes((atuais) =>
        atuais.filter((cliente) => cliente.cpf !== clienteParaExcluir.cpf)
      )
      setMensagemSucesso('Cliente deletado com sucesso!')
    } catch (erroRequisicao) {
      setErro(mensagemDeErro(erroRequisicao, 'Não foi possível deletar o cliente.'))
    } finally {
      setExcluindo(false)
      setClienteParaExcluir(null)
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
              <PeopleIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Clientes</h1>
              <p className="text-sm text-blue-100">Cadastro, edição e consulta</p>
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

        {/* BUSCA + CADASTRO */}
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
              placeholder="Pesquisar por nome ou CPF..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={() => setCadastroAberto(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <AddIcon fontSize="small" />
            Cadastrar Cliente
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
            Exibindo <strong>{clientesFiltrados.length}</strong> cliente(s)
          </p>
        )}

        {/* TABELA */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">CPF</th>
                  <th className="px-5 py-3 font-semibold">Telefone</th>
                  <th className="px-5 py-3 font-semibold">Data Nascimento</th>
                  <th className="px-5 py-3 font-semibold">Contrato</th>
                  <th className="px-5 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {clientesDaPagina.map((cliente) => (
                  <tr key={cliente.cpf} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">{cliente.nome}</td>
                    <td className="px-5 py-4 text-gray-600">{formatarCpf(cliente.cpf)}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {cliente.telefone ? formatarTelefone(cliente.telefone) : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {cliente.dataNascimento ? formatarData(cliente.dataNascimento) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          cliente.possuiContrato
                            ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'
                            : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'
                        }
                      >
                        {cliente.possuiContrato ? 'Sim' : 'Não'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleConsultarCliente(cliente)}
                          title="Consultar"
                          aria-label={`Consultar cliente ${cliente.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-blue-500 transition hover:bg-blue-50"
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setClienteEmEdicao(cliente)}
                          title="Atualizar"
                          aria-label={`Atualizar cliente ${cliente.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-green-600 transition hover:bg-green-50"
                        >
                          <EditIcon fontSize="small" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setClienteParaExcluir(cliente)}
                          title="Deletar"
                          aria-label={`Deletar cliente ${cliente.nome}`}
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
            <p className="px-6 py-12 text-center text-sm text-gray-500">Carregando clientes...</p>
          ) : clientes.length === 0 ? (
            !erro && (
              <p className="px-6 py-12 text-center text-sm font-medium text-gray-700">
                Não existem clientes cadastrados.
              </p>
            )
          ) : clientesFiltrados.length === 0 && (
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
      {clienteSelecionado && (
        <ClienteModal
          cliente={clienteSelecionado}
          onClose={() => setClienteSelecionado(null)}
        />
      )}

      {/* MODAL DE CADASTRO */}
      {cadastroAberto && (
        <CadastroClienteModal
          onClose={() => setCadastroAberto(false)}
          onSave={handleSalvarCliente}
        />
      )}

      {/* MODAL DE ATUALIZAÇÃO */}
      {clienteEmEdicao && (
        <CadastroClienteModal
          cliente={clienteEmEdicao}
          onClose={() => setClienteEmEdicao(null)}
          onSave={(dados) => handleAtualizarCliente(clienteEmEdicao.cpf, dados)}
        />
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {clienteParaExcluir && (
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
                <h2 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h2>
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-gray-600">
                Tem certeza que deseja deletar este cliente?
              </p>
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{clienteParaExcluir.nome}</p>
                <p className="mt-1 text-xs text-gray-500">
                  CPF: {formatarCpf(clienteParaExcluir.cpf)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setClienteParaExcluir(null)}
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
                {excluindo ? 'Deletando...' : 'Sim, Deletar'}
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
    </div>
  )
}
