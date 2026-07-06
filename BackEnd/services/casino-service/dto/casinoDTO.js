const casinoResponseDTO = (row) => ({
    idCasino: row.idCasino,
    nombre: row.nombre,
    direccion: row.direccion,
    activo: Boolean(row.activo)
});

const crearCasinoInputDTO = (body) => {
    if (!body.nombre) {
        throw new Error('Faltan campos obligatorios: nombre.');
    }
    return {
        nombre: body.nombre,
        direccion: body.direccion || null
    };
};

const servicioResponseDTO = (row) => ({
    idServicio: row.idServicio,
    nombre: row.nombre,
    categoria: row.categoria,
    horaInicio: row.horaInicio,
    horaFin: row.horaFin,
    idCasino: row.idCasino,
    activo: Boolean(row.activo)
});

const crearServicioInputDTO = (body) => {
    if (!body.nombre || !body.horaInicio || !body.horaFin || !body.idCasino) {
        throw new Error('Faltan campos obligatorios: nombre, horaInicio, horaFin e idCasino.');
    }
    return {
        nombre: body.nombre,
        categoria: body.categoria || null,
        horaInicio: body.horaInicio,
        horaFin: body.horaFin,
        idCasino: parseInt(body.idCasino),
        activo: body.activo !== false
    };
};

module.exports = {
    casinoResponseDTO,
    crearCasinoInputDTO,
    servicioResponseDTO,
    crearServicioInputDTO
};
