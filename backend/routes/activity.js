const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/log', auth, async (req, res) => {
  try {
    const { manual_id, accion } = req.body;
    await pool.query(
      'INSERT INTO activity_logs (user_id, manual_id, accion) VALUES ($1, $2, $3)',
      [req.user.id, manual_id, accion]
    );
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al registrar actividad' });
  }
});

router.get('/logs', auth, adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT al.*, u.nombre as user_nombre, u.email as user_email, u.departamento,
             m.titulo as manual_titulo, m.categoria as manual_categoria
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      JOIN manuals m ON al.manual_id = m.id
      ORDER BY al.created_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener logs' });
  }
});

router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const { rows: porUsuario } = await pool.query(`
      SELECT u.id, u.nombre, u.email, u.departamento,
             COUNT(al.id) as total_acciones,
             COUNT(CASE WHEN al.accion = 'preview' THEN 1 END) as previews,
             COUNT(CASE WHEN al.accion = 'download' THEN 1 END) as descargas,
             MAX(al.created_at) as ultimo_acceso
      FROM users u
      LEFT JOIN activity_logs al ON u.id = al.user_id
      WHERE u.rol = 'usuario'
      GROUP BY u.id, u.nombre, u.email, u.departamento
      ORDER BY total_acciones DESC
    `);

    const { rows: porManual } = await pool.query(`
      SELECT m.id, m.titulo, m.categoria,
             COUNT(al.id) as total_acciones,
             COUNT(DISTINCT al.user_id) as usuarios_unicos,
             COUNT(CASE WHEN al.accion = 'preview' THEN 1 END) as previews,
             COUNT(CASE WHEN al.accion = 'download' THEN 1 END) as descargas
      FROM manuals m
      LEFT JOIN activity_logs al ON m.id = al.manual_id
      WHERE m.activo = true
      GROUP BY m.id, m.titulo, m.categoria
      ORDER BY total_acciones DESC
    `);

    res.json({ porUsuario, porManual });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al obtener estadisticas' });
  }
});

module.exports = router;
