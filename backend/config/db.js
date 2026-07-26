const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'usuario',
        departamento VARCHAR(255) DEFAULT 'Sistemas',
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS manuals (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT DEFAULT '',
        categoria VARCHAR(100) NOT NULL,
        archivo VARCHAR(255) NOT NULL,
        nombre_original VARCHAR(255) NOT NULL,
        archivo_buffer BYTEA,
        subido_por INTEGER NOT NULL REFERENCES users(id),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS manual_assignments (
        id SERIAL PRIMARY KEY,
        manual_id INTEGER NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(manual_id, user_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        manual_id INTEGER NOT NULL REFERENCES manuals(id),
        accion VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Base de datos PostgreSQL inicializada');
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
