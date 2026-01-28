const dotenv = require('dotenv');
dotenv.config();
const sql = require('mssql');

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
    const pool = await sql.connect(dbConfigs[sede]);
    return pool;
  } catch (err) {
    throw err;
  }
}

module.exports = { getConnection, sql };
