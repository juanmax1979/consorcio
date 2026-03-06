const express = require('express');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { edificio_id, departamento_id, estado } = req.query;
    let sql = `SELECT m.id, m.edificio_id, m.departamento_id, m.tipo, m.descripcion, m.estado,
               m.fecha_solicitud, m.fecha_prevista, m.fecha_realizacion, m.costo, m.created_at,
               e.nombre as edificio_nombre, d.piso, d.numero
               FROM mantenimientos m
               JOIN edificios e ON m.edificio_id = e.id
               LEFT JOIN departamentos d ON m.departamento_id = d.id
               WHERE 1=1`;
    const params = [];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.json([]);
      sql += ' AND (m.departamento_id = ? OR (m.departamento_id IS NULL AND m.edificio_id = (SELECT edificio_id FROM departamentos WHERE id = ?)))';
      params.push(req.user.departamento_id, req.user.departamento_id);
    } else {
      if (edificio_id) { sql += ' AND m.edificio_id = ?'; params.push(edificio_id); }
      if (departamento_id) { sql += ' AND m.departamento_id = ?'; params.push(departamento_id); }
    }
    if (estado) { sql += ' AND m.estado = ?'; params.push(estado); }
    sql += ' ORDER BY m.fecha_solicitud DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar mantenimientos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let sql = `SELECT m.*, e.nombre as edificio_nombre, e.direccion as edificio_direccion, d.piso, d.numero
               FROM mantenimientos m
               JOIN edificios e ON m.edificio_id = e.id
               LEFT JOIN departamentos d ON m.departamento_id = d.id
               WHERE m.id = ?`;
    const params = [req.params.id];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.status(404).json({ error: 'No encontrado' });
      sql += ' AND (m.departamento_id = ? OR (m.departamento_id IS NULL AND m.edificio_id = (SELECT edificio_id FROM departamentos WHERE id = ?)))';
      params.push(req.user.departamento_id, req.user.departamento_id);
    }
    const [rows] = await db.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mantenimiento' });
  }
});

router.post(
  '/',
  adminOnly,
  body('edificio_id').isInt(),
  body('descripcion').trim().notEmpty(),
  body('fecha_solicitud').isDate(),
  body('tipo').isIn(['preventivo', 'correctivo', 'obra']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { edificio_id, departamento_id, tipo, descripcion, estado, fecha_solicitud, fecha_prevista, fecha_realizacion, costo } = req.body;
      const [r] = await db.query(
        `INSERT INTO mantenimientos (edificio_id, departamento_id, tipo, descripcion, estado, fecha_solicitud, fecha_prevista, fecha_realizacion, costo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [edificio_id, departamento_id || null, tipo || 'correctivo', descripcion, estado || 'pendiente', fecha_solicitud, fecha_prevista || null, fecha_realizacion || null, costo || null]
      );
      const [rows] = await db.query(
        `SELECT m.*, e.nombre as edificio_nombre, d.piso, d.numero FROM mantenimientos m
         JOIN edificios e ON m.edificio_id = e.id LEFT JOIN departamentos d ON m.departamento_id = d.id WHERE m.id = ?`,
        [r.insertId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear mantenimiento' });
    }
  }
);

router.put(
  '/:id',
  adminOnly,
  async (req, res) => {
    try {
      const { tipo, descripcion, estado, fecha_prevista, fecha_realizacion, costo } = req.body;
      const updates = [];
      const params = [];
      if (tipo !== undefined) { updates.push('tipo = ?'); params.push(tipo); }
      if (descripcion !== undefined) { updates.push('descripcion = ?'); params.push(descripcion); }
      if (estado !== undefined) { updates.push('estado = ?'); params.push(estado); }
      if (fecha_prevista !== undefined) { updates.push('fecha_prevista = ?'); params.push(fecha_prevista || null); }
      if (fecha_realizacion !== undefined) { updates.push('fecha_realizacion = ?'); params.push(fecha_realizacion || null); }
      if (costo !== undefined) { updates.push('costo = ?'); params.push(costo || null); }
      if (!updates.length) return res.status(400).json({ error: 'Nada que actualizar' });
      params.push(req.params.id);
      const [r] = await db.query(`UPDATE mantenimientos SET ${updates.join(', ')} WHERE id = ?`, params);
      if (r.affectedRows === 0) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
      const [rows] = await db.query(
        `SELECT m.*, e.nombre as edificio_nombre, d.piso, d.numero FROM mantenimientos m
         JOIN edificios e ON m.edificio_id = e.id LEFT JOIN departamentos d ON m.departamento_id = d.id WHERE m.id = ?`,
        [req.params.id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar mantenimiento' });
    }
  }
);

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM mantenimientos WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Mantenimiento no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar mantenimiento' });
  }
});

module.exports = router;
