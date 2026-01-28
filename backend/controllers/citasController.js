const { getConnection, sql } = require('../config/db');

async function getCitas(req, res) {
  const sede = req.query.sede || 'centro';
  try {
    const pool = await getConnection(sede);
    const result = await pool.request().query('SELECT * FROM cita_CENTRO');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addCita(req, res) {
  const sede = req.query.sede || 'centro';
  const { id_consultorio, id_paciente, fecha, motivo } = req.body;
  try {
    const pool = await getConnection(sede);
    const result = await pool.request()
      .input('id_consultorio', id_consultorio)
      .input('id_paciente', id_paciente)
      .input('fecha', fecha)
      .input('motivo', motivo)
      .query('INSERT INTO cita_CENTRO (id_consultorio, id_paciente, fecha, motivo, centro_medico) OUTPUT INSERTED.* VALUES (@id_consultorio, @id_paciente, @fecha, @motivo, 1)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editCita(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  const { id_consultorio, id_paciente, fecha, motivo } = req.body;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_cita', id)
      .input('id_consultorio', id_consultorio)
      .input('id_paciente', id_paciente)
      .input('fecha', fecha)
      .input('motivo', motivo)
      .query('UPDATE cita_CENTRO SET id_consultorio=@id_consultorio, id_paciente=@id_paciente, fecha=@fecha, motivo=@motivo WHERE id_cita=@id_cita');
    res.json({ message: 'Cita actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteCita(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_cita', id)
      .query('DELETE FROM cita_CENTRO WHERE id_cita=@id_cita');
    res.json({ message: 'Cita eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCitas,
  addCita,
  editCita,
  deleteCita,
};
