const express = require('express');
const router = express.Router();
const multer = require('multer');
const Manual = require('../models/Manual');
const { auth, adminAuth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/', auth, async (req, res) => {
  try {
    let manuals;
    if (req.user.rol === 'admin') {
      manuals = await Manual.findAll();
    } else {
      manuals = await Manual.findByUser(req.user.id);
    }
    const safe = manuals.map(m => {
      const { archivo_buffer, ...rest } = m;
      return rest;
    });
    res.json(safe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/all', auth, adminAuth, async (req, res) => {
  try {
    const manuals = await Manual.findAllIncludingInactive();
    const safe = manuals.map(m => {
      const { archivo_buffer, ...rest } = m;
      return rest;
    });
    res.json(safe);
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.post('/', auth, adminAuth, upload.single('archivo'), async (req, res) => {
  try {
    const { titulo, descripcion, categoria, asignados, folder_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: 'El archivo PDF es obligatorio' });
    }

    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf';

    const manual = await Manual.create({
      titulo,
      descripcion: descripcion || '',
      categoria,
      archivo: filename,
      nombreOriginal: req.file.originalname,
      archivoBuffer: req.file.buffer,
      subidoPor: req.user.id,
      asignados: asignados ? JSON.parse(asignados) : [],
      folderId: folder_id || null
    });

    const { archivo_buffer, ...rest } = manual;
    res.json(rest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { titulo, descripcion, categoria, asignados, folder_id } = req.body;
    const updateData = { titulo, descripcion, categoria, folderId: folder_id };

    if (asignados !== undefined) {
      updateData.asignados = JSON.parse(asignados);
    }

    const manual = await Manual.update(req.params.id, updateData);
    const { archivo_buffer, ...rest } = manual;
    res.json(rest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Manual.delete(req.params.id);
    res.json({ msg: 'Manual eliminado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/download/:filename', auth, async (req, res) => {
  try {
    const { pool } = require('../config/db');
    const { rows } = await pool.query('SELECT * FROM manuals WHERE archivo = $1', [req.params.filename]);
    const manual = rows[0];

    if (!manual) {
      return res.status(404).json({ msg: 'Manual no encontrado' });
    }

    if (req.user.rol !== 'admin') {
      const assignments = await pool.query('SELECT * FROM manual_assignments WHERE manual_id = $1 AND user_id = $2', [manual.id, req.user.id]);
      const folderAccess = manual.folder_id
        ? (await pool.query('SELECT * FROM folder_assignments WHERE folder_id = $1 AND user_id = $2', [manual.folder_id, req.user.id])).rows.length > 0
        : false;
      if (assignments.rows.length === 0 && !folderAccess) {
        return res.status(403).json({ msg: 'No tienes acceso a este manual' });
      }
    }

    if (!manual.archivo_buffer) {
      return res.status(404).json({ msg: 'Archivo no encontrado' });
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, manual_id, accion) VALUES ($1, $2, $3)',
      [req.user.id, manual.id, 'download']
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="' + manual.nombre_original + '"'
    });
    res.send(manual.archivo_buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/preview/:filename', auth, async (req, res) => {
  try {
    const { pool } = require('../config/db');
    const { rows } = await pool.query('SELECT * FROM manuals WHERE archivo = $1', [req.params.filename]);
    const manual = rows[0];

    if (!manual) {
      return res.status(404).json({ msg: 'Manual no encontrado' });
    }

    if (req.user.rol !== 'admin') {
      const assignments = await pool.query('SELECT * FROM manual_assignments WHERE manual_id = $1 AND user_id = $2', [manual.id, req.user.id]);
      const folderAccess = manual.folder_id
        ? (await pool.query('SELECT * FROM folder_assignments WHERE folder_id = $1 AND user_id = $2', [manual.folder_id, req.user.id])).rows.length > 0
        : false;
      if (assignments.rows.length === 0 && !folderAccess) {
        return res.status(403).json({ msg: 'No tienes acceso a este manual' });
      }
    }

    if (!manual.archivo_buffer) {
      return res.status(404).json({ msg: 'Archivo no encontrado' });
    }

    await pool.query(
      'INSERT INTO activity_logs (user_id, manual_id, accion) VALUES ($1, $2, $3)',
      [req.user.id, manual.id, 'preview']
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + manual.nombre_original + '"'
    });
    res.send(manual.archivo_buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
