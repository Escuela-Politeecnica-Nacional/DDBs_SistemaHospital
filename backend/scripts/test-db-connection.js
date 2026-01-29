const { getConnection } = require('../config/db');

(async () => {
  try {
    const pool = await getConnection('centro');
    await pool.request().query('SELECT 1 as test');
    console.log('Conexión exitosa a la base de datos CENTRO');
    process.exit(0);
  } catch (err) {
    console.error('Error de conexión:', err.message);
    process.exit(1);
  }
})();
