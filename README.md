# BarberPro 💈

Sistema web para gestão de barbearias com agendamento online para clientes, painel operacional para barbeiros, controle de comandas e frente de caixa (PDV) com estoque de produtos.

## Funcionalidades

- **Área do Cliente (Agendamento Online):**
  - Escolha de serviço com filtro por categoria (Cabelo, Barba, Combo, Química, Acabamento)
  - Seleção de profissional com especialidades e avaliação
  - Calendário com bloqueio automático de horários ocupados
  - Confirmação imediata com envio de comprovante pelo WhatsApp e consulta de agendamentos

- **Painel do Barbeiro (Agenda & Comandas):**
  - Visualização da agenda diária com filtro por barbeiro e status (`Confirmado`, `Na Cadeira`, `Concluído`)
  - Comanda integrada: adição de produtos consumidos durante o atendimento (cervejas, pomadas, óleos)
  - Cálculo automático de comissão por profissional
  - Fechamento de atendimento integrado diretamente ao Caixa

- **Sistema de Caixa & PDV (Venda de Produtos):**
  - Frente de caixa para venda avulsa de produtos no balcão com baixa automática de estoque
  - Recebimento rápido de comandas em aberto
  - Controle de entradas e saídas (sangria, despesas operacionais e suprimento)
  - Resumo financeiro separado por PIX, Cartão e Dinheiro

- **Estoque & Catálogo:**
  - Cadastro de novos produtos e serviços
  - Alerta de estoque mínimo e reposição rápida (`+1`, `+5`, `-1`)
  - Cálculo de margem de lucro e valor em estoque

## Tecnologias

- **React 19** + **Vite**
- **Tailwind CSS**
- **Lucide Icons**
- Persistência em `localStorage` (Context API)

## Como executar localmente

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev
```

## Estrutura de Pastas

```text
src/
 ├── components/
 │    └── Navbar.jsx           # Navegação entre os módulos e indicadores
 ├── context/
 │    └── BarberContext.jsx    # Regras de negócio e persistência no localStorage
 ├── data/
 │    └── initialData.js       # Dados iniciais (barbeiros, serviços, produtos e caixa)
 ├── pages/
 │    ├── ClientBooking.jsx    # Área do cliente (agendamento passo a passo)
 │    ├── BarberDashboard.jsx  # Painel do barbeiro, comandas e comissões
 │    ├── CashierPOS.jsx       # Frente de caixa (PDV) e fluxo financeiro
 │    └── InventoryProducts.jsx# Gestão de estoque e catálogo de serviços
 └── App.jsx
```
