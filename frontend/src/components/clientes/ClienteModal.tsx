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

interface ClienteModalProps {
  cliente: Cliente
  onClose: () => void
}

function ClienteModal({ cliente, onClose }: ClienteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">

      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg text-gray-900 font-bold">
            Detalhes do Cliente
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dados do cliente */}
        <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2">

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">ID</p>
            <p className="text-sm text-gray-900">{cliente.id}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Nome</p>
            <p className="text-sm text-gray-900">{cliente.nome}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">CPF</p>
            <p className="text-sm text-gray-900">{cliente.cpf}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Data de Nascimento</p>
            <p className="text-sm text-gray-900">{cliente.dataNascimento}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Telefone</p>
            <p className="text-sm text-gray-900">{cliente.telefone}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">E-mail</p>
            <p className="text-sm text-gray-900">{cliente.email}</p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-gray-500 uppercase">Endereço</p>
            <p className="text-sm text-gray-900">{cliente.endereco}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Cidade</p>
            <p className="text-sm text-gray-900">{cliente.cidade}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">UF</p>
            <p className="text-sm text-gray-900">{cliente.uf}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Contrato</p>
            <p className="text-sm text-gray-900">
              {cliente.contrato ? cliente.contrato : "Nenhum"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Data de Criação</p>
            <p className="text-sm text-gray-900">{cliente.dataCriacao}</p>
          </div>

        </div>

        {/* Rodapé */}
        <div className="flex justify-end bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium cursor-pointer text-white hover:bg-blue-800"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  )
}

export default ClienteModal   