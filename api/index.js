const express = require('express');
const cors = require('cors');
const { initDB } = require('../backend/config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/manuals', require('../backend/routes/manuals'));
app.use('/api/activity', require('../backend/routes/activity'));

app.get('/api/health', (req, res) => {
  res.json({ msg: 'Biblioteca Fibextelecom - Sistema activo' });
});

let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    try {
      await initDB();
      dbReady = true;
    } catch (err) {
      console.error('DB init error:', err);
    }
  }
  return app(req, res);
};
