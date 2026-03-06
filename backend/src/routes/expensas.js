const express = require('express');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { departamento_id, periodo_anio, periodo_mes, pendientes } = req.query;
    let sql = `SELECT ex.id, ex.departamento_id, ex.concepto_id, ex.periodo_mes, ex.periodo_anio, ex.monto,
               ex.fecha_vencimiento, ex.pagado, ex.fecha_pago, ex.observaciones, ex.created_at,
               d.piso, d.numero, e.nombre as edificio_nombre, c.nombre as concepto_nombre
               FROM expensas ex
               JOIN departamentos d ON ex.departamento_id = d.id
               JOIN edificios e ON d.edificio_id = e.id
               LEFT JOIN conceptos_expensa c ON ex.concepto_id = c.id
               WHERE 1=1`;
    const params = [];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.json([]);
      sql += ' AND ex.departamento_id = ?';
      params.push(req.user.departamento_id);
    } else if (departamento_id) {
      sql += ' AND ex.departamento_id = ?';
      params.push(departamento_id);
    }
    if (periodo_anio) { sql += ' AND ex.periodo_anio = ?'; params.push(periodo_anio); }
    if (periodo_mes) { sql += ' AND ex.periodo_mes = ?'; params.push(periodo_mes); }
    if (pendientes === '1') { sql += ' AND ex.pagado = 0'; }
    sql += ' ORDER BY ex.fecha_vencimiento DESC, ex.departamento_id';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar expensas' });
  }
});

router.get('/vencimientos', async (req, res) => {
  try {
    const dias = parseInt(req.query.dias, 10) || 30;
    let sql = `SELECT ex.id, ex.departamento_id, ex.periodo_mes, ex.periodo_anio, ex.monto, ex.fecha_vencimiento,
               ex.pagado, d.piso, d.numero, e.nombre as edificio_nombre, 'expensa' as tipo
               FROM expensas ex
               JOIN departamentos d ON ex.departamento_id = d.id
               JOIN edificios e ON d.edificio_id = e.id
               WHERE ex.pagado = 0 AND ex.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)`;
    const params = [dias];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.json([]);
      sql += ' AND ex.departamento_id = ?';
      params.push(req.user.departamento_id);
    }
    sql += ' ORDER BY ex.fecha_vencimiento';
    const [expensas] = await db.query(sql, params);
    let sqlAlq = `SELECT a.id, a.departamento_id, a.periodo_mes, a.periodo_anio, a.monto, a.fecha_vencimiento,
                  a.pagado, d.piso, d.numero, e.nombre as edificio_nombre, 'alquiler' as tipo
                  FROM alquileres a
                  JOIN departamentos d ON a.departamento_id = d.id
                  JOIN edificios e ON d.edificio_id = e.id
                  WHERE a.pagado = 0 AND a.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)`;
    const paramsAlq = [dias];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.json(expensas);
      sqlAlq += ' AND a.departamento_id = ?';
      paramsAlq.push(req.user.departamento_id);
    }
    sqlAlq += ' ORDER BY a.fecha_vencimiento';
    const [alquileres] = await db.query(sqlAlq, paramsAlq);
    const todos = [...expensas, ...alquileres].sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener vencimientos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let sql = `SELECT ex.*, d.piso, d.numero, e.nombre as edificio_nombre, c.nombre as concepto_nombre
               FROM expensas ex
               JOIN departamentos d ON ex.departamento_id = d.id
               JOIN edificios e ON d.edificio_id = e.id
               LEFT JOIN conceptos_expensa c ON ex.concepto_id = c.id
               WHERE ex.id = ?`;
    const params = [req.params.id];
    if (req.user.rol === 'residente') {
      if (!req.user.departamento_id) return res.status(404).json({ error: 'No encontrado' });
      sql += ' AND ex.departamento_id = ?';
      params.push(req.user.departamento_id);
    }
    const [rows] = await db.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Expensa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener expensa' });
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
      const { departamento_id, concepto_id, periodo_mes, periodo_anio, monto, fecha_vencimiento, observaciones } = req.body;
      const [r] = await db.query(
        `INSERT INTO expensas (departamento_id, concepto_id, periodo_mes, periodo_anio, monto, fecha_vencimiento, observaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [departamento_id, concepto_id || null, periodo_mes, periodo_anio, monto, fecha_vencimiento, observaciones || null]
      );
      const [rows] = await db.query(
        `SELECT ex.*, d.piso, d.numero, e.nombre as edificio_nombre, c.nombre as concepto_nombre
         FROM expensas ex JOIN departamentos d ON ex.departamento_id = d.id JOIN edificios e ON d.edificio_id = e.id
         LEFT JOIN conceptos_expensa c ON ex.concepto_id = c.id WHERE ex.id = ?`,
        [r.insertId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear expensa' });
    }
  }
);

router.put(
  '/:id',
  adminOnly,
  body('periodo_mes').isInt({ min: 1, max: 12 }).optional(),
  body('periodo_anio').isInt({ min: 2000, max: 2100 }).optional(),
  body('monto').isFloat({ min: 0 }).optional(),
  body('fecha_vencimiento').isDate().optional(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { departamento_id, concepto_id, periodo_mes, periodo_anio, monto, fecha_vencimiento, pagado, fecha_pago, observaciones } = req.body;
      const updates = [];
      const params = [];
      if (departamento_id !== undefined) { updates.push('departamento_id = ?'); params.push(departamento_id); }
      if (concepto_id !== undefined) { updates.push('concepto_id = ?'); params.push(concepto_id); }
      if (periodo_mes !== undefined) { updates.push('periodo_mes = ?'); params.push(periodo_mes); }
      if (periodo_anio !== undefined) { updates.push('periodo_anio = ?'); params.push(periodo_anio); }
      if (monto !== undefined) { updates.push('monto = ?'); params.push(monto); }
      if (fecha_vencimiento !== undefined) { updates.push('fecha_vencimiento = ?'); params.push(fecha_vencimiento); }
      if (typeof pagado === 'boolean' || typeof pagado === 'number') { updates.push('pagado = ?'); params.push(pagado ? 1 : 0); }
      if (fecha_pago !== undefined) { updates.push('fecha_pago = ?'); params.push(fecha_pago || null); }
      if (observaciones !== undefined) { updates.push('observaciones = ?'); params.push(observaciones || null); }
      if (!updates.length) return res.status(400).json({ error: 'Nada que actualizar' });
      params.push(req.params.id);
      const [r] = await db.query(`UPDATE expensas SET ${updates.join(', ')} WHERE id = ?`, params);
      if (r.affectedRows === 0) return res.status(404).json({ error: 'Expensa no encontrada' });
      const [rows] = await db.query(
        `SELECT ex.*, d.piso, d.numero, e.nombre as edificio_nombre, c.nombre as concepto_nombre
         FROM expensas ex JOIN departamentos d ON ex.departamento_id = d.id JOIN edificios e ON d.edificio_id = e.id
         LEFT JOIN conceptos_expensa c ON ex.concepto_id = c.id WHERE ex.id = ?`,
        [req.params.id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al actualizar expensa' });
    }
  }
);

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM expensas WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Expensa no encontrada' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar expensa' });
  }
});

module.exports = router;
