import { useState, type FormEvent } from 'react'

import CloseIcon from '@mui/icons-material/Close'

import type { Produto } from '../../types/produto'

type FormularioProduto = Omit<Produto, 'id' | 'valor' | 'quantidade'> & {
  valor: string
  quantidade: string
}

interface CadastroProdutoModalProps {
  onClose: () => void
  onSave: (produto: Omit<Produto, 'id'>) => void
  produto?: Produto
}

const criarFormulario = (produto?: Produto): FormularioProduto => produto
  ? {
      nome: produto.nome,
      tipo: produto.tipo,
      valor: String(produto.valor),
      quantidade: String(produto.quantidade),
      marca: produto.marca,
      descricao: produto.descricao,
      fornecedor: produto.fornecedor,
    }
  : {
      nome: '',
      tipo: '',
      valor: '',
      quantidade: '',
      marca: '',
      descricao: '',
      fornecedor: '',
    }

export default function CadastroProdutoModal({
  onClose,
  onSave,
  produto,
}: CadastroProdutoModalProps) {
  const [formulario, setFormulario] =
    useState<FormularioProduto>(() => criarFormulario(produto))
  const [erro, setErro] = useState('')

  const handleChange = (
    campo: keyof FormularioProduto,
    valor: string
  ) => {
    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [campo]: valor,
    }))
    setErro('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const valor = Number(formulario.valor)
    const quantidade = Number(formulario.quantidade)

    if (
      !formulario.nome.trim() ||
      !formulario.tipo.trim() ||
      !formulario.valor ||
      !formulario.quantidade ||
      !Number.isFinite(valor) ||
      valor < 0 ||
      !Number.isInteger(quantidade) ||
      quantidade < 0
    ) {
      setErro('Preencha corretamente os campos obrigatórios.')
      return
    }

    onSave({
      ...formulario,
      nome: formulario.nome.trim(),
      tipo: formulario.tipo.trim(),
      valor,
      quantidade,
      marca: formulario.marca.trim(),
      descricao: formulario.descricao.trim(),
      fornecedor: formulario.fornecedor.trim(),
    })
  }

  const campoTexto = (
    nome: keyof FormularioProduto,
    label: string,
    obrigatorio = false
  ) => (
    <label className="flex flex-col gap-1.5 text-sm text-gray-700">
      <span className="font-medium">
        {label}
        {obrigatorio && <span className="text-red-500"> *</span>}
      </span>
      <input
        type="text"
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
      aria-labelledby="cadastro-produto-titulo"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2
              id="cadastro-produto-titulo"
              className="text-xl font-bold text-gray-900"
            >
              {produto ? 'Atualizar produto' : 'Cadastrar produto'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {produto
                ? 'Altere os dados do produto selecionado.'
                : 'Informe os dados do produto.'}
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

        <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">
          {campoTexto('nome', 'Nome', true)}
          {campoTexto('tipo', 'Tipo', true)}
          <label className="flex flex-col gap-1.5 text-sm text-gray-700">
            <span className="font-medium">
              Valor <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formulario.valor}
              onChange={(event) => handleChange('valor', event.target.value)}
              required
              className="rounded-md border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-gray-700">
            <span className="font-medium">
              Quantidade <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={formulario.quantidade}
              onChange={(event) => handleChange('quantidade', event.target.value)}
              required
              className="rounded-md border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          {campoTexto('marca', 'Marca')}
          {campoTexto('fornecedor', 'Fornecedor')}
          <label className="flex flex-col gap-1.5 text-sm text-gray-700 sm:col-span-2">
            <span className="font-medium">Descrição</span>
            <textarea
              rows={3}
              value={formulario.descricao}
              onChange={(event) => handleChange('descricao', event.target.value)}
              className="resize-y rounded-md border border-gray-300 px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {erro && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
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
            {produto ? 'Salvar alterações' : 'Salvar produto'}
          </button>
        </div>
      </form>
    </div>
  )
}