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
      // Query all seats and combine, tolerate failures per node
      const promises = seats.map(async (s) => {
        try {
          const pool = await getConnection(s);
          const sqlText = queries[s].getPacientes;
          const result = await pool.request()
            .input('centroVal', sql.Int, sedeToCentroId(s))
            .query(sqlText);
          console.log(`getPacientes: fetched ${result.recordset.length} rows from DB (sede=${s})`);
          return result.recordset.map(r => ({ ...r, _sede: s }));
        } catch (errSeat) {
          console.error(`getPacientes: error fetching from sede='${s}':`, errSeat && errSeat.message ? errSeat.message : errSeat);
          return [];
        }
      });
      const parts = await Promise.all(promises);
      const combined = parts.flat();
      res.json(combined);
      return;
    }

    const target = seats.includes(filterRaw) ? filterRaw : sede;
    console.log(`getPacientes: requestedBy=${sede} filter=${filterRaw} -> target=${target}`);
    let pool;
    try {
      pool = await getConnection(target);
    } catch (connErr) {
      console.error(`getPacientes: failed to connect to target='${target}':`, connErr && connErr.message ? connErr.message : connErr);
      return res.status(502).json({ error: `DB connection failed for target '${target}': ${connErr.message || connErr}` });
    }
    const sqlText = queries[target] && queries[target].getPacientes ? queries[target].getPacientes : null;

    // helper to execute a prepared query with centroVal
    const tryQuery = async (pool, sqlString) => {
      return await pool.request().input('centroVal', sql.Int, sedeToCentroId(target)).query(sqlString);
    };

    if (sqlText) {
      try {
        const result = await tryQuery(pool, sqlText);
        console.log(`getPacientes: fetched ${result.recordset.length} rows from DB (target=${target}, requestedBy=${sede})`);
        return res.json(result.recordset.map(r => ({ ...r, _sede: target })));
      } catch (primaryErr) {
        console.error(`getPacientes: primary query failed for target='${target}':`, primaryErr && primaryErr.message ? primaryErr.message : primaryErr);
        // continue to fallbacks
      }
    }

    // Build candidate detalle table names (suffixed and base)
    const suffix = target.toUpperCase();
    const candidates = [`dbo.paciente_detalle_${suffix}`, 'dbo.paciente_detalle'];

    // First, try JOINing paciente_detalle with paciente_info for richer rows
    for (const tbl of candidates) {
      // If table is suffixed (per-sede physical table), don't force centro_medico filter
      const isSuffixed = tbl.toUpperCase().includes(`_${suffix}`);
      const whereClause = isSuffixed ? '' : 'WHERE pd.centro_medico = @centroVal';
      const joinSql = `SELECT pi.id_paciente, pi.cedula, pd.nombre, pd.apellido, pd.fecha_nacimiento, pd.genero, pd.centro_medico FROM ${tbl} pd JOIN dbo.paciente_info pi ON pd.id_paciente = pi.id_paciente ${whereClause}`;
      try {
        const r = await tryQuery(pool, joinSql);
        console.log(`getPacientes: fallback join succeeded using table ${tbl} (rows=${r.recordset.length})`);
        return res.json(r.recordset.map(rr => ({ ...rr, _sede: target })));
      } catch (joinErr) {
        console.warn(`getPacientes: join with ${tbl} failed:`, joinErr && joinErr.message ? joinErr.message : joinErr);
      }
    }

    // Next, try simple selects from detalle-only tables
    for (const tbl of candidates) {
      const isSuffixed = tbl.toUpperCase().includes(`_${suffix}`);
      const whereClause = isSuffixed ? '' : 'WHERE centro_medico = @centroVal';
      const simpleSql = `SELECT id_paciente, nombre, apellido, fecha_nacimiento, genero, centro_medico, cedula FROM ${tbl} ${whereClause}`;
      try {
        const r2 = await tryQuery(pool, simpleSql);
        console.log(`getPacientes: fallback simple select succeeded using table ${tbl} (rows=${r2.recordset.length})`);
        const mapped = r2.recordset.map(rr => ({ id_paciente: rr.id_paciente, cedula: rr.cedula || '', nombre: rr.nombre, apellido: rr.apellido, fecha_nacimiento: rr.fecha_nacimiento, genero: rr.genero, centro_medico: rr.centro_medico, _sede: target }));
        return res.json(mapped);
      } catch (simpleErr) {
        console.warn(`getPacientes: simple select from ${tbl} failed:`, simpleErr && simpleErr.message ? simpleErr.message : simpleErr);
      }
    }

    // Last-resort: return rows from paciente_info if available (basic id + cedula + centro)
    try {
      const infoSql = `SELECT id_paciente, cedula, centro_medico FROM dbo.paciente_info WHERE centro_medico = @centroVal`;
      const ri = await tryQuery(pool, infoSql);
      console.log(`getPacientes: paciente_info fallback returned ${ri.recordset.length} rows for target=${target}`);
      const mappedInfo = ri.recordset.map(rr => ({ id_paciente: rr.id_paciente, cedula: rr.cedula || '', nombre: '', apellido: '', fecha_nacimiento: null, genero: '', centro_medico: rr.centro_medico, _sede: target }));
      return res.json(mappedInfo);
    } catch (infoErr) {
      console.error(`getPacientes: paciente_info fallback failed for target='${target}':`, infoErr && infoErr.message ? infoErr.message : infoErr);
    }

    return res.status(500).json({ error: `No suitable paciente table/query found for target '${target}'` });
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
    const detalleTable = sede === 'centro' ? 'paciente_detalle_CENTRO' : 'paciente_detalle';
    await pool.request()
      .input('id_paciente', id)
      .input('nombre', nombre)
      .input('apellido', apellido)
      .input('fecha_nacimiento', fechaNacimiento)
      .input('genero', genero)
      .input('centroVal', sedeToCentroId(sede))
      .query(`UPDATE ${detalleTable} SET nombre=@nombre, apellido=@apellido, fecha_nacimiento=@fecha_nacimiento, genero=@genero WHERE id_paciente=@id_paciente AND centro_medico=@centroVal`);
    res.json({ message: 'Paciente actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Obtener paciente por id
async function getPacienteById(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    const result = await pool.request()
      .input('id_paciente', sql.Int, Number(id))
      .input('centroVal', sql.Int, sedeToCentroId(sede))
      .query(queries[sede].getPacienteById);
    if (!result.recordset || result.recordset.length === 0) {
      res.status(404).json({ error: 'Paciente no encontrado' });
      return;
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('getPacienteById error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Eliminar paciente
async function deletePaciente(req, res) {
  const sede = req.query.sede || 'centro';
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    const detalleTable = sede === 'centro' ? 'paciente_detalle_CENTRO' : 'paciente_detalle';
    await pool.request()
      .input('id_paciente', id)
      .input('centroVal', sedeToCentroId(sede))
      .query(`DELETE FROM ${detalleTable} WHERE id_paciente=@id_paciente AND centro_medico=@centroVal`);
    res.json({ message: 'Paciente eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getPacientes,
  addPaciente,
  editPaciente,
  getPacienteById,
  deletePaciente,
};
