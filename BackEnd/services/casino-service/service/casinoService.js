const db = require('../repository/database');

const mapCasino = (row) => row && ({
    idCasino: row.id_casino,
    nombre: row.nombre,
    direccion: row.direccion,
    activo: row.activo
});

const mapServicio = (row) => row && ({
    idServicio: row.id_servicio,
    nombre: row.nombre,
    categoria: row.categoria,
    horaInicio: String(row.hora_inicio).slice(0, 5),
    horaFin: String(row.hora_fin).slice(0, 5),
    idCasino: row.id_casino,
    activo: row.activo,
    casinoActivo: row.casino_activo
});

const listarCasinos = async () => {
    const result = await db.query('SELECT * FROM casinos ORDER BY id_casino');
    return result.rows.map(mapCasino);
};

const obtenerCasino = async (idCasino) => {
    const result = await db.query('SELECT * FROM casinos WHERE id_casino = $1', [idCasino]);
    if (!result.rows[0]) throw 'Casino no encontrado.';
    return mapCasino(result.rows[0]);
};

const crearCasino = async (datos) => {
    try {
        const result = await db.query(
            'INSERT INTO casinos (nombre, direccion) VALUES ($1, $2) RETURNING id_casino',
            [datos.nombre, datos.direccion || null]
        );
        return result.rows[0].id_casino;
    } catch (err) {
        if (err.code === '23505') throw 'Ya existe un casino con ese nombre.';
        throw 'Error al crear casino.';
    }
};

const obtenerServiciosPorCasino = async (idCasino) => {
    const result = await db.query(
        'SELECT * FROM servicios_alimentacion WHERE id_casino = $1 ORDER BY id_servicio',
        [idCasino]
    );
    return result.rows.map(mapServicio);
};

const listarServicios = async () => {
    const result = await db.query('SELECT * FROM servicios_alimentacion ORDER BY id_servicio');
    return result.rows.map(mapServicio);
};

const obtenerServicio = async (idServicio) => {
    const result = await db.query('SELECT * FROM servicios_alimentacion WHERE id_servicio = $1', [idServicio]);
    if (!result.rows[0]) throw 'Servicio de alimentación no encontrado.';
    return mapServicio(result.rows[0]);
};

const crearServicio = async (datos) => {
    try {
        const result = await db.query(
            `INSERT INTO servicios_alimentacion (nombre, categoria, hora_inicio, hora_fin, id_casino, activo)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id_servicio`,
            [datos.nombre, datos.categoria || null, datos.horaInicio, datos.horaFin, datos.idCasino, datos.activo !== false]
        );
        return result.rows[0].id_servicio;
    } catch (err) {
        throw 'Error al crear servicio de alimentación.';
    }
};

const editarServicio = async (idServicio, datos) => {
    await obtenerServicio(idServicio);
    try {
        const result = await db.query(
            `UPDATE servicios_alimentacion
             SET nombre = $1,
                 categoria = $2,
                 hora_inicio = $3,
                 hora_fin = $4,
                 id_casino = $5,
                 activo = $6
             WHERE id_servicio = $7
             RETURNING *`,
            [datos.nombre, datos.categoria || null, datos.horaInicio, datos.horaFin, datos.idCasino, datos.activo !== false, idServicio]
        );
        return mapServicio(result.rows[0]);
    } catch (err) {
        throw 'Error al editar servicio de alimentación.';
    }
};

const verificarDisponibilidad = async (idServicio) => {
    const result = await db.query(
        `SELECT s.*, c.activo AS casino_activo
         FROM servicios_alimentacion s
         INNER JOIN casinos c ON c.id_casino = s.id_casino
         WHERE s.id_servicio = $1`,
        [idServicio]
    );
    const row = mapServicio(result.rows[0]);
    if (!row) return { disponible: false, motivo: 'Servicio no encontrado.' };
    if (!row.activo) return { disponible: false, motivo: 'Servicio inactivo.' };
    if (!row.casinoActivo) return { disponible: false, motivo: 'Casino inactivo.' };

    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const dentroDeHorario = horaActual >= row.horaInicio && horaActual <= row.horaFin;

    return {
        disponible: dentroDeHorario,
        motivo: dentroDeHorario ? null : `Servicio fuera de horario (${row.horaInicio} - ${row.horaFin}).`,
        servicio: row
    };
};

module.exports = {
    listarCasinos,
    obtenerCasino,
    crearCasino,
    obtenerServiciosPorCasino,
    listarServicios,
    obtenerServicio,
    crearServicio,
    editarServicio,
    verificarDisponibilidad
};
