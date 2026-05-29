# Deploy no Render — Passo a Passo

## Configurações do Web Service

| Campo           | Valor                                      |
|-----------------|--------------------------------------------|
| **Build Command** | `npm run build`                          |
| **Start Command** | `npm start`                              |
| **Node Version**  | `18`                                     |

## Variáveis de Ambiente (Environment Variables)

Configure no painel do Render → Environment:

| Chave            | Valor                                      |
|------------------|--------------------------------------------|
| `MONGO_URI`      | sua string de conexão MongoDB Atlas        |
| `JWT_SECRET`     | string aleatória longa e segura            |
| `ADMIN_USERNAME` | `ADMIN`                                    |
| `ADMIN_PASSWORD` | senha do admin                             |
| `NODE_ENV`       | `production`                               |

## Como funciona o deploy

1. Render executa `npm run build`:
   - instala deps da raiz (Express, Mongoose, etc.)
   - instala deps do client (React, Vite, etc.)
   - executa `vite build` → gera `server/public/`

2. Render executa `npm start`:
   - `node server/server.js`
   - Serve os arquivos estáticos de `server/public/`
   - Expõe a API em `/api/*`

## Login padrão

- **Nome de Guerra:** `ADMIN`
- **Senha:** valor de `ADMIN_PASSWORD`
