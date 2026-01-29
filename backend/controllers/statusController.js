const { getConnection, sql } = require('../config/db');

async function probeNodes(req, res) {
  const seats = ['centro', 'norte', 'sur'];
  const results = {};
  for (const s of seats) {
    try {
      const pool = await getConnection(s);
      // Check for tables (pacientes + other domain tables) with suffixed and base names
      const tablesToCheck = ['paciente_info', 'paciente_detalle', 'doctor', 'consultorio', 'cita', 'historialmedico'];
      const checks = {};
      for (const t of tablesToCheck) checks[t] = { base: false, suffixed: false };

      for (const t of tablesToCheck) {
        try {
          const rBase = await pool.request().query(`SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${t}'`);
          checks[t].base = rBase.recordset[0].c > 0;
        } catch (e) {
          checks[t].base = false;
        }
        try {
          const suffName = `${t}_${s.toUpperCase()}`;
          const rSuff = await pool.request().query(`SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${suffName}'`);
          checks[t].suffixed = rSuff.recordset[0].c > 0;
        } catch (e) {
          checks[t].suffixed = false;
        }
      }

      // Try small counts for paciente_info if present
      let infoCount = null;
      if (checks['paciente_info'].base) {
        try {
          const rc = await pool.request().query('SELECT COUNT(*) AS c FROM dbo.paciente_info');
          infoCount = rc.recordset[0].c;
        } catch (e) {
          infoCount = null;
        }
      }

      results[s] = { ok: true, checks, paciente_info_count: infoCount };
    } catch (connErr) {
      results[s] = { ok: false, error: connErr && connErr.message ? connErr.message : String(connErr) };
    }
  }
  res.json(results);
}

module.exports = { probeNodes };
