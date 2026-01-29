const { getConnection, sql } = require('../config/db');
const queries = require('../queries/queries_v2');

// Helper: map sede to centro_medico numeric id
function sedeToCentroId(sede) {
  if (!sede) return 1; // default to centro
  const s = sede.toLowerCase();
  if (s === 'centro') return 1;
  if (s === 'sur') return 2;
  return 0; // norte
}

// Obtener todos los pacientes de una sede
async function getPacientes(req, res) {
  const sede = req.query.sede || 'centro';
  const filterRaw = (req.query.filter || sede).toString().toLowerCase();
  const seats = ['norte', 'centro', 'sur'];
  try {
    if (filterRaw === 'todos' || filterRaw === 'all') {
      // Query all seats and combine
      const promises = seats.map(async (s) => {
        const pool = await getConnection(s);
        const sqlText = queries[s].getPacientes;
        const result = await pool.request()
          .input('centroVal', sql.Int, sedeToCentroId(s))
          .query(sqlText);
        console.log(`getPacientes: fetched ${result.recordset.length} rows from DB (sede=${s})`);
        return result.recordset.map(r => ({ ...r, _sede: s }));
      });
      const parts = await Promise.all(promises);
      const combined = parts.flat();
      res.json(combined);
      return;
    }

    const target = seats.includes(filterRaw) ? filterRaw : sede;
    const pool = await getConnection(target);
    const sqlText = queries[target].getPacientes;
    const result = await pool.request()
      .input('centroVal', sql.Int, sedeToCentroId(target))
      .query(sqlText);
    console.log(`getPacientes: fetched ${result.recordset.length} rows from DB (target=${target}, requestedBy=${sede})`);
    res.json(result.recordset.map(r => ({ ...r, _sede: target })));
  } catch (err) {
    console.error('getPacientes error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

// Agregar paciente (inserta en paciente_info y paciente_detalle_CENTRO)
async function addPaciente(req, res) {
  const sede = req.query.sede || 'centro';
  const { id_paciente, cedula, centro_medico, nombre, apellido, fechaNacimiento, genero } = req.body;
  try {
    const pool = await getConnection(sede);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      // Usar id_paciente provisto en el body; si no viene, generar como antes
      let newId = id_paciente;
      if (!newId) {
        const idResult = await transaction.request().query('SELECT MAX(id_paciente) AS maxId FROM paciente_info');
        let maxId = idResult.recordset[0].maxId;
        if (!maxId || maxId < 69) {
          newId = 70;
        } else {
          newId = maxId + 1;
        }
      }

      // Normalizar y validar datos
      let gen = (genero || '').toString().toUpperCase();
      if (gen && gen !== 'F' && gen !== 'M') gen = '';
      // Force centro_medico according to the selected sede (do not trust client)
      const centroVal = sedeToCentroId(sede);
      const fechaDate = fechaNacimiento ? new Date(fechaNacimiento) : null;

      // Insertar en paciente_info usando Request con tipos (igual que el script de prueba)
      await new sql.Request(transaction)
        .input('id_paciente', sql.Int, Number(newId))
        .input('cedula', sql.VarChar(50), cedula)
        .input('centro_medico', sql.Int, centroVal)
        .query(queries[sede].insertPacienteInfo);

      // Insertar en paciente_detalle_CENTRO usando Request con tipos (igual que el script de prueba)
      await new sql.Request(transaction)
        .input('id_paciente', sql.Int, Number(newId))
        .input('nombre', sql.VarChar(100), nombre)
        .input('apellido', sql.VarChar(100), apellido)
        .input('fecha_nacimiento', sql.Date, fechaDate)
        .input('genero', sql.Char(1), gen)
        .input('centro_medico', sql.Int, centroVal)
        .query(queries[sede].insertPacienteDetalle);

      await transaction.commit();
      res.status(201).json({ id_paciente: newId, cedula, centro_medico: centroVal, nombre, apellido, fechaNacimiento, genero: gen });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('addPaciente error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}

// Editar paciente
async function editPaciente(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  const { nombre, apellido, fechaNacimiento, genero } = req.body;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_paciente', id)
      .input('nombre', nombre)
      .input('apellido', apellido)
      .input('fecha_nacimiento', fechaNacimiento)
      .input('genero', genero)
      .input('centroVal', sedeToCentroId(sede))
      .query('UPDATE paciente_detalle_CENTRO SET nombre=@nombre, apellido=@apellido, fecha_nacimiento=@fecha_nacimiento, genero=@genero WHERE id_paciente=@id_paciente AND centro_medico=@centroVal');
    res.json({ message: 'Paciente actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Eliminar paciente
async function deletePaciente(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    await pool.request()
      .input('id_paciente', id)
      .input('centroVal', sedeToCentroId(sede))
      .query('DELETE FROM paciente_detalle_CENTRO WHERE id_paciente=@id_paciente AND centro_medico=@centroVal');
    res.json({ message: 'Paciente eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPacientes,
  addPaciente,
  editPaciente,
  deletePaciente,
};
