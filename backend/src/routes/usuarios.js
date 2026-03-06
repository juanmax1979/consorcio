const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(auth);
router.use(adminOnly);

router.get('/', async (req, res) => {
  try {
    const edificioId = req.query.edificio_id;
    let sql = `SELECT u.id, u.email, u.nombre, u.apellido, u.rol, u.departamento_id, u.activo, u.created_at,
               d.piso, d.numero, e.id as edificio_id, e.nombre as edificio_nombre
               FROM usuarios u
               LEFT JOIN departamentos d ON u.departamento_id = d.id
               LEFT JOIN edificios e ON d.edificio_id = e.id
               WHERE 1=1`;
    const params = [];
    if (edificioId) {
      sql += ' AND e.id = ?';
      params.push(edificioId);
    }
    sql += ' ORDER BY u.nombre, u.apellido';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.nombre, u.apellido, u.rol, u.departamento_id, u.activo, u.created_at,
       d.piso, d.numero, d.edificio_id, e.nombre as edificio_nombre
       FROM usuarios u
       LEFT JOIN departamentos d ON u.departamento_id = d.id
       LEFT JOIN edificios e ON d.edificio_id = e.id
       WHERE u.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

router.post(
  '/',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nombre').trim().notEmpty(),
  body('rol').isIn(['admin', 'residente']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { email, password, nombre, apellido, rol, departamento_id } = req.body;
      const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (existing.length) return res.status(400).json({ error: 'El email ya está registrado' });
      const password_hash = await bcrypt.hash(password, 10);
      const [r] = await db.query(
        'INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, departamento_id) VALUES (?, ?, ?, ?, ?, ?)',
        [email, password_hash, nombre, apellido || null, rol, departamento_id || null]
      );
      const [rows] = await db.query(
        `SELECT u.id, u.email, u.nombre, u.apellido, u.rol, u.departamento_id, u.activo, u.created_at,
         d.piso, d.numero, e.nombre as edificio_nombre
         FROM usuarios u
         LEFT JOIN departamentos d ON u.departamento_id = d.id
         LEFT JOIN edificios e ON d.edificio_id = e.id
         WHERE u.id = ?`,
        [r.insertId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  }
);

router.put(
  '/:id',
  body('nombre').trim().notEmpty(),
  body('rol').isIn(['admin', 'residente']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { nombre, apellido, rol, departamento_id, activo } = req.body;
      let sql = 'UPDATE usuarios SET nombre = ?, apellido = ?, rol = ?, departamento_id = ?';
      const params = [nombre, apellido || null, rol, departamento_id || null];
      if (typeof activo === 'number' || typeof activo === 'boolean') {
        sql += ', activo = ?';
        params.push(activo ? 1 : 0);
      }
      sql += ' WHERE id = ?';
      params.push(req.params.id);
      const [r] = await db.query(sql, params);
      if (r.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      if (req.body.password && req.body.password.length >= 6) {
        const password_hash = await bcrypt.hash(req.body.password, 10);
        await db.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [password_hash, req.params.id]);
      }
      const [rows] = await db.query(
        `SELECT u.id, u.email, u.nombre, u.apellido, u.rol, u.departamento_id, u.activo, u.created_at,
         d.piso, d.numero, e.nombre as edificio_nombre
         FROM usuarios u
         LEFT JOIN departamentos d ON u.departamento_id = d.id
         LEFT JOIN edificios e ON d.edificio_id = e.id
         WHERE u.id = ?`,
        [req.params.id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
