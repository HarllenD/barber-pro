import React, { useState, useMemo } from 'react'
import {
  Scissors,
  Clock,
  Star,
  Calendar,
  CheckCircle2,
  User,
  Phone,
  FileText,
  Sparkles,
  MessageCircle,
  Search,
  MapPin,
  ShieldCheck
} from 'lucide-react'
import { useBarber } from '../context/BarberContext'
import { AVAILABLE_TIME_SLOTS, getTodayISO } from '../data/initialData'

export default function ClientBooking() {
  const {
    barbers,
    services,
    appointments,
    addAppointment,
    getBarberById,
    getServiceById
  } = useBarber()

  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '')
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id || '')
  const [selectedDate, setSelectedDate] = useState(getTodayISO())
  const [selectedTime, setSelectedTime] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [searchPhone, setSearchPhone] = useState('')

  const categories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category))
    return ['Todos', ...Array.from(cats)]
  }, [services])

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'Todos') return services
    return services.filter((s) => s.category === selectedCategory)
  }, [services, selectedCategory])

  // Horários já ocupados para o barbeiro e data selecionados
  const occupiedSlots = useMemo(() => {
    return appointments
      .filter(
        (app) =>
          app.barberId === selectedBarberId &&
          app.date === selectedDate &&
          app.status !== 'cancelado'
      )
      .map((app) => app.time)
  }, [appointments, selectedBarberId, selectedDate])

  const selectedService = getServiceById(selectedServiceId)
  const selectedBarber = getBarberById(selectedBarberId)

  const handleBookingSubmit = (e) => {
    e.preventDefault()
    if (!selectedServiceId || !selectedBarberId || !selectedDate || !selectedTime) {
      alert('Por favor, selecione o serviço, o barbeiro, a data e um horário disponível.')
      return
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Informe seu nome e WhatsApp para confirmar o agendamento.')
      return
    }

    const created = addAppointment({
      clientName,
      clientPhone,
      barberId: selectedBarberId,
      serviceId: selectedServiceId,
      date: selectedDate,
      time: selectedTime,
      notes
    })

    setConfirmedBooking(created)
    setSelectedTime('')
    setNotes('')
  }

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const formatDateBR = (isoDate) => {
    if (!isoDate) return ''
    const [y, m, d] = isoDate.split('-')
    return `${d}/${m}/${y}`
  }

  // Filtra agendamentos ativos para consulta rápida do cliente
  const clientAppointments = useMemo(() => {
    const query = searchPhone.trim().toLowerCase()
    return appointments
      .filter((a) => a.status !== 'cancelado')
      .filter((a) => {
        if (!query) return true
        return (
          a.clientName.toLowerCase().includes(query) ||
          a.clientPhone.toLowerCase().includes(query)
        )
      })
      .slice()
      .reverse()
  }, [appointments, searchPhone])

  const handleSendWhatsApp = (booking) => {
    const srv = getServiceById(booking.serviceId)
    const barb = getBarberById(booking.barberId)
    const text = `Olá! Confirmo meu agendamento na *BarberPro*:%0A%0A` +
      `👤 *Cliente:* ${booking.clientName}%0A` +
      `✂️ *Serviço:* ${srv?.name || ''} (${formatCurrency(srv?.price)})%0A` +
      `💈 *Barbeiro:* ${barb?.name || ''}%0A` +
      `📅 *Data:* ${formatDateBR(booking.date)} às *${booking.time}*%0A` +
      (booking.notes ? `📝 *Obs:* ${booking.notes}` : '')

    const phoneClean = (barb?.phone || '5511999999999').replace(/\D/g, '')
    window.open(`https://wa.me/55${phoneClean}?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Banner Principal da Barbearia */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Agendamento Online 24h • Sem Filas
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-wide uppercase">
              Reserve seu horário com <span className="text-amber-500">estilo e precisão</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base">
              Escolha seu serviço favorito, selecione o barbeiro de sua preferência e garanta seu horário em menos de 1 minuto.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" /> Av. Paulista, 1450 • Centro
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Seg a Sáb: 09h às 20h
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Confirmação Imediata
              </span>
            </div>
          </div>

          <div className="bg-dark-950/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 shrink-0">
            <div className="text-center px-3 border-r border-zinc-800">
              <p className="text-2xl font-display font-bold text-amber-400">4.9★</p>
              <p className="text-[11px] text-zinc-400">+350 avaliações</p>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-zinc-200 font-semibold">Cerveja ou Café Cortesia</p>
              <p className="text-zinc-400">No primeiro atendimento pelo app</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal/Alerta de Agendamento Confirmado */}
      {confirmedBooking && (
        <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/20 p-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500 text-zinc-950 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Horário Confirmado com Sucesso!
                </span>
                <h3 className="text-xl font-bold text-white">
                  Tudo pronto, {confirmedBooking.clientName}!
                </h3>
                <p className="text-sm text-zinc-300">
                  Serviço:{' '}
                  <strong className="text-amber-400">
                    {getServiceById(confirmedBooking.serviceId)?.name}
                  </strong>{' '}
                  com{' '}
                  <strong className="text-white">
                    {getBarberById(confirmedBooking.barberId)?.name}
                  </strong>
                </p>
                <p className="text-sm text-zinc-300">
                  Data: <strong>{formatDateBR(confirmedBooking.date)}</strong> às{' '}
                  <strong className="text-emerald-400">{confirmedBooking.time}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleSendWhatsApp(confirmedBooking)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar Comprovante no WhatsApp
              </button>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-dark-800 text-xs font-medium text-zinc-300"
              >
                Novo Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Principal: Formulário Passo a Passo + Resumo Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda (2/3): Etapas de Escolha */}
        <div className="lg:col-span-2 space-y-8">
          {/* PASSO 1: ESCOLHA O SERVIÇO */}
          <section className="rounded-2xl border border-zinc-800/90 bg-dark-900/60 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center">
                  1
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">Escolha o Serviço</h2>
                  <p className="text-xs text-zinc-400">
                    Selecione o procedimento que deseja realizar hoje
                  </p>
                </div>
              </div>

              {/* Filtro de Categoria */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-zinc-950 font-semibold'
                        : 'bg-dark-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredServices.map((service) => {
                const isSelected = selectedServiceId === service.id
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/5'
                        : 'border-zinc-800 bg-dark-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-white text-sm leading-snug">
                          {service.name}
                        </h3>
                        {service.popular && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                            Mais Pedido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-800/70">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {service.duration} min
                      </span>
                      <span className="text-base font-bold text-amber-400">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* PASSO 2: ESCOLHA O BARBEIRO */}
          <section className="rounded-2xl border border-zinc-800/90 bg-dark-900/60 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center">
                2
              </span>
              <div>
                <h2 className="text-lg font-bold text-white">Escolha o Profissional</h2>
                <p className="text-xs text-zinc-400">
                  Equipe especializada em cortes modernos e barboterapia
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {barbers.map((barber) => {
                const isSelected = selectedBarberId === barber.id
                return (
                  <div
                    key={barber.id}
                    onClick={() => {
                      setSelectedBarberId(barber.id)
                      setSelectedTime('')
                    }}
                    className={`cursor-pointer rounded-xl p-4 border transition-all text-center flex flex-col items-center ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/5'
                        : 'border-zinc-800 bg-dark-950/60 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={barber.avatar}
                      alt={barber.name}
                      className={`w-16 h-16 rounded-full object-cover mb-3 border-2 ${
                        isSelected ? 'border-amber-500' : 'border-zinc-700'
                      }`}
                    />
                    <h3 className="font-semibold text-white text-sm">{barber.name}</h3>
                    <p className="text-xs text-zinc-400 mb-2">{barber.role}</p>

                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full mb-3">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {barber.rating} ({barber.reviewsCount})
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 mt-auto">
                      {barber.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="text-[10px] px-2 py-0.5 rounded bg-dark-800 text-zinc-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* PASSO 3: DATA E HORÁRIO */}
          <section className="rounded-2xl border border-zinc-800/90 bg-dark-900/60 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center">
                  3
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">Data e Horário</h2>
                  <p className="text-xs text-zinc-400">
                    Horários disponíveis em tempo real para {selectedBarber?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <input
                  type="date"
                  value={selectedDate}
                  min={getTodayISO()}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedTime('')
                  }}
                  className="bg-dark-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {AVAILABLE_TIME_SLOTS.map((slot) => {
                const isOccupied = occupiedSlots.includes(slot)
                const isSelected = selectedTime === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isOccupied}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      isOccupied
                        ? 'bg-dark-950/40 border-zinc-800/50 text-zinc-600 line-through cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-500 border-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                        : 'bg-dark-950 border-zinc-800 text-zinc-200 hover:border-amber-500/60'
                    }`}
                  >
                    {slot}
                    {isOccupied && (
                      <span className="block text-[9px] font-normal text-zinc-600">
                        Ocupado
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Coluna Direita (1/3): Resumo e Finalização do Cliente */}
        <div className="space-y-6">
          <form
            onSubmit={handleBookingSubmit}
            className="sticky top-24 rounded-2xl border border-zinc-800 bg-dark-900/90 p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Scissors className="w-5 h-5 text-amber-500" />
              <h3 className="font-display text-lg font-bold tracking-wide text-white uppercase">
                Resumo do Agendamento
              </h3>
            </div>

            {/* Resumo das escolhas */}
            <div className="space-y-3 rounded-xl bg-dark-950 p-4 border border-zinc-800/80 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Serviço:</span>
                <span className="font-semibold text-white text-right">
                  {selectedService?.name || 'Selecione'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Profissional:</span>
                <span className="font-semibold text-zinc-200">
                  {selectedBarber?.name || 'Selecione'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-zinc-400">Data e Hora:</span>
                <span className="font-semibold text-amber-400">
                  {formatDateBR(selectedDate)} {selectedTime ? `às ${selectedTime}` : '(Escolha o horário)'}
                </span>
              </div>
              <div className="flex justify-between gap-2 pt-2 border-t border-zinc-800">
                <span className="text-zinc-300 font-medium">Valor Estimado:</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatCurrency(selectedService?.price)}
                </span>
              </div>
            </div>

            {/* Campos do Cliente */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Ferreira"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  WhatsApp / Telefone *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (11) 99876-5432"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Preferência / Observação (Opcional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Ex: Degradê navalhado, manter topo..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              Confirmar Agendamento Agora
            </button>

            <p className="text-[11px] text-center text-zinc-500">
              O pagamento é realizado diretamente na barbearia após o atendimento.
            </p>
          </form>
        </div>
      </div>

      {/* Seção Inferior: Consulta de Horários Marcados pelo Cliente */}
      <section className="rounded-2xl border border-zinc-800/90 bg-dark-900/40 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Consultar Horários Agendados
            </h3>
            <p className="text-xs text-zinc-400">
              Pesquise pelo seu nome ou telefone para conferir o status do seu horário
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full bg-dark-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {clientAppointments.slice(0, 6).map((app) => {
            const srv = getServiceById(app.serviceId)
            const barb = getBarberById(app.barberId)
            return (
              <div
                key={app.id}
                className="rounded-xl border border-zinc-800/90 bg-dark-950/70 p-4 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white text-sm">{app.clientName}</p>
                    <p className="text-xs text-amber-400 font-medium">{srv?.name}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      app.status === 'concluido'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : app.status === 'em_atendimento'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}
                  >
                    {app.status === 'em_atendimento'
                      ? 'Na Cadeira'
                      : app.status === 'concluido'
                      ? 'Concluído'
                      : 'Confirmado'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
                  <span>Barbeiro: {barb?.name}</span>
                  <span className="font-semibold text-zinc-200">
                    {formatDateBR(app.date)} • {app.time}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
