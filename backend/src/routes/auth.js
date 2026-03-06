const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { auth } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');
const { JWT_SECRET } = require('../middlewares/auth');

const router = express.Router();

const JWT_OPTS = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };

router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { email, password } = req.body;
      const [rows] = await db.query(
        'SELECT id, email, password_hash, nombre, apellido, rol, departamento_id, activo FROM usuarios WHERE email = ?',
        [email]
      );
      if (!rows.length) return res.status(401).json({ error: 'Credenciales incorrectas' });
      const user = rows[0];
      if (!user.activo) return res.status(401).json({ error: 'Usuario desactivado' });
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });
      const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol, departamento_id: user.departamento_id || null },
        JWT_SECRET,
        JWT_OPTS
      );
      delete user.password_hash;
      res.json({ token, user: { ...user, password_hash: undefined } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }
);

router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.nombre, u.apellido, u.rol, u.departamento_id, u.activo,
              d.piso, d.numero, d.edificio_id, e.nombre as edificio_nombre
       FROM usuarios u
       LEFT JOIN departamentos d ON u.departamento_id = d.id
       LEFT JOIN edificios e ON d.edificio_id = e.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
