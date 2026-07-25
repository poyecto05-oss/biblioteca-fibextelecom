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

const Manual = {
  findById(id) {
    const db = getDb();
    const manual = rowToObj(db.exec('SELECT * FROM manuals WHERE id = ?', [id]));
    if (!manual) return null;
    manual.asignados = this.getAsignados(id);
    manual.subidoPorUser = rowToObj(db.exec('SELECT id, nombre, email FROM users WHERE id = ?', [manual.subido_por]));
    return manual;
  },

  findAll() {
    const db = getDb();
    const manuals = rowsToArray(db.exec('SELECT * FROM manuals WHERE activo = 1 ORDER BY created_at DESC'));
    return manuals.map(m => {
      m.asignados = this.getAsignados(m.id);
      m.subidoPorUser = rowToObj(db.exec('SELECT id, nombre, email FROM users WHERE id = ?', [m.subido_por]));
      return m;
    });
  },

  findAllIncludingInactive() {
    const db = getDb();
    const manuals = rowsToArray(db.exec('SELECT * FROM manuals ORDER BY created_at DESC'));
    return manuals.map(m => {
      m.asignados = this.getAsignados(m.id);
      m.subidoPorUser = rowToObj(db.exec('SELECT id, nombre, email FROM users WHERE id = ?', [m.subido_por]));
      return m;
    });
  },

  findByUser(userId) {
    const db = getDb();
    const manuals = rowsToArray(db.exec(`
      SELECT m.* FROM manuals m
      INNER JOIN manual_assignments ma ON m.id = ma.manual_id
      WHERE ma.user_id = ? AND m.activo = 1
      ORDER BY m.created_at DESC
    `, [userId]));
    return manuals.map(m => {
      m.asignados = this.getAsignados(m.id);
      m.subidoPorUser = rowToObj(db.exec('SELECT id, nombre, email FROM users WHERE id = ?', [m.subido_por]));
      return m;
    });
  },

  getAsignados(manualId) {
    const db = getDb();
    return rowsToArray(db.exec(`
      SELECT u.id, u.nombre, u.email
      FROM users u
      INNER JOIN manual_assignments ma ON u.id = ma.user_id
      WHERE ma.manual_id = ?
    `, [manualId]));
  },

  create({ titulo, descripcion, categoria, archivo, nombreOriginal, subidoPor, asignados }) {
    const db = getDb();
    const stmt = db.prepare(
      'INSERT INTO manuals (titulo, descripcion, categoria, archivo, nombre_original, subido_por) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run([titulo, descripcion || '', categoria, archivo, nombreOriginal, subidoPor]);
    const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    stmt.free();

    if (asignados && asignados.length > 0) {
      this.setAsignados(lastId, asignados);
    }

    saveDB();
    return this.findById(lastId);
  },

  update(id, data) {
    const db = getDb();
    const fields = [];
    const values = [];

    if (data.titulo !== undefined) { fields.push('titulo = ?'); values.push(data.titulo); }
    if (data.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(data.descripcion); }
    if (data.categoria !== undefined) { fields.push('categoria = ?'); values.push(data.categoria); }
    if (data.activo !== undefined) { fields.push('activo = ?'); values.push(data.activo ? 1 : 0); }

    if (fields.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE manuals SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(values);
      stmt.free();
    }

    if (data.asignados !== undefined) {
      this.setAsignados(id, data.asignados);
    }

    saveDB();
    return this.findById(id);
  },

  setAsignados(manualId, userIds) {
    const db = getDb();
    db.run('DELETE FROM manual_assignments WHERE manual_id = ?', [manualId]);
    if (userIds && userIds.length > 0) {
      const stmt = db.prepare('INSERT INTO manual_assignments (manual_id, user_id) VALUES (?, ?)');
      userIds.forEach(userId => {
        stmt.run([manualId, userId]);
      });
      stmt.free();
    }
    saveDB();
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM manual_assignments WHERE manual_id = ?', [id]);
    db.run('DELETE FROM manuals WHERE id = ?', [id]);
    saveDB();
  }
};

module.exports = Manual;
