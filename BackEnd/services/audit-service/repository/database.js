const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.AUDIT_DB_HOST || process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.AUDIT_DB_PORT || process.env.DB_PORT || 15434),
    database: process.env.AUDIT_DB_NAME || 'audit_db',
    user: process.env.AUDIT_DB_USER || 'audit_user',
    password: process.env.AUDIT_DB_PASSWORD || 'audit_pass'
});

module.exports = pool;
