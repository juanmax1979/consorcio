const express = require('express');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const edificioId = req.query.edificio_id;
    let sql = `SELECT d.id, d.edificio_id, d.piso, d.numero, d.metros_cuadrados, d.habitaciones, d.created_at,
               e.nombre as edificio_nombre
               FROM departamentos d
               JOIN edificios e ON d.edificio_id = e.id`;
    const params = [];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.json([]);
      sql += ' WHERE d.id = ?';
      params.push(req.user.departamento_id);
    } else if (edificioId) {
      sql += ' WHERE d.edificio_id = ?';
      params.push(edificioId);
    }
    sql += ' ORDER BY e.nombre, d.piso, d.numero';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar departamentos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let sql = `SELECT d.id, d.edificio_id, d.piso, d.numero, d.metros_cuadrados, d.habitaciones, d.created_at,
       e.nombre as edificio_nombre, e.direccion as edificio_direccion
       FROM departamentos d
       JOIN edificios e ON d.edificio_id = e.id
       WHERE d.id = ?`;
    const params = [req.params.id];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id || req.user.departamento_id !== parseInt(req.params.id, 10)) return res.status(404).json({ error: 'Departamento no encontrado' });
    }
    const [rows] = await db.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Departamento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener departamento' });
  }
});

router.post(
  '/',
  adminOnly,
  body('edificio_id').isInt(),
  body('piso').trim().notEmpty(),
  body('numero').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { edificio_id, piso, numero, metros_cuadrados, habitaciones } = req.body;
      const [r] = await db.query(
        'INSERT INTO departamentos (edificio_id, piso, numero, metros_cuadrados, habitaciones) VALUES (?, ?, ?, ?, ?)',
        [edificio_id, piso, numero, metros_cuadrados || null, habitaciones || null]
      );
      const [rows] = await db.query(
        'SELECT d.*, e.nombre as edificio_nombre FROM departamentos d JOIN edificios e ON d.edificio_id = e.id WHERE d.id = ?',
        [r.insertId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear departamento' });
    }
  }
);

router.put(
  '/:id',
  adminOnly,
  body('edificio_id').isInt(),
  body('piso').trim().notEmpty(),
  body('numero').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { edificio_id, piso, numero, metros_cuadrados, habitaciones } = req.body;
      const [r] = await db.query(
        'UPDATE departamentos SET edificio_id = ?, piso = ?, numero = ?, metros_cuadrados = ?, habitaciones = ? WHERE id = ?',
        [edificio_id, piso, numero, metros_cuadrados || null, habitaciones || null, req.params.id]
      );
      if (r.affectedRows === 0) return res.status(404).json({ error: 'Departamento no encontrado' });
      const [rows] = await db.query(
        'SELECT d.*, e.nombre as edificio_nombre FROM departamentos d JOIN edificios e ON d.edificio_id = e.id WHERE d.id = ?',
        [req.params.id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar departamento' });
    }
  }
);

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM departamentos WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Departamento no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar departamento' });
  }
});

module.exports = router;
