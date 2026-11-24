import { useEffect, useMemo, useState } from 'react'

import CadastroServicoModal from '../../components/servicos/CadastroServicoModal'
import type { Servico } from '../../types/servico'
import { atualizarServico, cadastrarServico, listarServicos } from '../../services/servicoService'
import { formatarValor } from '../../utils/formatadores'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'

type ServicosProps = {
  onVoltar?: () => void
}

const SERVICOS_POR_PAGINA = 10

export default function Servicos({ onVoltar }: ServicosProps) {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)

  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  /*
   * ==========================================================
   * CARREGAR SERVIÇOS
   * ==========================================================
   */
  useEffect(() => {
    listarServicos()
      .then(setServicos)
      .catch((erroRequisicao: Error) => setErro(erroRequisicao.message))
      .finally(() => setCarregando(false))
  }, [])

  /*
   * ==========================================================
   * FILTRO (nome) E PAGINAÇÃO
   * ==========================================================
   */
  const servicosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    if (!termo) return servicos
    return servicos.filter((s) => s.nome.toLowerCase().includes(termo))
  }, [busca, servicos])

  const totalPaginas = Math.max(1, Math.ceil(servicosFiltrados.length / SERVICOS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const servicosDaPagina = servicosFiltrados.slice(
    (paginaAtual - 1) * SERVICOS_POR_PAGINA,
    paginaAtual * SERVICOS_POR_PAGINA
  )

  /*
   * ==========================================================
   * CADASTRAR / EDITAR
   * ==========================================================
   */
  const handleSalvarServico = async (dados: Omit<Servico, 'id'>) => {
    if (servicoEmEdicao) {
      const atualizado = await atualizarServico(servicoEmEdicao.id, dados)
      setServicos((atuais) => atuais.map((s) => (s.id === servicoEmEdicao.id ? atualizado : s)))
      setServicoEmEdicao(null)
    } else {
      const criado = await cadastrarServico(dados)
      setServicos((atuais) => [...atuais, criado])
      setCadastroAberto(false)
    }
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
              <MedicalServicesIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Serviços</h1>
              <p className="text-sm text-blue-100">Cadastro e edição de serviços prestados</p>
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
              placeholder="Pesquisar por nome..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={() => setCadastroAberto(true)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <AddIcon fontSize="small" />
            Cadastrar Serviço
          </button>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <span>{erro}</span>
            <button type="button" onClick={() => setErro('')} aria-label="Fechar aviso" className="cursor-pointer text-red-400 hover:text-red-600">
              ✕
            </button>
          </div>
        )}

        {/* QUANTIDADE */}
        {!carregando && (
          <p className="mb-3 text-sm text-gray-600">
            Exibindo <strong>{servicosFiltrados.length}</strong> serviço(s)
          </p>
        )}

        {/* TABELA */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">Descrição</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {servicosDaPagina.map((servico) => (
                  <tr key={servico.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-600">{servico.id}</td>
                    <td className="px-5 py-4 font-medium text-gray-800">{servico.nome}</td>
                    <td className="max-w-[300px] truncate px-5 py-4 text-gray-600" title={servico.descricao}>
                      {servico.descricao || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-800">{formatarValor(servico.valor)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => setServicoEmEdicao(servico)}
                          title="Editar"
                          aria-label={`Editar serviço ${servico.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-green-600 transition hover:bg-green-50"
                        >
                          <EditIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARREGANDO / LISTA VAZIA / SEM RESULTADO */}
          {carregando ? (
            <p className="px-6 py-12 text-center text-sm text-gray-500">Carregando serviços...</p>
          ) : servicos.length === 0 ? (
            !erro && (
              <p className="px-6 py-12 text-center text-sm font-medium text-gray-700">
                Não existem serviços cadastrados.
              </p>
            )
          ) : servicosFiltrados.length === 0 && (
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
            <span className="text-gray-600">Página {paginaAtual} de {totalPaginas}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true">
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
      {(cadastroAberto || servicoEmEdicao) && (
        <CadastroServicoModal
          servico={servicoEmEdicao ?? undefined}
          onClose={() => {
            setCadastroAberto(false)
            setServicoEmEdicao(null)
          }}
          onSave={handleSalvarServico}
        />
      )}
    </div>
  )
}
