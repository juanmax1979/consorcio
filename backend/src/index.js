require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const edificiosRoutes = require('./routes/edificios');
const departamentosRoutes = require('./routes/departamentos');
const usuariosRoutes = require('./routes/usuarios');
const expensasRoutes = require('./routes/expensas');
const alquileresRoutes = require('./routes/alquileres');
const mantenimientosRoutes = require('./routes/mantenimientos');
const notificacionesRoutes = require('./routes/notificaciones');
const mensajesRoutes = require('./routes/mensajes');
const conceptosExpensaRoutes = require('./routes/conceptosExpensa');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/edificios', edificiosRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/expensas', expensasRoutes);
app.use('/api/alquileres', alquileresRoutes);
app.use('/api/mantenimientos', mantenimientosRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/conceptos-expensa', conceptosExpensaRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor consorcio en http://localhost:${PORT}`);
});
