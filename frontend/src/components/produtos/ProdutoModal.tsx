import type { Produto } from '../../types/produto'

interface ProdutoModalProps {
  produto: Produto
  onClose: () => void
}

const formatarValor = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ProdutoModal({ produto, onClose }: ProdutoModalProps) {
  const informacoes: [string, string][] = [
    ['ID', String(produto.id)],
    ['Nome', produto.nome],
    ['Tipo', produto.tipo],
    ['Valor', formatarValor(produto.valor)],
    ['Quantidade', String(produto.quantidade)],
    ['Marca', produto.marca],
    ['Fornecedor', produto.fornecedor],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalhes-produto-titulo"
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2
              id="detalhes-produto-titulo"
              className="text-lg font-semibold text-gray-900"
            >
              Consultar Produto
            </h2>
            <p className="text-sm text-gray-500">Detalhes do produto</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
          {informacoes.map(([label, valor]) => (
            <div key={label}>
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="mt-1 text-sm text-gray-900">{valor || '—'}</p>
            </div>
          ))}
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-gray-500">Descrição</p>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-900">
              {produto.descricao || '—'}
            </p>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
