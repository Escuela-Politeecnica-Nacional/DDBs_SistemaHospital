const base = require('./pacientesController');
const { getConnection, sql } = require('../config/db');

const queries = {
    getPacientes: `
    SELECT id_paciente, cedula, nombre, apellido, fecha_nacimiento, genero, centro_medico
    FROM dbo.paciente
    WHERE centro_medico = 0;
    `,
    getPacienteById: `
        SELECT id_paciente, cedula, nombre, apellido, fecha_nacimiento, genero, centro_medico
        FROM dbo.paciente
        WHERE centro_medico = @centroVal AND id_paciente = @id_paciente;
    `,
    insertPacienteInfo: `
        INSERT INTO dbo.paciente_info (id_paciente, cedula, centro_medico)
        VALUES (@id_paciente, @cedula, @centro_medico)
    `,
    insertPacienteDetalle: `
        INSERT INTO dbo.paciente_detalle (id_paciente, nombre, apellido, fecha_nacimiento, genero, centro_medico)
        VALUES (@id_paciente, @nombre, @apellido, @fecha_nacimiento, @genero, @centro_medico)
    `,
};

module.exports = {
    async getPacientes(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('centroVal', sql.Int, 0)
                .query(queries.getPacientes);
            const pacientes = result.recordset.map((paciente) => ({
                ...paciente,
                genero: paciente.genero || 'N/A', // Ensure genero is included
            }));
            res.json(pacientes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async addPaciente(req, res) {
        try {
            const pool = await getConnection('norte');
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            try {
                await new sql.Request(transaction)
                    .input('id_paciente', sql.Int, req.body.id_paciente)
                    .input('cedula', sql.VarChar(50), req.body.cedula)
                    .input('centro_medico', sql.Int, 0)
                    .query(queries.insertPacienteInfo);

                await new sql.Request(transaction)
                    .input('id_paciente', sql.Int, req.body.id_paciente)
                    .input('nombre', sql.VarChar(100), req.body.nombre)
                    .input('apellido', sql.VarChar(100), req.body.apellido)
                    .input('fecha_nacimiento', sql.Date, req.body.fecha_nacimiento)
                    .input('genero', sql.Char(1), req.body.genero)
                    .input('centro_medico', sql.Int, 0)
                    .query(queries.insertPacienteDetalle);

                await transaction.commit();
                res.status(201).json({ message: 'Paciente agregado exitosamente' });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async editPaciente(req, res) {
        try {
            const pool = await getConnection('norte');
            await pool.request()
                .input('id_paciente', sql.Int, req.params.id)
                .input('nombre', sql.VarChar(100), req.body.nombre)
                .input('apellido', sql.VarChar(100), req.body.apellido)
                .input('fecha_nacimiento', sql.Date, req.body.fecha_nacimiento)
                .input('genero', sql.Char(1), req.body.genero)
                .input('centro_medico', sql.Int, 0)
                .query(`UPDATE dbo.paciente_detalle SET nombre=@nombre, apellido=@apellido, fecha_nacimiento=@fecha_nacimiento, genero=@genero WHERE id_paciente=@id_paciente AND centro_medico=@centro_medico`);
            res.json({ message: 'Paciente actualizado' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async deletePaciente(req, res) {
        try {
            const pool = await getConnection('norte');
            await pool.request()
                .input('id_paciente', sql.Int, req.params.id)
                .input('centro_medico', sql.Int, 0)
                .query(`DELETE FROM dbo.paciente_detalle WHERE id_paciente=@id_paciente AND centro_medico=@centro_medico`);
            res.json({ message: 'Paciente eliminado' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getPacienteById(req, res) {
        try {
            const pool = await getConnection('norte');
            const result = await pool.request()
                .input('id_paciente', sql.Int, req.params.id)
                .input('centro_medico', sql.Int, 0)
                .query(queries.getPacienteById);
            if (result.recordset.length === 0) {
                res.status(404).json({ error: 'Paciente no encontrado' });
                return;
            }
            res.json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
