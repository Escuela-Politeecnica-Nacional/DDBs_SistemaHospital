const { getConnection, sql } = require('../config/db');
const queries = require('../queries/queries_v2');

// Especialidades suele estar replicada; aceptamos 'sede' pero por defecto usamos 'centro'
async function getEspecialidades(req, res) {
  const sede = req.query.sede || 'centro';
  try {
    const pool = await getConnection(sede);
    const sqlText = queries[sede].getEspecialidades;
    const result = await pool.request().query(sqlText);
    console.log(`getEspecialidades: fetched ${result.recordset.length} rows (sede=${sede})`);
    res.json(result.recordset);
  } catch (err) {
    console.error('getEspecialidades error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function addEspecialidad(req, res) {
  const sede = req.query.sede || 'centro';
  const { nombre } = req.body;
  try {
    const pool = await getConnection(sede);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const result = await new sql.Request(transaction)
        .input('nombre', sql.VarChar(200), nombre)
        .query(queries[sede].insertEspecialidad);
      await transaction.commit();
      res.status(201).json(result.recordset[0]);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('addEspecialidad error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function editEspecialidad(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_especialidad', sql.Int, id)
      .input('nombre', sql.VarChar(200), nombre)
      .query('UPDATE dbo.especialidad SET nombre=@nombre WHERE id_especialidad=@id_especialidad');
    res.json({ message: 'Especialidad actualizada' });
  } catch (err) {
    console.error('editEspecialidad error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteEspecialidad(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_especialidad', sql.Int, id)
      .query('DELETE FROM dbo.especialidad WHERE id_especialidad=@id_especialidad');
    res.json({ message: 'Especialidad eliminada' });
  } catch (err) {
    console.error('deleteEspecialidad error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getEspecialidades,
  addEspecialidad,
  editEspecialidad,
  deleteEspecialidad,
};
