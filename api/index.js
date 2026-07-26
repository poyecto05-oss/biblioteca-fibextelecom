require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const { initDB } = require('../backend/config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/manuals', require('../backend/routes/manuals'));

app.get('/api/health', (req, res) => {
  res.json({ msg: 'Biblioteca Fibextelecom - Sistema activo' });
});

let connected = false;

module.exports = async (req, res) => {
  if (!connected) {
    await initDB();
    connected = true;
  }
  return app(req, res);
};
