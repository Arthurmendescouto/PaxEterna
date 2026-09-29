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

interface ClientesProps {
  onVoltar?: () => void
}

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
    endereco: 'Av. Brasil, 456, Centro, Jequié',
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

export default function Clientes({ onVoltar }: ClientesProps) {
  const [clientes, setClientes] =
    useState<Cliente[]>(clientesIniciais)

  const [busca, setBusca] = useState('')

  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null)

  const [cadastroAberto, setCadastroAberto] = useState(false)

  /*
   * Futuramente podemos utilizar este estado para
   * controlar um modal específico de confirmação de exclusão.
   *
   * Por enquanto, utilizamos window.confirm().
   */

  /**
   * Filtra os clientes pelo nome ou CPF.
   */
  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()

    if (!termo) {
      return clientes
    }

    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.cpf.includes(termo)
    )
  }, [busca, clientes])

  /**
   * Consulta os dados de um cliente.
   *
   * Atualmente abre o ClienteModal.
   */
  const handleConsultarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
  }

  /**
   * Fecha o modal de consulta.
   */
  const handleFecharModal = () => {
    setClienteSelecionado(null)
  }

  /**
   * Edita um cliente.
   *
   * Ainda será implementado quando criarmos
   * o formulário de cadastro/edição.
   */
  const handleEditarCliente = (cliente: Cliente) => {
    console.log('Editar cliente:', cliente)

    // Futuramente:
    // setClienteEmEdicao(cliente)
    // abrir formulário de edição
  }

  /**
   * Exclui um cliente.
   *
   * ATENÇÃO:
   * Atualmente a exclusão acontece apenas no estado
   * do frontend.
   *
   * Quando o backend estiver pronto, esta função deverá
   * chamar o service responsável pela operação.
   */
  const handleExcluirCliente = (cliente: Cliente) => {
    const confirmou = window.confirm(
      `Deseja realmente excluir o cliente "${cliente.nome}"?`
    )

    if (!confirmou) {
      return
    }

    setClientes((clientesAtuais) =>
      clientesAtuais.filter(
        (clienteAtual) => clienteAtual.id !== cliente.id
      )
    )

    /*
     * Futuramente:
     *
     * await excluirCliente(cliente.id)
     *
     * e então atualizar a lista após a resposta
     * do backend.
     */
  }

  const handleCadastrarCliente = () => {
    setCadastroAberto(true)
  }

  const handleSalvarCliente = (cliente: Cliente) => {
    setClientes((clientesAtuais) => [...clientesAtuais, cliente])
    setCadastroAberto(false)
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
              Gerenciar Clientes
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
            ÁREA DE BUSCA E CADASTRO
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
            QUANTIDADE DE CLIENTES
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
                    <td className="px-5 py-4 text-gray-600">
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

      {cadastroAberto && (
        <CadastroClienteModal
          proximoId={Math.max(0, ...clientes.map((cliente) => cliente.id)) + 1}
          onClose={() => setCadastroAberto(false)}
          onSave={handleSalvarCliente}
        />
      )}

    </div>
  )
}