const { getConnection, sql } = require('../config/db');

const queries = {
    getCitas: `
    SELECT id_cita, id_consultorio, id_paciente, fecha, motivo, centro_medico 
    FROM dbo.cita WHERE centro_medico = @centroVal`, 
    insertCita: `
        SET XACT_ABORT ON;
        INSERT INTO dbo.cita (id_cita, id_consultorio, id_paciente, fecha, motivo, centro_medico)
        VALUES (@id_cita, @id_consultorio, @id_paciente, @fecha, @motivo, @centro_medico);`,
    deleteCita: `
        SET XACT_ABORT ON;
        DELETE FROM dbo.cita 
        WHERE id_cita = @id_cita AND centro_medico = @centro_medico;
    `,
};

module.exports = {
    async getCitas(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('centroVal', sql.Int, 0)
                .query(queries.getCitas);
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async addCita(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('id_cita', sql.Int, req.body.id_cita)
                .input('id_consultorio', sql.Int, req.body.id_consultorio)
                .input('id_paciente', sql.Int, req.body.id_paciente)
                .input('fecha', sql.DateTime, req.body.fecha)
                .input('motivo', sql.VarChar(255), req.body.motivo)
                .input('centro_medico', sql.Int, 0)
                .query(queries.insertCita);
            res.status(201).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteCita(req, res) {
        try {
            const pool = await getConnection('norte');
            await pool.request()
                .input('id_cita', sql.Int, req.params.id)
                .input('centro_medico', sql.Int, 0)
                .query(queries.deleteCita);
            res.json({ message: 'Cita eliminada exitosamente' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};