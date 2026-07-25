const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Manual = require('../models/Manual');
const { auth, adminAuth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/', auth, (req, res) => {
  try {
    let manuals;
    if (req.user.rol === 'admin') {
      manuals = Manual.findAll();
    } else {
      manuals = Manual.findByUser(req.user.id);
    }
    res.json(manuals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/all', auth, adminAuth, (req, res) => {
  try {
    const manuals = Manual.findAllIncludingInactive();
    res.json(manuals);
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.post('/', auth, adminAuth, upload.single('archivo'), (req, res) => {
  try {
    const { titulo, descripcion, categoria, asignados } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: 'El archivo PDF es obligatorio' });
    }

    let parsedAsignados = [];
    if (asignados) {
      parsedAsignados = JSON.parse(asignados);
    }

    const manual = Manual.create({
      titulo,
      descripcion,
      categoria,
      archivo: req.file.filename,
      nombreOriginal: req.file.originalname,
      subidoPor: req.user.id,
      asignados: parsedAsignados
    });

    res.json(manual);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.put('/:id', auth, adminAuth, (req, res) => {
  try {
    const { titulo, descripcion, categoria, asignados } = req.body;
    const updateData = { titulo, descripcion, categoria };

    if (asignados !== undefined) {
      updateData.asignados = JSON.parse(asignados);
    }

    const manual = Manual.update(req.params.id, updateData);
    res.json(manual);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.delete('/:id', auth, adminAuth, (req, res) => {
  try {
    Manual.delete(req.params.id);
    res.json({ msg: 'Manual eliminado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

router.get('/download/:filename', auth, (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);

    if (req.user.rol !== 'admin') {
      const manual = Manual.findByUser(req.user.id).find(m => m.archivo === req.params.filename);
      if (!manual) {
        return res.status(403).json({ msg: 'No tienes acceso a este manual' });
      }
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;
