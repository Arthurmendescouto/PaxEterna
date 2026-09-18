import { useMemo, useState } from 'react'
import ClienteModal from '../../components/clientes/ClienteModal'

interface Cliente {
  id: number
  nome: string
  cpf: string
  dataNascimento: string
  telefone: string
  email: string
  endereco: string
  cidade: string
  uf: string
  contrato: string
  dataCriacao: string
}

const clientesIniciais: Cliente[] = [
  {
    id: 1,
    nome: 'Maria Aparecida Oliveira',
    cpf: '482.917.365-41',
    dataNascimento: '22/07/1965',
    telefone: '(77) 98123-4567',
    email: 'maria.oliveira@example.com',
    endereco: 'Rua das Palmeiras, 123, Bairro Jardim, Vitória da Conquista',
    cidade: 'Vitória da Conquista',
    uf: 'BA',
    contrato: 'PLN-2024-0087',
    dataCriacao: '15/03/2024'
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
    contrato: 'PLN-2023-0142',
    dataCriacao: '22/09/2023'
  },
  {
    id: 3,
    nome: 'Ana Beatriz Souza Lima',
    cpf: '625.830.147-09',
    dataNascimento: '14/02/1990',
    telefone: '(77) 98765-4321',
    email: 'ana.lima@example.com',
    endereco: 'Rua São Francisco, 78, Bairro Heliópolis, Itabuna',
    cidade: 'Itabuna',
    uf: 'BA',
    contrato: 'não possui',
    dataCriacao: '10/06/2025'
  },
  {
    id: 4,
    nome: 'Roberto Alves Martins',
    cpf: '941.263.578-22',
    dataNascimento: '30/05/1952',
    telefone: '(77) 99234-5678',
    email: 'roberto.martins@example.com',
    endereco: 'Travessa das Flores, 12, Bairro Santa Cruz, Ilhéus',
    cidade: 'Ilhéus',
    uf: 'BA',
    contrato: 'PLN-2022-0034',
    dataCriacao: '05/01/2022'
  }
]   

type ClientesProps = {
  onVoltar?: () => void
}

export default function Clientes({ onVoltar }: ClientesProps) {
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
            type="button"
            onClick={onVoltar}
            className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-400 hover:shadow-md"
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

            <table className="w-full min-w-200 text-left text-sm">

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

              <tbody className="divide-y divide-gray-100">

                {clientesFiltrados.map((cliente) => (

                  <tr>
                  
                  <td className="px-5 py-4 font-medium text-gray-800">
                      {cliente.id}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.nome}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.cpf}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.telefone}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {cliente.contrato}
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