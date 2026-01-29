const { getConnection, sql } = require('../config/db');
const queries = require('../queries/queries_v2');

async function getCentros(req, res) {
  try {
    const sede = req.query.sede || 'centro';
    const pool = await getConnection(sede);
    const sqlText = queries[sede].getCentros;
    const result = await pool.request()
      .input('sede', sql.VarChar(50), sede)
      .query(sqlText);
    console.log(`getCentros: fetched ${result.recordset.length} rows (sede=${sede})`);
    res.json(result.recordset);
  } catch (err) {
    console.error('getCentros error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

module.exports = {
  getCentros,
};
