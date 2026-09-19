import { useState } from 'react'
import './App.css'
import Dashboard from './pages/dashboard/Dashboard.tsx'
import Clientes from './pages/clientes/Clientes.tsx'
import Produtos from './pages/produtos/Produtos.tsx'
import type { Tela } from './types/navegacao.ts'

export default function App() {
  // Estado que decide qual tela aparece
const [tela,setTela] = useState<Tela>('dashboard')

  const irPara = (proxima: Tela) => setTela(proxima)
  const voltar = () => setTela('dashboard')

  // NOVO MÓDULO: adicione um case abaixo + o import da página
  switch (tela) {
    case 'clientes':
      return <Clientes onVoltar={voltar} />
    case 'produtos':
      return <Produtos onVoltar={voltar} />
    case 'dashboard':
    default:
      return <Dashboard onNavegar={irPara} />
  }
}
