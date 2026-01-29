const { getConnection, sql } = require('../config/db');

const queries = {
  getHistorial: `SELECT * FROM dbo.historialmedico WHERE centro_medico = @centroVal`,
  insertHistorial: `INSERT INTO dbo.historialmedico (id_cita, observaciones, diagnostico, tratamiento, fecha_registro, centro_medico) OUTPUT INSERTED.* VALUES (@id_cita, @observaciones, @diagnostico, @tratamiento, @fecha_registro, @centroVal)`,
};

module.exports = {
  async getHistorial(req, res) {
    try {
      const pool = await getConnection('norte');
      const result = await pool.request()
        .input('centroVal', sql.Int, 0)
        .query(queries.getHistorial);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async addHistorial(req, res) {
    try {
      const pool = await getConnection('norte');
      const result = await pool.request()
        .input('id_cita', sql.Int, req.body.id_cita)
        .input('observaciones', sql.VarChar(255), req.body.observaciones)
        .input('diagnostico', sql.VarChar(255), req.body.diagnostico)
        .input('tratamiento', sql.VarChar(255), req.body.tratamiento)
        .input('fecha_registro', sql.DateTime, req.body.fecha_registro)
        .input('centroVal', sql.Int, 0)
        .query(queries.insertHistorial);
      res.status(201).json(result.recordset[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};