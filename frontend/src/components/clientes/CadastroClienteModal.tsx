import { useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'

import type { Cliente } from '../../types/cliente'

interface CadastroClienteModalProps {
  onClose: () => void
  onSave: (cliente: Cliente) => void
  proximoId: number
}

type FormularioCliente = Omit<Cliente, 'id' | 'dataCriacao'>

const formularioInicial: FormularioCliente = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  email: '',
  endereco: '',
  cidade: '',
  uf: '',
  contrato: 'Ativo',
}

function CadastroClienteModal({
  onClose,
  onSave,
  proximoId,
}: CadastroClienteModalProps) {
  const [formulario, setFormulario] =
    useState<FormularioCliente>(formularioInicial)
  const [erro, setErro] = useState('')

  const handleChange = (
    campo: keyof FormularioCliente,
    valor: string
  ) => {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }))
    setErro('')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formulario.nome.trim() || !formulario.cpf.trim()) {
      setErro('Preencha os campos obrigatorios: nome e CPF.')
      return
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR')

    onSave({
      ...formulario,
      id: proximoId,
      dataCriacao: dataAtual,
    })
  }

  const campo = (
    nome: keyof FormularioCliente,
    label: string,
    tipo = 'text',
    obrigatorio = false
  ) => (
    <label className="flex flex-col gap-1.5 text-sm text-gray-700">
      <span className="font-medium">
        {label}
        {obrigatorio && <span className="text-red-500"> *</span>}
      </span>
      <input
        type={tipo}
        value={formulario[nome]}
        onChange={(event) => handleChange(nome, event.target.value)}
        required={obrigatorio}
        className="rounded-md border border-gray-300 px-3 py-2.5 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cadastro-cliente-titulo"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2
              id="cadastro-cliente-titulo"
              className="text-xl font-bold text-gray-900"
            >
              Cadastrar cliente
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Preencha os dados para adicionar um novo cliente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Fechar cadastro"
            aria-label="Fechar cadastro"
            className="cursor-pointer rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2d5082]">
              Dados pessoais
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                {campo('nome', 'Nome completo', 'text', true)}
              </div>
              {campo('cpf', 'CPF', 'text', true)}
              {campo('dataNascimento', 'Data de nascimento', 'date')}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2d5082]">
              Contato
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {campo('telefone', 'Telefone', 'tel')}
              {campo('email', 'E-mail', 'email')}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2d5082]">
              Endereco e contrato
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                {campo('endereco', 'Endereco')}
              </div>
              <div className="sm:col-span-2">
                {campo('cidade', 'Cidade')}
              </div>
              <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                <span className="font-medium">UF</span>
                <select
                  value={formulario.uf}
                  onChange={(event) => handleChange('uf', event.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Selecione</option>
                  {['AC', 'AL', 'BA', 'CE', 'DF', 'ES', 'GO', 'MG', 'PE', 'PR', 'RJ', 'RS', 'SC', 'SP'].map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-gray-700 sm:col-span-1">
                <span className="font-medium">Situacao do contrato</span>
                <select
                  value={formulario.contrato}
                  onChange={(event) => handleChange('contrato', event.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </label>
            </div>
          </section>

          {erro && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Salvar cliente
          </button>
        </div>
      </form>
    </div>
  )
}

export default CadastroClienteModal