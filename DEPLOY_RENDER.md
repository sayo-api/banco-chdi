# 🚀 Deploy na Render.com

## Estrutura Preparada para Render

Este projeto foi reorganizado para deploy simplificado na Render.

```
chdi-system/
├── package.json          ← Raiz (instala ambos)
├── .env                  ← Variáveis de ambiente
├── server/
│   ├── package.json      ← Dependências do backend
│   ├── server.js         ← Inicia na porta do .env
│   └── public/           ← Build do Vite (criado no build)
│
├── client/
│   ├── package.json      ← Dependências do frontend
│   ├── vite.config.js    ← Build para ../server/public
│   └── src/              ← Código source
```

## 🎯 Como Fazer Deploy na Render

### Passo 1: Preparar Repositório Git

```bash
# Se ainda não tem git
git init
git add .
git commit -m "Preparar para deploy"
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### Passo 2: Criar Nova Web Service na Render

1. Acesse: https://dashboard.render.com
2. Clique em: **+ New** → **Web Service**
3. Selecione seu repositório
4. Configure assim:

```
Name:               chdi-system
Environment:        Node
Build Command:      npm run build
Start Command:      npm start
Instance Type:      Free (ou conforme necessidade)
```

### Passo 3: Variáveis de Ambiente

1. Na página do serviço, vá para **Environment**
2. Adicione as variáveis:

```
MONGO_URI=mongodb+srv://seu-usuario:senha@seu-cluster.mongodb.net/chdi?retryWrites=true&w=majority
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
ADMIN_USERNAME=ADMIN
ADMIN_PASSWORD=CHDI@2024
PORT=10000
NODE_ENV=production
VITE_API_URL=/api
```

**Importante:** A Render usa porta dinâmica, deixe `PORT` sem valor ou com `10000` que ela substitui.

### Passo 4: Deploy

1. Clique em **Deploy** na página do serviço
2. Aguarde os logs:
   - ✅ `npm run build` → Build do Vite
   - ✅ `npm start` → Inicia servidor
   - ✅ `🚀 Servidor rodando na porta`

3. Seu site estará em: `https://seu-nome.onrender.com`

---

## 🛠️ O que Acontece no Deploy

### Build
```bash
npm run build
  ↓
cd client && npm run build
  ↓
Vite compila React
  ↓
Arquivo gerado em: server/public/
```

### Start
```bash
npm start
  ↓
cd server && node server.js
  ↓
Servidor Express inicia
  ↓
Serve arquivos estáticos (React)
  ↓
Escuta em http://seu-url:porta
```

---

## 📋 Checklist de Deploy

- [ ] Repositório GitHub criado
- [ ] .env preenchido com dados reais
- [ ] MongoDB Atlas conta criada
- [ ] MONGO_URI verificado
- [ ] JWT_SECRET gerado (use site: https://www.uuidgenerator.net/)
- [ ] Serviço criado na Render
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Servidor iniciou sem erros
- [ ] Site acessível em onrender.com

---

## 🔑 Variáveis Essenciais

### MONGO_URI
```
mongodb+srv://usuario:senha@cluster.mongodb.net/chdi?retryWrites=true&w=majority

Obtenha em: https://www.mongodb.com/cloud/atlas
```

### JWT_SECRET
```
Gere em: https://www.uuidgenerator.net/
Copie uma UUID v4

Ex: 550e8400-e29b-41d4-a716-446655440000
```

### NODE_ENV
```
production  ← Em produção
development ← Em desenvolvimento
```

---

## 🆘 Troubleshooting

### Erro: "Module not found"
```
→ npm install não foi executado
→ Verifique se package.json existe na raiz
```

### Erro: "Cannot connect to MongoDB"
```
→ MONGO_URI incorrea
→ IP whitelist não configurado em MongoDB Atlas
→ Adicione 0.0.0.0/0 em Database Access
```

### Erro: "Port is in use"
```
→ Render usa portas dinâmicas
→ Deixe PORT como padrão ou remova
```

### Erro: "Client not found"
```
→ Build do Vite não foi executado
→ Verifique se vite.config.js está correto
→ Pasta public/ deve existir após build
```

### Build muito lento
```
→ Pode ser a primeira vez
→ Renderware faz cache
→ Próximos builds são mais rápidos
```

---

## 📊 Fluxo de Build e Deploy

```
Push para GitHub
        ↓
Render detecta mudança
        ↓
npm run build
  → cd client && npm run build
  → Vite compila React
  → Arquivo em server/public/
        ↓
npm start
  → cd server && node server.js
  → Server inicia
  → Serve static files
  → API endpoints ativos
        ↓
✅ Site online em onrender.com
```

---

## 💾 Atualizar Código em Produção

```bash
# Fazer mudança local
git add .
git commit -m "Minha mudança"
git push

# Render detecta automaticamente
# Faz build e deploy
# Seu site é atualizado
```

---

## 🔒 Segurança em Produção

### Antes de Fazer Deploy

- [ ] `JWT_SECRET` é uma string aleatória longa?
- [ ] `ADMIN_PASSWORD` foi alterada?
- [ ] `MONGO_URI` usa senha forte?
- [ ] `.env` **NÃO** está commitado no git?
- [ ] `.gitignore` contém `.env`?

### Verificar Segurança

```bash
# Certificar que .env não foi commitado
git log --all --full-history -- ".env"

# Se tiver sido, remover:
git filter-branch --tree-filter 'rm -f .env' -- --all
```

---

## 📈 Monitorar em Produção

### Logs da Render
```
Dashboard → Seu serviço → Logs
Veja erros em tempo real
```

### Performance
```
Dashboard → Seu serviço → Metrics
CPU, memória, requisições
```

---

## 💰 Planos da Render

| Plano | Preço | Uso |
|-------|-------|-----|
| **Free** | R$ 0 | Desenvolvimento, baixo tráfego |
| **Starter** | ~R$ 7/mês | Produção, tráfego médio |
| **Pro** | Variável | Produção, alto tráfego |

---

## 🚀 Exemplo Completo

### 1. Preparação Local
```bash
cd chdi-system
npm install
npm run build   # Testa build local
npm start       # Testa em produção local
```

### 2. Repositório GitHub
```bash
git init
git add .
git commit -m "Projeto pronto para produção"
git push
```

### 3. Render Dashboard
```
1. New Web Service
2. Select Repository
3. Configure:
   - Build: npm run build
   - Start: npm start
4. Add Environment
5. Deploy
```

### 4. Acessar
```
https://seu-nome.onrender.com
Login: ADMIN / CHDI@2024
```

---

## ✅ Status de Deploy

### Build Bem-Sucedido
```
✅ "Deployed successfully"
✅ "Build completed"
✅ "Server running on port..."
```

### Erro no Build
```
❌ Check logs
❌ Verify variables
❌ Retry build
```

---

## 📞 Suporte Render

- Docs: https://render.com/docs
- Status: https://status.render.com
- Discord: https://discord.gg/6Kee5g2

---

**Seu projeto está pronto para deploy! 🎉**

Próximo passo: Push para GitHub e crie serviço na Render →
