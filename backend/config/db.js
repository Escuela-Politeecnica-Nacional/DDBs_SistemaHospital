const path = require('path');
const dotenv = require('dotenv');
// Load backend/.env explicitly so running node from project root still finds the file
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });
const sql = require('mssql');
console.log(`env loaded from ${envPath} DB_HOST_CENTRO=${process.env.DB_HOST_CENTRO}`);

console.log('Variables de entorno cargadas:', {
  DB_HOST_CENTRO: process.env.DB_HOST_CENTRO,
  DB_USER_CENTRO: process.env.DB_USER_CENTRO,
  DB_PASS_CENTRO: process.env.DB_PASS_CENTRO,
  DB_NAME_CENTRO: process.env.DB_NAME_CENTRO,
  DB_HOST_SUR: process.env.DB_HOST_SUR,
  DB_USER_SUR: process.env.DB_USER_SUR,
  DB_PASS_SUR: process.env.DB_PASS_SUR,
  DB_NAME_SUR: process.env.DB_NAME_SUR,
  DB_HOST_NORTE: process.env.DB_HOST_NORTE,
  DB_USER_NORTE: process.env.DB_USER_NORTE,
  DB_PASS_NORTE: process.env.DB_PASS_NORTE,
  DB_NAME_NORTE: process.env.DB_NAME_NORTE,
});

const dbConfigs = {
  centro: {
    user: process.env.DB_USER_CENTRO,
    password: process.env.DB_PASS_CENTRO,
    server: process.env.DB_HOST_CENTRO,
    database: process.env.DB_NAME_CENTRO,
    
    options: {
      encrypt: false, // Cambia a true si usas Azure
      trustServerCertificate: true
    }
  },
  sur: {
    user: process.env.DB_USER_SUR,
    password: process.env.DB_PASS_SUR,
    server: process.env.DB_HOST_SUR,
    database: process.env.DB_NAME_SUR,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  norte: {
    user: process.env.DB_USER_NORTE,
    password: process.env.DB_PASS_NORTE,
    server: process.env.DB_HOST_NORTE,
    database: process.env.DB_NAME_NORTE,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  }
};

async function getConnection(sede = 'centro') {
  try {
    const cfg = dbConfigs[sede];
    if (!cfg) throw new Error(`Unknown sede '${sede}'`);
    console.log(`getConnection: connecting to sede='${sede}' server='${cfg.server}' database='${cfg.database}'`);
    const pool = await sql.connect(cfg);
    return pool;
  } catch (err) {
    throw err;
  }
}

module.exports = { getConnection, sql };
