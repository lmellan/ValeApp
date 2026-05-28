const notificacionService = require('../service/notificacionService');
const { notificacionResponseDTO } = require('../dto/notificacionDTO');

const enviarResumenSemanal = async (req, res) => {
    const idFuncionario = req.params.idFuncionario;

    try {
        const payloadCorreo = await notificacionService.generarPayloadNotificacion(idFuncionario);
        console.log('Simulando envio de correo:', payloadCorreo);
        res.status(200).json({ mensaje: 'Notificacion enviada', detalle: notificacionResponseDTO(payloadCorreo) });
    } catch (error) {
        res.status(500).json({ error: 'Fallo al generar la notificacion' });
    }
};

module.exports = { enviarResumenSemanal };
