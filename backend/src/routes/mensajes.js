const express = require('express');
const db = require('../config/db');
const { auth, adminOnly } = require('../middlewares/auth');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

const router = express.Router();
router.use(auth);

// Listar mensajes: residente los que le enviaron; admin todos
router.get('/', async (req, res) => {
  try {
    if (req.user.rol === 'residente') {
      const [rows] = await db.query(
        `SELECT m.id, m.titulo, m.cuerpo, m.created_at, u.nombre as enviado_por_nombre,
         md.leido, md.leido_at
         FROM mensaje_destinatarios md
         JOIN mensajes m ON md.mensaje_id = m.id
         JOIN usuarios u ON m.enviado_por = u.id
         WHERE md.usuario_id = ?
         ORDER BY m.created_at DESC`,
        [req.user.id]
      );
      return res.json(rows);
    }
    const [rows] = await db.query(
      `SELECT m.id, m.titulo, m.cuerpo, m.enviado_por, m.created_at, u.nombre as enviado_por_nombre
       FROM mensajes m
       JOIN usuarios u ON m.enviado_por = u.id
       ORDER BY m.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar mensajes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (req.user.rol === 'residente') {
      const [rows] = await db.query(
        `SELECT m.id, m.titulo, m.cuerpo, m.created_at, u.nombre as enviado_por_nombre
         FROM mensaje_destinatarios md
         JOIN mensajes m ON md.mensaje_id = m.id
         JOIN usuarios u ON m.enviado_por = u.id
         WHERE md.mensaje_id = ? AND md.usuario_id = ?`,
        [req.params.id, req.user.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Mensaje no encontrado' });
      await db.query('UPDATE mensaje_destinatarios SET leido = 1, leido_at = CURRENT_TIMESTAMP WHERE mensaje_id = ? AND usuario_id = ?', [req.params.id, req.user.id]);
      return res.json(rows[0]);
    }
    const [rows] = await db.query(
      `SELECT m.*, u.nombre as enviado_por_nombre FROM mensajes m JOIN usuarios u ON m.enviado_por = u.id WHERE m.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mensaje' });
  }
});

router.post(
  '/',
  adminOnly,
  body('titulo').trim().notEmpty(),
  body('cuerpo').trim().notEmpty(),
  body('destinatarios').isArray(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const { titulo, cuerpo, destinatarios } = req.body;
      if (!destinatarios.length) return res.status(400).json({ error: 'Indique al menos un destinatario' });
      const [r] = await db.query(
        'INSERT INTO mensajes (enviado_por, titulo, cuerpo) VALUES (?, ?, ?)',
        [req.user.id, titulo, cuerpo]
      );
      const mensajeId = r.insertId;
      for (const usuario_id of destinatarios) {
        await db.query(
          'INSERT INTO mensaje_destinatarios (mensaje_id, usuario_id) VALUES (?, ?)',
          [mensajeId, usuario_id]
        );
      }
      if (emailService.isConfigured() && destinatarios.length) {
        const [users] = await db.query('SELECT email FROM usuarios WHERE id IN (?)', [destinatarios]);
        for (const u of users) {
          if (u.email) emailService.sendMessageEmail(u.email, titulo, cuerpo).catch(() => {});
        }
      }
      const [rows] = await db.query(
        'SELECT m.*, u.nombre as enviado_por_nombre FROM mensajes m JOIN usuarios u ON m.enviado_por = u.id WHERE m.id = ?',
        [mensajeId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al enviar mensaje' });
    }
  }
);

router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM mensajes WHERE id = ?', [req.params.id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Mensaje no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar mensaje' });
  }
});

module.exports = router;
