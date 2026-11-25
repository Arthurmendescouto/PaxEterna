import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PaymentsIcon from '@mui/icons-material/Payments'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'

import {
  atualizarPagamento,
  cadastrarPagamento,
  listarPagamentos,
  listarVinculosPagamento,
} from '../../services/pagamentoService'
import { buscarCliente } from '../../services/clienteService'
import type {
  FormaPagamento,
  Pagamento,
  StatusPagamento,
  TipoPagamento,
  VinculoPagamento,
} from '../../types/pagamento'
import {
  formatarCpf,
  formatarData,
  formatarValor,
  somenteDigitos,
} from '../../utils/formatadores'

type PagamentosProps = {
  onVoltar?: () => void
}

const PAGAMENTOS_POR_PAGINA = 10
const STATUS_PAGAMENTO = [
  { valor: 'pendente', rotulo: 'Pendente' },
  { valor: 'pago', rotulo: 'Pago' },
  { valor: 'cancelado', rotulo: 'Cancelado' },
] as const

const FORMAS_PAGAMENTO = [
  { valor: 'dinheiro', rotulo: 'Dinheiro' },
  { valor: 'cartao de credito', rotulo: 'Cartão de crédito' },
  { valor: 'cartao de debito', rotulo: 'Cartão de débito' },
  { valor: 'pix', rotulo: 'Pix' },
  { valor: 'boleto', rotulo: 'Boleto' },
] as const

