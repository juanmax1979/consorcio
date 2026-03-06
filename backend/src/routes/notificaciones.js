const express = require('express');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
router.use(auth);

// Residentes ven solo las suyas; admin puede listar por usuario_id
router.get('/', async (req, res) => {
  try {
    const { leida, usuario_id } = req.query;
    let sql = `SELECT n.id, n.usuario_id, n.tipo, n.titulo, n.mensaje, n.referencia_tipo, n.referencia_id, n.leida, n.leida_at, n.created_at
               FROM notificaciones n WHERE 1=1`;
    const params = [];
    if (req.user.rol === 'residente') {
      sql += ' AND n.usuario_id = ?';
      params.push(req.user.id);
    } else if (usuario_id) {
      sql += ' AND n.usuario_id = ?';
      params.push(usuario_id);
    }
    if (leida === '0' || leida === '1') { sql += ' AND n.leida = ?'; params.push(parseInt(leida, 10)); }
    sql += ' ORDER BY n.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar notificaciones' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let sql = 'SELECT * FROM notificaciones WHERE id = ?';
    const params = [req.params.id];
    if (req.user.rol === 'residente') {
      sql += ' AND usuario_id = ?';
      params.push(req.user.id);
    }
    const [rows] = await db.query(sql, params);
    if (!rows.length) return res.status(404).json({ error: 'Notificación no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener notificación' });
  }
});

router.post(
  '/',
  adminOnly,
  body('usuario_id').isInt(),
  body('titulo').trim().notEmpty(),
  body('tipo').isIn(['vencimiento', 'aviso', 'mantenimiento', 'mensaje', 'alerta']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { usuario_id, tipo, titulo, mensaje, referencia_tipo, referencia_id } = req.body;
      const [r] = await db.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, referencia_tipo, referencia_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [usuario_id, tipo || 'aviso', titulo, mensaje || null, referencia_tipo || null, referencia_id || null]
      );
      const [rows] = await db.query('SELECT * FROM notificaciones WHERE id = ?', [r.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al crear notificación' });
    }
  }
);

router.put('/:id/leer', async (req, res) => {
  try {
    let sql = 'UPDATE notificaciones SET leida = 1, leida_at = CURRENT_TIMESTAMP WHERE id = ?';
    const params = [req.params.id];
    if (req.user.rol === 'residente') {
      sql += ' AND usuario_id = ?';
      params.push(req.user.id);
    }
    const [r] = await db.query(sql, params);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Notificación no encontrada' });
    const [rows] = await db.query('SELECT * FROM notificaciones WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    let sql = 'DELETE FROM notificaciones WHERE id = ?';
    const params = [req.params.id];
    if (req.user.rol === 'residente') {
      sql += ' AND usuario_id = ?';
      params.push(req.user.id);
    }
    const [r] = await db.query(sql, params);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Notificación no encontrada' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
});

module.exports = router;
