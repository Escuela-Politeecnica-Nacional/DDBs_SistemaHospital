const { getConnection, sql } = require('../config/db');
const queries = require('../queries/queries_v2');

function sedeToCentroId(sede) {
  if (!sede) return 1;
  const s = sede.toLowerCase();
  if (s === 'centro') return 1;
  if (s === 'sur') return 2;
  return 0;
}

// Obtener todos los doctores de una sede
async function getDoctores(req, res) {
  const sede = req.query.sede || 'centro';
  const filterRaw = (req.query.filter || sede).toString().toLowerCase();
  const seats = ['norte', 'centro', 'sur'];
  try {
    if (filterRaw === 'todos' || filterRaw === 'all') {
      const promises = seats.map(async (s) => {
        const pool = await getConnection(s);
        const sqlText = queries[s].getDoctores;
        const result = await pool.request()
          .input('centroVal', sql.Int, sedeToCentroId(s))
          .query(sqlText);
        console.log(`getDoctores: fetched ${result.recordset.length} rows (sede=${s})`);
        return result.recordset.map(r => ({ ...r, _sede: s }));
      });
      const parts = await Promise.all(promises);
      res.json(parts.flat());
      return;
    }
    const target = seats.includes(filterRaw) ? filterRaw : sede;
    const pool = await getConnection(target);

    // helper to execute with centroVal
    const tryQuery = async (sqlString) => await pool.request().input('centroVal', sql.Int, sedeToCentroId(target)).query(sqlString);

    // Try configured query first
    const sqlText = queries[target] && queries[target].getDoctores ? queries[target].getDoctores : null;
    if (sqlText) {
      try {
        const result = await tryQuery(sqlText);
        console.log(`getDoctores: fetched ${result.recordset.length} rows (target=${target}, requestedBy=${sede})`);
        return res.json(result.recordset.map(r => ({ ...r, _sede: target })));
      } catch (primaryErr) {
        console.warn(`getDoctores: primary query failed for target='${target}':`, primaryErr && primaryErr.message ? primaryErr.message : primaryErr);
      }
    }

    // Fallbacks: suffixed table then base table
    const suffix = target.toUpperCase();
    const candidates = [`dbo.doctor_${suffix}`, 'dbo.doctor'];
    for (const tbl of candidates) {
      const isSuffixed = tbl.toUpperCase().includes(`_${suffix}`);
      const where = isSuffixed ? '' : 'WHERE centro_medico = @centroVal';
      const q = `SELECT * FROM ${tbl} ${where}`;
      try {
        const r = await tryQuery(q);
        console.log(`getDoctores: fallback succeeded using ${tbl} (rows=${r.recordset.length})`);
        return res.json(r.recordset.map(rr => ({ ...rr, _sede: target })));
      } catch (e) {
        console.warn(`getDoctores: fallback ${tbl} failed:`, e && e.message ? e.message : e);
      }
    }

    return res.status(500).json({ error: `No suitable doctor table found for target '${target}'` });
  } catch (err) {
    console.error('getDoctores error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Agregar doctor
async function addDoctor(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { nombre, apellido, id_especialidad } = req.body;
  console.log(`addDoctor: incoming (sede=${sede}) body=`, req.body);
  try {
    const pool = await getConnection(sede);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      // compute or use provided id_doctor
      let id_doctor = req.body.id_doctor || req.body.id || null;
      const suf = sede.toUpperCase() === 'CENTRO' ? 'CENTRO' : (sede.toLowerCase() === 'sur' ? 'SUR' : 'NORTE');
      const tableName = `dbo.doctor_${suf}`;
      if (!id_doctor) {
        const r = await new sql.Request(transaction).query(`SELECT ISNULL(MAX(id_doctor),0)+1 AS nextId FROM ${tableName}`);
        id_doctor = r.recordset && r.recordset[0] && r.recordset[0].nextId ? r.recordset[0].nextId : 1;
        console.log('addDoctor: computed id_doctor=', id_doctor);
      }
      const idEspVal = id_especialidad ? Number(id_especialidad) : null;
      console.log('addDoctor: using id_especialidad=', idEspVal, 'centro_medico=', centroVal, 'id_doctor=', id_doctor);
      const result = await new sql.Request(transaction)
        .input('id_doctor', sql.Int, id_doctor)
        .input('nombre', sql.VarChar(100), nombre)
        .input('apellido', sql.VarChar(100), apellido)
        .input('id_especialidad', sql.Int, idEspVal)
        .input('centro_medico', sql.Int, centroVal)
        .query(queries[sede].insertDoctor);
      await transaction.commit();
      res.status(201).json(result.recordset[0]);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('addDoctor error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Editar doctor
async function editDoctor(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id } = req.params;
  const { nombre, apellido, id_especialidad } = req.body;
  try {
    const pool = await getConnection(sede);
    const suf = sede.toUpperCase() === 'CENTRO' ? 'CENTRO' : (sede.toLowerCase() === 'sur' ? 'SUR' : 'NORTE');
    const tableName = `dbo.doctor_${suf}`;
    await pool.request()
      .input('id_doctor', sql.Int, id)
      .input('nombre', sql.VarChar(100), nombre)
      .input('apellido', sql.VarChar(100), apellido)
      .input('id_especialidad', sql.Int, id_especialidad)
      .input('centroVal', sql.Int, centroVal)
      .query(`UPDATE ${tableName} SET nombre=@nombre, apellido=@apellido, id_especialidad=@id_especialidad WHERE id_doctor=@id_doctor AND centro_medico=@centroVal`);
    res.json({ message: 'Doctor actualizado' });
  } catch (err) {
    console.error('editDoctor error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Eliminar doctor
async function deleteDoctor(req, res) {
  const sede = req.query.sede || 'centro';
  const centroVal = sedeToCentroId(sede);
  const { id } = req.params;
  try {
    const pool = await getConnection(sede);
    const suf = sede.toUpperCase() === 'CENTRO' ? 'CENTRO' : (sede.toLowerCase() === 'sur' ? 'SUR' : 'NORTE');
    const tableName = `dbo.doctor_${suf}`;
    await pool.request()
      .input('id_doctor', sql.Int, id)
      .input('centroVal', sql.Int, centroVal)
      .query(`DELETE FROM ${tableName} WHERE id_doctor=@id_doctor AND centro_medico=@centroVal`);
    res.json({ message: 'Doctor eliminado' });
  } catch (err) {
    console.error('deleteDoctor error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDoctores,
  addDoctor,
  editDoctor,
  deleteDoctor,
};
