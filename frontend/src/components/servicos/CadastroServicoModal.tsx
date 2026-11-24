import { useState, type FormEvent } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import type { Servico } from '../../types/servico'

type FormularioServico = {
  nome: string
  descricao: string
  valor: string
}

interface CadastroServicoModalProps {
  servico?: Servico
  onClose: () => void
  onSave: (dados: Omit<Servico, 'id'>) => Promise<void>
}

const criarFormulario = (servico?: Servico): FormularioServico =>
  servico
    ? { nome: servico.nome, descricao: servico.descricao, valor: String(servico.valor) }
    : { nome: '', descricao: '', valor: '' }

const classeInput =
  'w-full rounded-md border border-gray-300 px-3 py-2.5 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'

export default function CadastroServicoModal({ servico, onClose, onSave }: CadastroServicoModalProps) {
  const [formulario, setFormulario] = useState<FormularioServico>(() => criarFormulario(servico))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const handleChange = (campo: keyof FormularioServico, valor: string) => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
    setErro('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formulario.nome.trim() || !formulario.valor.trim()) {
      setErro('Preencha todos os campos obrigatórios!')
      return
    }

    const valor = Number(formulario.valor)
    if (!Number.isFinite(valor) || valor < 0) {
      setErro('Valor inválido!')
      return
    }

    setSalvando(true)
    try {
      await onSave({
        nome: formulario.nome.trim(),
        descricao: formulario.descricao.trim(),
        valor,
      })
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : 'Não foi possível salvar o serviço.'
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cadastro-servico-titulo"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 id="cadastro-servico-titulo" className="text-xl font-bold text-gray-900">
              {servico ? 'Editar serviço' : 'Cadastrar serviço'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {servico ? 'Altere os dados do serviço selecionado.' : 'Informe os dados do serviço.'}
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

        {/* CAMPOS */}
        <div className="flex flex-col gap-4 px-6 py-6">
          <label className="flex flex-col gap-1.5 text-sm text-gray-700">
            <span className="font-medium">
              Nome <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={formulario.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className={classeInput}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-gray-700">
            <span className="font-medium">
              Valor (R$) <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formulario.valor}
              onChange={(e) => handleChange('valor', e.target.value)}
              className={classeInput}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-gray-700">
            <span className="font-medium">Descrição</span>
            <textarea
              rows={3}
              value={formulario.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              className={`${classeInput} resize-y`}
            />
          </label>

          <p className="text-xs text-gray-500">
            <span className="text-red-500">*</span> Campos obrigatórios
          </p>

          {erro && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {erro}
            </p>
          )}
        </div>

        {/* RODAPÉ */}
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
            {salvando ? 'Salvando...' : servico ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}
