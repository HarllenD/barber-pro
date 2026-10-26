// Retorna a data de hoje no formato YYYY-MM-DD
export const getTodayISO = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const AVAILABLE_TIME_SLOTS = [
  '09:00', '09:45', '10:30', '11:15',
  '13:00', '13:45', '14:30', '15:15',
  '16:00', '16:45', '17:30', '18:15',
  '19:00', '19:45'
]

export const INITIAL_BARBERS = [
  {
    id: 'barb-1',
    name: 'Rafael Mendes',
    role: 'Master Barber & Visagista',
    commission: 50,
    rating: 4.9,
    reviewsCount: 142,
    phone: '11998765432',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    specialties: ['Degradê Navalhado', 'Barboterapia', 'Visagismo'],
    available: true
  },
  {
    id: 'barb-2',
    name: 'Lucas "Navalha" Costa',
    role: 'Especialista em Fade & Freestyle',
    commission: 45,
    rating: 4.8,
    reviewsCount: 98,
    phone: '11997654321',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    specialties: ['Low/Mid Fade', 'Platinado', 'Sobrancelha na Navalha'],
    available: true
  },
  {
    id: 'barb-3',
    name: 'Matheus Oliveira',
    role: 'Barbeiro Clássico & Executivo',
    commission: 45,
    rating: 4.9,
    reviewsCount: 116,
    phone: '11996543210',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    specialties: ['Corte Clássico Tesoura', 'Toalha Quente', 'Alinhamento de Barba'],
    available: true
  }
]

export const INITIAL_SERVICES = [
  {
    id: 'srv-1',
    name: 'Corte Degradê / Fade',
    description: 'Corte moderno com acabamento na navalha, lavagem e finalização com pomada.',
    price: 45.00,
    duration: 45,
    category: 'Cabelo',
    popular: true
  },
  {
    id: 'srv-2',
    name: 'Combo Corte + Barba Completa',
    description: 'Corte personalizado + barboterapia com toalha quente, óleo essencial e massagem facial.',
    price: 75.00,
    duration: 60,
    category: 'Combo',
    popular: true
  },
  {
    id: 'srv-3',
    name: 'Barboterapia com Toalha Quente',
    description: 'Alinhamento na navalha, espuma aquecida, toalha quente aromática e balm pós-barba.',
    price: 40.00,
    duration: 30,
    category: 'Barba',
    popular: false
  },
  {
    id: 'srv-4',
    name: 'Corte Social / Clássico na Tesoura',
    description: 'Corte tradicional executivo na tesoura e máquina com acabamento impecável.',
    price: 40.00,
    duration: 40,
    category: 'Cabelo',
    popular: false
  },
  {
    id: 'srv-5',
    name: 'Acabamento (Pezinho) + Sobrancelha',
    description: 'Limpeza do contorno do corte e alinhamento de sobrancelha na navalha.',
    price: 25.00,
    duration: 20,
    category: 'Acabamento',
    popular: false
  },
  {
    id: 'srv-6',
    name: 'Platinado Global + Corte',
    description: 'Descoloração segura com proteção capilar, matização e corte estilizado.',
    price: 130.00,
    duration: 90,
    category: 'Química',
    popular: false
  }
]

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Pomada Modeladora Efeito Matte 120g',
    category: 'Cosméticos',
    price: 38.00,
    cost: 17.50,
    stock: 14,
    minStock: 5,
    sku: 'POM-MAT-01'
  },
  {
    id: 'prod-2',
    name: 'Pomada Black Modeladora 120g',
    category: 'Cosméticos',
    price: 42.00,
    cost: 19.00,
    stock: 4,
    minStock: 5,
    sku: 'POM-BLK-02'
  },
  {
    id: 'prod-3',
    name: 'Óleo para Barba Cedarwood 30ml',
    category: 'Barba',
    price: 35.00,
    cost: 15.00,
    stock: 9,
    minStock: 4,
    sku: 'OLE-BAR-03'
  },
  {
    id: 'prod-4',
    name: 'Balm Pós-Barba Mentolado 100ml',
    category: 'Barba',
    price: 32.00,
    cost: 14.00,
    stock: 8,
    minStock: 4,
    sku: 'BAL-BAR-04'
  },
  {
    id: 'prod-5',
    name: 'Shampoo Anticaspa 3 em 1 250ml',
    category: 'Cabelo',
    price: 48.00,
    cost: 22.00,
    stock: 3,
    minStock: 5,
    sku: 'SHA-CAB-05'
  },
  {
    id: 'prod-6',
    name: 'Cerveja Heineken Long Neck 330ml',
    category: 'Bebidas',
    price: 12.00,
    cost: 5.80,
    stock: 24,
    minStock: 10,
    sku: 'BEB-HEI-06'
  },
  {
    id: 'prod-7',
    name: 'Energético Monster Energy 473ml',
    category: 'Bebidas',
    price: 14.00,
    cost: 6.90,
    stock: 11,
    minStock: 6,
    sku: 'BEB-MON-07'
  },
  {
    id: 'prod-8',
    name: 'Minoxidil 5% Loção Capilar 60ml',
    category: 'Barba',
    price: 65.00,
    cost: 30.00,
    stock: 6,
    minStock: 3,
    sku: 'MIN-BAR-08'
  }
]

