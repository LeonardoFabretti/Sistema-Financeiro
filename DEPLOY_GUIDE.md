# 🚀 Deploy - Sistema Financeiro para Produção

Este guia detalha como fazer deploy do sistema para **produção comercial** com **backend no Railway** e **frontend no Vercel**.

---

## 📋 **Pré-requisitos**

- Conta no [Railway](https://railway.app/) (para PostgreSQL + Backend)
- Conta no [Vercel](https://vercel.com/) (para Frontend)
- Git instalado
- Node.js 18+ instalado

---

## 🗄️ **Parte 1: Deploy do Banco de Dados (Railway)**

### 1.1 Criar Banco PostgreSQL

1. Acesse [Railway](https://railway.app/) e faça login
2. Clique em **"New Project"**
3. Selecione **"Provision PostgreSQL"**
4. Railway criará automaticamente um banco PostgreSQL

### 1.2 Obter Credenciais

1. Clique no banco de dados criado
2. Vá para **"Connect"** ou **"Variables"**
3. Copie a **DATABASE_URL** (formato: `postgresql://user:password@host:port/database`)

### 1.3 Executar Schema SQL

**Opção A: Via Railway Dashboard**
1. No Railway, clique em **"Query"**
2. Cole o conteúdo de `backend/src/database/schema.sql`
3. Execute

**Opção B: Via CLI local**
```bash
# Instalar psql
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql

# Conectar e executar
psql "sua-database-url-aqui" < backend/src/database/schema.sql
```

---

## 🔧 **Parte 2: Deploy do Backend (Railway)**

### 2.1 Preparar Backend

No diretório `backend/`:

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env
```

### 2.2 Configurar .env

Edite `backend/.env`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:port/db  # URL do Railway
JWT_SECRET=gere-um-secret-aqui-32-caracteres-minimo
SESSION_SECRET=gere-outro-secret-aqui-32-caracteres
BCRYPT_ROUNDS=12
FRONTEND_URL=https://seu-app.vercel.app  # Atualizar depois
```

**⚠️ IMPORTANTE:** Gere secrets fortes:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Deploy no Railway

**Opção A: Via Railway CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar
railway init

# Conectar ao projeto
railway link

# Deploy
railway up
```

**Opção B: Via GitHub**
1. Faça push do código para um repositório GitHub
2. No Railway:
   - Clique em **"New Project"**
   - Selecione **"Deploy from GitHub"**
   - Escolha seu repositório
   - Railway detectará automaticamente o Node.js

### 2.4 Configurar Variáveis de Ambiente no Railway

1. No Railway, clique no serviço do backend
2. Vá para **"Variables"**
3. Adicione cada variável do `.env`:
   - `NODE_ENV=production`
   - `JWT_SECRET=...`
   - `SESSION_SECRET=...`
   - `DATABASE_URL` (já deve estar configurada)
   - `FRONTEND_URL` (atualizar depois)

### 2.5 Obter URL do Backend

Após o deploy:
1. No Railway, clique em **"Settings"**
2. Em **"Domains"**, clique em **"Generate Domain"**
3. Copie a URL (ex: `https://seu-backend.up.railway.app`)

---

## 🎨 **Parte 3: Deploy do Frontend (Vercel)**

### 3.1 Atualizar Configuração do Frontend

Crie `src/config/api.ts`:

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  auth: {
    register: `${API_URL}/api/auth/register`,
    login: `${API_URL}/api/auth/login`,
    logout: `${API_URL}/api/auth/logout`,
    me: `${API_URL}/api/auth/me`,
  },
  finance: {
    months: `${API_URL}/api/finance/months`,
    export: `${API_URL}/api/finance/export`,
    import: `${API_URL}/api/finance/import`,
  },
  user: {
    profile: `${API_URL}/api/user/profile`,
    sessions: `${API_URL}/api/user/sessions`,
  }
};
```

### 3.2 Criar .env.production

No diretório raiz:

```env
VITE_API_URL=https://seu-backend.up.railway.app
```

### 3.3 Deploy no Vercel

**Opção A: Via Vercel CLI**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

**Opção B: Via Dashboard**
1. Acesse [Vercel](https://vercel.com/)
2. Clique em **"New Project"**
3. Importe seu repositório GitHub
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL` = URL do backend Railway

5. Clique em **"Deploy"**

### 3.4 Obter URL do Frontend

Após o deploy, Vercel fornecerá uma URL como:
- `https://seu-app.vercel.app`

---

## 🔄 **Parte 4: Conectar Frontend ↔ Backend**

### 4.1 Atualizar CORS no Backend

No Railway, atualize a variável `FRONTEND_URL`:
```
FRONTEND_URL=https://seu-app.vercel.app
```

### 4.2 Testar Conexão

Acesse `https://seu-app.vercel.app` e:
1. Tente registrar um usuário
2. Faça login
3. Adicione dados financeiros
4. Verifique no Railway que os dados foram salvos

---

## 📊 **Parte 5: Monitoramento**

### 5.1 Logs do Backend (Railway)

```bash
# Ver logs em tempo real
railway logs

# Ou no dashboard: aba "Logs"
```

### 5.2 Logs do Frontend (Vercel)

No Vercel Dashboard:
- Aba **"Deployments"** → Clique no deploy → **"View Function Logs"**

### 5.3 Banco de Dados (Railway)

No Railway:
- Aba **"Metrics"** para ver uso de CPU/memória/disco
- Aba **"Query"** para executar SQL manualmente

---

## 🔒 **Parte 6: Segurança em Produção**

### 6.1 Secrets Fortes

```bash
# Gerar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6.2 HTTPS Obrigatório

✅ Railway e Vercel fornecem HTTPS automaticamente

### 6.3 Variáveis de Ambiente

⚠️ **NUNCA** comitar `.env` no Git
✅ Usar variáveis do Railway/Vercel

### 6.4 Rate Limiting

Backend já tem rate limiting configurado:
- Auth: 5 tentativas / 15 minutos
- API geral: 100 requisições / 15 minutos

---

## 💰 **Custos Estimados**

### Railway (Backend + DB)
- **Plano Free:** $5/mês de crédito grátis
- **Plano Dev:** $5/mês (~500 horas)
- **Plano Pro:** $20/mês (ilimitado)

### Vercel (Frontend)
- **Hobby:** Grátis (uso pessoal)
- **Pro:** $20/mês (uso comercial)

**Total mínimo:** $5-10/mês para começar

---

## 🆘 **Troubleshooting**

### Erro: CORS blocked
- Verifique `FRONTEND_URL` no backend
- Certifique-se que a URL do Vercel está correta

### Erro: Database connection failed
- Verifique `DATABASE_URL` no Railway
- Teste conexão: `psql "sua-url"`

### Erro: 500 Internal Server Error
- Veja logs no Railway: `railway logs`
- Verifique se todas as variáveis estão configuradas

### Frontend não carrega dados
- Abra DevTools → Network
- Verifique se requisições estão indo para URL correta
- Verifique `VITE_API_URL` no Vercel

---

## 📚 **Próximos Passos**

1. **Domínio Customizado**
   - Vercel: Settings → Domains → Add
   - Railway: Settings → Domains → Custom Domain

2. **Backup Automático**
   - Railway oferece backups automáticos no plano Pro

3. **Monitoramento Avançado**
   - Integrar Sentry para error tracking
   - Configurar alerts no Railway

4. **CI/CD**
   - Push para `main` → Deploy automático
   - Já configurado automaticamente!

---

## ✅ **Checklist Final**

- [ ] PostgreSQL criado no Railway
- [ ] Schema SQL executado
- [ ] Backend deployed no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend deployed no Vercel
- [ ] CORS configurado corretamente
- [ ] Teste de registro funcionando
- [ ] Teste de login funcionando
- [ ] Dados sendo salvos no banco
- [ ] Domínio customizado configurado (opcional)

---

**🎉 Parabéns! Seu sistema está em produção!**

Para suporte:
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
