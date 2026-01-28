const { getConnection, sql } = require('../config/db');

// Obtener todos los pacientes de una sede
async function getPacientes(req, res) {
  const sede = req.query.sede || 'centro';
  try {
    const pool = await getConnection(sede);
    const result = await pool.request().query('SELECT * FROM paciente_detalle_CENTRO'); // Cambia la tabla según la sede
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Agregar paciente
async function addPaciente(req, res) {
  const sede = req.query.sede || 'centro';
  const { nombre, apellido, fechaNacimiento, genero } = req.body;
  try {
    const pool = await getConnection(sede);
    const result = await pool.request()
      .input('nombre', nombre)
      .input('apellido', apellido)
      .input('fecha_nacimiento', fechaNacimiento)
      .input('genero', genero)
      .query('INSERT INTO paciente_detalle_CENTRO (nombre, apellido, fecha_nacimiento, genero) OUTPUT INSERTED.* VALUES (@nombre, @apellido, @fecha_nacimiento, @genero)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Editar paciente
async function editPaciente(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  const { nombre, apellido, fechaNacimiento, genero } = req.body;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_paciente', id)
      .input('nombre', nombre)
      .input('apellido', apellido)
      .input('fecha_nacimiento', fechaNacimiento)
      .input('genero', genero)
      .query('UPDATE paciente_detalle_CENTRO SET nombre=@nombre, apellido=@apellido, fecha_nacimiento=@fecha_nacimiento, genero=@genero WHERE id_paciente=@id_paciente');
    res.json({ message: 'Paciente actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Eliminar paciente
async function deletePaciente(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_paciente', id)
      .query('DELETE FROM paciente_detalle_CENTRO WHERE id_paciente=@id_paciente');
    res.json({ message: 'Paciente eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPacientes,
  addPaciente,
  editPaciente,
  deletePaciente,
};
