require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/manuals', require('./routes/manuals'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/folders', require('./routes/folders'));

app.get('/api/health', (req, res) => {
  res.json({ msg: 'Biblioteca Fibextelecom - Sistema activo' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const start = async () => {
  await initDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Fibextelecom corriendo en puerto ${PORT}`);
  });
};

start();
