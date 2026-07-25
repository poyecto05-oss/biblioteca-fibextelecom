const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ msg: 'No hay token, autorizacion denegada' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ msg: 'Token no valido' });
    }

    req.user = User.toJSON(user);
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token no valido' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
  }
  next();
};

module.exports = { auth, adminAuth };
