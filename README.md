# 🐉 CHDI — Sistema de Gestão do Quartel
**Centro Hípico Dragões da Independência**

## Stack
- **Frontend:** React + Vite, React Router, Axios, React Hot Toast
- **Backend:** Node.js, Express, Mongoose
- **Banco de Dados:** MongoDB

---

## ⚙️ Instalação e Execução

### 1. Pré-requisitos
- Node.js 18+
- MongoDB rodando localmente (porta 27017) ou URI remota

### 2. Configurar o Backend

```bash
cd server
npm install
cp .env.example .env
# Edite .env com sua MONGO_URI e JWT_SECRET
npm run dev
```

### 3. Configurar o Frontend

```bash
cd client
npm install
npm run dev
```

### 4. Acessar o sistema
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🔐 Login Padrão do Administrador
| Campo         | Valor       |
|---------------|-------------|
| Nome de Guerra| `ADMIN`     |
| Senha         | `CHDI@2024` |

> ⚠️ Troque a senha do admin após o primeiro login nas variáveis `.env`

---

## 🛡️ Funcionalidades

### Sistema de Acesso
- Login/Registro por **Nome de Guerra + Senha**
- Novos usuários ficam **pendentes** até aprovação do admin
- Admin aprova, recusa ou remove usuários

### Banco de Dados (Militares)
- Campos padrão: Graduação, Nome Completo, Nome de Guerra, Nº Registro, Subunidade, Endereço, Telefone, Data de Incorporação
- Busca em tempo real
- Filtro por graduação
- Edição e exclusão de registros

### Campos Personalizados
- Admin pode criar campos ilimitados
- Tipos: Texto, Número, Data, Seleção com opções
- Aparecem automaticamente no formulário de cadastro

---

## 🎨 Design
Dark mode com paleta extraída da medalha oficial CHDI:
- **Carmesim profundo** `#8B0D20`
- **Ouro metálico** `#C9A84C`  
- **Fundo abissal** `#0E060F`
- Tipografia: Cinzel Decorative + EB Garamond
