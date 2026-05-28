const crearLogInputDTO = (body) => {
    if (!body.evento || !body.detalle) {
        throw new Error('Faltan campos obligatorios: evento y detalle.');
    }
    return {
        evento: body.evento,
        detalle: body.detalle,
        timestamp: body.timestamp || new Date().toISOString()
    };
};

const logResponseDTO = (log) => ({
    id: log.id,
    evento: log.evento,
    detalle: log.detalle,
    timestamp: log.timestamp
});

module.exports = { crearLogInputDTO, logResponseDTO };
