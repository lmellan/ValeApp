const repository = require('../repository/notificacionRepository');
const Notificacion = require('../model/notificacion');

const generarPayloadNotificacion = async (idFuncionario) => {
    const usuario = await repository.obtenerUsuario(idFuncionario);
    const resumen = await repository.obtenerResumenValesFuncionario(idFuncionario);

    return new Notificacion({
        destinatario: usuario.correo || usuario.email,
        asunto: 'Resumen Semanal de Vales',
        cuerpo: `Tienes ${resumen.disponibles} vales disponibles, ${resumen.utilizados} utilizados y ${resumen.expirados} expirados.`,
        metadata: {
            disponibles: resumen.disponibles,
            utilizados: resumen.utilizados,
            expirados: resumen.expirados
        }
    });
};

module.exports = { generarPayloadNotificacion };
