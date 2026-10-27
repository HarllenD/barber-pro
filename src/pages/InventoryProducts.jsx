import React, { useState, useMemo } from 'react'
import {
  Package,
  AlertTriangle,
  Plus,
  Scissors,
  Trash2,
  TrendingUp,
  Layers,
  CheckCircle2,
  Search
} from 'lucide-react'
import { useBarber } from '../context/BarberContext'

export default function InventoryProducts() {
  const {
    products,
    services,
    addProduct,
    restockProduct,
    deleteProduct,
    addService
  } = useBarber()

  const [search, setSearch] = useState('')
  const [onlyLowStock, setOnlyLowStock] = useState(false)

  // Modal Novo Produto
  const [showProductModal, setShowProductModal] = useState(false)
  const [prodName, setProdName] = useState('')
  const [prodCategory, setProdCategory] = useState('Cosméticos')
  const [prodPrice, setProdPrice] = useState('')
  const [prodCost, setProdCost] = useState('')
  const [prodStock, setProdStock] = useState('10')
  const [prodMinStock, setProdMinStock] = useState('5')

  // Modal Novo Serviço
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [srvName, setSrvName] = useState('')
  const [srvCategory, setSrvCategory] = useState('Cabelo')
  const [srvPrice, setSrvPrice] = useState('')
  const [srvDuration, setSrvDuration] = useState('40')
  const [srvDesc, setSrvDesc] = useState('')

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const stats = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + Number(p.stock || 0), 0)
    const totalSaleValue = products.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
      0
    )
    const totalCostValue = products.reduce(
      (sum, p) => sum + Number(p.cost || 0) * Number(p.stock || 0),
      0
    )
    const lowStockItems = products.filter((p) => p.stock <= p.minStock).length

    return {
      totalUnits,
      totalSaleValue,
      estimatedProfit: totalSaleValue - totalCostValue,
      lowStockItems
    }
  }, [products])

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => (onlyLowStock ? p.stock <= p.minStock : true))
      .filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        p.category.toLowerCase().includes(search.trim().toLowerCase())
      )
  }, [products, onlyLowStock, search])

  const handleCreateProduct = (e) => {
    e.preventDefault()
    if (!prodName.trim() || !prodPrice) return
    addProduct({
      name: prodName,
      category: prodCategory,
      price: Number(prodPrice),
      cost: Number(prodCost || 0),
      stock: Number(prodStock || 0),
      minStock: Number(prodMinStock || 5)
    })
    setProdName('')
    setProdPrice('')
    setProdCost('')
    setShowProductModal(false)
  }

  const handleCreateService = (e) => {
    e.preventDefault()
    if (!srvName.trim() || !srvPrice) return
    addService({
      name: srvName,
      category: srvCategory,
      price: Number(srvPrice),
      duration: Number(srvDuration || 30),
      description: srvDesc
    })
    setSrvName('')
    setSrvPrice('')
    setSrvDesc('')
    setShowServiceModal(false)
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900/70 border border-zinc-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Package className="w-3.5 h-3.5" />
            CONTROLE DE ESTOQUE • PRODUTOS E SERVIÇOS DA BARBEARIA
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
            Estoque de Produtos & Catálogo
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Gerencie pomadas, óleos, bebidas, margens de lucro e serviços disponíveis no agendamento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowServiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-950 hover:bg-dark-800 text-zinc-200 border border-zinc-700 font-semibold text-xs sm:text-sm transition-colors"
          >
            <Scissors className="w-4 h-4 text-amber-500" />
            + Novo Serviço
          </button>

          <button
            onClick={() => setShowProductModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-amber-500/15"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Produto
          </button>
        </div>
      </div>

      {/* KPIs de Estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-dark-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Total de Unidades</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {stats.totalUnits} un.
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Distribuídos em {products.length} produtos
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-dark-900/60 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Valor em Estoque (Venda)</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {formatCurrency(stats.totalSaleValue)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Potencial bruto de faturamento</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex items-center justify-between text-xs text-emerald-300 mb-2">
            <span>Lucro Estimado do Estoque</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-display font-bold text-emerald-400">
            {formatCurrency(stats.estimatedProfit)}
          </p>
          <p className="text-[11px] text-emerald-400/70 mt-1">
            Descontando custo de aquisição
          </p>
        </div>

        <div
          className={`rounded-2xl border p-5 ${
            stats.lowStockItems > 0
              ? 'border-rose-500/40 bg-rose-500/10'
              : 'border-zinc-800 bg-dark-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-300 mb-2">
            <span>Alerta de Reposição</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-display font-bold text-rose-400">
            {stats.lowStockItems} itens
          </p>
          <p className="text-[11px] text-rose-300/80 mt-1">
            Abaixo ou no limite do estoque mínimo
          </p>
        </div>
      </div>

      {/* Tabela / Controle de Produtos em Estoque */}
      <section className="rounded-2xl border border-zinc-800 bg-dark-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Produtos para Venda e Uso Interno
            </h2>
            <p className="text-xs text-zinc-400">
              Reposição rápida de estoque com 1 clique
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                onlyLowStock
                  ? 'bg-rose-500 text-zinc-950 border-rose-400'
                  : 'bg-dark-950 text-zinc-300 border-zinc-800'
              }`}
            >
              {onlyLowStock ? 'Mostrando Estoque Baixo' : 'Filtrar Estoque Baixo'}
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-950 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase text-zinc-400">
                <th className="py-3 px-3">Produto</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Custo</th>
                <th className="py-3 px-3">Preço Venda</th>
                <th className="py-3 px-3">Estoque Atual</th>
                <th className="py-3 px-3 text-right">Reposição Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-xs">
              {filteredProducts.map((prod) => {
                const isLow = prod.stock <= prod.minStock
                const margin =
                  prod.price > 0
                    ? Math.round(((prod.price - prod.cost) / prod.price) * 100)
                    : 0

                return (
                  <tr key={prod.id} className="hover:bg-dark-950/50">
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-white text-sm">{prod.name}</p>
                      <span className="text-[10px] text-zinc-500">SKU: {prod.sku}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-lg bg-dark-950 border border-zinc-800 text-zinc-300">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-zinc-400">
                      {formatCurrency(prod.cost)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-amber-400 text-sm">
                        {formatCurrency(prod.price)}
                      </span>
                      <span className="block text-[10px] text-emerald-400">
                        Margem: {margin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold ${
                            isLow
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          {prod.stock} un.
                        </span>
                        {isLow && (
                          <span className="text-[10px] text-rose-400 font-medium">
                            (Mín: {prod.minStock})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => restockProduct(prod.id, -1)}
                          className="px-2.5 py-1 rounded-lg bg-dark-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => restockProduct(prod.id, 1)}
                          className="px-2.5 py-1 rounded-lg bg-dark-950 border border-zinc-800 hover:border-amber-500 text-amber-400 font-semibold"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => restockProduct(prod.id, 5)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-400 font-semibold"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          title="Excluir produto"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Catálogo de Serviços da Barbearia */}
      <section className="rounded-2xl border border-zinc-800 bg-dark-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Catálogo de Serviços Ativos ({services.length})
            </h2>
            <p className="text-xs text-zinc-400">
              Estes serviços ficam disponíveis automaticamente no aplicativo de agendamento do cliente
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="rounded-xl border border-zinc-800 bg-dark-950/70 p-4 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-dark-800 text-amber-400">
                    {srv.category}
                  </span>
                  <span className="text-xs text-zinc-400">{srv.duration} min</span>
                </div>
                <h3 className="font-bold text-white text-sm">{srv.name}</h3>
                <p className="text-xs text-zinc-400 mt-1">{srv.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">Valor do serviço</span>
                <span className="text-base font-bold text-emerald-400">
                  {formatCurrency(srv.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Cadastro de Novo Produto */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-dark-900 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">Cadastrar Novo Produto</h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pomada Efeito Teia 150g"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Categoria</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Cosméticos">Cosméticos</option>
                  <option value="Barba">Barba</option>
                  <option value="Cabelo">Cabelo</option>
                  <option value="Bebidas">Bebidas</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="40.00"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">
                    Preço de Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="18.00"
                    value={prodCost}
                    onChange={(e) => setProdCost(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    value={prodMinStock}
                    onChange={(e) => setProdMinStock(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de Cadastro de Novo Serviço */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateService}
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-dark-900 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white">Novo Serviço da Barbearia</h3>
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Selagem Masculina + Corte"
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Categoria</label>
                  <select
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Barba">Barba</option>
                    <option value="Combo">Combo</option>
                    <option value="Química">Química</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="55.00"
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Tempo (min)</label>
                  <input
                    type="number"
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(e.target.value)}
                    className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Breve descrição que aparece para o cliente..."
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  className="w-full bg-dark-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
              >
                Adicionar Serviço
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
