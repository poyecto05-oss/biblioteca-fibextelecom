const { getDb, saveDB } = require('../config/db');

function rowsToArray(results) {
  if (!results || results.length === 0) return [];
  const result = results[0];
  if (!result || !result.values || result.values.length === 0) return [];
  const columns = result.columns;
  return result.values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function rowToObj(results) {
  const rows = rowsToArray(results);
  return rows.length > 0 ? rows[0] : null;
}

const User = {
  findById(id) {
    const db = getDb();
    return rowToObj(db.exec('SELECT * FROM users WHERE id = ?', [id]));
  },

  findByEmail(email) {
    const db = getDb();
    return rowToObj(db.exec('SELECT * FROM users WHERE email = ?', [email]));
  },

  findAll() {
    const db = getDb();
    return rowsToArray(db.exec('SELECT id, nombre, email, rol, departamento, activo, created_at FROM users ORDER BY nombre'));
  },

  create({ nombre, email, password, rol, departamento }) {
    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO users (nombre, email, password, rol, departamento) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run([nombre, email, password, rol || 'usuario', departamento || 'Sistemas']);
    const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    stmt.free();
    saveDB();
    return this.findById(lastId);
  },

  update(id, data) {
    const db = getDb();
    const fields = [];
    const values = [];

    if (data.nombre !== undefined) { fields.push('nombre = ?'); values.push(data.nombre); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.password !== undefined) { fields.push('password = ?'); values.push(data.password); }
    if (data.rol !== undefined) { fields.push('rol = ?'); values.push(data.rol); }
    if (data.departamento !== undefined) { fields.push('departamento = ?'); values.push(data.departamento); }
    if (data.activo !== undefined) { fields.push('activo = ?'); values.push(data.activo ? 1 : 0); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(values);
    stmt.free();
    saveDB();
    return this.findById(id);
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM users WHERE id = ?', [id]);
    saveDB();
  },

  toJSON(user) {
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }
};

module.exports = User;
