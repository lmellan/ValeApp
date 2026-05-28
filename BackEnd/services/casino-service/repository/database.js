const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.CASINO_DB_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.CASINO_DB_PORT || process.env.DB_PORT || 15434),
    database: process.env.CASINO_DB_NAME || 'casino_db',
    user: process.env.CASINO_DB_USER || 'casino_user',
    password: process.env.CASINO_DB_PASSWORD || 'casino_pass'
});

module.exports = pool;
