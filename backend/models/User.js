const { pool } = require('../config/db');

const User = {
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async findAll() {
    const { rows } = await pool.query('SELECT id, nombre, email, rol, departamento, activo, created_at FROM users ORDER BY nombre');
    return rows;
  },

  async create({ nombre, email, password, rol, departamento }) {
    const { rows } = await pool.query(
      'INSERT INTO users (nombre, email, password, rol, departamento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, email, password, rol || 'usuario', departamento || 'Sistemas']
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.nombre !== undefined) { fields.push(`nombre = $${i++}`); values.push(data.nombre); }
    if (data.email !== undefined) { fields.push(`email = $${i++}`); values.push(data.email); }
    if (data.password !== undefined) { fields.push(`password = $${i++}`); values.push(data.password); }
    if (data.rol !== undefined) { fields.push(`rol = $${i++}`); values.push(data.rol); }
    if (data.departamento !== undefined) { fields.push(`departamento = $${i++}`); values.push(data.departamento); }
    if (data.activo !== undefined) { fields.push(`activo = $${i++}`); values.push(data.activo); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`, values);
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
};

module.exports = User;
