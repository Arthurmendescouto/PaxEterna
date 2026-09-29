import { useMemo, useState } from 'react'

import ClienteModal from '../../components/clientes/ClienteModal'
import CadastroClienteModal from '../../components/clientes/CadastroClienteModal'
import type { Cliente } from '../../types/cliente'

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

/*
 * ==========================================================
 * DADOS INICIAIS
 * ==========================================================
 *
 * Estes dados são temporários.
 *
 * Posteriormente, eles serão substituídos pelos dados
 * retornados pelo backend através do clienteService.
 */
const clientesIniciais: Cliente[] = [
  {
    id: 1,
    nome: 'Maria Aparecida Oliveira',
    cpf: '482.917.365-41',
    dataNascimento: '22/07/1965',
    telefone: '(77) 98123-4567',
    email: 'maria.oliveira@example.com',
    endereco:
      'Rua das Palmeiras, 123, Bairro Jardim, Vitória da Conquista',
    cidade: 'Vitória da Conquista',
    uf: 'BA',
    contrato: 'Ativo',
    dataCriacao: '15/03/2024',
  },

  {
    id: 2,
    nome: 'Carlos Eduardo Ferreira',
    cpf: '317.504.892-63',
    dataNascimento: '08/11/1978',
    telefone: '(77) 99456-7890',
    email: 'carlos.ferreira@example.com',
    endereco:
      'Av. Brasil, 456, Centro, Jequié',
    cidade: 'Jequié',
    uf: 'BA',
    contrato: 'Ativo',
    dataCriacao: '22/09/2023',
  },

  {
    id: 3,
    nome: 'Ana Beatriz Souza Lima',
    cpf: '625.830.147-09',
    dataNascimento: '14/02/1990',
    telefone: '(77) 98765-4321',
    email: 'ana.lima@example.com',
    endereco:
      'Rua São Francisco, 78, Bairro Heliópolis, Itabuna',
    cidade: 'Itabuna',
    uf: 'BA',
    contrato: 'Inativo',
    dataCriacao: '10/06/2025',
  },

  {
    id: 4,
    nome: 'Roberto Alves Martins',
    cpf: '941.263.578-22',
    dataNascimento: '30/05/1952',
    telefone: '(77) 99234-5678',
    email: 'roberto.martins@example.com',
    endereco:
      'Travessa das Flores, 12, Bairro Santa Cruz, Ilhéus',
    cidade: 'Ilhéus',
    uf: 'BA',
    contrato: 'Ativo',
    dataCriacao: '05/01/2022',
  },
]

