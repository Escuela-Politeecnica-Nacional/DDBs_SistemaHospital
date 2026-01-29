const { getConnection } = require('../config/db');

const sedes = ['centro', 'sur', 'norte'];

(async () => {
  for (const sede of sedes) {
    try {
      console.log(`Probando conexión con la sede: ${sede}`);
      const pool = await getConnection(sede);
      await pool.request().query('SELECT 1 as test');
      console.log(`Conexión exitosa a la base de datos ${sede.toUpperCase()}`);
    } catch (err) {
      console.error(`Error de conexión con la sede ${sede.toUpperCase()}:`, err.message);
    }
  }
  process.exit(0);
})();
