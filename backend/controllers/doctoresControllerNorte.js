const { getConnection, sql } = require('../config/db');

const queries = {
    getDoctores: `
        SELECT id_doctor, nombre, apellido, id_especialidad, centro_medico 
        FROM dbo.doctor WHERE centro_medico = @centroVal
        `,
    insertDoctor: `
        SET XACT_ABORT ON;
        INSERT INTO dbo.doctor (id_doctor, nombre, apellido, id_especialidad, centro_medico)
        VALUES (@id_doctor, @nombre, @apellido, @id_especialidad, @centro_medico);`,
    deleteDoctor: `
        SET XACT_ABORT ON;
        DELETE FROM dbo.doctor 
        WHERE id_doctor = @id_doctor AND centro_medico = @centro_medico;
    `,
};

module.exports = {
    async getDoctores(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('centroVal', sql.Int, 0)
                .query(queries.getDoctores);
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async addDoctor(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('id_doctor', sql.Int, req.body.id_doctor)
                .input('nombre', sql.VarChar(100), req.body.nombre)
                .input('apellido', sql.VarChar(100), req.body.apellido)
                .input('id_especialidad', sql.Int, req.body.id_especialidad)
                .input('centro_medico', sql.Int, 0)
                .query(queries.insertDoctor);
            res.status(201).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteDoctor(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('id_doctor', sql.Int, req.body.id_doctor)
                .input('centro_medico', sql.Int, 0)
                .query(queries.deleteDoctor);
            res.status(200).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};