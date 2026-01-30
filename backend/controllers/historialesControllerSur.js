const { getConnection, sql } = require('../config/db');

const queries = {
    getHistorial: `
        SELECT id_historial, id_cita, observaciones, diagnostico, tratamiento, fecha_registro, centro_medico
        FROM dbo.historialmedico 
        WHERE centro_medico = @centroVal`,
    insertHistorial: `
        SET XACT_ABORT ON;
        INSERT INTO dbo.historialmedico (id_historial, id_cita, observaciones, diagnostico, tratamiento, fecha_registro, centro_medico)
        VALUES (@id_historial, @id_cita, @observaciones, @diagnostico, @tratamiento, @fecha_registro, @centro_medico);`,
    updateHistorial: `
        SET XACT_ABORT ON;
        UPDATE dbo.historialmedico
        SET observaciones = @observaciones,
            diagnostico = @diagnostico,
            tratamiento = @tratamiento
        WHERE id_historial = @id_historial AND centro_medico = @centro_medico;
    `,
};

module.exports = {
    async getHistorial(req, res) {
        try {
            const pool = await getConnection('sur');
            const result = await pool.request()
                .input('centroVal', sql.Int, 2)
                .query(queries.getHistorial);
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async addHistorial(req, res) {
        try {
            const pool = await getConnection('sur');
            const result = await pool.request()
                .input('id_cita', sql.Int, req.body.id_cita)
                .input('observaciones', sql.VarChar(255), req.body.observaciones)
                .input('diagnostico', sql.VarChar(255), req.body.diagnostico)
                .input('tratamiento', sql.VarChar(255), req.body.tratamiento)
                .input('fecha_registro', sql.DateTime, req.body.fecha_registro)
                .input('centroVal', sql.Int, 2)
                .query(queries.insertHistorial);
            res.status(201).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateHistorial(req, res) {
        try {
            const pool = await getConnection('sur');
            const result = await pool.request()
                .input('id_historial', sql.Int, req.body.id_historial)
                .input('observaciones', sql.VarChar(255), req.body.observaciones)
                .input('diagnostico', sql.VarChar(255), req.body.diagnostico)
                .input('tratamiento', sql.VarChar(255), req.body.tratamiento)
                .input('centro_medico', sql.Int, 2)
                .query(queries.updateHistorial);
            res.status(201).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};