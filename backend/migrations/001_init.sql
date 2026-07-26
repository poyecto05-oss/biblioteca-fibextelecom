CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'usuario',
  departamento TEXT DEFAULT 'Sistemas',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manuals (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  categoria TEXT NOT NULL,
  archivo TEXT NOT NULL,
  nombre_original TEXT NOT NULL,
  archivo_buffer BYTEA,
  subido_por INTEGER REFERENCES users(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manual_assignments (
  id SERIAL PRIMARY KEY,
  manual_id INTEGER REFERENCES manuals(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(manual_id, user_id)
);
