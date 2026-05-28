const pool = require('./database');

const mapVale = (row) => row && ({
    idVale: row.id_vale,
    idFuncionario: row.id_funcionario,
    idServicio: row.id_servicio,
    estadoUso: row.estado_uso,
    expirado: row.expirado,
    tipoAsignacion: row.tipo_asignacion,
    valor: row.valor,
    fechaUso: row.fecha_uso,
    horaInicioValidez: row.hora_inicio_validez,
    horaFinValidez: row.hora_fin_validez,
    fechaExpiracion: row.fecha_expiracion,
    motivo: row.motivo,
    fechaHoraImpresion: row.fecha_hora_impresion,
    idCajeroCanje: row.id_cajero_canje,
    fechaHoraCanje: row.fecha_hora_canje
});

const obtenerPorId = async (idVale) => {
    const result = await pool.query('SELECT * FROM vales WHERE id_vale = $1', [idVale]);
    return mapVale(result.rows[0]);
};

const listarTodos = async () => {
    const result = await pool.query('SELECT * FROM vales ORDER BY id_vale');
    return result.rows.map(mapVale);
};

const listarPorFuncionario = async (idFuncionario) => {
    const result = await pool.query(
        'SELECT * FROM vales WHERE id_funcionario = $1 ORDER BY fecha_uso, hora_inicio_validez',
        [idFuncionario]
    );
    return result.rows.map(mapVale);
};

const insertar = async (vale) => {
    const result = await pool.query(
        `INSERT INTO vales
         (id_vale, id_funcionario, id_servicio, estado_uso, expirado, tipo_asignacion, valor, fecha_uso, hora_inicio_validez, hora_fin_validez, fecha_expiracion, motivo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
            vale.idVale,
            vale.idFuncionario,
            vale.idServicio,
            vale.estadoUso,
            vale.expirado,
            vale.tipoAsignacion,
            vale.valor,
            vale.fechaUso,
            vale.horaInicioValidez,
            vale.horaFinValidez,
            vale.fechaExpiracion,
            vale.motivo || null
        ]
    );
    return { changes: result.rowCount };
};

const marcarImpreso = async (idVale, fechaHoraImpresion) => {
    const result = await pool.query(
        'UPDATE vales SET fecha_hora_impresion = $1 WHERE id_vale = $2',
        [fechaHoraImpresion, idVale]
    );
    return { changes: result.rowCount };
};

const marcarCanjeadoSiDisponible = async (idVale, idCajero, fechaHoraCanje) => {
    const result = await pool.query(
        `UPDATE vales
         SET estado_uso = 'UTILIZADO',
             id_cajero_canje = $1,
             fecha_hora_canje = $2
         WHERE id_vale = $3
           AND estado_uso = 'NO_UTILIZADO'
           AND expirado = false
           AND (fecha_expiracion::timestamp + time '23:59:59') >= now()`,
        [idCajero, fechaHoraCanje, idVale]
    );
    return { changes: result.rowCount };
};

const actualizarExpirados = async () => {
    const result = await pool.query(
        `UPDATE vales
         SET expirado = true
         WHERE estado_uso = 'NO_UTILIZADO'
           AND (fecha_expiracion::timestamp + time '23:59:59') < now()`
    );
    return { changes: result.rowCount };
};

const contarCoincidenciasUsadas = async (vale) => {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS total FROM vales
         WHERE id_funcionario = $1
           AND id_vale <> $2
           AND estado_uso = 'UTILIZADO'
           AND fecha_uso = $3
           AND NOT (hora_fin_validez <= $4 OR hora_inicio_validez >= $5)`,
        [vale.idFuncionario, vale.idVale, vale.fechaUso, vale.horaInicioValidez, vale.horaFinValidez]
    );
    return result.rows[0].total;
};

module.exports = {
    obtenerPorId,
    listarTodos,
    listarPorFuncionario,
    insertar,
    marcarImpreso,
    marcarCanjeadoSiDisponible,
    actualizarExpirados,
    contarCoincidenciasUsadas
};
