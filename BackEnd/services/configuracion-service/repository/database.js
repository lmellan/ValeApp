const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.CONFIGURACION_DB_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.CONFIGURACION_DB_PORT || process.env.DB_PORT || 15434),
    database: process.env.CONFIGURACION_DB_NAME || 'configuracion_db',
    user: process.env.CONFIGURACION_DB_USER || 'configuracion_user',
    password: process.env.CONFIGURACION_DB_PASSWORD || 'configuracion_pass'
});

module.exports = pool;
