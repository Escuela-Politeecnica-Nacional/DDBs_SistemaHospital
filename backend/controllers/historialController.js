const { getConnection, sql } = require('../config/db');
const queries = require('../queries/queries_v2');

function sedeToCentroId(sede) {
  if (!sede) return 1;
  const s = sede.toLowerCase();
  if (s === 'centro') return 1;
  if (s === 'sur') return 2;
  return 0;
}

async function getHistorial(req, res) {
  const sede = req.query.sede || 'centro';
  const filterRaw = (req.query.filter || sede).toString().toLowerCase();
  const seats = ['norte', 'centro', 'sur'];
  try {
    if (filterRaw === 'todos' || filterRaw === 'all') {
      const promises = seats.map(async (s) => {
        const pool = await getConnection(s);
        const sqlText = queries[s].getHistorial;
        const result = await pool.request()
          .input('centroVal', sql.Int, sedeToCentroId(s))
          .query(sqlText);
        console.log(`getHistorial: fetched ${result.recordset.length} rows from DB (sede=${s})`);
        return result.recordset.map(r => ({ ...r, _sede: s }));
      });
      const parts = await Promise.all(promises);
      res.json(parts.flat());
      return;
    }
    const target = seats.includes(filterRaw) ? filterRaw : sede;
    const pool = await getConnection(target);
    const sqlText = queries[target].getHistorial;
    const result = await pool.request()
      .input('centroVal', sql.Int, sedeToCentroId(target))
      .query(sqlText);
    console.log(`getHistorial: fetched ${result.recordset.length} rows from DB (target=${target}, requestedBy=${sede})`);
    res.json(result.recordset.map(r => ({ ...r, _sede: target })));
  } catch (err) {
    console.error('getHistorial error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

async function addHistorial(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id_cita, observaciones, diagnostico, tratamiento, fecha_registro } = req.body;
  try {
    const pool = await getConnection(sede);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const result = await new sql.Request(transaction)
        .input('id_cita', sql.Int, id_cita)
        .input('observaciones', sql.VarChar(sql.MAX), observaciones)
        .input('diagnostico', sql.VarChar(sql.MAX), diagnostico)
        .input('tratamiento', sql.VarChar(sql.MAX), tratamiento)
        .input('fecha_registro', sql.DateTime, fecha_registro)
        .input('centroVal', sql.Int, centroVal)
        .query(queries[sede].insertHistorial);
      await transaction.commit();
      res.status(201).json(result.recordset[0]);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('addHistorial error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function editHistorial(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id } = req.params;
  const { observaciones, diagnostico, tratamiento, fecha_registro } = req.body;
  try {
    const pool = await getConnection(sede);
    const suf = sede.toUpperCase() === 'CENTRO' ? 'CENTRO' : (sede.toLowerCase() === 'sur' ? 'SUR' : 'NORTE');
    const tableName = `dbo.historialmedico_${suf}`;
    await pool.request()
      .input('id_historial', sql.Int, id)
      .input('observaciones', sql.VarChar(sql.MAX), observaciones)
      .input('diagnostico', sql.VarChar(sql.MAX), diagnostico)
      .input('tratamiento', sql.VarChar(sql.MAX), tratamiento)
      .input('fecha_registro', sql.DateTime, fecha_registro)
      .input('centroVal', sql.Int, centroVal)
      .query(`UPDATE ${tableName} SET observaciones=@observaciones, diagnostico=@diagnostico, tratamiento=@tratamiento, fecha_registro=@fecha_registro WHERE id_historial=@id_historial AND centro_medico=@centroVal`);
    res.json({ message: 'Historial actualizado' });
  } catch (err) {
    console.error('editHistorial error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteHistorial(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    const suf = sede.toUpperCase() === 'CENTRO' ? 'CENTRO' : (sede.toLowerCase() === 'sur' ? 'SUR' : 'NORTE');
    const tableName = `dbo.historialmedico_${suf}`;
    await pool.request()
      .input('id_historial', sql.Int, id)
      .input('centroVal', sql.Int, centroVal)
      .query(`DELETE FROM ${tableName} WHERE id_historial=@id_historial AND centro_medico=@centroVal`);
    res.json({ message: 'Historial eliminado' });
  } catch (err) {
    console.error('deleteHistorial error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getHistorial,
  addHistorial,
  editHistorial,
  deleteHistorial,
};
