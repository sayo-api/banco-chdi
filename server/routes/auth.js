const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { nomeDeGuerra, password } = req.body;
    if (!nomeDeGuerra || !password)
      return res.status(400).json({ message: 'Preencha todos os campos' });

    const exists = await User.findOne({ nomeDeGuerra: nomeDeGuerra.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Nome de Guerra já cadastrado' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ nomeDeGuerra: nomeDeGuerra.toUpperCase(), password: hashed });
    res.status(201).json({ message: 'Registro enviado. Aguarde aprovação do administrador.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { nomeDeGuerra, password } = req.body;
    const user = await User.findOne({ nomeDeGuerra: nomeDeGuerra?.toUpperCase() });
    if (!user) return res.status(400).json({ message: 'Nome de Guerra não encontrado' });

    if (user.status === 'pending')
      return res.status(403).json({ message: 'Registro pendente de aprovação' });
    if (user.status === 'rejected')
      return res.status(403).json({ message: 'Registro recusado pelo administrador' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Senha incorreta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({
      token,
      user: { id: user._id, nomeDeGuerra: user.nomeDeGuerra, role: user.role },
    });
  } catch {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Get me
router.get('/me', auth, (req, res) => res.json(req.user));

// --- Admin Routes ---

// List pending users
router.get('/pending', auth, adminOnly, async (req, res) => {
  const users = await User.find({ status: 'pending' }).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// List all users
router.get('/users', auth, adminOnly, async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// Approve user
router.patch('/approve/:id', auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true }).select('-password');
  res.json(user);
});

// Reject user
router.patch('/reject/:id', auth, adminOnly, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true }).select('-password');
  res.json(user);
});

// Delete user
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Usuário removido' });
});

module.exports = router;
