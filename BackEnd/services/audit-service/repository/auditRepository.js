const pool = require('./database');

const mapLog = (row) => row && ({
    id: row.id_log,
    evento: row.evento,
    detalle: row.detalle,
    timestamp: row.timestamp
});

const registrar = async (log) => {
    const result = await pool.query(
        `INSERT INTO audit_logs (evento, detalle, timestamp)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [log.evento, log.detalle, log.timestamp]
    );
    return mapLog(result.rows[0]);
};

const listar = async () => {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC, id_log DESC');
    return result.rows.map(mapLog);
};

module.exports = { registrar, listar };
