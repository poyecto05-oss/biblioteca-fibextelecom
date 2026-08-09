const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const folders = await Folder.findAll();
    res.json(folders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/mis-carpetas', auth, async (req, res) => {
  try {
    const { pool } = require('../config/db');
    const { rows } = await pool.query(`
      SELECT f.* FROM folders f
      INNER JOIN folder_assignments fa ON f.id = fa.folder_id
      WHERE fa.user_id = $1 AND f.activo = true
      ORDER BY f.nombre
    `, [req.user.id]);
    const result = await Promise.all(rows.map(async f => {
      f.manuales = (await pool.query(
        'SELECT id, titulo, descripcion, categoria, archivo, nombre_original, activo, created_at FROM manuals WHERE folder_id = $1 AND activo = true ORDER BY created_at DESC',
        [f.id]
      )).rows;
      return f;
    }));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ msg: 'El nombre es obligatorio' });
    }
    const folder = await Folder.create({ nombre, descripcion });
    res.json(folder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { nombre, descripcion, usuarios } = req.body;
    const folder = await Folder.update(req.params.id, { nombre, descripcion });
    if (usuarios !== undefined) {
      await Folder.setUsuarios(folder.id, usuarios);
    }
    res.json(await Folder.findById(folder.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.post('/:id/usuarios', auth, adminAuth, async (req, res) => {
  try {
    const { usuarios } = req.body;
    await Folder.setUsuarios(req.params.id, usuarios || []);
    res.json(await Folder.findById(req.params.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Folder.delete(req.params.id);
    res.json({ msg: 'Carpeta eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
