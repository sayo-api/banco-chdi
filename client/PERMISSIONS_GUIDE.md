# Sistema de Controle de Acesso por Página

## 📋 Visão Geral

Este documento descreve o novo sistema de controle de acesso que permite restringir o acesso de usuários a páginas específicas do sistema CHDI.

## 🎯 Funcionalidades Principais

### 1. **Controle de Acesso Granular**
- Cada usuário pode ser configurado para acessar apenas as páginas permitidas
- Três páginas principais podem ser controladas:
  - **Dashboard** - Página inicial do sistema
  - **Militares** (Soldiers) - Gestão e consulta de dados de militares
  - **Bancos de Dados** (Databases) - Acesso aos bancos de dados customizados

### 2. **Painel de Administração Novo**
Uma nova aba "Permissões" foi adicionada ao painel de administração, permitindo:
- Visualizar todos os usuários do sistema
- Expandir cada usuário para ver suas permissões atuais
- Ativar/desativar acesso a cada página com um clique
- Visualizar quantas páginas cada usuário tem acesso

### 3. **Admins têm Acesso Total**
- Usuários com role "admin" automaticamente têm acesso a todas as páginas
- As restrições só se aplicam a usuários comuns

## 🔧 Como Configurar Permissões

### Passo 1: Acessar o Painel de Administração
1. Faça login com uma conta de administrador
2. Clique em "Administração" na barra lateral esquerda
3. Clique na aba "Permissões"

### Passo 2: Expandir um Usuário
1. Você verá uma lista de todos os usuários do sistema
2. Clique no card de um usuário para expandir e ver suas permissões
3. O card mostrará quantas páginas o usuário tem acesso (ex: "2 / 3 páginas autorizadas")

### Passo 3: Configurar Permissões
1. Para cada página, há um botão de lock/unlock
2. **Botão com cadeado (🔒)** = Acesso ativado (verde/ouro)
3. **Botão com cadeado aberto (🔓)** = Acesso desativado (cinzento)
4. Clique no botão para alternar entre ativado e desativado
5. A mudança é salva automaticamente

### Exemplo Prático

**Cenário:** Você quer que o usuário "SILVA" tenha acesso apenas ao Dashboard e à gestão de Militares, mas não ao banco de dados.

1. Acesse Administração → Permissões
2. Localize o usuário "SILVA"
3. Clique para expandir
4. Configure assim:
   - Dashboard: 🔒 (Ativado)
   - Militares: 🔒 (Ativado)
   - Bancos de Dados: 🔓 (Desativado)

Quando SILVA fazer login:
- Verá "Dashboard" e "Militares" na barra lateral
- Não verá "Inventários" (Bancos de Dados)
- Se tentar acessar manualmente a URL `/databases`, receberá mensagem de acesso restrito

## 🛡️ Comportamento de Segurança

### No Backend
- Cada rota protegida verifica as permissões do usuário
- Um usuário sem permissão recebe erro 403 (Forbidden)
- Admins contornam todas as verificações

### No Frontend
- Links para páginas restritas são automaticamente escondidos da navegação
- Se um usuário tentar acessar uma página sem permissão via URL, verá:
  ```
  🔒 Acesso Restrito
  Você não tem permissão para acessar esta página.
  Contacte o administrador para solicitar acesso.
  ```

## 🗄️ Dados e Persistência

### Tabela de Permissões (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Referência para o usuário
  pages: {
    dashboard: boolean,      // true = acesso permitido
    soldiers: boolean,
    databases: boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Armazenamento Local (Browser)
Quando um usuário faz login:
- As permissões são carregadas do servidor
- Armazenadas em localStorage como `chdi_permissions`
- Usadas para renderização condicional da interface

## 📡 Endpoints da API

### Obter permissões de um usuário
```
GET /api/permissions/user/:userId
Authorization: Bearer {token}
```
Resposta:
```json
{
  "_id": "...",
  "userId": "...",
  "pages": {
    "dashboard": true,
    "soldiers": true,
    "databases": false
  }
}
```

### Obter todos os usuários com suas permissões
```
GET /api/permissions
Authorization: Bearer {token}
```

### Atualizar permissão de uma página
```
PATCH /api/permissions/user/:userId/page/:page
Authorization: Bearer {token}
Content-Type: application/json

{
  "allowed": true
}
```

Páginas válidas: `dashboard`, `soldiers`, `databases`

## 🚀 Implementação Técnica

### Arquivos Adicionados/Modificados

1. **Backend:**
   - `server/models/Permission.js` - Modelo de permissões
   - `server/middleware/auth.js` - Middleware de verificação
   - `server/routes/permissions.js` - Rotas da API

2. **Frontend:**
   - `client/src/components/ProtectedRoute.jsx` - Componente de rota protegida
   - `client/src/components/PermissionsManager.jsx` - UI para gerenciar permissões
   - `client/src/context/AuthContext.jsx` - Contexto com suporte a permissões
   - `client/src/App.jsx` - Rotas com proteção de página

3. **Modificados:**
   - `server/server.js` - Adicionada rota de permissões
   - `client/src/components/Layout.jsx` - Filtra navegação por permissões

## 🔄 Fluxo de Verificação de Acesso

```
1. Usuário acessa a aplicação
   ↓
2. AuthContext carrega permissões via GET /api/permissions/user/:userId
   ↓
3. ProtectedRoute verifica se usuário tem pagePermission
   ↓
4. Se não tem permissão:
   → Mostra tela de "Acesso Restrito"
   → Se é admin, libera acesso
   ↓
5. Se tem permissão:
   → Renderiza o componente da página
```

## 💡 Dicas e Boas Práticas

1. **Novos Usuários:** Quando um novo usuário é aprovado, as permissões são criadas automaticamente (todas desativadas)
2. **Auditoria:** Verifique o campo `updatedAt` para saber quando as permissões foram alteradas pela última vez
3. **Segurança:** Sempre que alterar permissões no admin, o usuário precisa fazer login novamente para que as alterações apareçam no cliente (ou atualizar a página)

## ⚠️ Notas Importantes

- **Admins não são afetados:** Não há configuração de permissão para usuários admin
- **Logout automático:** Se as permissões forem alteradas enquanto o usuário está logado, ele verá as mudanças ao fazer login novamente
- **Páginas futuras:** Para adicionar novas páginas ao controle de acesso, atualize:
  1. O schema da Permission em `models/Permission.js`
  2. A constante `PAGES` em `PermissionsManager.jsx`
  3. O mapeamento em `components/Layout.jsx`
  4. As rotas em `App.jsx` com `pagePermission`

## 🆘 Troubleshooting

**Problema:** Usuário vê "Acesso Restrito" mesmo depois de ativar permissão

**Solução:** 
- O usuário precisa fazer logout e login novamente
- As permissões são carregadas apenas no login

---

**Problema:** Admin não vê a aba de Permissões no painel

**Solução:**
- Certifique-se de que está usando a versão atualizada do AdminPanel.jsx
- Limpe o cache do navegador (Ctrl+Shift+Delete)

---

**Problema:** Algumas permissões não estão sendo salvas

**Solução:**
- Verifique se o backend está rodando e conectado ao MongoDB
- Verifique os logs do servidor para erros de conexão
- Tente atualizar a página e tentar novamente
