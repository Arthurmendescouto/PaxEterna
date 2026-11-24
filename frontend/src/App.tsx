import { useState } from 'react'
import './App.css'
import Dashboard from './pages/dashboard/Dashboard.tsx'
import Clientes from './pages/clientes/Clientes.tsx'
import Produtos from './pages/produtos/Produtos.tsx'
import Compras from './pages/compras/Compras.tsx'
import Pagamentos from './pages/pagamentos/Pagamentos.tsx'
import Servicos from './pages/servicos/Servicos.tsx'
import type { Tela } from './types/navegacao.ts'

export default function App() {
  const [tela,setTela] = useState<Tela>('dashboard')

  const irPara = (proxima: Tela) => setTela(proxima)
  const voltar = () => setTela('dashboard')

  switch (tela) {
    case 'clientes':
      return <Clientes onVoltar={voltar} />
    case 'produtos':
      return <Produtos onVoltar={voltar} />
    case 'compra':
      return <Compras onVoltar={voltar} />
    case 'pagamento':
      return <Pagamentos onVoltar={voltar} />
    case 'servicos':
      return <Servicos onVoltar={voltar} />
    case 'dashboard':
    default:
      return <Dashboard onNavegar={irPara} />
  }
}
