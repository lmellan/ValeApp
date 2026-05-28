class AuditLog {
    constructor({ id, evento, detalle, timestamp }) {
        this.id = id;
        this.evento = evento;
        this.detalle = detalle;
        this.timestamp = timestamp;
    }
}

module.exports = AuditLog;
