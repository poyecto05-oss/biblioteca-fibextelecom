const { pool } = require('../config/db');

const Folder = {
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM folders WHERE id = $1', [id]);
    const folder = rows[0];
    if (!folder) return null;
    folder.usuarios = await this.getUsuarios(id);
    folder.manuales = (await pool.query(
      'SELECT id, titulo, descripcion, categoria, archivo, nombre_original, activo, created_at FROM manuals WHERE folder_id = $1 AND activo = true ORDER BY created_at DESC',
      [id]
    )).rows;
    return folder;
  },

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM folders WHERE activo = true ORDER BY nombre');
    return Promise.all(rows.map(async f => {
      f.usuarios = await this.getUsuarios(f.id);
      f.manuales = (await pool.query(
        'SELECT id, titulo, descripcion, categoria, archivo, nombre_original, activo, created_at FROM manuals WHERE folder_id = $1 AND activo = true ORDER BY created_at DESC',
        [f.id]
      )).rows;
      return f;
    }));
  },

  async getUsuarios(folderId) {
    const { rows } = await pool.query(`
      SELECT u.id, u.nombre, u.email
      FROM users u
      INNER JOIN folder_assignments fa ON u.id = fa.user_id
      WHERE fa.folder_id = $1
    `, [folderId]);
    return rows;
  },

  async create({ nombre, descripcion }) {
    const { rows } = await pool.query(
      'INSERT INTO folders (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion || '']
    );
    return this.findById(rows[0].id);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;
    if (data.nombre !== undefined) { fields.push(`nombre = $${i++}`); values.push(data.nombre); }
    if (data.descripcion !== undefined) { fields.push(`descripcion = $${i++}`); values.push(data.descripcion); }
    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE folders SET ${fields.join(', ')} WHERE id = $${i}`, values);
    }
    return this.findById(id);
  },

  async setUsuarios(folderId, userIds) {
    await pool.query('DELETE FROM folder_assignments WHERE folder_id = $1', [folderId]);
    if (userIds && userIds.length > 0) {
      for (const userId of userIds) {
        await pool.query('INSERT INTO folder_assignments (folder_id, user_id) VALUES ($1, $2)', [folderId, userId]);
      }
    }
  },

  async delete(id) {
    await pool.query('UPDATE manuals SET folder_id = NULL WHERE folder_id = $1', [id]);
    await pool.query('DELETE FROM folder_assignments WHERE folder_id = $1', [id]);
    await pool.query('DELETE FROM folders WHERE id = $1', [id]);
  }
};

module.exports = Folder;
