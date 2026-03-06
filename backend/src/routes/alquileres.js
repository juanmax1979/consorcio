const express = require('express');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { departamento_id, periodo_anio, periodo_mes, pendientes } = req.query;
    let sql = `SELECT a.id, a.departamento_id, a.periodo_mes, a.periodo_anio, a.monto, a.fecha_vencimiento,
               a.pagado, a.fecha_pago, a.observaciones, a.created_at,
               d.piso, d.numero, e.nombre as edificio_nombre
               FROM alquileres a
               JOIN departamentos d ON a.departamento_id = d.id
               JOIN edificios e ON d.edificio_id = e.id
               WHERE 1=1`;
    const params = [];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.json([]);
      sql += ' AND a.departamento_id = ?';
      params.push(req.user.departamento_id);
    } else if (departamento_id) {
      sql += ' AND a.departamento_id = ?';
      params.push(departamento_id);
    }
    if (periodo_anio) { sql += ' AND a.periodo_anio = ?'; params.push(periodo_anio); }
    if (periodo_mes) { sql += ' AND a.periodo_mes = ?'; params.push(periodo_mes); }
    if (pendientes === '1') { sql += ' AND a.pagado = 0'; }
    sql += ' ORDER BY a.fecha_vencimiento DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar alquileres' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let sql = `SELECT a.*, d.piso, d.numero, e.nombre as edificio_nombre
               FROM alquileres a
               JOIN departamentos d ON a.departamento_id = d.id
               JOIN edificios e ON d.edificio_id = e.id
               WHERE a.id = ?`;
    const params = [req.params.id];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.status(404).json({ error: 'No encontrado' });
      sql += ' AND a.departamento_id = ?';
      params.push(req.user.departamento_id);
    }
    const [rows] = await db.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Alquiler no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener alquiler' });
  }
});

router.post(
  '/',
  adminOnly,
  body('departamento_id').isInt(),
  body('periodo_mes').isInt({ min: 1, max: 12 }),
  body('periodo_anio').isInt({ min: 2000, max: 2100 }),
  body('monto').isFloat({ min: 0 }),
  body('fecha_vencimiento').isDate(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { departamento_id, periodo_mes, periodo_anio, monto, fecha_vencimiento, observaciones } = req.body;
      const [r] = await db.query(
        `INSERT INTO alquileres (departamento_id, periodo_mes, periodo_anio, monto, fecha_vencimiento, observaciones)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [departamento_id, periodo_mes, periodo_anio, monto, fecha_vencimiento, observaciones || null]
      );
      const [rows] = await db.query(
        `SELECT a.*, d.piso, d.numero, e.nombre as edificio_nombre
         FROM alquileres a JOIN departamentos d ON a.departamento_id = d.id JOIN edificios e ON d.edificio_id = e.id
         WHERE a.id = ?`,
        [r.insertId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear alquiler' });
    }
  }
);

router.put(
  '/:id',
  adminOnly,
  async (req, res) => {
    try {
      const { departamento_id, periodo_mes, periodo_anio, monto, fecha_vencimiento, pagado, fecha_pago, observaciones } = req.body;
      const updates = [];
      const params = [];
      if (departamento_id !== undefined) { updates.push('departamento_id = ?'); params.push(departamento_id); }
      if (periodo_mes !== undefined) { updates.push('periodo_mes = ?'); params.push(periodo_mes); }
      if (periodo_anio !== undefined) { updates.push('periodo_anio = ?'); params.push(periodo_anio); }
      if (monto !== undefined) { updates.push('monto = ?'); params.push(monto); }
      if (fecha_vencimiento !== undefined) { updates.push('fecha_vencimiento = ?'); params.push(fecha_vencimiento); }
      if (typeof pagado === 'boolean' || typeof pagado === 'number') { updates.push('pagado = ?'); params.push(pagado ? 1 : 0); }
      if (fecha_pago !== undefined) { updates.push('fecha_pago = ?'); params.push(fecha_pago || null); }
      if (observaciones !== undefined) { updates.push('observaciones = ?'); params.push(observaciones || null); }
      if (!updates.length) return res.status(400).json({ error: 'Nada que actualizar' });
      params.push(req.params.id);
      const [r] = await db.query(`UPDATE alquileres SET ${updates.join(', ')} WHERE id = ?`, params);
      if (r.affectedRows === 0) return res.status(404).json({ error: 'Alquiler no encontrado' });
      const [rows] = await db.query(
        `SELECT a.*, d.piso, d.numero, e.nombre as edificio_nombre
         FROM alquileres a JOIN departamentos d ON a.departamento_id = d.id JOIN edificios e ON d.edificio_id = e.id
         WHERE a.id = ?`,
        [req.params.id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar alquiler' });
    }
  }
);

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM alquileres WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Alquiler no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar alquiler' });
  }
});

module.exports = router;
