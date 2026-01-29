const { getConnection } = require('../config/db');

// Inspect candidate tables on a node: returns existence, columns, and sample rows
async function inspectTable(req, res) {
  const tableBase = req.params.table; // e.g., 'doctor' or 'paciente_detalle'
  const sede = (req.query.sede || 'centro').toString().toLowerCase();
  try {
    const pool = await getConnection(sede);
    const suff = `${tableBase}_${sede.toUpperCase()}`;
    const candidates = [suff, tableBase];
    const out = [];
    for (const t of candidates) {
      try {
        // check existence
        const existR = await pool.request().query(`SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${t}'`);
        const exists = existR.recordset[0].c > 0;
        const entry = { name: t, exists };
        if (exists) {
          // fetch columns
          try {
            const cols = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${t}' ORDER BY ORDINAL_POSITION`);
            entry.columns = cols.recordset;
          } catch (colErr) {
            entry.columns = null;
            entry.columnsError = String(colErr && colErr.message ? colErr.message : colErr);
          }
          // fetch sample rows
          try {
            const rows = await pool.request().query(`SELECT TOP 15 * FROM dbo.${t}`);
            entry.sample = rows.recordset;
          } catch (rowErr) {
            entry.sample = null;
            entry.sampleError = String(rowErr && rowErr.message ? rowErr.message : rowErr);
          }
        }
        out.push(entry);
      } catch (e) {
        out.push({ name: t, exists: false, error: String(e && e.message ? e.message : e) });
      }
    }
    res.json({ sede, tableBase, results: out });
  } catch (connErr) {
    res.status(502).json({ error: `DB connection failed for sede '${sede}': ${connErr && connErr.message ? connErr.message : connErr}` });
  }
}

module.exports = { inspectTable };
