const { pool } = require('../config/db');

const Manual = {
  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM manuals WHERE id = $1', [id]);
    const manual = rows[0];
    if (!manual) return null;
    manual.asignados = await this.getAsignados(id);
    manual.subidoPorUser = (await pool.query('SELECT id, nombre, email FROM users WHERE id = $1', [manual.subido_por])).rows[0];
    return manual;
  },

  async findAll() {
    const { rows } = await pool.query('SELECT * FROM manuals WHERE activo = true ORDER BY created_at DESC');
    return Promise.all(rows.map(async m => {
      m.asignados = await this.getAsignados(m.id);
      m.subidoPorUser = (await pool.query('SELECT id, nombre, email FROM users WHERE id = $1', [m.subido_por])).rows[0];
      return m;
    }));
  },

  async findAllIncludingInactive() {
    const { rows } = await pool.query('SELECT * FROM manuals ORDER BY created_at DESC');
    return Promise.all(rows.map(async m => {
      m.asignados = await this.getAsignados(m.id);
      m.subidoPorUser = (await pool.query('SELECT id, nombre, email FROM users WHERE id = $1', [m.subido_por])).rows[0];
      return m;
    }));
  },

  async findByUser(userId) {
    const { rows } = await pool.query(`
      SELECT DISTINCT m.* FROM manuals m
      LEFT JOIN manual_assignments ma ON m.id = ma.manual_id AND ma.user_id = $1
      LEFT JOIN folder_assignments fa ON m.folder_id = fa.folder_id AND fa.user_id = $1
      WHERE m.activo = true AND (ma.id IS NOT NULL OR fa.id IS NOT NULL)
      ORDER BY m.created_at DESC
    `, [userId]);
    return Promise.all(rows.map(async m => {
      m.asignados = await this.getAsignados(m.id);
      m.subidoPorUser = (await pool.query('SELECT id, nombre, email FROM users WHERE id = $1', [m.subido_por])).rows[0];
      return m;
    }));
  },

  async getAsignados(manualId) {
    const { rows } = await pool.query(`
      SELECT u.id, u.nombre, u.email
      FROM users u
      INNER JOIN manual_assignments ma ON u.id = ma.user_id
      WHERE ma.manual_id = $1
    `, [manualId]);
    return rows;
  },

  async create({ titulo, descripcion, categoria, archivo, nombreOriginal, subidoPor, asignados, archivoBuffer, folderId }) {
    const { rows } = await pool.query(
      'INSERT INTO manuals (titulo, descripcion, categoria, archivo, nombre_original, archivo_buffer, subido_por, folder_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [titulo, descripcion || '', categoria, archivo, nombreOriginal, archivoBuffer, subidoPor, folderId || null]
    );
    const manual = rows[0];

    if (asignados && asignados.length > 0) {
      await this.setAsignados(manual.id, asignados);
    }

    return this.findById(manual.id);
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.titulo !== undefined) { fields.push(`titulo = $${i++}`); values.push(data.titulo); }
    if (data.descripcion !== undefined) { fields.push(`descripcion = $${i++}`); values.push(data.descripcion); }
    if (data.categoria !== undefined) { fields.push(`categoria = $${i++}`); values.push(data.categoria); }
    if (data.activo !== undefined) { fields.push(`activo = $${i++}`); values.push(data.activo); }
    if (data.folderId !== undefined) { fields.push(`folder_id = $${i++}`); values.push(data.folderId || null); }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE manuals SET ${fields.join(', ')} WHERE id = $${i}`, values);
    }

    if (data.asignados !== undefined) {
      await this.setAsignados(id, data.asignados);
    }

    return this.findById(id);
  },

  async setAsignados(manualId, userIds) {
    await pool.query('DELETE FROM manual_assignments WHERE manual_id = $1', [manualId]);
    if (userIds && userIds.length > 0) {
      for (const userId of userIds) {
        await pool.query('INSERT INTO manual_assignments (manual_id, user_id) VALUES ($1, $2)', [manualId, userId]);
      }
    }
  },

  async delete(id) {
    await pool.query('DELETE FROM activity_logs WHERE manual_id = $1', [id]);
    await pool.query('DELETE FROM manual_assignments WHERE manual_id = $1', [id]);
    await pool.query('DELETE FROM manuals WHERE id = $1', [id]);
  }
};

module.exports = Manual;
