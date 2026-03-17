# 💰 Sistema Financeiro - Production Ready

Sistema financeiro completo com **frontend React + backend Node.js** pronto para comercialização.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 🎯 **Visão Geral**

Sistema financeiro pessoal com **segurança enterprise**, pronto para ser comercializado. Implementa todas as melhores práticas de segurança e compliance (LGPD).

### ✨ **Principais Features**

- 💼 **Gestão Financeira Completa** - Controle de rendas, gastos, caixinhas, relatórios
- 🔒 **Segurança Enterprise** - JWT, bcrypt, rate limiting, audit logs
- 📊 **Banco de Dados Robusto** - PostgreSQL com RLS e prepared statements
- 📱 **Interface Moderna** - React 18 + TypeScript + Tailwind CSS
- ⚖️ **Compliance LGPD** - Consentimento, exportação, direito ao esquecimento

---

## 🏗️ **Arquitetura**

```
Frontend (Vercel)  ────HTTPS────▶  Backend (Railway)  ────Pool────▶  PostgreSQL (Railway)
React + TypeScript                 Express + TypeScript               Database 14+
```

---

## 📦 **Estrutura do Projeto**

```
sistema_financeiro/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── server.ts
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── database/
│   └── package.json
│
├── src/                        # Frontend
│   ├── components/
│   ├── contexts/
│   ├── services/
│   └── types/
│
├── DEPLOY_GUIDE.md            # Guia completo de deploy
├── CORRECOES_APLICADAS.md     # Correções de segurança
└── README.md                  # Este arquivo
```

---

## 🚀 **Quick Start - Desenvolvimento Local**

### **Backend**

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas credenciais

# Criar banco
psql -U postgres -c "CREATE DATABASE sistema_financeiro;"
psql -U postgres -d sistema_financeiro -f src/database/schema.sql

npm run dev
# ✅ Backend em http://localhost:3000
```

### **Frontend**

```bash
npm install
echo "VITE_API_URL=http://localhost:3000" > .env.development
npm run dev
# ✅ Frontend em http://localhost:5173
```

---

## 🌐 **Deploy para Produção**

### 📋 **Pré-requisitos**
- Conta no [Railway](https://railway.app/) (backend + DB)
- Conta no [Vercel](https://vercel.com/) (frontend)

### 🚀 **Deploy Rápido**

```bash
# 1. Deploy do Backend (Railway)
cd backend
npm install -g @railway/cli
railway login
railway init
railway up

# 2. Deploy do Frontend (Vercel)
npm install -g vercel
vercel --prod
```

**📖 Guia Completo de Deploy:** [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)

---

## 🔒 **Segurança Implementada**

✅ Bcrypt + Salt único  
✅ JWT com refresh token  
✅ Rate limiting (fingerprint-based)  
✅ Session signing (anti-forjamento)  
✅ CORS configurado  
✅ Helmet security headers  
✅ SQL injection protection  
✅ XSS protection  
✅ Audit logs  
✅ HTTPS obrigatório  

**Detalhes:** [CORRECOES_APLICADAS.md](CORRECOES_APLICADAS.md)

---

## 🛣️ **API Endpoints**

```http
# Autenticação
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

# Finanças
GET    /api/finance/months
POST   /api/finance/months
POST   /api/finance/export

