import React, { useState, useMemo } from 'react'
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Lock,
  Unlock,
  Receipt
} from 'lucide-react'
import { useBarber } from '../context/BarberContext'
import { getTodayISO } from '../data/initialData'

export default function CashierPOS() {
  const {
    products,
    transactions,
    appointments,
    cashier,
    getServiceById,
    getBarberById,
    registerDirectSale,
    registerCashierMovement,
    checkoutAppointment,
    toggleCashierStatus
  } = useBarber()

  // Estado do PDV (Carrinho de Venda de Produtos)
  const [searchProduct, setSearchProduct] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cart, setCart] = useState([])
  const [posClientName, setPosClientName] = useState('')
  const [posPaymentMethod, setPosPaymentMethod] = useState('PIX')
  const [posDiscount, setPosDiscount] = useState('')
  const [saleSuccessMsg, setSaleSuccessMsg] = useState('')

  // Modal de Lançamento Manual (Sangria / Despesa / Suprimento)
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [movType, setMovType] = useState('saida')
  const [movCategory, setMovCategory] = useState('Despesa Operacional')
  const [movDesc, setMovDesc] = useState('')
  const [movAmount, setMovAmount] = useState('')
  const [movMethod, setMovMethod] = useState('Dinheiro')

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const today = getTodayISO()

  // Resumo financeiro do caixa
  const financialSummary = useMemo(() => {
    const entries = transactions
      .filter((t) => t.type === 'entrada')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)

    const exits = transactions
      .filter((t) => t.type === 'saida')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)

    const byPix = transactions
      .filter((t) => t.type === 'entrada' && t.paymentMethod === 'PIX')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)

    const byCard = transactions
      .filter(
        (t) =>
          t.type === 'entrada' &&
          (t.paymentMethod === 'Cartão de Crédito' ||
            t.paymentMethod === 'Cartão de Débito')
      )
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)

    const byCash = transactions
      .filter((t) => t.type === 'entrada' && t.paymentMethod === 'Dinheiro')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0)

    const netBalance = Number(cashier.openingBalance || 0) + entries - exits

    return { entries, exits, netBalance, byPix, byCard, byCash }
  }, [transactions, cashier.openingBalance])

  // Categorias de produtos para o PDV
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return ['Todos', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) =>
        selectedCategory === 'Todos' ? true : p.category === selectedCategory
      )
      .filter((p) =>
        p.name.toLowerCase().includes(searchProduct.trim().toLowerCase())
      )
  }, [products, selectedCategory, searchProduct])

  // Comandas abertas do dia para recebimento rápido no caixa
  const openComandas = useMemo(() => {
    return appointments.filter(
      (a) => a.date === today && !a.paid && a.status !== 'cancelado'
    )
  }, [appointments, today])

  // Funções do Carrinho PDV
  const addToCart = (product) => {
    if (product.stock <= 0) return
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Quantidade máxima disponível em estoque atingida.')
          return prev
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          quantity: 1
        }
      ]
    })
  }

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item
          const nextQty = item.quantity + delta
          if (nextQty > item.stock) return item
          return { ...item, quantity: nextQty }
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  )
  const cartTotal = Math.max(0, cartSubtotal - Number(posDiscount || 0))

  const handleFinishPOSSale = (e) => {
    e.preventDefault()
    if (!cashier.isOpen) {
      alert('Abra o caixa antes de registrar novas vendas.')
      return
    }
    if (cart.length === 0) return

    registerDirectSale({
      items: cart,
      paymentMethod: posPaymentMethod,
      clientName: posClientName.trim() || 'Cliente Balcão',
      discount: Number(posDiscount || 0)
    })

    setCart([])
    setPosClientName('')
    setPosDiscount('')
    setSaleSuccessMsg('Venda registrada no caixa e estoque atualizado!')
    setTimeout(() => setSaleSuccessMsg(''), 3500)
  }

  const handleManualMovement = (e) => {
    e.preventDefault()
    if (!movDesc.trim() || !movAmount) return
    registerCashierMovement({
      type: movType,
      category: movCategory,
      description: movDesc.trim(),
      amount: Number(movAmount),
      paymentMethod: movMethod
    })
    setMovDesc('')
    setMovAmount('')
    setShowMovementModal(false)
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Caixa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900/70 border border-zinc-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Wallet className="w-3.5 h-3.5" />
            FRENTE DE CAIXA (PDV) • VENDAS DE PRODUTOS & FLUXO FINANCEIRO
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
            Sistema de Caixa & Venda de Produtos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Realize vendas avulsas no balcão, receba comandas de cortes e controle entradas e saídas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMovementModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-950 hover:bg-dark-800 text-zinc-200 border border-zinc-700 font-semibold text-xs sm:text-sm transition-colors"
          >
            <Receipt className="w-4 h-4 text-amber-500" />
            Sangria / Despesa / Suprimento
          </button>

          <button
            onClick={() => toggleCashierStatus()}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
              cashier.isOpen
                ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
            }`}
          >
            {cashier.isOpen ? (
              <>
                <Lock className="w-4 h-4" /> Fechar Caixa
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" /> Abrir Caixa
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-dark-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Fundo de Caixa Inicial</span>
            <Wallet className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {formatCurrency(cashier.openingBalance)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Aberto às {cashier.openedAt}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-2">
            <span>Total de Entradas</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-display font-bold text-emerald-400">
            {formatCurrency(financialSummary.entries)}
          </p>
          <p className="text-[11px] text-emerald-400/70 mt-1">
            PIX: {formatCurrency(financialSummary.byPix)} • Cartão:{' '}
            {formatCurrency(financialSummary.byCard)}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
          <div className="flex items-center justify-between text-xs text-rose-300 mb-2">
            <span>Saídas / Despesas</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-display font-bold text-rose-400">
            {formatCurrency(financialSummary.exits)}
          </p>
          <p className="text-[11px] text-rose-400/70 mt-1">
            Sangrias e compras operacionais
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between text-xs text-amber-300 mb-2">
            <span>Saldo Total em Caixa</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-display font-bold text-amber-400">
            {formatCurrency(financialSummary.netBalance)}
          </p>
          <p className="text-[11px] text-amber-300/80 mt-1">
            Dinheiro físico: {formatCurrency(cashier.openingBalance + financialSummary.byCash - financialSummary.exits)}
          </p>
        </div>
      </div>

      {/* PDV: Venda de Produtos + Carrinho Balcão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo Rápido de Produtos (2/3) */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-dark-900/60 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                PDV — Venda Rápida de Produtos
              </h2>
              <p className="text-xs text-zinc-400">
                Clique nos produtos para adicionar ao carrinho de venda no balcão
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar pomada, óleo, bebida..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full bg-dark-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Filtro por Categoria */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-dark-950 text-zinc-400 border border-zinc-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de Produtos para Clicar e Adicionar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredProducts.map((prod) => {
              const inCart = cart.find((c) => c.id === prod.id)
              const isOut = prod.stock <= 0
              const isLow = prod.stock <= prod.minStock && !isOut

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOut && addToCart(prod)}
                  className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                    isOut
                      ? 'border-zinc-800/50 bg-dark-950/30 opacity-50 cursor-not-allowed'
                      : inCart
                      ? 'border-amber-500 bg-amber-500/10 cursor-pointer shadow-md shadow-amber-500/5'
                      : 'border-zinc-800 bg-dark-950/70 hover:border-amber-500/50 cursor-pointer'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-dark-800 text-zinc-400">
                        {prod.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-400'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        {isOut ? 'Esgotado' : `${prod.stock} un.`}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-sm leading-snug pt-1">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800/80">
                    <span className="text-base font-bold text-amber-400">
                      {formatCurrency(prod.price)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 bg-dark-800 px-2.5 py-1 rounded-lg">
                      <Plus className="w-3.5 h-3.5 text-amber-500" />
                      {inCart ? `No carrinho (${inCart.quantity})` : 'Adicionar'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Carrinho de Venda no Balcão (1/3) */}
        <form
          onSubmit={handleFinishPOSSale}
          className="rounded-2xl border border-zinc-800 bg-dark-900/90 p-6 flex flex-col justify-between space-y-5 shadow-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-display text-lg font-bold text-white uppercase tracking-wide">
                Carrinho de Venda (PDV)
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Limpar
                </button>
              )}
            </div>

            {saleSuccessMsg && (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {saleSuccessMsg}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-10 text-center space-y-2 border border-dashed border-zinc-800 rounded-xl">
                <ShoppingBag className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  Nenhum produto selecionado no carrinho.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Clique nos produtos ao lado para iniciar uma venda avulsa.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-dark-950 border border-zinc-800 p-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-amber-400 font-medium">
                        {formatCurrency(item.price)} cada
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, -1)}
                        className="p-1 rounded-lg bg-dark-800 text-zinc-300 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-white w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, 1)}
                        className="p-1 rounded-lg bg-dark-800 text-zinc-300 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Identificação do Cliente e Forma de Pagamento */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Cliente (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Cliente Balcão"
                  value={posClientName}
                  onChange={(e) => setPosClientName(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'].map(
                    (method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPosPaymentMethod(method)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          posPaymentMethod === method
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
                <label className="block text-xs text-zinc-400 mb-1">
                  Desconto R$ (Opcional)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  placeholder="0,00"
                  value={posDiscount}
                  onChange={(e) => setPosDiscount(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Total da Venda:</span>
              <span className="text-2xl font-display font-bold text-emerald-400">
                {formatCurrency(cartTotal)}
              </span>
            </div>

            <button
              type="submit"
              disabled={cart.length === 0 || !cashier.isOpen}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/15"
            >
              Finalizar Venda no Caixa
            </button>
          </div>
        </form>
      </div>

      {/* Comandas de Agendamentos Pendentes de Pagamento */}
      {openComandas.length > 0 && (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Comandas de Atendimento Aguardando Recebimento ({openComandas.length})
            </h3>
            <p className="text-xs text-zinc-400">
              Receba diretamente no caixa os agendamentos de clientes em atendimento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {openComandas.map((app) => {
              const srv = getServiceById(app.serviceId)
              const barb = getBarberById(app.barberId)
              const extraSum = app.extraProducts.reduce(
                (acc, i) => acc + i.price * i.quantity,
                0
              )
              const total = (srv?.price || 0) + extraSum

              return (
                <div
                  key={app.id}
                  className="rounded-xl border border-zinc-800 bg-dark-950 p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        {app.clientName}
                      </span>
                      <span className="text-xs font-semibold text-amber-400">
                        {app.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      {srv?.name} • Barbeiro: {barb?.name}
                    </p>
                    {app.extraProducts.length > 0 && (
                      <p className="text-[11px] text-amber-300 mt-1">
                        + {app.extraProducts.map((p) => `${p.quantity}x ${p.name}`).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <span className="text-base font-bold text-emerald-400">
                      {formatCurrency(total)}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => checkoutAppointment(app.id, 'PIX', 0)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                      >
                        Receber PIX
                      </button>
                      <button
                        onClick={() =>
                          checkoutAppointment(app.id, 'Cartão de Crédito', 0)
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs"
                      >
                        Cartão
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Histórico Completo de Movimentações do Caixa */}
      <section className="rounded-2xl border border-zinc-800 bg-dark-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Fluxo de Caixa — Histórico de Lançamentos
            </h3>
            <p className="text-xs text-zinc-400">
              Registro detalhado de serviços, vendas de produtos e despesas operacionais
            </p>
          </div>
          <span className="text-xs text-zinc-400">
            {transactions.length} movimentações registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase text-zinc-400">
                <th className="py-3 px-3">Horário</th>
                <th className="py-3 px-3">Tipo / Categoria</th>
                <th className="py-3 px-3">Descrição</th>
                <th className="py-3 px-3">Pagamento</th>
                <th className="py-3 px-3">Comissão Barbeiro</th>
                <th className="py-3 px-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-xs">
              {transactions.map((trx) => {
                const isEntry = trx.type === 'entrada'
                const barb = trx.barberId ? getBarberById(trx.barberId) : null
                return (
                  <tr key={trx.id} className="hover:bg-dark-950/50">
                    <td className="py-3.5 px-3 font-medium text-zinc-300 whitespace-nowrap">
                      {trx.time}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isEntry
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {isEntry ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {trx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-200 max-w-md">
                      {trx.description}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-zinc-300 bg-dark-950 border border-zinc-800 px-2.5 py-1 rounded-lg">
                        <CreditCard className="w-3 h-3 text-amber-500" />
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap text-zinc-400">
                      {trx.commissionAmount > 0 ? (
                        <span className="text-amber-400 font-medium">
                          {formatCurrency(trx.commissionAmount)} ({barb?.name.split(' ')[0]})
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-right font-bold whitespace-nowrap text-sm ${
                        isEntry ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isEntry ? '+' : '-'} {formatCurrency(trx.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Sangria / Despesa / Suprimento */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleManualMovement}
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-dark-900 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                Lançar Movimentação no Caixa
              </h3>
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMovType('saida')
                  setMovCategory('Despesa Operacional')
                }}
                className={`py-2.5 rounded-xl text-xs font-bold border ${
                  movType === 'saida'
                    ? 'bg-rose-500 text-zinc-950 border-rose-400'
                    : 'bg-dark-950 text-zinc-400 border-zinc-800'
                }`}
              >
                Saída / Sangria / Despesa
              </button>
              <button
                type="button"
                onClick={() => {
                  setMovType('entrada')
                  setMovCategory('Suprimento de Caixa')
                }}
                className={`py-2.5 rounded-xl text-xs font-bold border ${
                  movType === 'entrada'
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                    : 'bg-dark-950 text-zinc-400 border-zinc-800'
                }`}
              >
                Entrada / Suprimento
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de lâminas, café, pagamento fornecedor..."
                  value={movDesc}
                  onChange={(e) => setMovDesc(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={movAmount}
                    onChange={(e) => setMovAmount(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Meio</label>
                  <select
                    value={movMethod}
                    onChange={(e) => setMovMethod(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
              >
                Registrar no Caixa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
