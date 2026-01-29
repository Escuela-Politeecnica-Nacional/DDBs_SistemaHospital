const { getConnection, sql } = require('../config/db');

const queries = {
  getConsultorios: `SELECT * FROM dbo.consultorio WHERE centro_medico = @centroVal`,
  insertConsultorio: `INSERT INTO dbo.consultorio (id_consultorio, numero, ubicacion, centro_medico) OUTPUT INSERTED.* VALUES (@id_consultorio, @numero, @ubicacion, @centro_medico)`,
};

module.exports = {
  async getConsultorios(req, res) {
    try {
      const pool = await getConnection('sur');
      const result = await pool.request()
        .input('centroVal', sql.Int, 2)
        .query(queries.getConsultorios);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async addConsultorio(req, res) {
    try {
      const pool = await getConnection('sur');
      const result = await pool.request()
        .input('id_consultorio', sql.Int, req.body.id_consultorio)
        .input('numero', sql.VarChar(50), req.body.numero)
        .input('ubicacion', sql.VarChar(255), req.body.ubicacion)
        .input('centro_medico', sql.Int, 2)
        .query(queries.insertConsultorio);
      res.status(201).json(result.recordset[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};