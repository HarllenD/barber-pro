import React from 'react'
import {
  Scissors,
  CalendarCheck,
  UserCheck,
  ShoppingBag,
  Package,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { useBarber } from '../context/BarberContext'
import { getTodayISO } from '../data/initialData'

export default function Navbar({ activeTab, setActiveTab }) {
  const { appointments, products, cashier, resetDemoData } = useBarber()

  const today = getTodayISO()
  const pendingToday = appointments.filter(
    (a) => a.date === today && (a.status === 'confirmado' || a.status === 'em_atendimento')
  ).length

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length

  const navItems = [
    {
      id: 'cliente',
      label: 'Área do Cliente',
      sublabel: 'Agendar Online',
      icon: CalendarCheck,
      badge: null
    },
    {
      id: 'barbeiro',
      label: 'Painel do Barbeiro',
      sublabel: 'Agenda & Comandas',
      icon: UserCheck,
      badge: pendingToday > 0 ? pendingToday : null,
      badgeColor: 'bg-amber-500 text-zinc-950'
    },
    {
      id: 'caixa',
      label: 'Caixa & PDV',
      sublabel: 'Vendas e Financeiro',
      icon: ShoppingBag,
      badge: cashier.isOpen ? 'Aberto' : 'Fechado',
      badgeColor: cashier.isOpen
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    },
    {
      id: 'estoque',
      label: 'Produtos & Serviços',
      sublabel: 'Estoque e Catálogo',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} baixo` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    }
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-dark-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          {/* Logo e Status */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => setActiveTab('cliente')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Scissors className="w-6 h-6 text-zinc-950 -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-bold tracking-wider text-white">
                    BARBER<span className="text-amber-500">PRO</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Sparkles className="w-3 h-3" /> Gestão 360º
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Agendamento Online • Comandas • PDV & Estoque
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar os dados de demonstração originais?')) {
                  resetDemoData()
                }
              }}
              title="Restaurar dados de demonstração"
              className="lg:hidden inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar Demo
            </button>
          </div>

          {/* Navegação entre os Módulos */}
          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-all border ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/5'
                      : 'bg-dark-900/70 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-dark-800 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs sm:text-sm font-semibold truncate">
                        {item.label}
                      </p>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate hidden sm:block">
                      {item.sublabel}
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Ação rápida desktop */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar os dados de demonstração originais?')) {
                  resetDemoData()
                }
              }}
              title="Restaurar dados iniciais de demonstração"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 px-3 py-2 rounded-lg border border-zinc-800/80 hover:border-zinc-700 bg-dark-900/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
