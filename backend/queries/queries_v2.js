/*
  Centralized SQL queries file (v2)
  - Use this file; controllers will import queries_v2.
  - Sections marked by comments: QUERY CENTRO / QUERY NORTE / QUERY SUR
*/

const SUFFIX = {
    centro: 'CENTRO',
    norte: 'NORTE',
    sur: 'SUR',
};

function table(tableBase, sede) {
    const suffix = SUFFIX[sede] || SUFFIX.centro;
    return `${tableBase}_${suffix}`;
}

const queries = {};

['centro', 'norte', 'sur'].forEach((sede) => {
    const q = {};

    // QUERY: get pacientes
    q.getPacientes = `
    SELECT pi.id_paciente, pi.cedula, pd.nombre, pd.apellido, pd.fecha_nacimiento, pd.genero, pd.centro_medico
    FROM dbo.${table('paciente_detalle', sede)} pd
    JOIN dbo.paciente_info pi ON pd.id_paciente = pi.id_paciente
    WHERE pd.centro_medico = @centroVal
  `;

    // QUERY: get paciente por id
    q.getPacienteById = `
    SELECT pi.id_paciente, pi.cedula, pd.nombre, pd.apellido, pd.fecha_nacimiento, pd.genero
    FROM dbo.${table('paciente_detalle', sede)} pd
    JOIN dbo.paciente_info pi ON pd.id_paciente = pi.id_paciente
    WHERE pd.id_paciente = @id_paciente AND pd.centro_medico = @centroVal
  `;

    // QUERY: insert paciente_info
    q.insertPacienteInfo = `
    INSERT INTO dbo.paciente_info (id_paciente, cedula, centro_medico)
    VALUES (@id_paciente, @cedula, @centro_medico)
  `;

    // QUERY: insert paciente_detalle
    q.insertPacienteDetalle = `
    INSERT INTO dbo.${table('paciente_detalle', sede)} (id_paciente, nombre, apellido, fecha_nacimiento, genero, centro_medico)
    VALUES (@id_paciente, @nombre, @apellido, @fecha_nacimiento, @genero, @centro_medico)
  `;

    // QUERY: get historiales
    q.getHistorial = `SELECT * FROM dbo.${table('historialmedico', sede)} WHERE centro_medico = @centroVal`;

    // QUERY: insert historial
    q.insertHistorial = `
    INSERT INTO dbo.${table('historialmedico', sede)} (id_cita, observaciones, diagnostico, tratamiento, fecha_registro, centro_medico)
    OUTPUT INSERTED.*
    VALUES (@id_cita, @observaciones, @diagnostico, @tratamiento, @fecha_registro, @centroVal)
  `;

    // QUERY: get citas
    q.getCitas = `SELECT * FROM dbo.${table('cita', sede)} WHERE centro_medico = @centroVal`;

    // QUERY: insert cita
    q.insertCita = `
    INSERT INTO dbo.${table('cita', sede)} (id_consultorio, id_paciente, fecha, motivo, centro_medico)
    OUTPUT INSERTED.*
    VALUES (@id_consultorio, @id_paciente, @fecha, @motivo, @centro_medico)
  `;

    // QUERY: consultorios
    q.getConsultorios = `SELECT * FROM dbo.${table('consultorio', sede)} WHERE centro_medico = @centroVal`;
    q.insertConsultorio = `INSERT INTO dbo.${table('consultorio', sede)} (numero, ubicacion, centro_medico) OUTPUT INSERTED.* VALUES (@numero, @ubicacion, @centro_medico)`;

    // QUERY: doctores
    q.getDoctores = `SELECT * FROM dbo.${table('doctor', sede)} WHERE centro_medico = @centroVal`;
    q.insertDoctor = `INSERT INTO dbo.${table('doctor', sede)} (nombre, apellido, id_especialidad, centro_medico) OUTPUT INSERTED.* VALUES (@nombre, @apellido, @id_especialidad, @centro_medico)`;

    // QUERY: especialidades (shared table, no suffix)
    q.getEspecialidades = `SELECT * FROM dbo.especialidad`;
    // Some deployments require providing id_especialidad manually (no IDENTITY).
    // Insert accepts id_especialidad when provided, otherwise controller will compute one.
    q.insertEspecialidad = `INSERT INTO dbo.especialidad (id_especialidad, nombre) OUTPUT INSERTED.* VALUES (@id_especialidad, @nombre)`;

    // QUERY: centros (shared table, filter by sede column)
    q.getCentros = `SELECT id_centro_medico, nombre, direccion, telefono, email, sede FROM dbo.centros_medicos`;

    queries[sede] = q;
});

module.exports = queries;
