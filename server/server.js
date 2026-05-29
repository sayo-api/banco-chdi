require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/soldiers',    require('./routes/soldiers'));
app.use('/api/fields',      require('./routes/fields'));
app.use('/api/databases',   require('./routes/databases'));
app.use('/api/permissions', require('./routes/permissions'));

// Servir frontend em produção
// __dirname = <raiz>/server — vite builda para <raiz>/server/public
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, 'public');
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado');
    await createDefaultAdmin();
  })
  .catch(err => console.error('❌ Erro MongoDB:', err));

async function createDefaultAdmin() {
  const User = require('./models/User');
  const Permission = require('./models/Permission');
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'CHDI@2024', 10);
    const admin = await User.create({
      nomeDeGuerra: process.env.ADMIN_USERNAME || 'ADMIN',
      password: hashed,
      role: 'admin',
      status: 'approved',
    });
    await Permission.create({
      userId: admin._id,
      pages: { dashboard: true, soldiers: true, databases: true }
    });
    console.log(`✅ Admin padrão criado — Nome de Guerra: ${process.env.ADMIN_USERNAME || 'ADMIN'}`);
  }
}

const PORT = process.env.PORT || 5000;
// 0.0.0.0 obrigatório no Render para aceitar conexões externas
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
