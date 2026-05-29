# 🔐 CHDI - Sistema de Controle de Acesso por Página

> **Novo!** Estrutura reorganizada para deploy fácil na Render.com

## 📦 Estrutura Otimizada para Produção

```
chdi-system/
├── package.json          ← npm install tudo
├── .env                  ← Variáveis de ambiente (um único arquivo)
├── DEPLOY_RENDER.md      ← Guia de deploy
│
├── server/               ← Backend Node.js/Express
│   ├── models/           ← Modelos MongoDB
│   ├── routes/           ← Rotas da API
│   ├── middleware/       ← Autenticação
│   ├── package.json
│   ├── server.js         ← Inicia na PORT do .env
│   └── public/           ← Build do Vite (criado automaticamente)
│
└── client/               ← Frontend React/Vite
    ├── src/              ← Código source
    ├── package.json
    ├── vite.config.js    ← Build para ../server/public
    └── index.html
```

## 🚀 Desenvolvimento Local

### 1. Instalar Tudo
```bash
npm install
```

Instala:
- Dependências da raiz (`concurrently`)
- Dependências do server
- Dependências do client

### 2. Configurar .env
```bash
# Edite .env na raiz com:
MONGO_URI=sua-conexao-mongodb
JWT_SECRET=chave-super-secreta
NODE_ENV=development
PORT=5000
```

### 3. Rodar Desenvolvimento
```bash
npm run dev
```

Inicia server e client juntos:
- 🔙 Backend: http://localhost:5000
- 🔶 Frontend: http://localhost:5173

---

## 🏗️ Build para Produção

### Build Local (teste antes de deploy)
```bash
npm run build
```

Faz:
1. Build do Vite (React)
2. Gera pasta `server/public/`
3. Server vai servir estaticamente

### Testar em Produção Local
```bash
NODE_ENV=production npm start
```

Inicia como estaria em produção:
- Frontend: compilado + servido pelo backend
- Backend: porta do .env

---

## 🌐 Deploy na Render

### 1. Preparar GitHub
```bash
git add .
git commit -m "Pronto para produção"
git push
```

### 2. Na Render
```
New Web Service
↓
Build: npm run build
Start: npm start
Environment: Adicione variáveis do .env
↓
Deploy!
```

### 3. Acessar
```
https://seu-nome.onrender.com
```

**Veja:** `DEPLOY_RENDER.md` para instruções completas.

---

## 📋 Scripts Disponíveis

| Script | O que faz |
|--------|-----------|
| `npm install` | Instala tudo (raiz, server, client) |
| `npm run dev` | Roda server + client juntos (dev) |
| `npm run build` | Build do Vite (produção) |
| `npm start` | Inicia servidor (produção) |
| `npm run server` | Inicia só o backend |
| `npm run client` | Inicia só o frontend |
| `npm run preview` | Preview do build estático |
| `npm run install-all` | Instalação completa (alternativo) |

---

## 🔐 Novo Sistema de Permissões

### O que É
Controle granular de acesso a páginas por usuário.

### Como Usar
1. Login: **ADMIN** / **CHDI@2024**
2. Vá para: **Administração → Permissões**
3. Expanda um usuário
4. Clique em 🔒/🔓 para ativar/desativar páginas

### Páginas Controláveis
- 📊 Dashboard
- 👤 Militares
- 📁 Bancos de Dados

---

## 🔧 Variáveis de Ambiente (.env)

```
# MongoDB
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/chdi

# Autenticação
JWT_SECRET=chave-aleatoria-super-segura
ADMIN_USERNAME=ADMIN
ADMIN_PASSWORD=CHDI@2024

# Servidor
PORT=5000
NODE_ENV=production  # production ou development

# Frontend
VITE_API_URL=/api  # Em produção, usar /api
```

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `DEPLOY_RENDER.md` | Deploy em Render.com |
| `PERMISSIONS_GUIDE.md` | Guia completo de permissões |
| Server `README.md` | Documentação do backend |
| Client `README.md` | Documentação do frontend |

---

## ✨ Mudanças Implementadas

### ✅ Novo
- ✨ Sistema de permissões por página
- ✨ Painel admin para gerenciar permissões
- ✨ Package.json na raiz para scripts unificados
- ✨ .env centralizado
- ✨ Estrutura pronta para Render

### 🔄 Modificado
- 🔄 Vite build para `server/public/`
- 🔄 Server serve arquivos estáticos
- 🔄 Rotas API com verificação de permissões

---

## 🚀 Quick Start

```bash
# 1. Instalar
npm install

# 2. Configurar .env
# Editar variáveis em .env

# 3. Desenvolvimento
npm run dev
# Acessa http://localhost:5173

# 4. Produção (teste local)
npm run build
NODE_ENV=production npm start
# Acessa http://localhost:5000

# 5. Deploy (Render)
# Push para GitHub e crie serviço na Render
# Build: npm run build
# Start: npm start
```

---

## 🎯 Próximos Passos

1. **Desenvolvimento**
   - [ ] `npm install`
   - [ ] Editar `.env`
   - [ ] `npm run dev`
   - [ ] Testar permissões

2. **Produção Local**
   - [ ] `npm run build`
   - [ ] `NODE_ENV=production npm start`
   - [ ] Testar em http://localhost:5000

3. **Deploy**
   - [ ] Push para GitHub
   - [ ] Criar serviço em Render.com
   - [ ] Ver `DEPLOY_RENDER.md`

---

## 🆘 Troubleshooting

### Erro: "Module not found"
```
→ npm install não rodou
→ Rode: npm install
```

### Erro: "Cannot connect to MongoDB"
```
→ MONGO_URI incorreta
→ Verificar credenciais em MongoDB Atlas
```

### Erro: "Port already in use"
```
→ Mude PORT em .env
PORT=5001
```

### Frontend não carrega
```
→ Build não foi executado
→ Rode: npm run build
→ Verifique se pasta public/ existe em server/
```

---

## 📊 Arquitetura

```
┌─────────────────────────────────────┐
│        Frontend (React/Vite)        │
│         http://localhost:5173       │
└──────────────────┬──────────────────┘
                   │
                   │ /api/*
                   ▼
┌─────────────────────────────────────┐
│      Backend (Node.js/Express)      │
│         http://localhost:5000       │
│                                     │
│  - Rotas API                        │
│  - Autenticação JWT                 │
│  - Permissões                       │
│  - Serve Frontend em produção       │
└──────────────────┬──────────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │   MongoDB        │
         │   Cloud/Local    │
         └──────────────────┘
```

---

## 🔒 Segurança

✅ JWT para autenticação
✅ Middleware para verificação de permissões
✅ Frontend protegido por rotas privadas
✅ Variáveis sensíveis em .env (não committadas)
✅ CORS configurado
✅ Senha padrão pode ser alterada

---

## 📈 Performance

✅ Vite para build rápido
✅ Compressão automática
✅ Static files servidos pelo server
✅ MongoDB indexado
✅ JWT cachado no frontend

---

## 🎓 Recursos

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Render.com](https://render.com/)

---

## 📝 Licença

MIT

---

## 👥 Autor

CHDI - Sistema de Controle

---

**Sistema pronto para produção! 🚀**

Dúvidas? Veja `DEPLOY_RENDER.md` ou `PERMISSIONS_GUIDE.md`
