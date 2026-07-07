const db = require('../repository/database');

const CASINO_SERVICE_URL = process.env.CASINO_SERVICE_URL || 'http://localhost:3004';

const mapTipo = (row) => row && ({
    idTipoComensal: row.id_tipo_comensal,
    nombre: row.nombre,
    descripcion: row.descripcion,
    cantidadVales: row.cantidad_vales,
    emisionMultiple: row.emision_multiple,
    color: row.color
});

const mapTurno = (row) => row && ({
    idTurno: row.id_turno,
    nombre: row.nombre,
    horaInicio: String(row.hora_inicio).slice(0, 5),
    horaFin: String(row.hora_fin).slice(0, 5)
});

const mapValorizacion = (row) => row && ({
    idValorizacion: row.id_valorizacion,
    idTipoComensal: row.id_tipo_comensal,
    idServicio: row.id_servicio,
    valor: row.valor,
    activo: row.activo
});

const asegurarTablaValorizaciones = async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS valorizaciones_vale (
        id_valorizacion SERIAL PRIMARY KEY,
        id_tipo_comensal INTEGER NOT NULL REFERENCES tipos_comensal(id_tipo_comensal),
        id_servicio INTEGER NOT NULL,
        valor INTEGER NOT NULL CHECK (valor >= 0),
        activo BOOLEAN NOT NULL DEFAULT true,
        UNIQUE (id_tipo_comensal, id_servicio)
    )`);

    await db.query(`INSERT INTO valorizaciones_vale (id_tipo_comensal, id_servicio, valor, activo) VALUES
        (1, 1, 2500, true), (1, 2, 3500, true), (1, 3, 2500, true), (1, 4, 3500, true), (1, 5, 3500, true), (1, 6, 4000, true),
        (2, 1, 3000, true), (2, 2, 4500, true), (2, 3, 3000, true), (2, 4, 4500, true), (2, 5, 4500, true), (2, 6, 5000, true),
        (3, 1, 3500, true), (3, 2, 5500, true), (3, 3, 3500, true), (3, 4, 5500, true), (3, 5, 5500, true), (3, 6, 6000, true),
        (4, 1, 2500, true), (4, 2, 3500, true), (4, 3, 2500, true), (4, 4, 3500, true), (4, 5, 3500, true), (4, 6, 4000, true)
     ON CONFLICT (id_tipo_comensal, id_servicio) DO NOTHING`);
};

const listarTiposComensal = async () => {
    const result = await db.query('SELECT * FROM tipos_comensal ORDER BY id_tipo_comensal');
    return result.rows.map(mapTipo);
};

const obtenerTipoComensal = async (idTipoComensal) => {
    const result = await db.query('SELECT * FROM tipos_comensal WHERE id_tipo_comensal = $1', [idTipoComensal]);
    if (!result.rows[0]) throw 'Tipo de comensal no encontrado.';
    return mapTipo(result.rows[0]);
};

const crearTipoComensal = async (datos) => {
    try {
        const result = await db.query(
            `INSERT INTO tipos_comensal (nombre, descripcion, cantidad_vales, emision_multiple, color)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id_tipo_comensal`,
            [datos.nombre, datos.descripcion, 1, Boolean(datos.emisionMultiple), datos.color]
        );
        return result.rows[0].id_tipo_comensal;
    } catch (err) {
        if (err.code === '23505') throw 'Ya existe un tipo de comensal con ese nombre.';
        throw 'Error al crear tipo de comensal.';
    }
};

const editarTipoComensal = async (idTipoComensal, datos) => {
    await obtenerTipoComensal(idTipoComensal);
    try {
        const result = await db.query(
            `UPDATE tipos_comensal
             SET nombre = $1,
                 descripcion = $2,
                 cantidad_vales = $3,
                 emision_multiple = $4,
                 color = $5
             WHERE id_tipo_comensal = $6
             RETURNING *`,
            [datos.nombre, datos.descripcion, 1, Boolean(datos.emisionMultiple), datos.color, idTipoComensal]
        );
        return mapTipo(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') throw 'Ya existe un tipo de comensal con ese nombre.';
        throw 'Error al editar tipo de comensal.';
    }
};

const listarTurnos = async () => {
    const result = await db.query('SELECT * FROM turnos ORDER BY id_turno');
    return result.rows.map(mapTurno);
};

const obtenerTurno = async (idTurno) => {
    const result = await db.query('SELECT * FROM turnos WHERE id_turno = $1', [idTurno]);
    if (!result.rows[0]) throw 'Turno no encontrado.';
    return mapTurno(result.rows[0]);
};

const crearTurno = async (datos) => {
    try {
        const result = await db.query(
            'INSERT INTO turnos (nombre, hora_inicio, hora_fin) VALUES ($1, $2, $3) RETURNING id_turno',
            [datos.nombre, datos.horaInicio, datos.horaFin]
        );
        return result.rows[0].id_turno;
    } catch (err) {
        if (err.code === '23505') throw 'Ya existe un turno con ese nombre.';
        throw 'Error al crear turno.';
    }
};

const obtenerTurnoVigente = async (idFuncionario) => {
    const result = await db.query(
        `SELECT t.* FROM turnos t
         INNER JOIN asignaciones_turno a ON a.id_turno = t.id_turno
         WHERE a.id_funcionario = $1 AND a.fecha_fin IS NULL
         ORDER BY a.fecha_inicio DESC
         LIMIT 1`,
        [idFuncionario]
    );
    return mapTurno(result.rows[0]) || null;
};

const crearAsignacionTurno = async (datos) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query(
            'UPDATE asignaciones_turno SET fecha_fin = $1 WHERE id_funcionario = $2 AND fecha_fin IS NULL',
            [datos.fechaInicio, datos.idFuncionario]
        );
        const result = await client.query(
            `INSERT INTO asignaciones_turno (id_funcionario, id_turno, fecha_inicio, fecha_fin)
             VALUES ($1, $2, $3, $4)
             RETURNING id_asignacion`,
            [datos.idFuncionario, datos.idTurno, datos.fechaInicio, datos.fechaFin]
        );
        await client.query('COMMIT');
        return result.rows[0].id_asignacion;
    } catch (err) {
        await client.query('ROLLBACK');
        throw 'Error al crear asignación de turno.';
    } finally {
        client.release();
    }
};

const obtenerServiciosPorTurno = async (idTurno) => {
    const result = await db.query('SELECT id_servicio FROM turno_servicios WHERE id_turno = $1 ORDER BY id_servicio', [idTurno]);
    return result.rows.map(r => r.id_servicio);
};

const quitarServicioDeTurno = async (idTurno, idServicio) => {
    await db.query('DELETE FROM turno_servicios WHERE id_turno = $1 AND id_servicio = $2', [idTurno, idServicio]);
};

const agregarServicioATurno = async (idTurno, idServicio) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const response = await fetch(`${CASINO_SERVICE_URL}/servicios-alimentacion/${idServicio}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (response.status === 404) throw 'El servicio de alimentacion no existe.';
        if (!response.ok) throw 'No se pudo validar el servicio de alimentacion.';
    } catch (err) {
        if (typeof err === 'string') throw err;
        throw 'No se pudo validar el servicio de alimentacion.';
    }

    try {
        const result = await db.query(
            `INSERT INTO turno_servicios (id_turno, id_servicio)
             VALUES ($1, $2)
             RETURNING id_turno_servicio`,
            [idTurno, idServicio]
        );
        return result.rows[0].id_turno_servicio;
    } catch (err) {
        if (err.code === '23505') throw 'El servicio ya está asociado a ese turno.';
        throw 'Error al asociar servicio al turno.';
    }
};

