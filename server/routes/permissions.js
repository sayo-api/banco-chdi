const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const Permission = require('../models/Permission');
const User = require('../models/User');

// Get permissions of a user
router.get('/user/:userId', auth, adminOnly, async (req, res) => {
  try {
    let permission = await Permission.findOne({ userId: req.params.userId });
    
    // Se não existir permissão, criar com valores padrão
    if (!permission) {
      permission = await Permission.create({
        userId: req.params.userId,
        pages: {
          dashboard: false,
          soldiers: false,
          databases: false,
        }
      });
    }
    
    res.json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar permissões' });
  }
});

// Get all users with their permissions
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    
    const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
        let permission = await Permission.findOne({ userId: user._id });
        if (!permission) {
          permission = await Permission.create({
            userId: user._id,
            pages: { dashboard: false, soldiers: false, databases: false }
          });
        }
        return {
          ...user.toObject(),
          permissions: permission.pages
        };
      })
    );
    
    res.json(usersWithPermissions);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar permissões' });
  }
});

// Update user permissions
router.patch('/user/:userId', auth, adminOnly, async (req, res) => {
  try {
    const { pages } = req.body;
    
    let permission = await Permission.findOne({ userId: req.params.userId });
    
    if (!permission) {
      permission = await Permission.create({
        userId: req.params.userId,
        pages: pages || { dashboard: false, soldiers: false, databases: false }
      });
    } else {
      permission.pages = pages;
      await permission.save();
    }
    
    res.json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar permissões' });
  }
});

// Update specific page permission
router.patch('/user/:userId/page/:page', auth, adminOnly, async (req, res) => {
  try {
    const { userId, page } = req.params;
    const { allowed } = req.body;
    
    const validPages = ['dashboard', 'soldiers', 'databases'];
    if (!validPages.includes(page)) {
      return res.status(400).json({ message: 'Página inválida' });
    }
    
    let permission = await Permission.findOne({ userId });
    
    if (!permission) {
      permission = await Permission.create({
        userId,
        pages: { dashboard: false, soldiers: false, databases: false }
      });
    }
    
    permission.pages[page] = allowed;
    await permission.save();
    
    res.json(permission);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar permissão da página' });
  }
});

module.exports = router;
