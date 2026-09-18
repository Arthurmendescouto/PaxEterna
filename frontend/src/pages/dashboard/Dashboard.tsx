import type { Tela } from '../../types/navegacao.ts'

type DashboardProps = {
  onNavegar: (tela: Tela) => void
}

// NOVO MÓDULO: só acrescente um item neste array
const modulos: { id: Exclude<Tela, 'dashboard'>; titulo: string; descricao: string }[] = [
  {
    id: 'clientes',
    titulo: 'Clientes',
    descricao: 'Cadastro, edição e consulta',
  },
]

export default function Dashboard({ onNavegar }: DashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#2d5082] text-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">PaxEterna</h1>
          <p className="mt-1 text-sm text-blue-100">Painel principal</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-lg font-semibold text-slate-800">
          Módulos
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map((modulo) => (
            <button
              key={modulo.id}
              type="button"
              onClick={() => onNavegar(modulo.id)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#2d5082] hover:bg-blue-50 hover:shadow-md"
            >
              <span className="block text-base font-semibold text-slate-900">
                {modulo.titulo}
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                {modulo.descricao}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
