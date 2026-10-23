import { useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

import type { Cliente, ClienteFormulario } from '../../types/cliente'
import {
  formatarCep,
  formatarCpf,
  formatarRg,
  formatarTelefone,
  rgValido,
  somenteDigitos,
} from '../../utils/formatadores'

interface CadastroClienteModalProps {
  onClose: () => void
  /* Deve lançar um erro com a mensagem a exibir caso a operação falhe. */
  onSave: (cliente: ClienteFormulario) => Promise<void>
  cliente?: Cliente
}

interface Formulario {
  nome: string
  cpf: string
  rg: string
  dataNascimento: string
  telefones: string[]
  logradouro: string
  numEndereco: string
  bairro: string
  cep: string
  cidade: string
  uf: string
}

type CampoTexto = Exclude<keyof Formulario, 'telefones'>

const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA',
  'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

const formularioInicial: Formulario = {
  nome: '',
  cpf: '',
  rg: '',
  dataNascimento: '',
  telefones: [''],
  logradouro: '',
  numEndereco: '',
  bairro: '',
  cep: '',
  cidade: '',
  uf: '',
}

const paraFormulario = (cliente: Cliente): Formulario => ({
  nome: cliente.nome,
  cpf: formatarCpf(cliente.cpf),
  rg: cliente.rg,
  dataNascimento: cliente.dataNascimento,
  telefones: cliente.telefones.length
    ? cliente.telefones.map(formatarTelefone)
    : [''],
  logradouro: cliente.endereco.logradouro,
  numEndereco: cliente.endereco.numEndereco,
  bairro: cliente.endereco.bairro,
  cep: formatarCep(cliente.endereco.cep),
  cidade: cliente.endereco.cidade,
  uf: cliente.endereco.uf,
})

const mascaras: Partial<Record<CampoTexto, (valor: string) => string>> = {
  cpf: formatarCpf,
  rg: formatarRg,
  cep: formatarCep,
}

// Validações feitas antes de enviar (o backend repete as mesmas regras).
function validar(formulario: Formulario): string {
  const telefones = formulario.telefones.map(somenteDigitos).filter(Boolean)
  const obrigatorios: CampoTexto[] = [
    'nome', 'cpf', 'rg', 'dataNascimento', 'logradouro',
    'numEndereco', 'bairro', 'cep', 'cidade', 'uf',
  ]

  if (obrigatorios.some((campo) => !formulario[campo].trim()) || telefones.length === 0) {
    return 'Preencha todos os campos obrigatórios!'
  }
  if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formulario.cpf)) {
    return 'CPF inválido! Use o formato: 000.000.000-00'
  }
  if (!rgValido(formulario.rg)) {
    return 'RG inválido! Use apenas números (ex.: 00.000.000-0)'
  }
  if (telefones.some((t) => t.length < 10)) {
    return 'Telefone inválido! Use o formato: (00) 00000-0000'
  }
  if (somenteDigitos(formulario.cep).length !== 8) {
    return 'CEP inválido! Use o formato: 00000-000'
  }
  return ''
}

