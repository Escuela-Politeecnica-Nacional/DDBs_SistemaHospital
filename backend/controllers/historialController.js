const { getConnection, sql } = require('../config/db');

async function getHistorial(req, res) {
  const sede = req.query.sede || 'centro';
  try {
    const pool = await getConnection(sede);
    const result = await pool.request().query('SELECT * FROM historialmedico_CENTRO');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addHistorial(req, res) {
  const sede = req.query.sede || 'centro';
  const { id_cita, observaciones, diagnostico, tratamiento, fecha_registro } = req.body;
  try {
    const pool = await getConnection(sede);
    const result = await pool.request()
      .input('id_cita', id_cita)
      .input('observaciones', observaciones)
      .input('diagnostico', diagnostico)
      .input('tratamiento', tratamiento)
      .input('fecha_registro', fecha_registro)
      .query('INSERT INTO historialmedico_CENTRO (id_cita, observaciones, diagnostico, tratamiento, fecha_registro, centro_medico) OUTPUT INSERTED.* VALUES (@id_cita, @observaciones, @diagnostico, @tratamiento, @fecha_registro, 1)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editHistorial(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  const { observaciones, diagnostico, tratamiento, fecha_registro } = req.body;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_historial', id)
      .input('observaciones', observaciones)
      .input('diagnostico', diagnostico)
      .input('tratamiento', tratamiento)
      .input('fecha_registro', fecha_registro)
      .query('UPDATE historialmedico_CENTRO SET observaciones=@observaciones, diagnostico=@diagnostico, tratamiento=@tratamiento, fecha_registro=@fecha_registro WHERE id_historial=@id_historial');
    res.json({ message: 'Historial actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteHistorial(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_historial', id)
      .query('DELETE FROM historialmedico_CENTRO WHERE id_historial=@id_historial');
    res.json({ message: 'Historial eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getHistorial,
  addHistorial,
  editHistorial,
  deleteHistorial,
};
