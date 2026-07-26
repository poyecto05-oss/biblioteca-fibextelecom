require('dotenv').config();
const { initDB, pool } = require('./config/db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    await initDB();
    console.log('Conectado a PostgreSQL');

    const existing = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@fibextelecom.com']);
    if (existing.rows.length > 0) {
      console.log('El admin ya existe');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await pool.query(
      'INSERT INTO users (nombre, email, password, rol, departamento) VALUES ($1, $2, $3, $4, $5)',
      ['Administrador Sistemas', 'admin@fibextelecom.com', hashedPassword, 'admin', 'Sistemas']
    );

    console.log('Admin creado exitosamente:');
    console.log('  Email: admin@fibextelecom.com');
    console.log('  Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();
