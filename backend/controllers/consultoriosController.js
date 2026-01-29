const { getConnection, sql } = require('../config/db');
const queries = require('../queries/queries_v2');

function sedeToCentroId(sede) {
  if (!sede) return 1;
  const s = sede.toLowerCase();
  if (s === 'centro') return 1;
  if (s === 'sur') return 2;
  return 0;
}

async function getConsultorios(req, res) {
  const sede = req.query.sede || 'centro';
  const filterRaw = (req.query.filter || sede).toString().toLowerCase();
  const seats = ['norte', 'centro', 'sur'];
  try {
    if (filterRaw === 'todos' || filterRaw === 'all') {
      const promises = seats.map(async (s) => {
        const pool = await getConnection(s);
        const sqlText = queries[s].getConsultorios;
        const result = await pool.request()
          .input('centroVal', sql.Int, sedeToCentroId(s))
          .query(sqlText);
        console.log(`getConsultorios: fetched ${result.recordset.length} rows (sede=${s})`);
        return result.recordset.map(r => ({ ...r, _sede: s }));
      });
      const parts = await Promise.all(promises);
      res.json(parts.flat());
      return;
    }
    const target = seats.includes(filterRaw) ? filterRaw : sede;
    const pool = await getConnection(target);
    const sqlText = queries[target].getConsultorios;
    const result = await pool.request()
      .input('centroVal', sql.Int, sedeToCentroId(target))
      .query(sqlText);
    console.log(`getConsultorios: fetched ${result.recordset.length} rows (target=${target}, requestedBy=${sede})`);
    res.json(result.recordset.map(r => ({ ...r, _sede: target })));
  } catch (err) {
    console.error('getConsultorios error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function addConsultorio(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { numero, ubicacion } = req.body;
  try {
    const pool = await getConnection(sede);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const result = await new sql.Request(transaction)
        .input('numero', sql.Int, numero)
        .input('ubicacion', sql.VarChar(200), ubicacion)
        .input('centro_medico', sql.Int, centroVal)
        .query(queries[sede].insertConsultorio);
      await transaction.commit();
      res.status(201).json(result.recordset[0]);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('addConsultorio error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function editConsultorio(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id } = req.params;
  const { numero, ubicacion } = req.body;
  try {
    const pool = await getConnection(sede);
    const suf = sede.toUpperCase() === 'CENTRO' ? 'CENTRO' : (sede.toLowerCase() === 'sur' ? 'SUR' : 'NORTE');
    const tableName = `dbo.consultorio_${suf}`;
    await pool.request()
      .input('id_consultorio', sql.Int, id)
      .input('numero', sql.Int, numero)
      .input('ubicacion', sql.VarChar(200), ubicacion)
      .input('centroVal', sql.Int, centroVal)
      .query(`UPDATE ${tableName} SET numero=@numero, ubicacion=@ubicacion WHERE id_consultorio=@id_consultorio AND centro_medico=@centroVal`);
    res.json({ message: 'Consultorio actualizado' });
  } catch (err) {
    console.error('editConsultorio error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteConsultorio(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    const suf = sede.toUpperCase() === 'CENTRO' ? 'CENTRO' : (sede.toLowerCase() === 'sur' ? 'SUR' : 'NORTE');
    const tableName = `dbo.consultorio_${suf}`;
    await pool.request()
      .input('id_consultorio', sql.Int, id)
      .input('centroVal', sql.Int, centroVal)
      .query(`DELETE FROM ${tableName} WHERE id_consultorio=@id_consultorio AND centro_medico=@centroVal`);
    res.json({ message: 'Consultorio eliminado' });
  } catch (err) {
    console.error('deleteConsultorio error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getConsultorios,
  addConsultorio,
  editConsultorio,
  deleteConsultorio,
};
