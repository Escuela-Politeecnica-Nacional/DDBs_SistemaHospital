const { getConnection, sql } = require('../config/db');

// Obtener todos los doctores de una sede
async function getDoctores(req, res) {
  const sede = req.query.sede || 'centro';
  try {
    const pool = await getConnection(sede);
    const result = await pool.request().query('SELECT * FROM doctor_CENTRO');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Agregar doctor
async function addDoctor(req, res) {
  const sede = req.query.sede || 'centro';
  const { nombre, apellido, id_especialidad } = req.body;
  try {
    const pool = await getConnection(sede);
    const result = await pool.request()
      .input('nombre', nombre)
      .input('apellido', apellido)
      .input('id_especialidad', id_especialidad)
      .query('INSERT INTO doctor_CENTRO (nombre, apellido, id_especialidad, centro_medico) OUTPUT INSERTED.* VALUES (@nombre, @apellido, @id_especialidad, 1)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Editar doctor
async function editDoctor(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  const { nombre, apellido, id_especialidad } = req.body;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_doctor', id)
      .input('nombre', nombre)
      .input('apellido', apellido)
      .input('id_especialidad', id_especialidad)
      .query('UPDATE doctor_CENTRO SET nombre=@nombre, apellido=@apellido, id_especialidad=@id_especialidad WHERE id_doctor=@id_doctor');
    res.json({ message: 'Doctor actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Eliminar doctor
async function deleteDoctor(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_doctor', id)
      .query('DELETE FROM doctor_CENTRO WHERE id_doctor=@id_doctor');
    res.json({ message: 'Doctor eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDoctores,
  addDoctor,
  editDoctor,
  deleteDoctor,
};
