const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales incorrectas' });
    }

    if (!user.activo) {
      return res.status(400).json({ msg: 'Usuario desactivado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        departamento: user.departamento
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

router.get('/users', auth, adminAuth, (req, res) => {
  try {
    const users = User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.post('/users', auth, adminAuth, async (req, res) => {
  try {
    const { nombre, email, password, rol, departamento } = req.body;

    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ msg: 'El email ya esta registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = User.create({
      nombre,
      email,
      password: hashedPassword,
      rol: rol || 'usuario',
      departamento: departamento || 'Sistemas'
    });

    res.json({ user: User.toJSON(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { nombre, email, rol, departamento, activo, password } = req.body;
    const updateData = { nombre, email, rol, departamento, activo };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = User.update(req.params.id, updateData);
    res.json(User.toJSON(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.delete('/users/:id', auth, adminAuth, (req, res) => {
  try {
    User.delete(req.params.id);
    res.json({ msg: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