const obtenerTipoComensalPorFuncionario = async (idFuncionario) => {
    const result = await db.query(
        `SELECT tc.* FROM tipos_comensal tc
         INNER JOIN funcionario_tipo_comensal ftc ON ftc.id_tipo_comensal = tc.id_tipo_comensal
         WHERE ftc.id_funcionario = $1`,
        [idFuncionario]
    );
    return mapTipo(result.rows[0]) || null;
};

const asignarTipoComensalAFuncionario = async (idFuncionario, idTipoComensal) => {
    await obtenerTipoComensal(idTipoComensal);
    await db.query(
        `INSERT INTO funcionario_tipo_comensal (id_funcionario, id_tipo_comensal)
         VALUES ($1, $2)
         ON CONFLICT (id_funcionario)
         DO UPDATE SET id_tipo_comensal = EXCLUDED.id_tipo_comensal`,
        [idFuncionario, idTipoComensal]
    );
};

const quitarTipoComensalAFuncionario = async (idFuncionario) => {
    await db.query('DELETE FROM funcionario_tipo_comensal WHERE id_funcionario = $1', [idFuncionario]);
};

const listarValorizacionesVale = async () => {
    await asegurarTablaValorizaciones();
    const result = await db.query('SELECT * FROM valorizaciones_vale ORDER BY id_tipo_comensal, id_servicio');
    return result.rows.map(mapValorizacion);
};

const guardarValorizacionVale = async (datos) => {
    await asegurarTablaValorizaciones();
    await obtenerTipoComensal(datos.idTipoComensal);
    const result = await db.query(
        `INSERT INTO valorizaciones_vale (id_tipo_comensal, id_servicio, valor, activo)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_tipo_comensal, id_servicio)
         DO UPDATE SET valor = EXCLUDED.valor,
                       activo = EXCLUDED.activo
         RETURNING *`,
        [datos.idTipoComensal, datos.idServicio, datos.valor, datos.activo]
    );
    return mapValorizacion(result.rows[0]);
};

const obtenerValorVale = async (idTipoComensal, idServicio) => {
    await asegurarTablaValorizaciones();
    const result = await db.query(
        `SELECT * FROM valorizaciones_vale
         WHERE id_tipo_comensal = $1
           AND id_servicio = $2
           AND activo = true`,
        [idTipoComensal, idServicio]
    );
    if (!result.rows[0]) throw 'No existe una valorización activa para este tipo de comensal y servicio.';
    return mapValorizacion(result.rows[0]);
};

module.exports = {
    listarTiposComensal,
    obtenerTipoComensal,
    crearTipoComensal,
    editarTipoComensal,
    listarTurnos,
    obtenerTurno,
    crearTurno,
    obtenerTurnoVigente,
    crearAsignacionTurno,
    obtenerServiciosPorTurno,
    agregarServicioATurno,
    quitarServicioDeTurno,
    obtenerTipoComensalPorFuncionario,
    asignarTipoComensalAFuncionario,
    quitarTipoComensalAFuncionario,
    listarValorizacionesVale,
    guardarValorizacionVale,
    obtenerValorVale
};


