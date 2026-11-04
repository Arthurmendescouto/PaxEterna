import { useState, type FormEvent } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

import type { CompraFormulario, ItemDisponivel } from '../../types/compra'
import { formatarCpf, formatarValor, somenteDigitos } from '../../utils/formatadores'

interface CadastroCompraModalProps {
  itensDisponiveis: ItemDisponivel[]
  onClose: () => void
  /* Deve lançar um erro com a mensagem a exibir caso a operação falhe. */
  onSave: (compra: CompraFormulario) => Promise<void>
}

// Uma linha de item do formulário. "chave" identifica o item: "produto:1", "servico:2"...
interface LinhaItem {
  chave: string
  quantidade: string
}

const chaveDoItem = (item: ItemDisponivel) => `${item.tipo}:${item.id}`

const hoje = () => {
  const data = new Date()
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset())
  return data.toISOString().slice(0, 10)
}

const classeInput =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'

export default function CadastroCompraModal({
  itensDisponiveis,
  onClose,
  onSave,
}: CadastroCompraModalProps) {
  const [cpfCliente, setCpfCliente] = useState('')
  const [dataCompra, setDataCompra] = useState(hoje)
  const [linhas, setLinhas] = useState<LinhaItem[]>([{ chave: '', quantidade: '1' }])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const itemPorChave = new Map(itensDisponiveis.map((item) => [chaveDoItem(item), item]))
  const produtos = itensDisponiveis.filter((item) => item.tipo === 'produto')
  const servicos = itensDisponiveis.filter((item) => item.tipo === 'servico')

  const subtotal = (linha: LinhaItem) => {
    const item = itemPorChave.get(linha.chave)
    const quantidade = Number(linha.quantidade)
    return item && Number.isInteger(quantidade) && quantidade > 0 ? item.valor * quantidade : 0
  }

  // RF009 passo 7: o Valor Total é calculado automaticamente com base nos itens
  const valorTotal = linhas.reduce((total, linha) => total + subtotal(linha), 0)

  const alterarLinha = (indice: number, campo: keyof LinhaItem, valor: string) => {
    setLinhas((atuais) =>
      atuais.map((linha, i) => (i === indice ? { ...linha, [campo]: valor } : linha))
    )
    setErro('')
  }

  const adicionarLinha = () => {
    setLinhas((atuais) => [...atuais, { chave: '', quantidade: '1' }])
  }

  const removerLinha = (indice: number) => {
    setLinhas((atuais) => atuais.filter((_, i) => i !== indice))
    setErro('')
  }

  // Validações do RF009 (o backend deverá repetir as mesmas regras)
  const validar = (): string => {
    if (
      !dataCompra ||
      linhas.length === 0 ||
      linhas.some((linha) => !linha.chave || !linha.quantidade.trim())
    ) {
      return 'Preencha todos os campos obrigatórios!'
    }
    if (cpfCliente && somenteDigitos(cpfCliente).length !== 11) {
      return 'CPF inválido! Use o formato: 000.000.000-00'
    }
    if (linhas.some((linha) => !Number.isInteger(Number(linha.quantidade)) || Number(linha.quantidade) < 1)) {
      return 'Quantidade inválida!'
    }
    // exceção 9.2: quantidade maior que o estoque disponível
    const estourou = linhas.some((linha) => {
      const item = itemPorChave.get(linha.chave)
      return item?.estoque != null && Number(linha.quantidade) > item.estoque
    })
    if (estourou) {
      return 'Estoque insuficiente para o item selecionado!'
    }
    return ''
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const mensagemErro = validar()
    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    setSalvando(true)
    try {
      await onSave({
        cpfCliente: cpfCliente ? somenteDigitos(cpfCliente) : null,
        dataCompra,
        itens: linhas.map((linha) => {
          const item = itemPorChave.get(linha.chave)!
          return { itemId: item.id, tipo: item.tipo, quantidade: Number(linha.quantidade) }
        }),
      })
    } catch (erroRequisicao) {
      setErro(
        erroRequisicao instanceof Error
          ? erroRequisicao.message
          : 'Não foi possível cadastrar a compra.'
      )
    } finally {
      setSalvando(false)
    }
  }

  // Cada item só pode aparecer em uma linha
  const escolhidoEmOutraLinha = (chave: string, indice: number) =>
    linhas.some((linha, i) => i !== indice && linha.chave === chave)

  const opcao = (item: ItemDisponivel, indice: number) => {
    const chave = chaveDoItem(item)
    const semEstoque = item.estoque === 0
    const estoque = item.estoque === null ? '' : ` (estoque: ${item.estoque})`
    return (
      <option
        key={chave}
        value={chave}
        disabled={semEstoque || escolhidoEmOutraLinha(chave, indice)}
      >
        {`${item.nome} — ${formatarValor(item.valor)}${estoque}`}
      </option>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cadastro-compra-titulo"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 id="cadastro-compra-titulo" className="text-xl font-bold text-gray-900">
              Cadastrar compra
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Registre uma venda avulsa de produtos ou serviços.
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
          {/* DADOS DA COMPRA */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2d5082]">
              Dados da compra
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                <span className="font-medium">CPF do Cliente</span>
                <input
                  type="text"
                  value={cpfCliente}
                  onChange={(event) => {
                    setCpfCliente(formatarCpf(event.target.value))
                    setErro('')
                  }}
                  placeholder="000.000.000-00 (opcional)"
                  className={classeInput}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                <span className="font-medium">
                  Data da Compra <span className="text-red-500">*</span>
                </span>
                <input
                  type="date"
                  value={dataCompra}
                  onChange={(event) => {
                    setDataCompra(event.target.value)
                    setErro('')
                  }}
                  className={classeInput}
                />
              </label>
            </div>
          </section>

          {/* ITENS */}
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2d5082]">
              Itens <span className="text-red-500">*</span>
            </h3>

            <div className="space-y-3">
              {linhas.map((linha, indice) => {
                const item = itemPorChave.get(linha.chave)
                return (
                  <div
                    key={indice}
                    className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[1fr_110px_auto] sm:items-end"
                  >
                    <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                      <span className="font-medium">
                        Item <span className="text-red-500">*</span>
                      </span>
                      <select
                        value={linha.chave}
                        onChange={(event) => alterarLinha(indice, 'chave', event.target.value)}
                        className={classeInput}
                      >
                        <option value="">Selecione um produto ou serviço</option>
                        <optgroup label="Produtos">
                          {produtos.map((produto) => opcao(produto, indice))}
                        </optgroup>
                        <optgroup label="Serviços">
                          {servicos.map((servico) => opcao(servico, indice))}
                        </optgroup>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm text-gray-700">
                      <span className="font-medium">
                        Quantidade <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        max={item?.estoque ?? undefined}
                        value={linha.quantidade}
                        onChange={(event) => alterarLinha(indice, 'quantidade', event.target.value)}
                        className={classeInput}
                      />
                    </label>

                    <div className="flex items-end justify-between gap-3 sm:justify-end">
                      <div className="text-sm sm:min-w-[120px] sm:text-right">
                        <p className="text-xs text-gray-500">
                          {item ? `${formatarValor(item.valor)} × ${linha.quantidade || 0}` : 'Subtotal'}
                        </p>
                        <p className="font-semibold text-gray-900">{formatarValor(subtotal(linha))}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerLinha(indice)}
                        disabled={linhas.length === 1}
                        title="Remover item"
                        aria-label={`Remover item ${indice + 1}`}
                        className="cursor-pointer rounded-md p-2.5 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={adicionarLinha}
              disabled={linhas.length >= itensDisponiveis.length}
              className="mt-3 flex cursor-pointer items-center gap-1 text-sm font-medium text-[#2d5082] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AddIcon fontSize="small" />
              Adicionar item
            </button>
          </section>

          {/* VALOR TOTAL (calculado) */}
          <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <span className="text-sm font-medium text-[#2d5082]">Valor Total</span>
            <span className="text-xl font-bold text-[#2d5082]">{formatarValor(valorTotal)}</span>
          </div>

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
            {salvando ? 'Salvando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}
