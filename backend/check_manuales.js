const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.qobxnmxbbjkzejxwqrlv:biblioteca2104mariale@aws-1-us-west-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const res = await pool.query('SELECT id, titulo, categoria FROM manuals ORDER BY id');
    res.rows.forEach(r => console.log(r.id + ' | ' + r.categoria + ' | ' + r.titulo));
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    await pool.end();
  }
})();