const today = getTodayISO()

export const INITIAL_APPOINTMENTS = [
  {
    id: 'ag-101',
    clientName: 'Gabriel Santos',
    clientPhone: '11988112233',
    barberId: 'barb-1',
    serviceId: 'srv-2',
    date: today,
    time: '09:00',
    status: 'concluido', // confirmado | em_atendimento | concluido | cancelado
    notes: 'Degradê médio, preservar comprimento no topo',
    extraProducts: [
      { productId: 'prod-1', name: 'Pomada Modeladora Efeito Matte 120g', price: 38.00, quantity: 1 }
    ],
    paid: true,
    paymentMethod: 'PIX'
  },
  {
    id: 'ag-102',
    clientName: 'Rodrigo Almeida',
    clientPhone: '11977223344',
    barberId: 'barb-2',
    serviceId: 'srv-1',
    date: today,
    time: '10:30',
    status: 'em_atendimento',
    notes: 'Low fade + risco na lateral',
    extraProducts: [
      { productId: 'prod-6', name: 'Cerveja Heineken Long Neck 330ml', price: 12.00, quantity: 1 }
    ],
    paid: false,
    paymentMethod: ''
  },
  {
    id: 'ag-103',
    clientName: 'Fernando Costa',
    clientPhone: '11966334455',
    barberId: 'barb-1',
    serviceId: 'srv-3',
    date: today,
    time: '11:15',
    status: 'confirmado',
    notes: 'Alinhar bigode na tesoura',
    extraProducts: [],
    paid: false,
    paymentMethod: ''
  },
  {
    id: 'ag-104',
    clientName: 'Bruno Henrique',
    clientPhone: '11955443322',
    barberId: 'barb-3',
    serviceId: 'srv-2',
    date: today,
    time: '13:45',
    status: 'confirmado',
    notes: '',
    extraProducts: [],
    paid: false,
    paymentMethod: ''
  },
  {
    id: 'ag-105',
    clientName: 'Thiago Ribeiro',
    clientPhone: '11944332211',
    barberId: 'barb-2',
    serviceId: 'srv-6',
    date: today,
    time: '15:15',
    status: 'confirmado',
    notes: 'Primeira vez fazendo platinado',
    extraProducts: [],
    paid: false,
    paymentMethod: ''
  }
]

export const INITIAL_TRANSACTIONS = [
  {
    id: 'trx-1',
    type: 'entrada', // entrada | saida
    category: 'Comanda (Serviço + Produto)',
    description: 'Atendimento Gabriel Santos - Combo Corte + Barba + 1x Pomada Matte',
    amount: 113.00,
    serviceAmount: 75.00,
    productAmount: 38.00,
    barberId: 'barb-1',
    commissionAmount: 37.50,
    paymentMethod: 'PIX',
    date: today,
    time: '09:55',
    appointmentId: 'ag-101'
  },
  {
    id: 'trx-2',
    type: 'entrada',
    category: 'Venda de Produtos (PDV)',
    description: 'Venda Balcão - 1x Óleo para Barba Cedarwood + 1x Cerveja Heineken',
    amount: 47.00,
    serviceAmount: 0,
    productAmount: 47.00,
    barberId: null,
    commissionAmount: 0,
    paymentMethod: 'Cartão de Crédito',
    date: today,
    time: '10:15',
    appointmentId: null
  },
  {
    id: 'trx-3',
    type: 'saida',
    category: 'Despesa Operacional',
    description: 'Compra de descartáveis (golas higiênicas e lâminas)',
    amount: 35.00,
    serviceAmount: 0,
    productAmount: 0,
    barberId: null,
    commissionAmount: 0,
    paymentMethod: 'Dinheiro',
    date: today,
    time: '08:40',
    appointmentId: null
  }
]