export default function Clientes({
  onVoltar,
}: ClientesProps) {

  /*
   * ==========================================================
   * ESTADOS
   * ==========================================================
   */

  /*
   * Lista de clientes.
   *
   * Atualmente os dados estão no frontend.
   * Posteriormente serão carregados através do backend.
   */
  const [clientes, setClientes] =
    useState<Cliente[]>(clientesIniciais)

  /*
   * Texto utilizado na pesquisa.
   */
  const [busca, setBusca] = useState('')

  /*
   * Cliente selecionado para consulta.
   */
  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null)

  /*
   * Controla a abertura do modal de cadastro.
   */
  const [cadastroAberto, setCadastroAberto] =
    useState(false)

  /*
   * Cliente que está aguardando confirmação
   * de exclusão.
   */
  const [clienteParaExcluir, setClienteParaExcluir] =
    useState<Cliente | null>(null)

  /*
   * Controla a mensagem de sucesso após
   * a exclusão.
   */
  const [mensagemSucesso, setMensagemSucesso] =
    useState(false)

  /*
   * ==========================================================
   * FILTRO DE CLIENTES
   * ==========================================================
   *
   * Permite pesquisar por:
   *
   * - Nome
   * - CPF
   */
  const clientesFiltrados = useMemo(() => {

    const termo = busca.toLowerCase().trim()

    if (!termo) {
      return clientes
    }

    return clientes.filter(
      (cliente) =>
        cliente.nome
          .toLowerCase()
          .includes(termo) ||
        cliente.cpf.includes(termo)
    )

  }, [busca, clientes])

  /*
   * ==========================================================
   * CONSULTAR CLIENTE
   * ==========================================================
   */
  const handleConsultarCliente = (
    cliente: Cliente
  ) => {
    setClienteSelecionado(cliente)
  }

  /*
   * ==========================================================
   * FECHAR MODAL DE CONSULTA
   * ==========================================================
   */
  const handleFecharModal = () => {
    setClienteSelecionado(null)
  }

  /*
   * ==========================================================
   * EDITAR CLIENTE
   * ==========================================================
   *
   * A implementação do formulário de edição será feita
   * posteriormente.
   */
  const handleEditarCliente = (
    cliente: Cliente
  ) => {
    console.log('Editar cliente:', cliente)
  }

  /*
   * ==========================================================
   * INICIAR EXCLUSÃO
   * ==========================================================
   *
   * Não utilizamos window.confirm().
   *
   * Ao clicar na lixeira, abrimos nosso próprio modal
   * de confirmação.
   */
  const handleExcluirCliente = (
    cliente: Cliente
  ) => {
    setClienteParaExcluir(cliente)
  }

  /*
   * ==========================================================
   * CANCELAR EXCLUSÃO
   * ==========================================================
   */
  const cancelarExclusao = () => {
    setClienteParaExcluir(null)
  }

  /*
   * ==========================================================
   * CONFIRMAR EXCLUSÃO
   * ==========================================================
   *
   * Atualmente remove o cliente somente do estado local.
   *
   * Posteriormente poderá ser substituído por algo como:
   *
   * await excluirCliente(clienteParaExcluir.id)
   */
  const confirmarExclusao = () => {

    if (!clienteParaExcluir) {
      return
    }

    setClientes((clientesAtuais) =>
      clientesAtuais.filter(
        (cliente) =>
          cliente.id !== clienteParaExcluir.id
      )
    )

    /*
     * Fecha o modal de confirmação.
     */
    setClienteParaExcluir(null)

    /*
     * Exibe o modal de sucesso.
     */
    setMensagemSucesso(true)
  }

  /*
   * ==========================================================
   * ABRIR CADASTRO
   * ==========================================================
   */
  const handleCadastrarCliente = () => {
    setCadastroAberto(true)
  }

  /*
   * ==========================================================
   * SALVAR CLIENTE
   * ==========================================================
   *
   * Atualmente adiciona o cliente ao estado local.
   *
   * Posteriormente o cadastro será enviado ao backend.
   */
  const handleSalvarCliente = (
    cliente: Cliente
  ) => {

    setClientes((clientesAtuais) => [
      ...clientesAtuais,
      cliente,
    ])

    setCadastroAberto(false)
  }

  /*
   * ==========================================================
   * RENDERIZAÇÃO
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <header className="bg-[#2d5082] text-white shadow">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          {/* Identificação do módulo */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">

              <PeopleIcon />

            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Gerenciar Clientes
              </h1>

              <p className="text-sm text-blue-100">
                Cadastro, edição e consulta
              </p>

            </div>

          </div>

          {/* Voltar */}

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
            BUSCA + CADASTRO
        ==================================================== */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">

          {/* Campo de pesquisa */}

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
              placeholder="Pesquisar por nome ou CPF..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Cadastrar cliente */}

          <button
            type="button"
            onClick={handleCadastrarCliente}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >

            <AddIcon fontSize="small" />

            Cadastrar Cliente

          </button>

        </div>

        {/* ===================================================
            QUANTIDADE
        ==================================================== */}

        <p className="mb-3 text-sm text-gray-600">

          Exibindo{' '}

          <strong>
            {clientesFiltrados.length}
          </strong>{' '}

          cliente(s)

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
                    CPF
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Telefone
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Contrato
                  </th>

                  <th className="px-5 py-3 text-center font-semibold">
                    Ações
                  </th>

                </tr>

              </thead>

              {/* Corpo */}

              <tbody className="divide-y divide-gray-100">

                {clientesFiltrados.map((cliente) => (

                  <tr
                    key={cliente.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* ID */}

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {cliente.id}
                    </td>

                    {/* Nome */}

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {cliente.nome}
                    </td>

                    {/* CPF */}

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.cpf}
                    </td>

                    {/* Telefone */}

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.telefone}
                    </td>

                    {/* Contrato */}

                    <td className="px-5 py-4">

                      <span
                        className={
                          cliente.contrato === 'Ativo'
                            ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'
                            : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'
                        }
                      >
                        {cliente.contrato}
                      </span>

                    </td>

                    {/* Ações */}

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-1">

                        {/* Consultar */}

                        <button
                          type="button"
                          onClick={() =>
                            handleConsultarCliente(cliente)
                          }
                          title="Consultar cliente"
                          aria-label={`Consultar cliente ${cliente.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-blue-500 transition hover:bg-blue-50"
                        >

                          <VisibilityIcon fontSize="small" />

                        </button>

                        {/* Editar */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEditarCliente(cliente)
                          }
                          title="Editar cliente"
                          aria-label={`Editar cliente ${cliente.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-green-600 transition hover:bg-green-50"
                        >

                          <EditIcon fontSize="small" />

                        </button>

                        {/* Excluir */}

                        <button
                          type="button"
                          onClick={() =>
                            handleExcluirCliente(cliente)
                          }
                          title="Excluir cliente"
                          aria-label={`Excluir cliente ${cliente.nome}`}
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

          {clientesFiltrados.length === 0 && (

            <div className="px-6 py-12 text-center">

              <p className="text-sm font-medium text-gray-700">
                Nenhum cliente encontrado
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Tente pesquisar utilizando outro nome ou CPF.
              </p>

            </div>

          )}

        </div>

      </main>

      {/* =====================================================
          MODAL DE CONSULTA
      ====================================================== */}

      {clienteSelecionado && (

        <ClienteModal
          cliente={clienteSelecionado}
          onClose={handleFecharModal}
        />

      )}

      {/* =====================================================
          MODAL DE CADASTRO
      ====================================================== */}

      {cadastroAberto && (

        <CadastroClienteModal
          proximoId={
            Math.max(
              0,
              ...clientes.map(
                (cliente) => cliente.id
              )
            ) + 1
          }
          onClose={() =>
            setCadastroAberto(false)
          }
          onSave={handleSalvarCliente}
        />

      )}

      {/* =====================================================
          MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
      ====================================================== */}

      {clienteParaExcluir && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">

            {/* =================================================
                CABEÇALHO DO MODAL
            ================================================== */}

            <div className="flex items-center gap-3 px-6 py-5">

              {/* Ícone da lixeira ao lado do título */}

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">

                <DeleteIcon
                  className="text-red-600"
                  sx={{ fontSize: 23 }}
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Excluir cliente
                </h2>

                <p className="text-sm text-gray-500">
                  Confirmação de exclusão
                </p>

              </div>

            </div>

            {/* =================================================
                CONTEÚDO
            ================================================== */}

            <div className="px-6 py-6">

              <p className="text-sm leading-6 text-gray-600">
                Deseja realmente excluir este item?
              </p>

              {/* Cliente selecionado */}

              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">

                <p className="text-sm font-semibold text-gray-900">
                  {clienteParaExcluir.nome}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  CPF: {clienteParaExcluir.cpf}
                </p>

              </div>

            </div>

            {/* =================================================
                BOTÕES
            ================================================== */}

            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">

              {/* Cancelar */}

              <button
                type="button"
                onClick={cancelarExclusao}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Cancelar
              </button>

              {/* Confirmar */}

              <button
                type="button"
                onClick={confirmarExclusao}
                className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >

                <DeleteIcon fontSize="small" />

                Sim, excluir

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL DE SUCESSO
      ====================================================== */}

      {mensagemSucesso && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">

            {/* =================================================
                CABEÇALHO
            ================================================== */}

            <div className="flex items-center gap-3 px-6 py-5">

              {/* Ícone */}

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">

                <span className="text-xl font-bold text-green-600">
                  ✓
                </span>

              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Cliente excluído!
                </h2>

                <p className="text-sm text-gray-500">
                  Operação realizada
                </p>

              </div>

            </div>

            {/* =================================================
                MENSAGEM
            ================================================== */}

            <div className="px-6 py-6">

              <p className="text-sm leading-6 text-gray-600">
                Cliente excluído com sucesso!
              </p>

            </div>

            {/* =================================================
                BOTÃO
            ================================================== */}

            <div className="flex justify-end bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setMensagemSucesso(false)
                }
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