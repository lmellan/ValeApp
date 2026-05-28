const repository = require('../repository/notificacionRepository');
const Notificacion = require('../model/notificacion');

const normalizarEstado = (vale) => vale.estadoUso || (vale.estado === 'Utilizado' ? 'UTILIZADO' : 'NO_UTILIZADO');

const generarPayloadNotificacion = async (idFuncionario) => {
    const usuario = await repository.obtenerUsuario(idFuncionario);
    const vales = (await repository.obtenerVales()).filter(v => String(v.idFuncionario) === String(idFuncionario));

    const disponibles = vales.filter(v => normalizarEstado(v) === 'NO_UTILIZADO' && !v.expirado).length;
    const utilizados = vales.filter(v => normalizarEstado(v) === 'UTILIZADO').length;
    const expirados = vales.filter(v => Boolean(v.expirado)).length;

    return new Notificacion({
        destinatario: usuario.correo || usuario.email,
        asunto: 'Resumen Semanal de Vales',
        cuerpo: `Tienes ${disponibles} vales disponibles, ${utilizados} utilizados y ${expirados} expirados.`,
        metadata: { disponibles, utilizados, expirados }
    });
};

module.exports = { generarPayloadNotificacion };
