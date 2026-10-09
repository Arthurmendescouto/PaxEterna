import { useMemo, useState } from 'react'

import CadastroProdutoModal from '../../components/produtos/CadastroProdutoModal'
import type { Produto } from '../../types/produto'

import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import Inventory2Icon from '@mui/icons-material/Inventory2'

type ProdutosProps = {
  onVoltar?: () => void
}

/*
 * Dados temporários.
 *
 * Posteriormente serão substituídos pelos dados
 * vindos do backend através do produtoService.
 */
const produtosIniciais: Produto[] = [
  {
    id: 1,
    nome: 'Urna Funerária Luxo',
    tipo: 'Urna',
    valor: 3500,
    quantidade: 8,
    marca: 'Pax Premium',
    descricao:
      'Urna funerária em madeira com acabamento especial.',
    fornecedor: 'Fornecedor Pax',
  },
  {
    id: 2,
    nome: 'Urna Funerária Simples',
    tipo: 'Urna',
    valor: 1800,
    quantidade: 15,
    marca: 'Pax Standard',
    descricao:
      'Urna funerária de madeira com acabamento tradicional.',
    fornecedor: 'Fornecedor Central',
  },
  {
    id: 3,
    nome: 'Véu Funerário',
    tipo: 'Acessório',
    valor: 250,
    quantidade: 20,
    marca: 'Pax Care',
    descricao:
      'Véu utilizado nos serviços funerários.',
    fornecedor: 'Distribuidora Vida',
  },
  {
    id: 4,
    nome: 'Coroa de Flores',
    tipo: 'Floricultura',
    valor: 450,
    quantidade: 6,
    marca: 'Flores da Paz',
    descricao:
      'Coroa de flores para cerimônias funerárias.',
    fornecedor: 'Floricultura Esperança',
  },
]

