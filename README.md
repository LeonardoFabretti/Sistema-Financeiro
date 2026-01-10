# 💰 Sistema Financeiro Pessoal

Sistema completo e moderno de controle financeiro pessoal, focado em gestão de renda, gastos e economia.

## 🎯 Funcionalidades

### ✅ Controle de Renda
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
