const pool = require('./database');

const mapUsuario = (row) => row && ({
    id: row.id_usuario,
    nombre: row.nombre,
    correo: row.correo,
    rol: row.rol,
    activo: row.activo
});

const listar = async ({ rol, activo } = {}) => {
    const conditions = [];
    const values = [];

    if (rol) {
        values.push(rol);
        conditions.push(`rol = $${values.length}`);
    }
    if (activo !== undefined) {
        values.push(String(activo) === 'true');
        conditions.push(`activo = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM usuarios ${where} ORDER BY id_usuario`, values);
    return result.rows.map(mapUsuario);
};

const obtenerPorId = async (idUsuario) => {
    const result = await pool.query('SELECT * FROM usuarios WHERE id_usuario = $1', [idUsuario]);
    return mapUsuario(result.rows[0]);
};

const crear = async (datos) => {
    const result = await pool.query(
        `INSERT INTO usuarios (nombre, correo, rol, activo)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [datos.nombre, datos.correo, datos.rol, datos.activo]
    );
    return mapUsuario(result.rows[0]);
};

const actualizar = async (idUsuario, datos) => {
    const actual = await obtenerPorId(idUsuario);
    if (!actual) return null;

    const result = await pool.query(
        `UPDATE usuarios
         SET nombre = $1, correo = $2, rol = $3, activo = $4, updated_at = now()
         WHERE id_usuario = $5
         RETURNING *`,
        [
            datos.nombre ?? actual.nombre,
            datos.correo ?? actual.correo,
            datos.rol ?? actual.rol,
            datos.activo ?? actual.activo,
            idUsuario
        ]
    );
    return mapUsuario(result.rows[0]);
};

module.exports = { listar, obtenerPorId, crear, actualizar };
