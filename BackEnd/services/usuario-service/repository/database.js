const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.USUARIO_DB_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.USUARIO_DB_PORT || process.env.DB_PORT || 15434),
    database: process.env.USUARIO_DB_NAME || 'usuario_db',
    user: process.env.USUARIO_DB_USER || 'usuario_user',
    password: process.env.USUARIO_DB_PASSWORD || 'usuario_pass'
});

module.exports = pool;
