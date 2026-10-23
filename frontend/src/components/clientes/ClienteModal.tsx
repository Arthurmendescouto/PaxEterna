import type { Cliente } from '../../types/cliente'
import {
  formatarCep,
  formatarCpf,
  formatarData,
  formatarTelefone,
} from '../../utils/formatadores'

interface ClienteModalProps {
  cliente: Cliente
  onClose: () => void
}

function Info({ label, valor, largo = false }: { label: string; valor: React.ReactNode; largo?: boolean }) {
  return (
    <div className={largo ? 'sm:col-span-2' : undefined}>
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="text-sm text-gray-900">{valor || '—'}</p>
    </div>
  )
}

// [RF004] Tela de detalhes do cliente
function ClienteModal({ cliente, onClose }: ClienteModalProps) {
  const { endereco } = cliente
  const enderecoCompleto = [
    `${endereco.logradouro}, ${endereco.numEndereco}`,
    endereco.bairro,
    `CEP ${formatarCep(endereco.cep)}`,
  ].join(' - ')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalhes-cliente-titulo"
    >
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 id="detalhes-cliente-titulo" className="text-lg text-gray-900 font-bold">
            Detalhes do Cliente
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dados do cliente, na ordem do RF004 */}
        <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2">
          <Info label="Nome" valor={cliente.nome} />
          <Info label="CPF" valor={formatarCpf(cliente.cpf)} />
          <Info
            label="Data de Nascimento"
            valor={cliente.dataNascimento ? formatarData(cliente.dataNascimento) : ''}
          />
          <Info label="Telefone" valor={formatarTelefone(cliente.telefone)} />
          <Info label="Email" valor={cliente.email ?? ''} largo />
          <Info label="Endereço" valor={enderecoCompleto} largo />
          <Info label="Cidade" valor={endereco.cidade} />
          <Info label="UF" valor={endereco.uf} />
          <Info
            label="Possui contrato"
            valor={
              <span
                className={
                  cliente.possuiContrato
                    ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'
                    : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                }
              >
                {cliente.possuiContrato ? 'Sim' : 'Não'}
              </span>
            }
          />
          <Info label="Data de criação" valor={formatarData(cliente.dataCriacao)} />
        </div>

        {/* Rodapé */}
        <div className="flex justify-end bg-white px-6 py-4">
          <button
            type="button"
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
