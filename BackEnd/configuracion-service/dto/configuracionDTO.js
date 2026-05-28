// DTO de respuesta: tipo de comensal
const tipoComenalResponseDTO = (row) => ({
    idTipoComensal:  row.idTipoComensal,
    nombre:          row.nombre,
    descripcion:     row.descripcion,
    cantidadVales:   row.cantidadVales,
    emisionMultiple: Boolean(row.emisionMultiple)
});

// DTO de entrada: crear tipo de comensal
const crearTipoComensalInputDTO = (body) => {
    if (!body.nombre || body.cantidadVales === undefined) {
        throw new Error('Faltan campos obligatorios: nombre y cantidadVales.');
    }
    return {
        nombre:          body.nombre,
        descripcion:     body.descripcion || null,
        cantidadVales:   parseInt(body.cantidadVales),
        emisionMultiple: body.emisionMultiple ? 1 : 0
    };
};

// DTO de respuesta: turno
const turnoResponseDTO = (row) => ({
    idTurno:    row.idTurno,
    nombre:     row.nombre,
    horaInicio: row.horaInicio,
    horaFin:    row.horaFin
});

// DTO de entrada: crear turno
const crearTurnoInputDTO = (body) => {
    if (!body.nombre || !body.horaInicio || !body.horaFin) {
        throw new Error('Faltan campos obligatorios: nombre, horaInicio y horaFin.');
    }
    return {
        nombre:     body.nombre,
        horaInicio: body.horaInicio,
        horaFin:    body.horaFin
    };
};

// DTO de entrada: asignar turno a funcionario
const crearAsignacionTurnoInputDTO = (body) => {
    if (!body.idFuncionario || !body.idTurno || !body.fechaInicio) {
        throw new Error('Faltan campos obligatorios: idFuncionario, idTurno y fechaInicio.');
    }
    return {
        idFuncionario: parseInt(body.idFuncionario),
        idTurno:       parseInt(body.idTurno),
        fechaInicio:   body.fechaInicio,
        fechaFin:      body.fechaFin || null
    };
};

// DTO de respuesta: configuración completa de un funcionario (para vale-service)
const configuracionFuncionarioResponseDTO = (turno, tipoComensal) => ({
    turno: turno ? {
        idTurno:    turno.idTurno,
        nombre:     turno.nombre,
        horaInicio: turno.horaInicio,
        horaFin:    turno.horaFin
    } : null,
    tipoComensal: tipoComensal ? {
        idTipoComensal:  tipoComensal.idTipoComensal,
        nombre:          tipoComensal.nombre,
        cantidadVales:   tipoComensal.cantidadVales,
        emisionMultiple: Boolean(tipoComensal.emisionMultiple)
    } : null
});

module.exports = {
    tipoComenalResponseDTO,
    crearTipoComensalInputDTO,
    turnoResponseDTO,
    crearTurnoInputDTO,
    crearAsignacionTurnoInputDTO,
    configuracionFuncionarioResponseDTO
};
