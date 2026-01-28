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

const app = express();
app.use(cors());
app.use(express.json());

// Rutas

app.use('/api/pacientes', pacientesRoutes);
app.use('/api/doctores', doctoresRoutes);
app.use('/api/consultorios', consultoriosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/especialidades', especialidadesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
