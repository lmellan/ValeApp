class Notificacion {
    constructor({ destinatario, asunto, cuerpo, metadata }) {
        this.destinatario = destinatario;
        this.asunto = asunto;
        this.cuerpo = cuerpo;
        this.metadata = metadata || {};
    }
}

module.exports = Notificacion;
