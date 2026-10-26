import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  INITIAL_BARBERS,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_APPOINTMENTS,
  INITIAL_TRANSACTIONS,
  getTodayISO
} from '../data/initialData'

const BarberContext = createContext(null)

const STORAGE_KEYS = {
  BARBERS: 'barberpro_barbers_v1',
  SERVICES: 'barberpro_services_v1',
  PRODUCTS: 'barberpro_products_v1',
  APPOINTMENTS: 'barberpro_appointments_v1',
  TRANSACTIONS: 'barberpro_transactions_v1',
  CASHIER: 'barberpro_cashier_v1'
}

const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch (err) {
    console.error(`Erro ao carregar ${key}:`, err)
    return fallback
  }
}

export function BarberProvider({ children }) {
  const [barbers, setBarbers] = useState(() =>
    loadFromStorage(STORAGE_KEYS.BARBERS, INITIAL_BARBERS)
  )
  const [services, setServices] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES)
  )
  const [products, setProducts] = useState(() =>
    loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  )
  const [appointments, setAppointments] = useState(() =>
    loadFromStorage(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS)
  )
  const [transactions, setTransactions] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS)
  )
  const [cashier, setCashier] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CASHIER, {
      isOpen: true,
      openingBalance: 150.00,
      openedAt: '08:00'
    })
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BARBERS, JSON.stringify(barbers))
  }, [barbers])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services))
  }, [services])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments))
  }, [appointments])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASHIER, JSON.stringify(cashier))
  }, [cashier])

  // Helpers de busca
  const getBarberById = (id) => barbers.find((b) => b.id === id)
  const getServiceById = (id) => services.find((s) => s.id === id)
  const getProductById = (id) => products.find((p) => p.id === id)

  // 1. Criar novo agendamento (pelo cliente ou pelo barbeiro)
  const addAppointment = (data) => {
    const newAppointment = {
      id: `ag-${Date.now()}`,
      clientName: data.clientName.trim(),
      clientPhone: data.clientPhone.trim(),
      barberId: data.barberId,
      serviceId: data.serviceId,
      date: data.date || getTodayISO(),
      time: data.time,
      status: 'confirmado',
      notes: data.notes || '',
      extraProducts: [],
      paid: false,
      paymentMethod: ''
    }
    setAppointments((prev) => [...prev, newAppointment])
    return newAppointment
  }

  // 2. Atualizar status do agendamento
  const updateAppointmentStatus = (appointmentId, newStatus) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId ? { ...app, status: newStatus } : app
      )
    )
  }

  // 3. Adicionar produto extra na comanda do cliente agendado
  const addProductToAppointment = (appointmentId, productId, quantity = 1) => {
    const prod = getProductById(productId)
    if (!prod || prod.stock < quantity) return false

    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id !== appointmentId) return app
        const existing = app.extraProducts.find((item) => item.productId === productId)
        let updatedExtras
        if (existing) {
          updatedExtras = app.extraProducts.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          updatedExtras = [
            ...app.extraProducts,
            {
              productId: prod.id,
              name: prod.name,
              price: prod.price,
              quantity
            }
          ]
        }
        return { ...app, extraProducts: updatedExtras }
      })
    )
    return true
  }

  // 4. Remover produto extra da comanda do agendamento
  const removeProductFromAppointment = (appointmentId, productId) => {
    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id !== appointmentId) return app
        return {
          ...app,
          extraProducts: app.extraProducts.filter((item) => item.productId !== productId)
        }
      })
    )
  }

  // 5. Finalizar comanda do agendamento e lançar no Caixa
  const checkoutAppointment = (appointmentId, paymentMethod = 'PIX', discount = 0) => {
    const app = appointments.find((a) => a.id === appointmentId)
    if (!app || app.paid) return null

    const service = getServiceById(app.serviceId)
    const barber = getBarberById(app.barberId)

    const serviceAmount = service ? service.price : 0
    const productAmount = app.extraProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const totalAmount = Math.max(0, serviceAmount + productAmount - Number(discount || 0))
    const commissionRate = barber ? barber.commission / 100 : 0.45
    const commissionAmount = Number((serviceAmount * commissionRate).toFixed(2))

    // Dar baixa no estoque dos produtos consumidos na comanda
    if (app.extraProducts.length > 0) {
      setProducts((prev) =>
        prev.map((prod) => {
          const used = app.extraProducts.find((item) => item.productId === prod.id)
          if (!used) return prod
          return {
            ...prod,
            stock: Math.max(0, prod.stock - used.quantity)
          }
        })
      )
    }

    // Atualizar status do agendamento para concluído e pago
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointmentId
          ? { ...item, status: 'concluido', paid: true, paymentMethod }
          : item
      )
    )

    // Criar registro financeiro no Caixa
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    const extraDesc =
      app.extraProducts.length > 0
        ? ` + ${app.extraProducts.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`
        : ''

    const newTransaction = {
      id: `trx-${Date.now()}`,
      type: 'entrada',
      category: app.extraProducts.length > 0 ? 'Comanda (Serviço + Produto)' : 'Serviço Barbearia',
      description: `Atendimento ${app.clientName} - ${service ? service.name : 'Serviço'}${extraDesc}`,
      amount: totalAmount,
      serviceAmount,
      productAmount,
      barberId: app.barberId,
      commissionAmount,
      paymentMethod,
      date: getTodayISO(),
      time: nowTime,
      appointmentId: app.id
    }

    setTransactions((prev) => [newTransaction, ...prev])
    return newTransaction
  }

  // 6. Venda avulsa de produtos no PDV / Balcão
  const registerDirectSale = ({ items, paymentMethod = 'PIX', clientName = 'Cliente Balcão', discount = 0 }) => {
    if (!items || items.length === 0) return null

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const totalAmount = Math.max(0, subtotal - Number(discount || 0))

    // Baixar estoque
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = items.find((i) => i.id === prod.id)
        if (!cartItem) return prod
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartItem.quantity)
        }
      })
    )

    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    const itemsSummary = items.map((i) => `${i.quantity}x ${i.name}`).join(', ')

    const newTransaction = {
      id: `trx-${Date.now()}`,
      type: 'entrada',
      category: 'Venda de Produtos (PDV)',
      description: `Venda PDV (${clientName || 'Balcão'}) - ${itemsSummary}`,
      amount: totalAmount,
      serviceAmount: 0,
      productAmount: totalAmount,
      barberId: null,
      commissionAmount: 0,
      paymentMethod,
      date: getTodayISO(),
      time: nowTime,
      appointmentId: null
    }

    setTransactions((prev) => [newTransaction, ...prev])
    return newTransaction
  }

  // 7. Lançamento manual no caixa (Despesa, Sangria ou Suprimento)
  const registerCashierMovement = ({ type, category, description, amount, paymentMethod = 'Dinheiro' }) => {
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    const newTransaction = {
      id: `trx-${Date.now()}`,
      type, // 'entrada' ou 'saida'
      category: category || (type === 'saida' ? 'Despesa Operacional' : 'Suprimento de Caixa'),
      description,
      amount: Number(amount),
      serviceAmount: 0,
      productAmount: 0,
      barberId: null,
      commissionAmount: 0,
      paymentMethod,
      date: getTodayISO(),
      time: nowTime,
      appointmentId: null
    }
    setTransactions((prev) => [newTransaction, ...prev])
    return newTransaction
  }

  // 8. Gerenciamento de Estoque e Produtos
  const addProduct = (data) => {
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: data.name.trim(),
      category: data.category || 'Cosméticos',
      price: Number(data.price),
      cost: Number(data.cost || 0),
      stock: Number(data.stock || 0),
      minStock: Number(data.minStock || 5),
      sku: data.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`
    }
    setProducts((prev) => [...prev, newProduct])
    return newProduct
  }

  const restockProduct = (productId, quantityToAdd) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === productId
          ? { ...prod, stock: Math.max(0, prod.stock + Number(quantityToAdd)) }
          : prod
      )
    )
  }

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== productId))
  }

  // 9. Adicionar novo serviço
  const addService = (data) => {
    const newService = {
      id: `srv-${Date.now()}`,
      name: data.name.trim(),
      description: data.description || 'Serviço especializado da barbearia.',
      price: Number(data.price),
      duration: Number(data.duration || 30),
      category: data.category || 'Cabelo',
      popular: false
    }
    setServices((prev) => [...prev, newService])
    return newService
  }

  // 10. Abrir / Fechar Caixa
  const toggleCashierStatus = (newOpeningBalance) => {
    const nowTime = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    setCashier((prev) => ({
      isOpen: !prev.isOpen,
      openingBalance:
        newOpeningBalance !== undefined ? Number(newOpeningBalance) : prev.openingBalance,
      openedAt: !prev.isOpen ? nowTime : prev.openedAt
    }))
  }

  // 11. Restaurar dados de demonstração
  const resetDemoData = () => {
    setBarbers(INITIAL_BARBERS)
    setServices(INITIAL_SERVICES)
    setProducts(INITIAL_PRODUCTS)
    setAppointments(INITIAL_APPOINTMENTS)
    setTransactions(INITIAL_TRANSACTIONS)
    setCashier({ isOpen: true, openingBalance: 150.00, openedAt: '08:00' })
  }

  return (
    <BarberContext.Provider
      value={{
        barbers,
        services,
        products,
        appointments,
        transactions,
        cashier,
        getBarberById,
        getServiceById,
        getProductById,
        addAppointment,
        updateAppointmentStatus,
        addProductToAppointment,
        removeProductFromAppointment,
        checkoutAppointment,
        registerDirectSale,
        registerCashierMovement,
        addProduct,
        restockProduct,
        deleteProduct,
        addService,
        toggleCashierStatus,
        resetDemoData
      }}
    >
      {children}
    </BarberContext.Provider>
  )
}

export const useBarber = () => {
  const context = useContext(BarberContext)
  if (!context) {
    throw new Error('useBarber deve ser usado dentro de um BarberProvider')
  }
  return context
}
