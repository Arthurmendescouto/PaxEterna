import type { Tela } from '../../types/navegacao.ts'

import logo from '../../assets/logo.png'

import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PaymentsIcon from '@mui/icons-material/Payments'
import DescriptionIcon from '@mui/icons-material/Description'
import GroupIcon from '@mui/icons-material/Group'

type DashboardProps = {
  onNavegar: (tela: Tela) => void
}

type Modulo = {
  // Mantém os módulos disponíveis aqui independentes da união de telas ainda
  // não atualizada no tipo de navegação.
  id: string
  titulo: string
  descricao: string
  icone: React.ElementType
  corIcone: string
  corFundo: string
}

// NOVO MÓDULO:
// basta acrescentar um novo objeto neste array.
const modulos: Modulo[] = [
  {
    id: 'clientes',
    titulo: 'Clientes',
    descricao: 'Gerenciar clientes e titulares',
    icone: PeopleAltIcon,
    corIcone: 'text-blue-600',
    corFundo: 'bg-blue-100',
  },
  {
    id: 'produtos',
    titulo: 'Produtos',
    descricao: 'Recursos e materiais',
    icone: Inventory2Icon,
    corIcone: 'text-orange-600',
    corFundo: 'bg-orange-100',
  },
  {
    id: 'servicos',
    titulo: 'Serviços',
    descricao: 'Serviços prestados',
    icone: MedicalServicesIcon,
    corIcone: 'text-purple-600',
    corFundo: 'bg-purple-100',
  },
  {
    id: 'compra',
    titulo: 'Compras',
    descricao: 'Vendas avulsas',
    icone: ShoppingCartIcon,
    corIcone: 'text-green-600',
    corFundo: 'bg-green-100',
  },
  {
    id: 'pagamento',
    titulo: 'Pagamentos',
    descricao: 'Gestão financeira',
    icone: PaymentsIcon,
    corIcone: 'text-emerald-600',
    corFundo: 'bg-emerald-100',
  },
  {
    id: 'contrato',
    titulo: 'Contratos',
    descricao: 'Planos de assistência familiar',
    icone: DescriptionIcon,
    corIcone: 'text-indigo-600',
    corFundo: 'bg-indigo-100',
  },
  {
    id: 'dependentes',
    titulo: 'Dependentes',
    descricao: 'Beneficiários dos contratos',
    icone: GroupIcon,
    corIcone: 'text-pink-600',
    corFundo: 'bg-pink-100',
  },
]

export default function Dashboard({ onNavegar }: DashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          CABEÇALHO
      ====================================================== */}
      <header className="bg-[#2d5082] text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">

          <img
            src={logo}
            alt="Logo PaxEterna"
            className="h-12 w-auto"
          />

          <div>
            <h1 className="text-2xl font-bold leading-tight">
              PaxEterna
            </h1>

            <p className="text-sm text-blue-100">
              Management System
            </p>
          </div>

        </div>
      </header>

      {/* =====================================================
          CONTEÚDO
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <h2 className="mb-6 text-lg font-semibold text-slate-800">
          Módulos
        </h2>

        {/* ===================================================
            CARDS DOS MÓDULOS
        ==================================================== */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {modulos.map((modulo) => {
            const Icone = modulo.icone

            return (
              <button
                key={modulo.id}
                type="button"
                onClick={() => onNavegar(modulo.id as Tela)}
                className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#2d5082] hover:shadow-md"
              >

                {/* =================================================
                    ÍCONE
                ================================================== */}
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${modulo.corFundo} transition duration-200 group-hover:scale-105`}
                >
                  <Icone
                    className={modulo.corIcone}
                    sx={{ fontSize: 30 }}
                  />
                </span>

                {/* =================================================
                    INFORMAÇÕES
                ================================================== */}
                <span className="min-w-0">

                  <span className="block text-base font-semibold text-slate-900">
                    {modulo.titulo}
                  </span>

                  <span className="mt-1 block text-sm text-slate-500">
                    {modulo.descricao}
                  </span>

                </span>

              </button>
            )
          })}

        </div>

      </main>

    </div>
  )
}