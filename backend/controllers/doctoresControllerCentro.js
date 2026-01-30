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
     BEGIN DISTRIBUTED TRANSACTION;
     SET XACT_ABORT ON;
     DELETE FROM dbo.doctor 
     WHERE id_doctor = @id_doctor AND centro_medico = @centro_medico;
     COMMIT TRANSACTION;
     `,
};

module.exports = {
    async getDoctores(req, res) {
        try {
            const pool = await getConnection('centro');
            const result = await pool.request()
                .input('centroVal', sql.Int, 1)
                .query(queries.getDoctores);
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async addDoctor(req, res) {
        try {
            const pool = await getConnection('centro');
            const result = await pool.request()
                .input('id_doctor', sql.Int, req.body.id_doctor)
                .input('nombre', sql.VarChar(100), req.body.nombre)
                .input('apellido', sql.VarChar(100), req.body.apellido)
                .input('id_especialidad', sql.Int, req.body.id_especialidad)
                .input('centro_medico', sql.Int, 1)
                .query(queries.insertDoctor);
            res.status(201).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteDoctor(req, res) {
        try {
            const { sede } = req.query; // Extract 'sede' from query parameters

            if (!sede) {
                return res.status(400).json({ error: "Missing 'sede' parameter" });
            }

            // Registrar el valor y tipo de 'sede' para depuración
            console.log("Valor recibido para 'sede':", sede, "Tipo:", typeof sede);

            // Convertir el valor de 'sede' a un número
            const centroMedico = parseInt(sede, 10);

            if (isNaN(centroMedico)) {
                console.error("Error: El parámetro 'sede' no es un número válido.");
                return res.status(400).json({ error: "El parámetro 'sede' debe ser un número válido." });
            }

            // Convertir el parámetro id a entero
            const idDoctor = parseInt(req.params.id, 10);
            if (isNaN(idDoctor)) {
                return res.status(400).json({ error: "El parámetro 'id' debe ser un número válido." });
            }

            const pool = await getConnection('centro');
            const result = await pool.request()
                .input('id_doctor', sql.Int, idDoctor)
                .input('centro_medico', sql.Int, centroMedico)
                .query(queries.deleteDoctor);

            console.log('Resultado DELETE:', result);
            if (result.rowsAffected[0] === 0) {
                console.error('No se eliminó ningún registro. id_doctor:', idDoctor, 'centro_medico:', centroMedico);
                return res.status(404).json({ error: "Doctor no encontrado o no pertenece al centro especificado" });
            }
            res.status(200).json({ message: "Doctor deleted successfully" });
        } catch (err) {
            console.error('ERROR EN DELETE DOCTOR:', err);
            res.status(500).json({ error: err.message, stack: err.stack });
        }
    },

    async getDoctorById(req, res) {
        try {
            const { id } = req.params; // Extraer el ID del doctor desde los parámetros de la URL
            const { sede } = req.query; // Extraer el parámetro 'sede' de la consulta

            if (!sede) {
                return res.status(400).json({ error: "Falta el parámetro 'sede'" });
            }
            const centroMedico = parseInt(sede, 10);
            if (isNaN(centroMedico)) {
                return res.status(400).json({ error: "El parámetro 'sede' debe ser un número válido." });
            }

            const pool = await getConnection('centro');
            const result = await pool.request()
                .input('id_doctor', sql.Int, id)
                .input('centro_medico', sql.Int, centroMedico)
                .query(`
                    SELECT id_doctor, nombre, apellido, id_especialidad, centro_medico 
                    FROM dbo.doctor 
                    WHERE id_doctor = @id_doctor AND centro_medico = @centro_medico;
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: "Doctor no encontrado o no pertenece al centro especificado" });
            }

            res.status(200).json(result.recordset[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async editDoctor(req, res) {
        try {
            const { id } = req.params; // Extraer el ID del doctor desde los parámetros de la URL
            const { nombre, apellido, id_especialidad, sede } = req.body; // Extraer los datos del cuerpo de la solicitud

            if (!sede) {
                return res.status(400).json({ error: "Falta el parámetro 'sede'" });
            }
            const centroMedico = parseInt(sede, 10);
            if (isNaN(centroMedico)) {
                return res.status(400).json({ error: "El parámetro 'sede' debe ser un número válido." });
            }

            const pool = await getConnection('centro');
            const result = await pool.request()
                .input('id_doctor', sql.Int, id)
                .input('nombre', sql.VarChar(100), nombre)
                .input('apellido', sql.VarChar(100), apellido)
                .input('id_especialidad', sql.Int, id_especialidad)
                .input('centro_medico', sql.Int, centroMedico)
                .query(`
                    UPDATE dbo.doctor
                    SET nombre = @nombre, apellido = @apellido, id_especialidad = @id_especialidad
                    WHERE id_doctor = @id_doctor AND centro_medico = @centro_medico;
                `);

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ error: "Doctor no encontrado o no pertenece al centro especificado" });
            }

            res.status(200).json({ message: "Doctor actualizado exitosamente" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};