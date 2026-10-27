import React, { useState } from 'react'
import { BarberProvider } from './context/BarberContext'
import Navbar from './components/Navbar'
import ClientBooking from './pages/ClientBooking'
import BarberDashboard from './pages/BarberDashboard'
import CashierPOS from './pages/CashierPOS'
import InventoryProducts from './pages/InventoryProducts'
import { Scissors } from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('cliente')

  return (
    <BarberProvider>
      <div className="min-h-screen flex flex-col bg-dark-950 text-zinc-100">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'cliente' && <ClientBooking />}
          {activeTab === 'barbeiro' && (
            <BarberDashboard onNavigateToCashier={() => setActiveTab('caixa')} />
          )}
          {activeTab === 'caixa' && <CashierPOS />}
          {activeTab === 'estoque' && <InventoryProducts />}
        </main>

        <footer className="border-t border-zinc-900 bg-dark-950 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-zinc-300">BarberPro</span> — Sistema de Agendamento, Comandas e PDV
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('cliente')}
                className="hover:text-amber-400 transition-colors"
              >
                Agendar Horário
              </button>
              <button
                onClick={() => setActiveTab('barbeiro')}
                className="hover:text-amber-400 transition-colors"
              >
                Área do Barbeiro
              </button>
              <button
                onClick={() => setActiveTab('caixa')}
                className="hover:text-amber-400 transition-colors"
              >
                Caixa PDV
              </button>
              <button
                onClick={() => setActiveTab('estoque')}
                className="hover:text-amber-400 transition-colors"
              >
                Estoque
              </button>
            </div>
          </div>
        </footer>
      </div>
    </BarberProvider>
  )
}