# Usuário
GET    /api/user/profile
DELETE /api/user/account
GET    /api/user/sessions
```

---

## 💰 **Custos (Produção)**

| Serviço | Plano | Custo/mês |
|---------|-------|-----------|
| Railway (Backend + DB) | Hobby | $5 |
| Vercel (Frontend) | Hobby | Grátis |
| **Total** | | **$5** |

---

## 🛠️ **Stack Tecnológica**

**Frontend:** React 18, TypeScript, Tailwind CSS, Vite  
**Backend:** Node.js, Express, TypeScript, JWT, Bcrypt  
**Database:** PostgreSQL 14+  
**Deploy:** Vercel + Railway  

---

## 📚 **Documentação**

- [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) - Guia completo de deploy
- [SECURITY.md](SECURITY.md) - Documentação de segurança
- [CORRECOES_APLICADAS.md](CORRECOES_APLICADAS.md) - Correções implementadas
- [backend/README.md](backend/README.md) - Documentação do backend

---

## ✅ **Status**

🎉 **PRONTO PARA PRODUÇÃO**

✅ Backend API completo  
✅ Frontend responsivo  
✅ PostgreSQL com RLS  
✅ Deploy automatizado  
✅ LGPD compliance  
✅ Documentação completa  

---

**Desenvolvido com ❤️ para comercialização** ✅ Controle de Renda
- Cadastro de rendas com frequência (semanal, quinzenal, mensal, única)
- **Divisão automática** em categorias configuráveis
- Histórico completo de todas as rendas

### 💳 Gestão de Gastos
- Registro detalhado de gastos por categoria
- Visualização de gastos do dia, mês e por categoria
- Remoção de gastos com atualização automática de saldos
- Filtros por categoria

### 🏦 Sistema de Caixinhas
- Caixinhas personalizáveis com cores e nomes
- 3 categorias padrão: Reserva de Emergência, Gastos Essenciais e Objetivos Futuros
- Criação ilimitada de novas caixinhas
- Configuração de percentual automático para cada caixinha
- Histórico de movimentações por caixinha
- Visualização de saldo e estatísticas

### 📊 Gráficos e Estatísticas
- **Gastos por categoria** (gráfico de pizza interativo)
- **Evolução financeira** ao longo dos meses (gráfico de linhas)
- **Comparação de gastos** entre meses (gráfico de barras)
- **Distribuição de saldos** nas caixinhas
- Identificação automática do mês que mais gastou e mais economizou

### 📅 Sistema Mensal Automático
- Criação automática de novos meses
- Arquivamento automático de dados anteriores
- Resumo mensal completo:
  - Total recebido
  - Total gasto
  - Total economizado
  - Categoria com maior gasto
  - Comparação com mês anterior

### 📁 Histórico
- Navegação entre todos os meses registrados
- Visualização de dados arquivados
- Resumo detalhado de cada mês
- Exportação de relatórios em CSV

### 🎨 Interface
- Design moderno e intuitivo
- **Tema claro e escuro**
- Responsivo (funciona em desktop, tablet e mobile)
- Gráficos interativos
- Animações suaves

### 🔧 Funcionalidades Extras
- **Backup completo** dos dados (exportação JSON)
- **Importação** de backups
- **Exportação de relatórios** em CSV
- Armazenamento local (LocalStorage)
- Limpeza de dados

## 🛠️ Tecnologias

- **React 18** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Estilização utility-first
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones modernos
- **LocalStorage** - Persistência de dados

## 🚀 Como Executar

### Instalação das Dependências

```bash
npm install
```

### Executar em Modo Desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## 📖 Como Usar

### 1. Adicionar Renda
- Acesse a aba "Renda"
- Preencha o valor, descrição, data e frequência
- Ative a divisão automática para distribuir entre caixinhas
- Clique em "Adicionar Renda"

### 2. Registrar Gastos
- Acesse a aba "Gastos"
- Preencha valor, categoria, descrição e data
- O sistema atualiza automaticamente o saldo da caixinha

### 3. Gerenciar Caixinhas
- Acesse a aba "Caixinhas"
- Crie novas caixinhas personalizadas
- Configure o percentual automático de cada uma
- Visualize saldo e histórico de movimentações

### 4. Visualizar Gráficos
- Acesse a aba "Gráficos"
- Veja estatísticas visuais completas
- Identifique padrões de gastos
- Compare evolução mensal

### 5. Consultar Histórico
- Acesse a aba "Histórico"
- Navegue entre meses anteriores
- Exporte relatórios em CSV
- Compare resultados

### 6. Fazer Backup
- Clique no botão flutuante verde (download)
- Seus dados serão salvos em formato JSON
- Guarde o arquivo em local seguro

### 7. Alternar Tema
- Clique no botão flutuante (lua/sol)
- Alterna entre modo claro e escuro

## 📊 Estrutura do Projeto

```
src/
├── components/        # Componentes React
│   ├── Dashboard.tsx  # Tela principal
│   ├── RendaForm.tsx  # Gestão de rendas
│   ├── GastosForm.tsx # Registro de gastos
│   ├── Caixinhas.tsx  # Sistema de caixinhas
│   ├── Graficos.tsx   # Gráficos e estatísticas
│   └── Historico.tsx  # Histórico mensal
├── contexts/          # Context API
│   └── FinanceContext.tsx # Estado global
├── types/             # Tipos TypeScript
│   └── index.ts
├── utils/             # Funções auxiliares
│   └── helpers.ts
├── App.tsx            # Componente principal
├── main.tsx           # Entrada da aplicação
└── index.css          # Estilos globais
```

## 🎯 Características Principais

### Automação Máxima
- Divisão automática de renda
- Atualização automática de saldos
- Criação automática de novos meses
- Cálculos automáticos de resumos

### Controle Completo
- Edição e remoção de registros
- Personalização de categorias
- Configuração de percentuais
- Filtros e buscas

### Segurança dos Dados
- Armazenamento local seguro
- Sistema de backup
- Importação/exportação
- Nenhum dado enviado para servidores

## 🔮 Possíveis Evoluções Futuras

- [ ] Backend com banco de dados
- [ ] Aplicativo mobile (React Native)
- [ ] Metas financeiras com progresso
- [ ] Notificações e lembretes
- [ ] Múltiplos usuários
- [ ] Sincronização em nuvem
- [ ] Relatórios em PDF
- [ ] Integração com bancos
- [ ] Dashboard de investimentos
- [ ] Planejamento de objetivos

## 📝 Licença

Projeto livre para uso pessoal e educacional.

## 👨‍💻 Desenvolvido com ❤️

Sistema criado para ajudar no controle financeiro pessoal de forma simples, visual e eficiente.
