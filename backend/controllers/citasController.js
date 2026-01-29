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
        try {
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
        } catch (errSeat) {
          console.error(`getCitas: error fetching from sede='${s}':`, errSeat && errSeat.message ? errSeat.message : errSeat);
          return [];
        }
      });
      const parts = await Promise.all(promises);
      res.json(parts.flat());
      return;
    }
    const target = seats.includes(filterRaw) ? filterRaw : sede;
    console.log(`getCitas: requestedBy=${sede} filter=${filterRaw} -> target=${target}`);
    let pool;
    try {
      pool = await getConnection(target);
    } catch (connErr) {
      console.error(`getCitas: failed to connect to target='${target}':`, connErr && connErr.message ? connErr.message : connErr);
      return res.status(502).json({ error: `DB connection failed for target '${target}': ${connErr.message || connErr}` });
    }
    const sqlText = queries[target] && queries[target].getCitas ? queries[target].getCitas : null;
    const tryQuery = async (sqlString) => await pool.request().input('centroVal', sql.Int, sedeToCentroId(target)).query(sqlString);

    if (sqlText) {
      try {
        const result = await tryQuery(sqlText);
        console.log(`getCitas: fetched ${result.recordset.length} rows from DB (target=${target}, requestedBy=${sede})`);
        return res.json(result.recordset.map(r => ({ id_cita: r.id_cita, id_consultorio: r.id_consultorio, id_paciente: r.id_paciente, fecha: r.fecha, motivo: r.motivo, centro_medico: r.centro_medico })));
      } catch (primaryErr) {
        console.warn(`getCitas: primary query failed for target='${target}':`, primaryErr && primaryErr.message ? primaryErr.message : primaryErr);
      }
    }

    const suffix = target.toUpperCase();
    const candidates = [`dbo.cita_${suffix}`, 'dbo.cita'];
    for (const tbl of candidates) {
      const isSuffixed = tbl.toUpperCase().includes(`_${suffix}`);
      const where = isSuffixed ? '' : 'WHERE centro_medico = @centroVal';
      const q = `SELECT id_cita, id_consultorio, id_paciente, fecha, motivo, centro_medico FROM ${tbl} ${where}`;
      try {
        const r = await tryQuery(q);
        console.log(`getCitas: fallback succeeded using ${tbl} (rows=${r.recordset.length})`);
        return res.json(r.recordset.map(rr => ({ id_cita: rr.id_cita, id_consultorio: rr.id_consultorio, id_paciente: rr.id_paciente, fecha: rr.fecha, motivo: rr.motivo, centro_medico: rr.centro_medico })));
      } catch (e) {
        console.warn(`getCitas: fallback ${tbl} failed:`, e && e.message ? e.message : e);
      }
    }

    return res.status(500).json({ error: `No suitable cita table found for target '${target}'` });
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