function CadastroClienteModal({
  onClose,
  onSave,
  cliente,
}: CadastroClienteModalProps) {
  const [formulario, setFormulario] = useState<Formulario>(() =>
    cliente ? paraFormulario(cliente) : formularioInicial
  )
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const handleChange = (campo: CampoTexto, valor: string) => {
    const mascara = mascaras[campo]
    setFormulario((atual) => ({
      ...atual,
      [campo]: mascara ? mascara(valor) : valor,
    }))
    setErro('')
  }

  const handleTelefoneChange = (indice: number, valor: string) => {
    setFormulario((atual) => ({
      ...atual,
      telefones: atual.telefones.map((telefone, i) =>
        i === indice ? formatarTelefone(valor) : telefone
      ),
    }))
    setErro('')
  }

  const adicionarTelefone = () => {
    setFormulario((atual) => ({ ...atual, telefones: [...atual.telefones, ''] }))
  }

  const removerTelefone = (indice: number) => {
    setFormulario((atual) => ({
      ...atual,
      telefones: atual.telefones.filter((_, i) => i !== indice),
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const mensagemErro = validar(formulario)
    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    setSalvando(true)
    try {
      await onSave({
        nome: formulario.nome.trim(),
        cpf: formulario.cpf,
        rg: formulario.rg.trim(),
        dataNascimento: formulario.dataNascimento,
        telefones: formulario.telefones.map(somenteDigitos).filter(Boolean),
        endereco: {
          logradouro: formulario.logradouro.trim(),
          numEndereco: formulario.numEndereco.trim(),
          bairro: formulario.bairro.trim(),
          cep: somenteDigitos(formulario.cep),
          cidade: formulario.cidade.trim(),
          uf: formulario.uf,
        },
      })
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : 'Não foi possível salvar o cliente.'
      )
    } finally {
      setSalvando(false)
    }
  }

  const classeInput =
    'rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'

  const rotulo = (label: string) => (
    <span className="font-medium">
      {label}
      <span className="text-red-500"> *</span>
    </span>
  )

  const campo = (
    nome: CampoTexto,
    label: string,
    tipo = 'text',
    placeholder = ''
  ) => (
    <label className="flex flex-col gap-1.5 text-sm text-gray-700">
      {rotulo(label)}
      <input
        type={tipo}
        value={formulario[nome]}
        onChange={(event) => handleChange(nome, event.target.value)}
        placeholder={placeholder}
        max={tipo === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
        className={classeInput}
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
        noValidate
        className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2
              id="cadastro-cliente-titulo"
              className="text-xl font-bold text-gray-900"
            >
              {cliente ? 'Editar cliente' : 'Cadastrar cliente'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {cliente
                ? 'Atualize os dados do cliente.'
                : 'Preencha os dados para adicionar um novo cliente.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Fechar"
            aria-label="Fechar"
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
                {campo('nome', 'Nome completo', 'text', 'Digite o nome completo')}
              </div>
              {campo('cpf', 'CPF', 'text', '000.000.000-00')}
              {campo('rg', 'RG', 'text', '00.000.000-0')}
              {campo('dataNascimento', 'Data de nascimento', 'date')}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2d5082]">
              Telefones
            </h3>
            <div className="space-y-3">
              {formulario.telefones.map((telefone, indice) => (
                <div key={indice} className="flex items-end gap-2">
                  <label className="flex flex-1 flex-col gap-1.5 text-sm text-gray-700">
                    {indice === 0 ? rotulo('Telefone') : (
                      <span className="font-medium">Telefone {indice + 1}</span>
                    )}
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(event) => handleTelefoneChange(indice, event.target.value)}
                      placeholder="(00) 00000-0000"
                      className={classeInput}
                    />
                  </label>
                  {formulario.telefones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerTelefone(indice)}
                      title="Remover telefone"
                      aria-label={`Remover telefone ${indice + 1}`}
                      className="cursor-pointer rounded-md p-2.5 text-red-500 transition hover:bg-red-50"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={adicionarTelefone}
                className="flex cursor-pointer items-center gap-1 text-sm font-medium text-[#2d5082] hover:underline"
              >
                <AddIcon fontSize="small" />
                Adicionar telefone
              </button>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2d5082]">
              Endereço
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="sm:col-span-3">
                {campo('logradouro', 'Logradouro', 'text', 'Rua, avenida...')}
              </div>
              {campo('numEndereco', 'Número')}
              <div className="sm:col-span-2">
                {campo('bairro', 'Bairro')}
              </div>
              <div className="sm:col-span-2">
                {campo('cep', 'CEP', 'text', '00000-000')}
              </div>
              <div className="sm:col-span-3">
                {campo('cidade', 'Cidade')}
              </div>
              <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                {rotulo('UF')}
                <select
                  value={formulario.uf}
                  onChange={(event) => handleChange('uf', event.target.value)}
                  className={classeInput}
                >
                  <option value="">Selecione</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-[#2d5082]">
            <span className="text-red-500">*</span> Campos obrigatórios
          </p>

          {erro && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
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
            disabled={salvando}
            className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : cliente ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CadastroClienteModal
