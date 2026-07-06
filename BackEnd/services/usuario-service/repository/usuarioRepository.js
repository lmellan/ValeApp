const pool = require('./database');

const mapUsuario = (row) => row && ({
    id: row.id_usuario,
    nombre: row.nombre,
    correo: row.correo,
    codigo: row.codigo,
    id_tipo_comensal: row.id_tipo_comensal,
    tipo_comensal: row.tipo_comensal,
    turno: row.turno,
    contrasena: row.contrasena,
    rol: row.nombre_rol,
    activo: row.activo
});

const listar = async ({ rol, activo } = {}) => {
    const conditions = [];
    const values = [];

    if (rol) {
        values.push(rol);
        conditions.push(`roles.nombre = $${values.length}`);
    }
    if (activo !== undefined) {
        values.push(String(activo) === 'true');
        conditions.push(`usuarios.activo = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
        `SELECT usuarios.*, roles.nombre AS nombre_rol
         FROM usuarios
         JOIN roles ON usuarios.id_rol = roles.id_rol
         ${where}
         ORDER BY usuarios.id_usuario`,
        values
    );
    return result.rows.map(mapUsuario);
};

const obtenerPorId = async (idUsuario) => {
    const result = await pool.query(
        `SELECT usuarios.*, roles.nombre AS nombre_rol
         FROM usuarios
         JOIN roles ON usuarios.id_rol = roles.id_rol
         WHERE usuarios.id_usuario = $1`,
        [idUsuario]
    );
    return mapUsuario(result.rows[0]);
};

const obtenerPorCorreo = async (correo) => {
    const result = await pool.query(
        `SELECT usuarios.*, roles.nombre AS nombre_rol
         FROM usuarios
         JOIN roles ON usuarios.id_rol = roles.id_rol
         WHERE usuarios.correo = $1`,
        [correo]
    );
    return mapUsuario(result.rows[0]);
};

const obtenerPorCorreoOCodigo = async (identificador) => {
    const result = await pool.query(
        `SELECT usuarios.*, roles.nombre AS nombre_rol
         FROM usuarios
         JOIN roles ON usuarios.id_rol = roles.id_rol
         WHERE usuarios.correo = $1 OR usuarios.codigo = $1`,
        [identificador]
    );
    return mapUsuario(result.rows[0]);
};


const obtenerUltimoNumeroCodigo = async (prefijo) => {
    const result = await pool.query(
        `SELECT COALESCE(MAX(SUBSTRING(codigo FROM LENGTH($1) + 1)::int), 0) AS ultimo
         FROM usuarios
         WHERE codigo ~ $2`,
        [prefijo, `^${prefijo}[0-9]+$`]
    );
    return result.rows[0].ultimo;
};
const crear = async (datos) => {
    const result = await pool.query(
        `WITH nuevo AS (
             INSERT INTO usuarios (nombre, correo, codigo, contrasena, id_tipo_comensal, tipo_comensal, turno, id_rol, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT id_rol FROM roles WHERE nombre = $8), $9)
             RETURNING *
         )
         SELECT nuevo.*, roles.nombre AS nombre_rol
         FROM nuevo
         JOIN roles ON nuevo.id_rol = roles.id_rol`,
        [datos.nombre, datos.correo, datos.codigo, datos.contrasena, datos.id_tipo_comensal || null, datos.tipo_comensal || null, datos.turno || null, datos.rol, datos.activo]
    );
    return mapUsuario(result.rows[0]);
};

const actualizar = async (idUsuario, datos) => {
    const actual = await obtenerPorId(idUsuario);
    if (!actual) return null;

    const result = await pool.query(
        `WITH actualizado AS (
             UPDATE usuarios
             SET nombre = $1,
                 correo = $2,
                 codigo = COALESCE($3, codigo),
                 contrasena = COALESCE($4, contrasena),
                 id_tipo_comensal = $5,
                 tipo_comensal = $6,
                 turno = $7,
                 id_rol = COALESCE((SELECT id_rol FROM roles WHERE nombre = $8), id_rol),
                 activo = $9,
                 updated_at = now()
             WHERE id_usuario = $10
             RETURNING *
         )
         SELECT actualizado.*, roles.nombre AS nombre_rol
         FROM actualizado
         JOIN roles ON actualizado.id_rol = roles.id_rol`,
        [
            datos.nombre ?? actual.nombre,
            datos.correo ?? actual.correo,
            datos.codigo ?? actual.codigo,
            datos.contrasena ?? null,
            datos.id_tipo_comensal ?? actual.id_tipo_comensal,
            datos.tipo_comensal ?? actual.tipo_comensal,
            datos.turno ?? actual.turno,
            datos.rol ?? actual.rol,
            datos.activo ?? actual.activo,
            idUsuario
        ]
    );
    return mapUsuario(result.rows[0]);
};

module.exports = { listar, obtenerPorId, obtenerPorCorreo, obtenerPorCorreoOCodigo, obtenerUltimoNumeroCodigo, crear, actualizar };

