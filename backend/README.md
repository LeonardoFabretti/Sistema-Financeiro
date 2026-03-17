# Sistema Financeiro - Backend API

API RESTful para o Sistema Financeiro com todas as correções de segurança aplicadas.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📁 Estrutura

```
backend/
├── src/
│   ├── server.ts              # Servidor principal
│   ├── controllers/           # Lógica de negócio
│   │   ├── auth.controller.ts
│   │   ├── finance.controller.ts
│   │   └── user.controller.ts
│   ├── routes/                # Definição de rotas
│   │   ├── auth.routes.ts
│   │   ├── finance.routes.ts
│   │   └── user.routes.ts
│   ├── middleware/            # Middleware customizado
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── notFound.ts
│   └── database/              # Banco de dados
│       ├── db.ts              # Conexão PostgreSQL
│       └── schema.sql         # Schema do banco
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔒 Segurança Implementada

✅ **Bcrypt** - Hash de senhas com salt único  
✅ **JWT** - Autenticação stateless  
✅ **Rate Limiting** - Proteção contra brute force  
✅ **Helmet** - Security headers  
✅ **CORS** - Configurado para Vercel  
✅ **SQL Injection** - Prepared statements  
✅ **Audit Logs** - Rastreamento de ações  
✅ **Session Management** - Controle de sessões  

## 🛣️ API Endpoints

### Autenticação
```
POST   /api/auth/register      - Registrar usuário
POST   /api/auth/login         - Login
POST   /api/auth/logout        - Logout
POST   /api/auth/refresh       - Renovar token
POST   /api/auth/change-password - Trocar senha
GET    /api/auth/me            - Usuário atual
```

### Finanças
```
GET    /api/finance/months           - Listar todos os meses
GET    /api/finance/months/:y/:m     - Buscar mês específico
POST   /api/finance/months           - Criar mês
PUT    /api/finance/months/:id       - Atualizar mês
DELETE /api/finance/months/:id       - Deletar mês
POST   /api/finance/export           - Exportar dados
POST   /api/finance/import           - Importar dados
```

### Usuário
```
GET    /api/user/profile             - Ver perfil
PUT    /api/user/profile             - Atualizar perfil
DELETE /api/user/account             - Deletar conta
GET    /api/user/sessions            - Listar sessões
DELETE /api/user/sessions/:id        - Revogar sessão
```

## 🗄️ Banco de Dados

PostgreSQL 14+ com:
- **users** - Usuários do sistema
- **sessions** - Sessões ativas
- **financial_months** - Dados financeiros (JSONB)
- **audit_logs** - Logs de auditoria
- **login_attempts** - Rate limiting
- **backups** - Backups criptografados
- **compliance_requests** - LGPD

## 🔧 Variáveis de Ambiente

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=secret-aqui
JWT_EXPIRES_IN=30m
SESSION_SECRET=outro-secret
BCRYPT_ROUNDS=12
FRONTEND_URL=https://seu-app.vercel.app
```

## 📦 Deploy

Veja [DEPLOY_GUIDE.md](../DEPLOY_GUIDE.md) para instruções completas de deploy no Railway.

## 🧪 Testing

```bash
# Testar endpoints
curl http://localhost:3000/health

# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123"}'
```

## 📊 Logs

```bash
# Desenvolvimento
Logs aparecem automaticamente no console

# Produção (Railway)
railway logs
```

## 🐛 Troubleshooting

### Erro de conexão ao banco
```bash
# Testar conexão
psql $DATABASE_URL

# Verificar se schema foi aplicado
psql $DATABASE_URL -c "\dt"
```

### CORS errors
Verifique se `FRONTEND_URL` está configurado corretamente

### Token expirado
Tokens JWT expiram em 30 minutos. Use `/api/auth/refresh`

## 📝 License

MIT
