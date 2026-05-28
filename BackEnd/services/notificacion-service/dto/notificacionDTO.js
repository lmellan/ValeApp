const notificacionResponseDTO = (notificacion) => ({
    destinatario: notificacion.destinatario,
    asunto: notificacion.asunto,
    cuerpo: notificacion.cuerpo,
    metadata: notificacion.metadata
});

module.exports = { notificacionResponseDTO };
