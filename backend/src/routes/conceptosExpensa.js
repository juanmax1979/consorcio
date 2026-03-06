const express = require('express');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(auth);
router.use(adminOnly);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, descripcion, created_at FROM conceptos_expensa ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar conceptos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM conceptos_expensa WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Concepto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener concepto' });
  }
});

router.post('/', body('nombre').trim().notEmpty(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nombre, descripcion } = req.body;
    const [r] = await db.query('INSERT INTO conceptos_expensa (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion || null]);
    const [rows] = await db.query('SELECT * FROM conceptos_expensa WHERE id = ?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear concepto' });
  }
});

router.put('/:id', body('nombre').trim().notEmpty(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nombre, descripcion } = req.body;
    const [r] = await db.query('UPDATE conceptos_expensa SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion || null, req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Concepto no encontrado' });
    const [rows] = await db.query('SELECT * FROM conceptos_expensa WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar concepto' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM conceptos_expensa WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Concepto no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar concepto' });
  }
});

module.exports = router;
