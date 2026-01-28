const { getConnection, sql } = require('../config/db');

async function getConsultorios(req, res) {
  const sede = req.query.sede || 'centro';
  try {
    const pool = await getConnection(sede);
    const result = await pool.request().query('SELECT * FROM consultorio_CENTRO');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addConsultorio(req, res) {
  const sede = req.query.sede || 'centro';
  const { numero, ubicacion } = req.body;
  try {
    const pool = await getConnection(sede);
    const result = await pool.request()
      .input('numero', numero)
      .input('ubicacion', ubicacion)
      .query('INSERT INTO consultorio_CENTRO (numero, ubicacion, centro_medico) OUTPUT INSERTED.* VALUES (@numero, @ubicacion, 1)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editConsultorio(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  const { numero, ubicacion } = req.body;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_consultorio', id)
      .input('numero', numero)
      .input('ubicacion', ubicacion)
      .query('UPDATE consultorio_CENTRO SET numero=@numero, ubicacion=@ubicacion WHERE id_consultorio=@id_consultorio');
    res.json({ message: 'Consultorio actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteConsultorio(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_consultorio', id)
      .query('DELETE FROM consultorio_CENTRO WHERE id_consultorio=@id_consultorio');
    res.json({ message: 'Consultorio eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getConsultorios,
  addConsultorio,
  editConsultorio,
  deleteConsultorio,
};
