const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Permission = require('../models/Permission');

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });
    if (user.status !== 'approved') return res.status(403).json({ message: 'Acesso não autorizado' });
    
    // Carregar permissões do usuário
    const permission = await Permission.findOne({ userId: user._id });
    req.user = user;
    req.permissions = permission?.pages || {};
    
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Apenas administradores' });
  next();
};

// Middleware para verificar acesso a páginas específicas
const checkPagePermission = (page) => {
  return (req, res, next) => {
    // Admins têm acesso a tudo
    if (req.user?.role === 'admin') return next();
    
    // Verificar se o usuário tem permissão para a página
    if (!req.permissions?.[page]) {
      return res.status(403).json({ message: 'Você não tem acesso a esta página' });
    }
    next();
  };
};

module.exports = { auth, adminOnly, checkPagePermission };
