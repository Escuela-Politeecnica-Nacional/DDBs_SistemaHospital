const { getConnection, sql } = require('../config/db');

async function getEspecialidades(req, res) {
  try {
    const pool = await getConnection('centro'); // Especialidades es replicada
    const result = await pool.request().query('SELECT * FROM especialidad');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addEspecialidad(req, res) {
  const { nombre } = req.body;
  try {
    const pool = await getConnection('centro');
    const result = await pool.request()
      .input('nombre', nombre)
      .query('INSERT INTO especialidad (nombre) OUTPUT INSERTED.* VALUES (@nombre)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editEspecialidad(req, res) {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const pool = await getConnection('centro');
    await pool.request()
      .input('id_especialidad', id)
      .input('nombre', nombre)
      .query('UPDATE especialidad SET nombre=@nombre WHERE id_especialidad=@id_especialidad');
    res.json({ message: 'Especialidad actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteEspecialidad(req, res) {
  const { id } = req.params;
  try {
    const pool = await getConnection('centro');
    await pool.request()
      .input('id_especialidad', id)
      .query('DELETE FROM especialidad WHERE id_especialidad=@id_especialidad');
    res.json({ message: 'Especialidad eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getEspecialidades,
  addEspecialidad,
  editEspecialidad,
  deleteEspecialidad,
};
