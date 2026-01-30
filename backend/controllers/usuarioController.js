const { getConnection, sql } = require('../config/db');

const queries = {
    getDoctores: `
        SELECT id_doctor, nombre, apellido, id_especialidad, centro_medico
        FROM dbo.doctor
    `,
    getPacientes: `
        SELECT id_paciente, cedula, nombre, apellido, fecha_nacimiento, genero, centro_medico
        FROM dbo.paciente
    `,
    getEspecialidades: `
        SELECT id_especialidad, nombre
        FROM dbo.especialidad
    `,
    getHistoriales: `
        SELECT id_historial, id_cita, observaciones, diagnostico, tratamiento, fecha_registro, centro_medico
        FROM dbo.historialmedico
    `,
    getConsultorios: `
        SELECT id_consultorio, numero, ubicacion, centro_medico
        FROM dbo.consultorio
    `,
    getCitas: `
        SELECT id_cita, id_consultorio, id_paciente, id_doctor, fecha, motivo, centro_medico
        FROM dbo.cita
    `,
    getCentros: `
        SELECT id_centro, nombre_centro, direccion, telefono
        FROM dbo.centros_medicos
    `,
};

async function getAllFromDBs(query) {
    const results = [];
    const sedes = ['centro'];
    for (const sede of sedes) {
        try {
            const pool = await getConnection(sede);
            const result = await pool.request().query(query);
            results.push(...result.recordset);
        } catch (err) {
            console.error(`Error fetching from ${sede}:`, err.message);
            // Continue with other sedes
        }
    }
    return results;
}

module.exports = {
    async getDoctores(req, res) {
        try {
            const data = await getAllFromDBs(queries.getDoctores);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getPacientes(req, res) {
        try {
            const data = await getAllFromDBs(queries.getPacientes);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getEspecialidades(req, res) {
        try {
            const data = await getAllFromDBs(queries.getEspecialidades);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getHistoriales(req, res) {
        try {
            const data = await getAllFromDBs(queries.getHistoriales);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getConsultorios(req, res) {
        try {
            const data = await getAllFromDBs(queries.getConsultorios);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getCitas(req, res) {
        try {
            const data = await getAllFromDBs(queries.getCitas);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getCentros(req, res) {
        try {
            const data = await getAllFromDBs(queries.getCentros);
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};