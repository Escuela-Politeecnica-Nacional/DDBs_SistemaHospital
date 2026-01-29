const { getConnection, sql } = require('../config/db');
require('dotenv').config();

async function insertarPaciente(paciente) {
  const pool = await getConnection('centro');
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Insert en paciente_info
    await new sql.Request(transaction)
      .input('id_paciente', sql.Int, paciente.id_paciente)
      .input('cedula', sql.VarChar(50), paciente.cedula)
      .input('centro_medico', sql.Int, paciente.centro_medico)
      .query(`
        INSERT INTO dbo.paciente_info (id_paciente, cedula, centro_medico)
        VALUES (@id_paciente, @cedula, @centro_medico)
      `);

    // Insert en paciente_detalle_CENTRO
    await new sql.Request(transaction)
      .input('id_paciente', sql.Int, paciente.id_paciente)
      .input('nombre', sql.VarChar(100), paciente.nombre)
      .input('apellido', sql.VarChar(100), paciente.apellido)
      .input('fecha_nacimiento', sql.Date, paciente.fecha_nacimiento)
      .input('genero', sql.Char(1), paciente.genero)
      .input('centro_medico', sql.Int, paciente.centro_medico)
      .query(`
        INSERT INTO dbo.paciente_detalle_CENTRO
          (id_paciente, nombre, apellido, fecha_nacimiento, genero, centro_medico)
        VALUES
          (@id_paciente, @nombre, @apellido, @fecha_nacimiento, @genero, @centro_medico)
      `);

    await transaction.commit();
    console.log('Paciente insertado correctamente (test script)');
  } catch (error) {
    await transaction.rollback();
    console.error('Error al insertar paciente (test script):', error);
    process.exit(1);
  } finally {
    pool && pool.close && pool.close();
  }
}

// Datos de prueba - ajusta según tu entorno
const pacientePrueba = {
  id_paciente: 999,
  cedula: '9999999999',
  centro_medico: 1,
  nombre: 'Prueba',
  apellido: 'Usuario',
  fecha_nacimiento: '1990-01-01',
  genero: 'M'
};

insertarPaciente(pacientePrueba).then(() => process.exit(0));
