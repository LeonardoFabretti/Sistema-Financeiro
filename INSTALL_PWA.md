# 💰 Sistema Financeiro Pessoal - Guia de Instalação PWA

## 📱 Como Instalar no Celular (Android/iPhone)

### Android (Chrome/Edge)
1. Abra o site no navegador Chrome ou Edge
2. Toque no menu (⋮) no canto superior direito
3. Selecione "Adicionar à tela inicial" ou "Instalar app"
4. Confirme a instalação
5. O ícone aparecerá na sua tela inicial

### iPhone/iPad (Safari)
1. Abra o site no Safari
2. Toque no botão de compartilhar (quadrado com seta para cima)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Dê um nome ao app e toque em "Adicionar"
5. O ícone aparecerá na sua tela inicial

## 💻 Como Instalar no PC

### Windows (Chrome/Edge)
1. Abra o site no navegador
2. Clique no ícone de instalação na barra de endereços (ou ⋮ > "Instalar [Nome do App]")
3. Confirme a instalação
4. O app será aberto em uma janela separada

### macOS (Chrome/Safari)
1. Abra o site no Chrome ou Safari
2. No Chrome: clique em ⋮ > "Instalar [Nome do App]"
3. No Safari: Arquivo > Adicionar à Dock
4. O app funcionará como um aplicativo nativo

## 🎨 Gerando os Ícones

1. Abra o arquivo `public/icon-generator.html` no navegador
2. Os ícones serão gerados automaticamente
3. Clique em "Download Todos" para baixar:
   - `icon-192x192.png`
   - `icon-512x512.png`
4. Salve os arquivos na pasta `public/`

## 🚀 Como Testar Localmente

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## ✨ Recursos do PWA

- ✅ Instalável no celular e PC
- ✅ Funciona offline após primeira visita
- ✅ Ícone personalizado na tela inicial
- ✅ Interface responsiva para mobile
- ✅ Armazena dados localmente
- ✅ Backup e restauração de dados

## 📦 Deploy

Para disponibilizar online, você pode usar:

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages
```bash
npm run build
# Configure o GitHub Pages para servir a pasta dist/
```

## 🔒 Privacidade

- Todos os dados são armazenados localmente no seu dispositivo
- Nenhuma informação é enviada para servidores externos
- Você tem controle total dos seus dados
- Use a função de backup para guardar suas informações

## 📝 Próximos Passos

Após gerar os ícones e fazer o deploy:
1. Teste a instalação no seu dispositivo
2. Verifique se funciona offline
3. Compartilhe com amigos e família!

## 🆘 Problemas Comuns

**O botão de instalar não aparece?**
- Certifique-se de estar usando HTTPS (ou localhost)
- Limpe o cache do navegador
- Verifique se os ícones estão na pasta public/

**App não funciona offline?**
- Visite o app pelo menos uma vez online
- O service worker precisa ser registrado primeiro

**Dados foram perdidos?**
- Use sempre a função de backup
- Os dados ficam no navegador (podem ser limpos)
