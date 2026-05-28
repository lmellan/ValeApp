const notificacionService = require('../service/notificacionService');

const enviarResumenSemanal = async (req, res) => {
    const idFuncionario = req.params.idFuncionario;
    
    try {
        const payloadCorreo = await notificacionService.generarPayloadNotificacion(idFuncionario);
        console.log("Simulando envío de correo:", payloadCorreo);
        res.status(200).json({ mensaje: "Notificación enviada", detalle: payloadCorreo });
    } catch (error) {
        res.status(500).json({ error: "Fallo al generar la notificación" });
    }
};

module.exports = { enviarResumenSemanal };