/**
 * Crea un usuario administrador inicial.
 * Uso: node scripts/seed-admin.js
 * Credenciales: admin@consorcio.local / admin123
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'consorcio',
});

async function main() {
  const password_hash = await bcrypt.hash('admin123', 10);
  const [r] = await pool.query(
    `INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, departamento_id, activo)
     VALUES (?, ?, 'Administrador', NULL, 'admin', NULL, 1)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nombre = 'Administrador', rol = 'admin'`,
    ['admin@consorcio.local', password_hash]
  );
  console.log('Usuario admin creado o actualizado: admin@consorcio.local / admin123');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
