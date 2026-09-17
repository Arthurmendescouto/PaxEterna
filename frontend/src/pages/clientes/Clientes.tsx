import { useMemo, useState } from 'react'
import ClienteModal from '../../components/clientes/ClienteModal'

interface Cliente {
  id: number
  nome: string
  cpf: string
  rg: string
  dataNascimento: string
  telefone: string
  endereco: string
}

const clientesIniciais: Cliente[] = [
  {
    id: 1,
    nome: 'João Silva Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dataNascimento: '15/03/1978',
    telefone: '(77) 99999-1111',
    endereco: 'Rua A, 100 - Centro',
  },
  {
    id: 2,
    nome: 'Maria Oliveira Costa',
    cpf: '987.654.321-00',
    rg: '98.765.432-1',
    dataNascimento: '22/07/1985',
    telefone: '(77) 98888-2222',
    endereco: 'Rua B, 250 - Candeias',
  },
  {
    id: 3,
    nome: 'Pedro Henrique Souza',
    cpf: '456.789.123-00',
    rg: '45.678.912-3',
    dataNascimento: '10/11/1990',
    telefone: '(77) 97777-3333',
    endereco: 'Avenida Central, 500 - Recreio',
  },
  {
    id: 4,
    nome: 'Ana Carolina Ferreira',
    cpf: '321.654.987-00',
    rg: '32.165.498-7',
    dataNascimento: '03/05/1982',
    telefone: '(77) 96666-4444',
    endereco: 'Rua das Flores, 80 - Brasil',
  },
  {
    id: 5,
    nome: 'Carlos Eduardo Lima',
    cpf: '741.852.963-00',
    rg: '74.185.296-3',
    dataNascimento: '19/09/1975',
    telefone: '(77) 95555-5555',
    endereco: 'Rua São Paulo, 120 - Patagônia',
  },
]

export default function Clientes() {
  const [clientes] = useState<Cliente[]>(clientesIniciais)

  const [busca, setBusca] = useState('')

  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null)

  const clientesFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()

    if (!termo) {
      return clientes
    }

    return clientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpf.includes(termo)
    )
  }, [busca, clientes])

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Cabeçalho */}
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
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-500"
          >
            ← Voltar ao dashboard
          </button>

        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Área de busca */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">
            
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquisar por nome ou CPF..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          <button
            className="rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            + Cadastrar Cliente
          </button>

        </div>

        {/* Quantidade */}
        <p className="mb-3 text-sm text-gray-600">
          Exibindo <strong>{clientesFiltrados.length}</strong> cliente(s)
        </p>

        {/* Tabela */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px] text-left text-sm">

              <thead className="bg-gray-50 text-gray-800">
                <tr>
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
                    Data Nascimento
                  </th>

                  <th className="px-5 py-3 text-center font-semibold">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {clientesFiltrados.map((cliente) => (

                  <tr
                    key={cliente.id}
                    className="transition hover:bg-blue-50"
                  >

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {cliente.nome}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.cpf}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.telefone}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.dataNascimento}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex justify-center">

                        <button
                          onClick={() =>
                            setClienteSelecionado(cliente)
                          }
                          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium cursor-pointer text-blue-700 transition hover:bg-blue-100"
                        >
                          Consultar
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Nenhum resultado */}
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

    {/* Modal */}
    {clienteSelecionado && (
      <ClienteModal
        cliente={clienteSelecionado}
        onClose={() => setClienteSelecionado(null)}
      />
    )}

    </div>
  )
}