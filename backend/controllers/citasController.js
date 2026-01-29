const { getConnection, sql } = require('../config/db');
const queries = require('../queries/queries_v2');

// Helper: map sede to centro_medico numeric id
function sedeToCentroId(sede) {
  if (!sede) return 1;
  const s = sede.toLowerCase();
  if (s === 'centro') return 1;
  if (s === 'sur') return 2;
  return 0; // norte
}

// Obtener citas para una sede (filtrando por centro_medico)
async function getCitas(req, res) {
  const sede = req.query.sede || 'centro';
  const filterRaw = (req.query.filter || sede).toString().toLowerCase();
  const seats = ['norte', 'centro', 'sur'];
  try {
    if (filterRaw === 'todos' || filterRaw === 'all') {
      const promises = seats.map(async (s) => {
        const pool = await getConnection(s);
        const sqlText = queries[s].getCitas;
        const result = await pool.request()
          .input('centroVal', sql.Int, sedeToCentroId(s))
          .query(sqlText);
        console.log(`getCitas: fetched ${result.recordset.length} rows from DB (sede=${s})`);
        return result.recordset.map(r => ({ ...r, _sede: s }));
      });
      const parts = await Promise.all(promises);
      res.json(parts.flat());
      return;
    }
    const target = seats.includes(filterRaw) ? filterRaw : sede;
    const pool = await getConnection(target);
    const sqlText = queries[target].getCitas;
    const result = await pool.request()
      .input('centroVal', sql.Int, sedeToCentroId(target))
      .query(sqlText);
    console.log(`getCitas: fetched ${result.recordset.length} rows from DB (target=${target}, requestedBy=${sede})`);
    res.json(result.recordset.map(r => ({ ...r, _sede: target })));
  } catch (err) {
    console.error('getCitas error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Agregar cita con transacción tipada y forzando centro_medico según sede
async function addCita(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id_consultorio, id_paciente, fecha, motivo } = req.body;
  try {
    const pool = await getConnection(sede);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const insertResult = await new sql.Request(transaction)
        .input('id_consultorio', sql.Int, id_consultorio)
        .input('id_paciente', sql.Int, id_paciente)
        .input('fecha', sql.DateTime, fecha)
        .input('motivo', sql.VarChar(255), motivo)
        .input('centro_medico', sql.Int, centroVal)
        .query(queries[sede].insertCita);
      await transaction.commit();
      res.status(201).json(insertResult.recordset[0]);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('addCita error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Editar cita (solo si pertenece al mismo centro_medico)
async function editCita(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id } = req.params;
  const { id_consultorio, id_paciente, fecha, motivo } = req.body;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_cita', sql.Int, id)
      .input('id_consultorio', sql.Int, id_consultorio)
      .input('id_paciente', sql.Int, id_paciente)
      .input('fecha', sql.DateTime, fecha)
      .input('motivo', sql.VarChar(255), motivo)
      .input('centroVal', sql.Int, centroVal)
      .query('UPDATE dbo.cita_CENTRO SET id_consultorio=@id_consultorio, id_paciente=@id_paciente, fecha=@fecha, motivo=@motivo WHERE id_cita=@id_cita AND centro_medico=@centroVal');
    res.json({ message: 'Cita actualizada' });
  } catch (err) {
    console.error('editCita error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Eliminar cita (solo si pertenece al mismo centro_medico)
async function deleteCita(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_cita', sql.Int, id)
      .input('centroVal', sql.Int, centroVal)
      .query('DELETE FROM dbo.cita_CENTRO WHERE id_cita=@id_cita AND centro_medico=@centroVal');
    res.json({ message: 'Cita eliminada' });
  } catch (err) {
    console.error('deleteCita error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCitas,
  addCita,
  editCita,
  deleteCita,
};
