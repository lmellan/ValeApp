const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.VALE_DB_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.VALE_DB_PORT || process.env.DB_PORT || 15434),
    database: process.env.VALE_DB_NAME || 'vale_db',
    user: process.env.VALE_DB_USER || 'vale_user',
    password: process.env.VALE_DB_PASSWORD || 'vale_pass'
});

module.exports = pool;