function dataAtualLocal() {
  const data = new Date()
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function mesmaChave(a: Pagamento, b: Pagamento) {
  return a.id === b.id && a.tipo === b.tipo
}

export default function Pagamentos({ onVoltar }: PagamentosProps) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [pagamentoEmEdicao, setPagamentoEmEdicao] = useState<Pagamento | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [estornando, setEstornando] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [cpf, setCpf] = useState('')
  const [cpfValidado, setCpfValidado] = useState('')
  const [consultandoCliente, setConsultandoCliente] = useState(false)
  const [erroCpf, setErroCpf] = useState('')
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | ''>('')
  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamento | ''>('')
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento>('pendente')
  const [dataPagamento, setDataPagamento] = useState('')
  const [vinculos, setVinculos] = useState<VinculoPagamento[]>([])
  const [vinculoId, setVinculoId] = useState('')
  const [carregandoVinculos, setCarregandoVinculos] = useState(false)
  const [erroFormulario, setErroFormulario] = useState('')
  const requisicaoCpf = useRef(0)
  const [pagamentoParaEstornar, setPagamentoParaEstornar] = useState<Pagamento | null>(null)

  useEffect(() => {
    listarPagamentos()
      .then(setPagamentos)
      .catch((erroRequisicao: Error) => setErro(erroRequisicao.message))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    if (!cadastroAberto || pagamentoEmEdicao || !tipoPagamento || !cpfValidado) {
      return
    }

    let cancelada = false

    listarVinculosPagamento(tipoPagamento, cpfValidado)
      .then((resultado) => {
        if (!cancelada) setVinculos(resultado)
      })
      .catch((erroRequisicao: Error) => {
        if (!cancelada) setErroFormulario(erroRequisicao.message)
      })
      .finally(() => {
        if (!cancelada) setCarregandoVinculos(false)
      })

    return () => {
      cancelada = true
    }
  }, [cadastroAberto, pagamentoEmEdicao, tipoPagamento, cpfValidado])

  const pagamentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return pagamentos

    return pagamentos.filter((pagamento) => {
      const forma = FORMAS_PAGAMENTO.find((opcao) => opcao.valor === pagamento.formaPagamento)
      const termoDigitos = somenteDigitos(termo)
      return (
        String(pagamento.id).includes(termo) ||
        (pagamento.nome?.toLowerCase().includes(termo) ?? false) ||
        (termoDigitos !== '' && (pagamento.cpf?.includes(termoDigitos) ?? false)) ||
        pagamento.tipo.includes(termo) ||
        (pagamento.formaPagamento?.includes(termo) ?? false) ||
        (forma?.rotulo.toLowerCase().includes(termo) ?? false)
      )
    })
  }, [busca, pagamentos])

  const totalPaginas = Math.max(1, Math.ceil(pagamentosFiltrados.length / PAGAMENTOS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const pagamentosDaPagina = pagamentosFiltrados.slice(
    (paginaAtual - 1) * PAGAMENTOS_POR_PAGINA,
    paginaAtual * PAGAMENTOS_POR_PAGINA
  )

  const abrirCadastro = () => {
    requisicaoCpf.current += 1
    setPagamentoEmEdicao(null)
    setCpf('')
    setCpfValidado('')
    setConsultandoCliente(false)
    setErroCpf('')
    setNome('')
    setValor('')
    setFormaPagamento('')
    setTipoPagamento('')
    setStatusPagamento('pendente')
    setDataPagamento(dataAtualLocal())
    setVinculos([])
    setVinculoId('')
    setErroFormulario('')
    setMensagemSucesso('')
    setErro('')
    setCadastroAberto(true)
  }

  const abrirEdicao = (pagamento: Pagamento) => {
    requisicaoCpf.current += 1
    setPagamentoEmEdicao(pagamento)
    setCpf(formatarCpf(pagamento.cpf ?? ''))
    setCpfValidado(pagamento.cpf ?? '')
    setConsultandoCliente(false)
    setErroCpf('')
    setNome(pagamento.nome ?? '')
    setValor(String(pagamento.valor))
    setFormaPagamento(pagamento.formaPagamento ?? '')
    setTipoPagamento(pagamento.tipo)
    setStatusPagamento(pagamento.status)
    setDataPagamento(pagamento.dataPagamento ?? '')
    setVinculos([])
    setVinculoId('')
    setErroFormulario('')
    setMensagemSucesso('')
    setErro('')
    setCadastroAberto(true)
  }

  const fecharCadastro = () => {
    requisicaoCpf.current += 1
    setConsultandoCliente(false)
    setCadastroAberto(false)
    setPagamentoEmEdicao(null)
    setVinculos([])
    setVinculoId('')
  }

  const consultarClientePorCpf = async () => {
    const cpfInformado = somenteDigitos(cpf)
    if (cpfInformado.length !== 11) {
      setCpfValidado('')
      setNome('')
      setErroCpf('Informe um CPF válido com 11 dígitos.')
      setVinculos([])
      setVinculoId('')
      setCarregandoVinculos(false)
      return
    }

    const requisicaoAtual = ++requisicaoCpf.current
    setConsultandoCliente(true)
    setErroCpf('')
    setCpfValidado('')
    setNome('')

    try {
      const cliente = await buscarCliente(cpfInformado)
      if (requisicaoAtual !== requisicaoCpf.current) return

      setCpfValidado(somenteDigitos(cliente.cpf))
      setNome(cliente.nome)
      setErroCpf('')
      if (tipoPagamento) setCarregandoVinculos(true)
    } catch (erroRequisicao) {
      if (requisicaoAtual !== requisicaoCpf.current) return

      setErroCpf(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : 'Não foi possível localizar um cliente com este CPF.'
      )
    } finally {
      if (requisicaoAtual === requisicaoCpf.current) setConsultandoCliente(false)
    }
  }

  const salvarPagamento = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const valorNumerico = Number(valor)

    if (
      !pagamentoEmEdicao &&
      (!cpfValidado || cpfValidado !== somenteDigitos(cpf))
    ) {
      setErroFormulario('Consulte um CPF existente antes de salvar o pagamento.')
      return
    }

    if (
      !tipoPagamento ||
      !valor ||
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      setErroFormulario('Preencha todos os campos obrigatórios com valores válidos.')
      return
    }

    if (!pagamentoEmEdicao && (!vinculoId || !Number.isSafeInteger(Number(vinculoId)))) {
      setErroFormulario('Selecione uma compra ou contrato para vincular ao pagamento.')
      return
    }

    setSalvando(true)
    setErroFormulario('')
    try {
      const dadosPagamento = {
        valor: valorNumerico,
        dataPagamento: dataPagamento || null,
        formaPagamento: formaPagamento || null,
        status: statusPagamento,
      }

      if (pagamentoEmEdicao) {
        const pagamentoAtualizado = await atualizarPagamento(
          pagamentoEmEdicao.tipo,
          pagamentoEmEdicao.id,
          dadosPagamento
        )
        setPagamentos((atuais) =>
          atuais.map((pagamento) =>
            mesmaChave(pagamento, pagamentoEmEdicao)
              ? pagamentoAtualizado
              : pagamento
          )
        )
        setPagamentoSelecionado((atual) =>
          atual && mesmaChave(atual, pagamentoAtualizado) ? pagamentoAtualizado : atual
        )
        setMensagemSucesso('Pagamento atualizado com sucesso!')
      } else {
        const pagamentoCriado = await cadastrarPagamento({
          ...dadosPagamento,
          tipo: tipoPagamento,
          fk_id: Number(vinculoId),
        })
        setPagamentos((atuais) => [pagamentoCriado, ...atuais])
        setMensagemSucesso('Pagamento cadastrado com sucesso!')
      }

      fecharCadastro()
    } catch (erroRequisicao) {
      setErroFormulario(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : 'Não foi possível salvar o pagamento.'
      )
    } finally {
      setSalvando(false)
    }
  }

  const confirmarEstorno = async () => {
    if (!pagamentoParaEstornar) return

    setEstornando(true)
    setErro('')
    try {
      const pagamentoCancelado = await atualizarPagamento(
        pagamentoParaEstornar.tipo,
        pagamentoParaEstornar.id,
        {
          valor: pagamentoParaEstornar.valor,
          dataPagamento: pagamentoParaEstornar.dataPagamento,
          formaPagamento: pagamentoParaEstornar.formaPagamento,
          status: 'cancelado',
        }
      )
      setPagamentos((atuais) =>
        atuais.map((pagamento) =>
          mesmaChave(pagamento, pagamentoCancelado) ? pagamentoCancelado : pagamento
        )
      )
      setPagamentoSelecionado((atual) =>
        atual && mesmaChave(atual, pagamentoCancelado) ? pagamentoCancelado : atual
      )
      setMensagemSucesso(`Pagamento #${pagamentoCancelado.id} estornado com sucesso.`)
      setPagamentoParaEstornar(null)
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : 'Não foi possível estornar o pagamento.'
      )
    } finally {
      setEstornando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#2d5082] text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
              <PaymentsIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Pagamentos</h1>
              <p className="text-sm text-blue-100">Cadastro, atualização e consulta de pagamentos</p>
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <SearchIcon
              fontSize="small"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={busca}
              onChange={(event) => {
                setBusca(event.target.value)
                setPagina(1)
              }}
              aria-label="Pesquisar pagamentos"
              placeholder="Pesquisar por ID, nome, CPF, forma ou tipo de pagamento..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="button"
            onClick={abrirCadastro}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <AddIcon fontSize="small" />
            Cadastrar pagamento
          </button>
        </div>

        <div className="mb-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Pagamentos carregados da API. Novos registros devem estar vinculados a uma compra ou
          contrato ativo do cliente.
        </div>

        {mensagemSucesso && (
          <div
            className="mb-4 flex items-center justify-between gap-3 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700"
            role="status"
          >
            <span>{mensagemSucesso}</span>
            <button
              type="button"
              onClick={() => setMensagemSucesso('')}
              aria-label="Fechar aviso"
              className="cursor-pointer text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        )}

        {erro && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {erro}
          </div>
        )}

        <p className="mb-3 text-sm text-gray-600">
          {carregando
            ? 'Carregando pagamentos...'
            : <>Exibindo <strong>{pagamentosFiltrados.length}</strong> pagamento(s)</>}
        </p>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">CPF</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Forma de pagamento</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagamentosDaPagina.map((pagamento) => (
                  <tr key={`${pagamento.tipo}:${pagamento.id}`} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">#{pagamento.id}</td>
                    <td className="px-5 py-4 font-medium text-gray-800">{pagamento.nome ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {pagamento.cpf ? formatarCpf(pagamento.cpf) : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-600 capitalize">{pagamento.tipo}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {FORMAS_PAGAMENTO.find((forma) => forma.valor === pagamento.formaPagamento)?.rotulo ?? '—'}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {formatarValor(pagamento.valor)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {STATUS_PAGAMENTO.find((status) => status.valor === pagamento.status)?.rotulo}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPagamentoSelecionado(pagamento)}
                        title="Consultar pagamento"
                        aria-label={`Consultar pagamento ${pagamento.id}`}
                        className="cursor-pointer rounded-md px-3 py-1.5 text-blue-500 transition hover:bg-blue-50"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirEdicao(pagamento)}
                        title="Editar pagamento"
                        aria-label={`Editar pagamento ${pagamento.id}`}
                        className="cursor-pointer rounded-md px-3 py-1.5 text-amber-600 transition hover:bg-amber-50"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      {pagamento.status !== 'cancelado' && (
                        <button
                          type="button"
                          onClick={() => setPagamentoParaEstornar(pagamento)}
                          title="Estornar pagamento"
                          aria-label={`Estornar pagamento ${pagamento.id}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-red-500 transition hover:bg-red-50"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagamentosFiltrados.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm font-medium text-gray-700">
              {carregando
                ? 'Carregando pagamentos...'
                : pagamentos.length === 0
                ? 'Nenhum pagamento cadastrado.'
                : 'Nenhum resultado encontrado!'}
            </p>
          ) : null}
        </div>

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

      {cadastroAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pagamento-cadastro-titulo"
        >
          <form
            onSubmit={salvarPagamento}
            className="flex max-h-[calc(100dvh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <div className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <PaymentsIcon className="text-blue-600" />
              </div>
              <div>
                <h2 id="pagamento-cadastro-titulo" className="text-lg font-semibold text-gray-900">
                  {pagamentoEmEdicao ? 'Atualizar pagamento' : 'Cadastrar pagamento'}
                </h2>
                <p className="text-sm text-gray-500">
                  {pagamentoEmEdicao
                    ? 'Altere os dados do pagamento selecionado'
                    : 'Preencha os dados do pagamento'}
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-2">
              <div>
                <label htmlFor="pagamento-id" className="mb-1 block text-sm font-medium text-gray-700">
                  ID do pagamento
                </label>
                <input
                  id="pagamento-id"
                  type="text"
                  value={pagamentoEmEdicao?.id ?? 'Gerado pelo sistema'}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {pagamentoEmEdicao
                    ? 'O identificador do pagamento não pode ser alterado.'
                    : 'O identificador será gerado pela API.'}
                </p>
              </div>

              <div>
                <label htmlFor="pagamento-cpf" className="mb-1 block text-sm font-medium text-gray-700">
                  CPF do cliente <span className="text-red-600">*</span>
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="pagamento-cpf"
                    type="text"
                    value={cpf}
                    onChange={(event) => {
                      requisicaoCpf.current += 1
                      setCpf(formatarCpf(event.target.value))
                      setCpfValidado('')
                      setConsultandoCliente(false)
                      setErroCpf('')
                      setNome('')
                      setErroFormulario('')
                      setVinculos([])
                      setVinculoId('')
                      setCarregandoVinculos(false)
                    }}
                    readOnly={Boolean(pagamentoEmEdicao)}
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={14}
                    required={!pagamentoEmEdicao}
                    aria-describedby="pagamento-cpf-ajuda"
                    className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="000.000.000-00"
                  />
                  {!pagamentoEmEdicao && (
                    <button
                      type="button"
                      onClick={consultarClientePorCpf}
                      disabled={consultandoCliente || somenteDigitos(cpf).length !== 11}
                      className="cursor-pointer rounded-md border border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {consultandoCliente ? 'Consultando...' : 'Consultar CPF'}
                    </button>
                  )}
                </div>
                <p id="pagamento-cpf-ajuda" className="mt-1 text-xs text-gray-500">
                  {pagamentoEmEdicao
                    ? 'O pagamento permanece vinculado ao cliente e registro originais.'
                    : 'O nome será preenchido após confirmar um CPF cadastrado.'}
                </p>
                {erroCpf && (
                  <p className="mt-1 text-sm text-red-700" role="alert">
                    {erroCpf}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="pagamento-nome" className="mb-1 block text-sm font-medium text-gray-700">
                  Nome do cliente
                </label>
                <input
                  id="pagamento-nome"
                  type="text"
                  value={nome}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600"
                  placeholder="Preenchido pela consulta do CPF"
                />
              </div>

              <div>
                <label htmlFor="pagamento-valor" className="mb-1 block text-sm font-medium text-gray-700">
                  Valor <span className="text-red-600">*</span>
                </label>
                <input
                  id="pagamento-valor"
                  type="number"
                  value={valor}
                  onChange={(event) => setValor(event.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label htmlFor="pagamento-forma" className="mb-1 block text-sm font-medium text-gray-700">
                  Forma de pagamento
                </label>
                <select
                  id="pagamento-forma"
                  value={formaPagamento}
                  onChange={(event) => {
                    const formaSelecionada = FORMAS_PAGAMENTO.find(
                      (forma) => forma.valor === event.target.value
                    )
                    setFormaPagamento(formaSelecionada?.valor ?? '')
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Selecione a forma de pagamento</option>
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <option key={forma.valor} value={forma.valor}>
                      {forma.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pagamento-tipo" className="mb-1 block text-sm font-medium text-gray-700">
                  Tipo de pagamento <span className="text-red-600">*</span>
                </label>
                <select
                  id="pagamento-tipo"
                  value={tipoPagamento}
                  onChange={(event) => {
                    const tipo = event.target.value
                    const tipoValido =
                      tipo === 'avulso' || tipo === 'assinatura' ? tipo : ''
                    setTipoPagamento(tipoValido)
                    setVinculoId('')
                    setVinculos([])
                    setCarregandoVinculos(Boolean(tipoValido && cpfValidado))
                    setErroFormulario('')
                  }}
                  disabled={Boolean(pagamentoEmEdicao)}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Selecione o tipo de pagamento</option>
                  <option value="avulso">Pagamento avulso</option>
                  <option value="assinatura">Pagamento da assinatura</option>
                </select>
              </div>

              {pagamentoEmEdicao ? (
                <div>
                  <span className="mb-1 block text-sm font-medium text-gray-700">Vínculo</span>
                  <p className="rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600">
                    {pagamentoEmEdicao.tipo === 'avulso' ? 'Compra' : 'Contrato'} #
                    {pagamentoEmEdicao.idCompra ?? pagamentoEmEdicao.idContrato}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    O vínculo original não pode ser alterado.
                  </p>
                </div>
              ) : tipoPagamento && cpfValidado ? (
                <div>
                  <label htmlFor="pagamento-vinculo" className="mb-1 block text-sm font-medium text-gray-700">
                    {tipoPagamento === 'avulso' ? 'Compra' : 'Contrato ativo'}{' '}
                    <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="pagamento-vinculo"
                    value={vinculoId}
                    onChange={(event) => {
                      setVinculoId(event.target.value)
                      const vinculoSelecionado = vinculos.find(
                        (vinculo) => String(vinculo.id) === event.target.value
                      )
                      if (vinculoSelecionado) setValor(String(vinculoSelecionado.valor))
                    }}
                    disabled={carregandoVinculos || vinculos.length === 0}
                    required
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  >
                    <option value="">
                      {carregandoVinculos
                        ? 'Carregando vínculos...'
                        : vinculos.length === 0
                          ? 'Nenhum vínculo disponível'
                          : 'Selecione uma opção'}
                    </option>
                    {vinculos.map((vinculo) => (
                      <option key={vinculo.id} value={vinculo.id}>
                        {tipoPagamento === 'avulso' ? 'Compra' : 'Contrato'} #{vinculo.id}
                        {' · '}
                        {formatarData(vinculo.dataInicio)}
                        {vinculo.dataTermino
                          ? ` a ${formatarData(vinculo.dataTermino)}`
                          : ''}
                        {' · '}
                        {formatarValor(vinculo.valor)}
                      </option>
                    ))}
                  </select>
                  {!carregandoVinculos && vinculos.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      Não há {tipoPagamento === 'avulso' ? 'compras' : 'contratos ativos'} para este CPF.
                    </p>
                  )}
                  {vinculos.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      O valor é preenchido com o valor do vínculo e pode ser ajustado.
                    </p>
                  )}
                </div>
              ) : null}

              <div>
                <label htmlFor="pagamento-data" className="mb-1 block text-sm font-medium text-gray-700">
                  Data do pagamento
                </label>
                <input
                  id="pagamento-data"
                  type="date"
                  value={dataPagamento}
                  onChange={(event) => setDataPagamento(event.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="pagamento-status" className="mb-1 block text-sm font-medium text-gray-700">
                  Status <span className="text-red-600">*</span>
                </label>
                <select
                  id="pagamento-status"
                  value={statusPagamento}
                  onChange={(event) => {
                    const status = event.target.value
                    if (status === 'pago' || status === 'cancelado' || status === 'pendente') {
                      setStatusPagamento(status)
                    }
                  }}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  {STATUS_PAGAMENTO.map((status) => (
                    <option key={status.valor} value={status.valor}>
                      {status.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              {erroFormulario && (
                <p className="text-sm text-red-700" role="alert">
                  {erroFormulario}
                </p>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={fecharCadastro}
                disabled={salvando}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando
                  ? 'Salvando...'
                  : pagamentoEmEdicao
                    ? 'Salvar alterações'
                    : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {pagamentoSelecionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pagamento-modal-titulo"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <PaymentsIcon className="text-blue-600" />
              </div>
              <div>
                <h2 id="pagamento-modal-titulo" className="text-lg font-semibold text-gray-900">
                  Consulta do pagamento
                </h2>
                <p className="text-sm text-gray-500">Pagamento #{pagamentoSelecionado.id}</p>
              </div>
            </div>

            <dl className="space-y-4 px-6 py-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Nome</dt>
                <dd className="font-medium text-gray-800">{pagamentoSelecionado.nome ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">CPF</dt>
                <dd className="font-medium text-gray-800">
                  {pagamentoSelecionado.cpf ? formatarCpf(pagamentoSelecionado.cpf) : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Tipo</dt>
                <dd className="font-medium capitalize text-gray-800">
                  {pagamentoSelecionado.tipo === 'avulso' ? 'Pagamento avulso' : 'Pagamento da assinatura'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Vínculo</dt>
                <dd className="font-medium text-gray-800">
                  {pagamentoSelecionado.tipo === 'avulso' ? 'Compra' : 'Contrato'} #
                  {pagamentoSelecionado.idCompra ?? pagamentoSelecionado.idContrato}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Valor</dt>
                <dd className="font-medium text-gray-800">{formatarValor(pagamentoSelecionado.valor)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Data</dt>
                <dd className="font-medium text-gray-800">
                  {pagamentoSelecionado.dataPagamento
                    ? formatarData(pagamentoSelecionado.dataPagamento)
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Forma de pagamento</dt>
                <dd className="font-medium text-gray-800">
                  {FORMAS_PAGAMENTO.find((forma) => forma.valor === pagamentoSelecionado.formaPagamento)?.rotulo ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-gray-800">
                  {STATUS_PAGAMENTO.find((status) => status.valor === pagamentoSelecionado.status)?.rotulo}
                </dd>
              </div>
            </dl>

            <div className="flex justify-end bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setPagamentoSelecionado(null)}
                className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {pagamentoParaEstornar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="estorno-pagamento-titulo"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <DeleteIcon className="text-red-600" sx={{ fontSize: 23 }} />
              </div>
              <div>
                <h2 id="estorno-pagamento-titulo" className="text-lg font-semibold text-gray-900">
                  Estornar pagamento
                </h2>
                <p className="text-sm text-gray-500">Confirmação de estorno</p>
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm leading-6 text-gray-600">
                Deseja realmente estornar este pagamento?
              </p>
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  Pagamento #{pagamentoParaEstornar.id} · {pagamentoParaEstornar.nome ?? 'Cliente não identificado'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {pagamentoParaEstornar.cpf
                    ? formatarCpf(pagamentoParaEstornar.cpf)
                    : 'Sem CPF'}
                  {' · '}
                  {formatarValor(pagamentoParaEstornar.valor)}
                </p>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                O pagamento será mantido no histórico e seu status será atualizado para cancelado.
              </p>
            </div>

            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setPagamentoParaEstornar(null)}
                disabled={estornando}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEstorno}
                disabled={estornando}
                className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <DeleteIcon fontSize="small" />
                {estornando ? 'Estornando...' : 'Confirmar estorno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
