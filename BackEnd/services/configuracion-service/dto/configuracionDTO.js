const tipoComenalResponseDTO = (row) => ({
    idTipoComensal: row.idTipoComensal,
    nombre: row.nombre,
    descripcion: row.descripcion,
    cantidadVales: row.cantidadVales,
    emisionMultiple: Boolean(row.emisionMultiple),
    color: row.color
});

const crearTipoComensalInputDTO = (body) => {
    if (!body.nombre) {
        throw new Error('Falta campo obligatorio: nombre.');
    }
    return {
        nombre: body.nombre,
        descripcion: body.descripcion || null,
        cantidadVales: 1,
        emisionMultiple: Boolean(body.emisionMultiple),
        color: body.color || '#0f4c81'
    };
};

const turnoResponseDTO = (row) => ({
    idTurno: row.idTurno,
    nombre: row.nombre,
    horaInicio: row.horaInicio,
    horaFin: row.horaFin
});

const crearTurnoInputDTO = (body) => {
    if (!body.nombre || !body.horaInicio || !body.horaFin) {
        throw new Error('Faltan campos obligatorios: nombre, horaInicio y horaFin.');
    }
    return {
        nombre: body.nombre,
        horaInicio: body.horaInicio,
        horaFin: body.horaFin
    };
};

const crearAsignacionTurnoInputDTO = (body) => {
    if (!body.idFuncionario || !body.idTurno || !body.fechaInicio) {
        throw new Error('Faltan campos obligatorios: idFuncionario, idTurno y fechaInicio.');
    }
    return {
        idFuncionario: parseInt(body.idFuncionario),
        idTurno: parseInt(body.idTurno),
        fechaInicio: body.fechaInicio,
        fechaFin: body.fechaFin || null
    };
};

const valorizacionValeResponseDTO = (row) => ({
    idValorizacion: row.idValorizacion,
    idTipoComensal: row.idTipoComensal,
    idServicio: row.idServicio,
    valor: row.valor,
    activo: Boolean(row.activo)
});

const guardarValorizacionValeInputDTO = (body) => {
    if (!body.idTipoComensal || !body.idServicio || body.valor === undefined) {
        throw new Error('Faltan campos obligatorios: idTipoComensal, idServicio y valor.');
    }
    return {
        idTipoComensal: parseInt(body.idTipoComensal),
        idServicio: parseInt(body.idServicio),
        valor: parseInt(body.valor),
        activo: body.activo === undefined ? true : Boolean(body.activo)
    };
};

const configuracionFuncionarioResponseDTO = (turno, tipoComensal) => ({
    turno: turno ? {
        idTurno: turno.idTurno,
        nombre: turno.nombre,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin
    } : null,
    tipoComensal: tipoComensal ? {
        idTipoComensal: tipoComensal.idTipoComensal,
        nombre: tipoComensal.nombre,
        cantidadVales: tipoComensal.cantidadVales,
        emisionMultiple: Boolean(tipoComensal.emisionMultiple),
        color: tipoComensal.color
    } : null
});

module.exports = {
    tipoComenalResponseDTO,
    crearTipoComensalInputDTO,
    turnoResponseDTO,
    crearTurnoInputDTO,
    crearAsignacionTurnoInputDTO,
    valorizacionValeResponseDTO,
    guardarValorizacionValeInputDTO,
    configuracionFuncionarioResponseDTO
};




