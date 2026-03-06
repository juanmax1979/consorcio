const express = require('express');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();
router.use(auth);
router.use(adminOnly);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, direccion, ciudad, codigo_postal, created_at FROM edificios ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar edificios' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, direccion, ciudad, codigo_postal, created_at FROM edificios WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Edificio no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener edificio' });
  }
});

router.post(
  '/',
  body('nombre').trim().notEmpty(),
  body('direccion').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { nombre, direccion, ciudad, codigo_postal } = req.body;
      const [r] = await db.query(
        'INSERT INTO edificios (nombre, direccion, ciudad, codigo_postal) VALUES (?, ?, ?, ?)',
        [nombre, direccion, ciudad || null, codigo_postal || null]
      );
      const [rows] = await db.query('SELECT * FROM edificios WHERE id = ?', [r.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear edificio' });
    }
  }
);

router.put(
  '/:id',
  body('nombre').trim().notEmpty(),
  body('direccion').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { nombre, direccion, ciudad, codigo_postal } = req.body;
      const [r] = await db.query(
        'UPDATE edificios SET nombre = ?, direccion = ?, ciudad = ?, codigo_postal = ? WHERE id = ?',
        [nombre, direccion, ciudad || null, codigo_postal || null, req.params.id]
      );
      if (r.affectedRows === 0) return res.status(404).json({ error: 'Edificio no encontrado' });
      const [rows] = await db.query('SELECT * FROM edificios WHERE id = ?', [req.params.id]);
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar edificio' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM edificios WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Edificio no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar edificio' });
  }
});

module.exports = router;
