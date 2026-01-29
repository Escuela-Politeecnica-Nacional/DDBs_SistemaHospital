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
        return result.recordset.map(r => ({
          id_cita: r.id_cita,
          id_consultorio: r.id_consultorio,
          id_paciente: r.id_paciente,
          fecha: r.fecha,
          motivo: r.motivo,
          centro_medico: r.centro_medico,
        }));
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
    res.json(result.recordset.map(r => ({
      id_cita: r.id_cita,
      id_consultorio: r.id_consultorio,
      id_paciente: r.id_paciente,
      fecha: r.fecha,
      motivo: r.motivo,
      centro_medico: r.centro_medico,
    })));
  } catch (err) {
    console.error('getCitas error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Agregar cita con transacción tipada y forzando centro_medico según sede
async function addCita(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id_cita, id_consultorio, id_paciente, fecha, motivo } = req.body;
  try {
    const pool = await getConnection(sede);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const insertResult = await new sql.Request(transaction)
        .input('id_cita', sql.Int, id_cita)
        .input('id_consultorio', sql.Int, id_consultorio)
        .input('id_paciente', sql.Int, id_paciente)
        .input('fecha', sql.DateTime, fecha)
        .input('motivo', sql.VarChar(255), motivo)
        .input('centro_medico', sql.Int, centroVal)
        .query(queries[sede].insertCita);
      await transaction.commit();
      const row = insertResult.recordset[0] || {};
      res.status(201).json({
        id_cita: row.id_cita,
        id_consultorio: row.id_consultorio,
        id_paciente: row.id_paciente,
        fecha: row.fecha,
        motivo: row.motivo,
        centro_medico: row.centro_medico,
      });
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
    console.log(`editCita: id=${id} sede=${sede} body=`, req.body);
    const pool = await getConnection(sede);
    const suf = sede.toUpperCase() === 'CENTRO' ? 'CENTRO' : (sede.toLowerCase() === 'sur' ? 'SUR' : 'NORTE');
    const tableName = `dbo.cita_${suf}`;
    await pool.request()
      .input('id_cita', sql.Int, id)
      .input('id_consultorio', sql.Int, id_consultorio)
      .input('id_paciente', sql.Int, id_paciente)
      .input('fecha', sql.DateTime, fecha)
      .input('motivo', sql.VarChar(255), motivo)
      .input('centroVal', sql.Int, centroVal)
      .query(`UPDATE ${tableName} SET id_consultorio=@id_consultorio, id_paciente=@id_paciente, fecha=@fecha, motivo=@motivo WHERE id_cita=@id_cita AND centro_medico=@centroVal`);
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
    console.log(`deleteCita: id=${id} sede=${sede}`);
    const idInt = parseInt(id, 10);
    if (isNaN(idInt)) {
      console.error('deleteCita: invalid id param', id);
      return res.status(400).json({ error: 'Invalid id parameter' });
    }
    const pool = await getConnection(sede);
    // Use centralized query to delete
    const sqlText = queries[sede] && queries[sede].deleteCita ? queries[sede].deleteCita : `DELETE FROM dbo.cita_${sede.toUpperCase()} WHERE id_cita = @id_cita`;
    try {
      const result = await pool.request()
        .input('id_cita', sql.Int, idInt)
        .query(sqlText);
      const deleted = Array.isArray(result.rowsAffected) ? (result.rowsAffected[0] || 0) : (result.rowsAffected || 0);
      console.log(`deleteCita: executed SQL (${sqlText}) rowsDeleted=${deleted}`);
      if (deleted === 0) {
        return res.status(404).json({ error: 'Cita no encontrada', rowsAffected: deleted });
      }
      res.json({ message: 'Cita eliminada', rowsAffected: deleted });
    } catch (sqlErr) {
      console.error('deleteCita SQL error:', sqlErr);
      return res.status(500).json({ error: sqlErr.message });
    }
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
