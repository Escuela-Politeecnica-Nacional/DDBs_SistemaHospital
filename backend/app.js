const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();


const pacientesRoutes = require('./routes/pacientes');
const doctoresRoutes = require('./routes/doctores');
const consultoriosRoutes = require('./routes/consultorios');
const citasRoutes = require('./routes/citas');
const historialRoutes = require('./routes/historial');
const especialidadesRoutes = require('./routes/especialidades');
const centrosRoutes = require('./routes/centros');
const authRoutes = require('./routes/auth');
const requestLogger = require('./middleware/requestLogger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rutas

app.use('/api/pacientes', pacientesRoutes);
app.use('/api/doctores', doctoresRoutes);
app.use('/api/consultorios', consultoriosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/centros', centrosRoutes);
app.use('/api/auth', authRoutes);
const statusRoutes = require('./routes/_status');
app.use('/api/_status', statusRoutes);
const inspectRoutes = require('./routes/_inspect');
app.use('/api/_inspect', inspectRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