export default function Produtos({
  onVoltar,
}: ProdutosProps) {

  /*
   * Lista de produtos.
   *
   * Atualmente utiliza dados locais.
   * Posteriormente será alimentada pelo backend.
   */
  const [produtos, setProdutos] =
    useState<Produto[]>(produtosIniciais)

  /*
   * Texto utilizado na pesquisa.
   */
  const [busca, setBusca] = useState('')

  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [produtoEmEdicao, setProdutoEmEdicao] =
    useState<Produto | null>(null)

  /*
   * Produto selecionado para consulta.
   */
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<Produto | null>(null)

  /*
   * Produto que está aguardando confirmação
   * de exclusão.
   */
  const [produtoParaExcluir, setProdutoParaExcluir] =
    useState<Produto | null>(null)

  /*
   * Controla a exibição da mensagem
   * de exclusão realizada com sucesso.
   */
  const [mensagemSucesso, setMensagemSucesso] =
    useState(false)

  /*
   * ==========================================================
   * FILTRO
   * ==========================================================
   *
   * A documentação prevê pesquisa por:
   *
   * - Nome
   * - Tipo
   */
  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()

    if (!termo) {
      return produtos
    }

    return produtos.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(termo) ||
        produto.tipo.toLowerCase().includes(termo)
    )
  }, [busca, produtos])

  /*
   * ==========================================================
   * CONSULTAR PRODUTO
   * ==========================================================
   */
  const handleConsultarProduto = (produto: Produto) => {
    setProdutoSelecionado(produto)
  }

  /*
   * Fecha o modal de consulta.
   */
  const handleFecharModal = () => {
    setProdutoSelecionado(null)
  }

  const handleCadastrarProduto = () => {
    setCadastroAberto(true)
  }

  const handleSalvarProduto = (produto: Omit<Produto, 'id'>) => {
    if (produtoEmEdicao) {
      setProdutos((produtosAtuais) =>
        produtosAtuais.map((produtoAtual) =>
          produtoAtual.id === produtoEmEdicao.id
            ? { ...produto, id: produtoEmEdicao.id }
            : produtoAtual
        )
      )
      setProdutoEmEdicao(null)
      return
    }

    setProdutos((produtosAtuais) => [
      ...produtosAtuais,
      {
        ...produto,
        id: Math.max(0, ...produtosAtuais.map((item) => item.id)) + 1,
      },
    ])
    setCadastroAberto(false)
  }

  /*
   * ==========================================================
   * EDITAR PRODUTO
   * ==========================================================
   *
   * Abre o formulário preenchido com os dados atuais do produto.
   */
  const handleEditarProduto = (produto: Produto) => {
    setProdutoEmEdicao(produto)
  }

  /*
   * ==========================================================
   * INICIAR EXCLUSÃO
   * ==========================================================
   *
   * Ao clicar na lixeira, apenas abrimos o modal.
   *
   * Não existe verificação de estoque.
   */
  const handleExcluirProduto = (produto: Produto) => {
    setProdutoParaExcluir(produto)
  }

  /*
   * ==========================================================
   * CANCELAR EXCLUSÃO
   * ==========================================================
   */
  const cancelarExclusao = () => {
    setProdutoParaExcluir(null)
  }

  /*
   * ==========================================================
   * CONFIRMAR EXCLUSÃO
   * ==========================================================
   */
  const confirmarExclusao = () => {

    if (!produtoParaExcluir) {
      return
    }

    /*
     * Remove o produto da lista local.
     *
     * Posteriormente, aqui poderemos chamar:
     *
     * await excluirProduto(produtoParaExcluir.id)
     */
    setProdutos((produtosAtuais) =>
      produtosAtuais.filter(
        (produto) =>
          produto.id !== produtoParaExcluir.id
      )
    )

    /*
     * Fecha o modal de confirmação.
     */
    setProdutoParaExcluir(null)

    /*
     * Abre a mensagem de sucesso.
     */
    setMensagemSucesso(true)
  }

  /*
   * ==========================================================
   * RENDERIZAÇÃO
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <header className="bg-[#2d5082] text-white shadow">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            {/* Ícone do módulo */}

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">

              <Inventory2Icon />

            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Gerenciar Produtos
              </h1>

              <p className="text-sm text-blue-100">
                Cadastro, edição e consulta do estoque
              </p>

            </div>

          </div>

          {/* Voltar */}

          <button
            type="button"
            onClick={onVoltar}
            className="flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-400 hover:shadow-md"
          >

            <ArrowBackIcon fontSize="small" />

            Voltar ao dashboard

          </button>

        </div>

      </header>

      {/* =====================================================
          CONTEÚDO
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ===================================================
            PESQUISA + CADASTRO
        ==================================================== */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">

          {/* Pesquisa */}

          <div className="relative flex-1">

            <SearchIcon
              fontSize="small"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
              placeholder="Pesquisar por nome ou tipo..."
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* Cadastrar */}

          <button
            type="button"
            onClick={handleCadastrarProduto}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2d5082] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >

            <AddIcon fontSize="small" />

            Cadastrar Produto

          </button>

        </div>

        {/* ===================================================
            QUANTIDADE
        ==================================================== */}

        <p className="mb-3 text-sm text-gray-600">

          Exibindo{' '}

          <strong>
            {produtosFiltrados.length}
          </strong>{' '}

          produto(s)

        </p>

        {/* ===================================================
            TABELA
        ==================================================== */}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left text-sm">

              {/* Cabeçalho */}

              <thead className="bg-gray-50 text-gray-800">

                <tr>

                  <th className="px-5 py-3 font-semibold">
                    ID
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Nome
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Tipo
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Valor
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Quantidade
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Marca
                  </th>

                  <th className="px-5 py-3 text-center font-semibold">
                    Ações
                  </th>

                </tr>

              </thead>

              {/* Corpo */}

              <tbody className="divide-y divide-gray-100">

                {produtosFiltrados.map((produto) => (

                  <tr
                    key={produto.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* ID */}

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {produto.id}
                    </td>

                    {/* Nome */}

                    <td className="px-5 py-4 font-medium text-gray-800">
                      {produto.nome}
                    </td>

                    {/* Tipo */}

                    <td className="px-5 py-4 text-gray-600">
                      {produto.tipo}
                    </td>

                    {/* Valor */}

                    <td className="px-5 py-4 text-gray-600">

                      {produto.valor.toLocaleString(
                        'pt-BR',
                        {
                          style: 'currency',
                          currency: 'BRL',
                        }
                      )}

                    </td>

                    {/* Quantidade */}

                    <td className="px-5 py-4">

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {produto.quantidade}
                      </span>

                    </td>

                    {/* Marca */}

                    <td className="px-5 py-4 text-gray-600">
                      {produto.marca}
                    </td>

                    {/* Ações */}

                    <td className="px-5 py-4">

                      <div className="flex justify-center gap-1">

                        {/* Consultar */}

                        <button
                          type="button"
                          onClick={() =>
                            handleConsultarProduto(produto)
                          }
                          title="Consultar produto"
                          aria-label={`Consultar produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-blue-500 transition hover:bg-blue-50"
                        >

                          <VisibilityIcon fontSize="small" />

                        </button>

                        {/* Editar */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEditarProduto(produto)
                          }
                          title="Editar produto"
                          aria-label={`Editar produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-green-600 transition hover:bg-green-50"
                        >

                          <EditIcon fontSize="small" />

                        </button>

                        {/* Excluir */}

                        <button
                          type="button"
                          onClick={() =>
                            handleExcluirProduto(produto)
                          }
                          title="Excluir produto"
                          aria-label={`Excluir produto ${produto.nome}`}
                          className="cursor-pointer rounded-md px-3 py-1.5 text-red-500 transition hover:bg-red-50"
                        >

                          <DeleteIcon fontSize="small" />

                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* =================================================
              NENHUM RESULTADO
          ================================================== */}

          {produtosFiltrados.length === 0 && (

            <div className="px-6 py-12 text-center">

              <p className="text-sm font-medium text-gray-700">
                Nenhum recurso encontrado!
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Tente pesquisar utilizando outro nome ou tipo.
              </p>

            </div>

          )}

        </div>

      </main>

      {/* =====================================================
          MODAL DE CONSULTA
      ====================================================== */}

      {produtoSelecionado && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

            {/* Cabeçalho */}

            <div className="flex items-center justify-between px-6 py-4">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Consultar Produto
                </h2>

                <p className="text-sm text-gray-500">
                  Detalhes do produto
                </p>

              </div>

              <button
                type="button"
                onClick={handleFecharModal}
                className="cursor-pointer rounded-md px-2 py-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fechar"
              >
                ×
              </button>

            </div>

            {/* Dados */}

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Nome
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {produtoSelecionado.nome}
                </p>

              </div>

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Tipo
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.tipo}
                </p>

              </div>

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Valor
                </p>

                <p className="mt-1 text-sm text-gray-900">

                  {produtoSelecionado.valor.toLocaleString(
                    'pt-BR',
                    {
                      style: 'currency',
                      currency: 'BRL',
                    }
                  )}

                </p>

              </div>

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Quantidade
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.quantidade}
                </p>

              </div>

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Marca
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.marca}
                </p>

              </div>

              <div>

                <p className="text-xs font-medium text-gray-500">
                  Fornecedor
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.fornecedor}
                </p>

              </div>

              <div className="sm:col-span-2">

                <p className="text-xs font-medium text-gray-500">
                  Descrição
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {produtoSelecionado.descricao}
                </p>

              </div>

            </div>

            {/* Rodapé */}

            <div className="flex justify-end px-6 py-4">

              <button
                type="button"
                onClick={handleFecharModal}
                className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                Fechar
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
      ====================================================== */}

      {produtoParaExcluir && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">

            {/* =================================================
                CABEÇALHO
            ================================================== */}

            <div className="flex items-center gap-3 px-6 py-5">

              {/* LIXEIRA AO LADO DO TÍTULO */}

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">

                <DeleteIcon
                  className="text-red-600"
                  sx={{ fontSize: 23 }}
                />

              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Excluir produto
                </h2>

                <p className="text-sm text-gray-500">
                  Confirmação de exclusão
                </p>

              </div>

            </div>

            {/* =================================================
                CONTEÚDO
            ================================================== */}

            <div className="px-6 py-6">

              <p className="text-sm leading-6 text-gray-600">
                Deseja realmente excluir este item?
              </p>

              {/* Produto selecionado */}

              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">

                <p className="text-sm font-semibold text-gray-900">
                  {produtoParaExcluir.nome}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Tipo: {produtoParaExcluir.tipo}
                </p>

              </div>

            </div>

            {/* =================================================
                BOTÕES
            ================================================== */}

            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={cancelarExclusao}
                className="cursor-pointer rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarExclusao}
                className="flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >

                <DeleteIcon fontSize="small" />

                Sim, excluir

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL DE SUCESSO
      ====================================================== */}

      {mensagemSucesso && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">

            {/* Cabeçalho */}

            <div className="flex items-center gap-3 px-6 py-5">

              {/* ÍCONE AO LADO DO TÍTULO */}

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">

                <span className="text-xl font-bold text-green-600">
                  ✓
                </span>

              </div>

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Produto excluído!
                </h2>

                <p className="text-sm text-gray-500">
                  Operação realizada
                </p>

              </div>

            </div>

            {/* Conteúdo */}

            <div className="px-6 py-6">

              <p className="text-sm leading-6 text-gray-600">
                Produto excluído com sucesso!
              </p>

            </div>

            {/* Botão */}

            <div className="flex justify-end bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={() => setMensagemSucesso(false)}
                className="cursor-pointer rounded-md bg-[#2d5082] px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
              >
                Fechar
              </button>

            </div>

          </div>

        </div>

      )}

      {(cadastroAberto || produtoEmEdicao) && (
        <CadastroProdutoModal
          produto={produtoEmEdicao ?? undefined}
          onClose={() => {
            setCadastroAberto(false)
            setProdutoEmEdicao(null)
          }}
          onSave={handleSalvarProduto}
        />
      )}

    </div>
  )
}