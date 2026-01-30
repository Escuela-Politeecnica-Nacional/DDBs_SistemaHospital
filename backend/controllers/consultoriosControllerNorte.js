const { getConnection, sql } = require('../config/db');

const queries = {
    getConsultorios: `
        SELECT id_consultorio, numero, ubicacion, centro_medico 
        FROM dbo.consultorio WHERE centro_medico = @centroVal`,
    insertConsultorio: `
        SET XACT_ABORT ON;
        INSERT INTO dbo.consultorio (id_consultorio, numero, ubicacion, centro_medico)
        VALUES (@id_consultorio, @numero, @ubicacion, @centro_medico);`,
    updateConsultorio: `
        SET XACT_ABORT ON;
        UPDATE dbo.consultorio
        SET numero = @numero,
            ubicacion = @ubicacion
        WHERE id_consultorio = @id_consultorio AND centro_medico = @centro_medico;
    `,
};

module.exports = {
    async getConsultorios(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('centroVal', sql.Int, 0)
                .query(queries.getConsultorios);
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async addConsultorio(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('id_consultorio', sql.Int, req.body.id_consultorio)
                .input('numero', sql.VarChar(50), req.body.numero)
                .input('ubicacion', sql.VarChar(255), req.body.ubicacion)
                .input('centro_medico', sql.Int, 0)
                .query(queries.insertConsultorio);
            res.status(201).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateConsultorio(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('id_consultorio', sql.Int, req.body.id_consultorio)
                .input('numero', sql.VarChar(50), req.body.numero)
                .input('ubicacion', sql.VarChar(255), req.body.ubicacion)
                .input('centro_medico', sql.Int, 0)
                .query(queries.updateConsultorio);
            res.status(201).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};