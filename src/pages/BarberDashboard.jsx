import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  Scissors,
  UserCheck,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  ShoppingBag,
  Trash2,
  MessageCircle,
  DollarSign,
  Award,
  Sparkles,
  Filter
} from 'lucide-react'
import { useBarber } from '../context/BarberContext'
import { AVAILABLE_TIME_SLOTS, getTodayISO } from '../data/initialData'

export default function BarberDashboard({ onNavigateToCashier }) {
  const {
    barbers,
    services,
    products,
    appointments,
    transactions,
    getBarberById,
    getServiceById,
    updateAppointmentStatus,
    addProductToAppointment,
    removeProductFromAppointment,
    checkoutAppointment,
    addAppointment
  } = useBarber()

  const [selectedDate, setSelectedDate] = useState(getTodayISO())
  const [selectedBarberFilter, setSelectedBarberFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')

  // Controle de adição de produto extra na comanda
  const [addingProductForApp, setAddingProductForApp] = useState(null)
  const [selectedExtraProductId, setSelectedExtraProductId] = useState(
    products[0]?.id || ''
  )

  // Controle de modal de recebimento / checkout da comanda
  const [checkoutModalApp, setCheckoutModalApp] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('PIX')
  const [discount, setDiscount] = useState('')

  // Controle de modal de encaixe rápido pelo barbeiro
  const [showQuickModal, setShowQuickModal] = useState(false)
  const [quickClientName, setQuickClientName] = useState('')
  const [quickClientPhone, setQuickClientPhone] = useState('')
  const [quickBarberId, setQuickBarberId] = useState(barbers[0]?.id || '')
  const [quickServiceId, setQuickServiceId] = useState(services[0]?.id || '')
  const [quickTime, setQuickTime] = useState('14:30')
  const [quickNotes, setQuickNotes] = useState('')

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  // Filtra e ordena agendamentos por horário
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((app) => app.date === selectedDate)
      .filter((app) =>
        selectedBarberFilter === 'todos' ? true : app.barberId === selectedBarberFilter
      )
      .filter((app) => (statusFilter === 'todos' ? true : app.status === statusFilter))
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointments, selectedDate, selectedBarberFilter, statusFilter])

  // Métricas do dia
  const dayStats = useMemo(() => {
    const dayApps = appointments.filter(
      (a) =>
        a.date === selectedDate &&
        (selectedBarberFilter === 'todos' || a.barberId === selectedBarberFilter)
    )
    const total = dayApps.filter((a) => a.status !== 'cancelado').length
    const inChair = dayApps.filter((a) => a.status === 'em_atendimento').length
    const completed = dayApps.filter((a) => a.status === 'concluido').length

    const dayCommissions = transactions
      .filter(
        (t) =>
          t.date === selectedDate &&
          t.type === 'entrada' &&
          (selectedBarberFilter === 'todos' || t.barberId === selectedBarberFilter)
      )
      .reduce((acc, t) => acc + Number(t.commissionAmount || 0), 0)

    return { total, inChair, completed, dayCommissions }
  }, [appointments, transactions, selectedDate, selectedBarberFilter])

  // Cálculo de comissões por barbeiro no dia
  const barberCommissions = useMemo(() => {
    return barbers.map((barb) => {
      const barbTrx = transactions.filter(
        (t) => t.date === selectedDate && t.barberId === barb.id && t.type === 'entrada'
      )
      const totalCommission = barbTrx.reduce(
        (sum, t) => sum + Number(t.commissionAmount || 0),
        0
      )
      const totalGenerated = barbTrx.reduce(
        (sum, t) => sum + Number(t.serviceAmount || 0),
        0
      )
      return {
        ...barb,
        cutsCount: barbTrx.length,
        totalGenerated,
        totalCommission
      }
    })
  }, [barbers, transactions, selectedDate])

  const handleAddExtraProduct = (appointmentId) => {
    if (!selectedExtraProductId) return
    const ok = addProductToAppointment(appointmentId, selectedExtraProductId, 1)
    if (!ok) {
      alert('Produto sem estoque suficiente!')
    } else {
      setAddingProductForApp(null)
    }
  }

  const handleConfirmCheckout = (e) => {
    e.preventDefault()
    if (!checkoutModalApp) return
    checkoutAppointment(checkoutModalApp.id, paymentMethod, Number(discount || 0))
    setCheckoutModalApp(null)
    setDiscount('')
  }

  const handleQuickAppointment = (e) => {
    e.preventDefault()
    if (!quickClientName.trim()) return
    addAppointment({
      clientName: quickClientName,
      clientPhone: quickClientPhone || '11999999999',
      barberId: quickBarberId,
      serviceId: quickServiceId,
      date: selectedDate,
      time: quickTime,
      notes: quickNotes
    })
    setQuickClientName('')
    setQuickClientPhone('')
    setQuickNotes('')
    setShowQuickModal(false)
  }

  const sendWhatsAppReminder = (app) => {
    const srv = getServiceById(app.serviceId)
    const barb = getBarberById(app.barberId)
    const phone = (app.clientPhone || '').replace(/\D/g, '')
    const msg = `Olá *${app.clientName}*! Tudo bem? Passando para confirmar seu horário hoje às *${app.time}* (${srv?.name}) com o barbeiro *${barb?.name}* na *BarberPro*! 💈✂️`
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Painel do Barbeiro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900/70 border border-zinc-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Scissors className="w-3.5 h-3.5" />
            GESTÃO DE AGENDA, ATENDIMENTO & COMISSÕES
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
            Painel do Barbeiro
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Acompanhe os clientes do dia, adicione produtos na comanda e envie direto para o caixa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-white focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowQuickModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-amber-500/15"
          >
            <Plus className="w-4 h-4" />
            Novo Encaixe / Agendamento
          </button>
        </div>
      </div>

      {/* Cards de Indicadores do Dia */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-dark-900/60 p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Agendamentos Hoje</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-white">
            {dayStats.total}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Horários ativos na agenda</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="flex items-center justify-between text-amber-300 text-xs mb-2">
            <span>Clientes na Cadeira</span>
            <Scissors className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-amber-400">
            {dayStats.inChair}
          </p>
          <p className="text-[11px] text-amber-400/70 mt-1">Em atendimento agora</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex items-center justify-between text-emerald-300 text-xs mb-2">
            <span>Finalizados no Dia</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-400">
            {dayStats.completed}
          </p>
          <p className="text-[11px] text-emerald-400/70 mt-1">Lançados no caixa</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-dark-900/60 p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Comissões do Dia</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-display font-bold text-white">
            {formatCurrency(dayStats.dayCommissions)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Repasse acumulado dos barbeiros</p>
        </div>
      </div>

      {/* Filtros por Barbeiro e Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-dark-900/40 border border-zinc-800/80 rounded-2xl p-4">
        {/* Seleção de Barbeiro */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" /> Profissional:
          </span>
          <button
            onClick={() => setSelectedBarberFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedBarberFilter === 'todos'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-dark-950 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            Todos os Barbeiros
          </button>
          {barbers.map((barb) => (
            <button
              key={barb.id}
              onClick={() => setSelectedBarberFilter(barb.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedBarberFilter === barb.id
                  ? 'bg-amber-500 text-zinc-950'
                  : 'bg-dark-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <img
                src={barb.avatar}
                alt={barb.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              {barb.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Filtro de Status */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'confirmado', label: 'Aguardando' },
            { id: 'em_atendimento', label: 'Na Cadeira' },
            { id: 'concluido', label: 'Concluídos' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st.id
                  ? 'bg-zinc-200 text-zinc-950 font-semibold'
                  : 'bg-dark-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Agendamentos / Comandas + Resumo de Comissões */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Agendamentos (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-dark-900/40 p-12 text-center space-y-3">
              <Scissors className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">
                Nenhum agendamento encontrado para este filtro
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Altere a data, selecione outro barbeiro ou clique em "Novo Encaixe / Agendamento" para adicionar um cliente.
              </p>
            </div>
          ) : (
            filteredAppointments.map((app) => {
              const service = getServiceById(app.serviceId)
              const barber = getBarberById(app.barberId)
              const extraTotal = app.extraProducts.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              )
              const totalComanda = (service?.price || 0) + extraTotal

              return (
                <div
                  key={app.id}
                  className={`rounded-2xl border p-5 transition-all space-y-4 ${
                    app.status === 'em_atendimento'
                      ? 'border-amber-500/60 bg-amber-500/5 shadow-lg shadow-amber-500/5'
                      : app.status === 'concluido'
                      ? 'border-emerald-500/30 bg-dark-900/40'
                      : app.status === 'cancelado'
                      ? 'border-rose-500/20 bg-dark-950/40 opacity-60'
                      : 'border-zinc-800 bg-dark-900/70'
                  }`}
                >
                  {/* Linha Superior: Horário, Cliente e Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="px-3 py-2 rounded-xl bg-dark-950 border border-zinc-800 text-center shrink-0">
                        <span className="block font-display text-lg font-bold text-amber-400">
                          {app.time}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase">Horário</span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {app.clientName}
                          </h3>
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              app.status === 'em_atendimento'
                                ? 'bg-amber-500 text-zinc-950'
                                : app.status === 'concluido'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : app.status === 'cancelado'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            }`}
                          >
                            {app.status === 'em_atendimento'
                              ? '💈 Na Cadeira'
                              : app.status === 'concluido'
                              ? `Pago (${app.paymentMethod || 'Caixa'})`
                              : app.status === 'cancelado'
                              ? 'Cancelado'
                              : 'Confirmado'}
                          </span>
                        </div>

                        <p className="text-xs text-amber-400 font-medium mt-0.5">
                          {service?.name} ({formatCurrency(service?.price)}) •{' '}
                          <span className="text-zinc-300">Barbeiro: {barber?.name}</span>
                        </p>

                        {app.notes && (
                          <p className="text-xs text-zinc-400 mt-1 italic">
                            Obs: "{app.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-zinc-800/80 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-zinc-400 block">
                          Total da Comanda
                        </span>
                        <span className="text-lg font-bold text-emerald-400">
                          {formatCurrency(totalComanda)}
                        </span>
                      </div>

                      <button
                        onClick={() => sendWhatsAppReminder(app)}
                        title="Chamar cliente no WhatsApp"
                        className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Produtos Consumidos na Comanda (Cerveja, Pomada, etc.) */}
                  <div className="rounded-xl bg-dark-950/80 border border-zinc-800/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                        Produtos adicionais na comanda ({app.extraProducts.length})
                      </span>

                      {!app.paid && app.status !== 'cancelado' && (
                        <button
                          type="button"
                          onClick={() =>
                            setAddingProductForApp(
                              addingProductForApp === app.id ? null : app.id
                            )
                          }
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Produto / Bebida
                        </button>
                      )}
                    </div>

                    {app.extraProducts.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {app.extraProducts.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between text-xs bg-dark-900 px-3 py-1.5 rounded-lg border border-zinc-800/60"
                          >
                            <span className="text-zinc-200">
                              {item.quantity}x {item.name}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-amber-400">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                              {!app.paid && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeProductFromAppointment(app.id, item.productId)
                                  }
                                  className="text-zinc-500 hover:text-rose-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Seletor rápido para adicionar produto na comanda */}
                    {addingProductForApp === app.id && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-800">
                        <select
                          value={selectedExtraProductId}
                          onChange={(e) => setSelectedExtraProductId(e.target.value)}
                          className="flex-1 bg-dark-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          {products.map((prod) => (
                            <option
                              key={prod.id}
                              value={prod.id}
                              disabled={prod.stock <= 0}
                            >
                              {prod.name} — {formatCurrency(prod.price)} (Estoque:{' '}
                              {prod.stock})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAddExtraProduct(app.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400"
                        >
                          Incluir na Comanda
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação do Barbeiro */}
                  {!app.paid && app.status !== 'cancelado' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {app.status === 'confirmado' && (
                          <button
                            onClick={() =>
                              updateAppointmentStatus(app.id, 'em_atendimento')
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" /> Iniciar Atendimento (Na Cadeira)
                          </button>
                        )}

                        <button
                          onClick={() => updateAppointmentStatus(app.id, 'cancelado')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-950 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs font-medium transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancelar
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutModalApp(app)
                          setPaymentMethod('PIX')
                          setDiscount('')
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/10 transition-all"
                      >
                        <DollarSign className="w-4 h-4" />
                        Finalizar & Receber no Caixa
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Coluna Lateral (1/3): Comissões por Barbeiro no Dia */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-dark-900/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Comissões da Equipe
                </h3>
                <p className="text-xs text-zinc-400">
                  Cálculo automático sobre serviços finalizados
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {barberCommissions.map((barb) => (
                <div
                  key={barb.id}
                  className="rounded-xl bg-dark-950 border border-zinc-800/80 p-4 space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={barb.avatar}
                      alt={barb.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{barb.name}</p>
                      <p className="text-[11px] text-zinc-400">
                        Comissão: {barb.commission}% • {barb.cutsCount} atendimentos hoje
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                    <span className="text-zinc-400">
                      Produzido: {formatCurrency(barb.totalGenerated)}
                    </span>
                    <span className="font-bold text-amber-400">
                      Repasse: {formatCurrency(barb.totalCommission)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {onNavigateToCashier && (
              <button
                onClick={onNavigateToCashier}
                className="w-full py-2.5 px-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs transition-colors"
              >
                Abrir Relatório Completo no Caixa →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE FECHAMENTO DE COMANDA DIRETO PARA O CAIXA */}
      {checkoutModalApp && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmCheckout}
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-dark-900 p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Fechar Comanda & Lançar no Caixa
              </h3>
              <button
                type="button"
                onClick={() => setCheckoutModalApp(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {(() => {
              const srv = getServiceById(checkoutModalApp.serviceId)
              const barb = getBarberById(checkoutModalApp.barberId)
              const extraSum = checkoutModalApp.extraProducts.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
              )
              const subtotal = (srv?.price || 0) + extraSum
              const finalTotal = Math.max(0, subtotal - Number(discount || 0))

              return (
                <>
                  <div className="rounded-xl bg-dark-950 border border-zinc-800 p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Cliente:</span>
                      <span className="font-bold text-white">
                        {checkoutModalApp.clientName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Barbeiro:</span>
                      <span className="text-zinc-200">{barb?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Serviço ({srv?.name}):</span>
                      <span className="text-zinc-200">{formatCurrency(srv?.price)}</span>
                    </div>
                    {checkoutModalApp.extraProducts.map((p) => (
                      <div key={p.productId} className="flex justify-between">
                        <span className="text-zinc-400">
                          + {p.quantity}x {p.name}:
                        </span>
                        <span className="text-amber-400">
                          {formatCurrency(p.price * p.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold">
                      <span className="text-white">Total a Receber:</span>
                      <span className="text-emerald-400">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Forma de Pagamento
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map(
                          (method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPaymentMethod(method)}
                              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                                paymentMethod === method
                                  ? 'bg-amber-500 border-amber-400 text-zinc-950'
                                  : 'bg-dark-950 border-zinc-800 text-zinc-300'
                              }`}
                            >
                              {method}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Desconto em R$ (Opcional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.50"
                        placeholder="0,00"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutModalApp(null)}
                      className="px-4 py-2.5 rounded-xl border border-zinc-700 text-xs font-medium text-zinc-300"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                    >
                      Confirmar Recebimento ({formatCurrency(finalTotal)})
                    </button>
                  </div>
                </>
              )
            })()}
          </form>
        </div>
      )}

      {/* MODAL DE ENCAIXE RÁPIDO PELO BARBEIRO */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickAppointment}
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-dark-900 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                Novo Encaixe / Agendamento Manual
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marcos Vinícius"
                  value={quickClientName}
                  onChange={(e) => setQuickClientName(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={quickClientPhone}
                  onChange={(e) => setQuickClientPhone(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Barbeiro</label>
                  <select
                    value={quickBarberId}
                    onChange={(e) => setQuickBarberId(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Horário</label>
                  <select
                    value={quickTime}
                    onChange={(e) => setQuickTime(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {AVAILABLE_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Serviço</label>
                <select
                  value={quickServiceId}
                  onChange={(e) => setQuickServiceId(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatCurrency(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
              >
                Salvar na Agenda
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
