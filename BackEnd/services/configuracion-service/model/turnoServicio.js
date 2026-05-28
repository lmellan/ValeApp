// R20: Un turno habilita uno o más servicios de alimentación
// R21: Un servicio de alimentación puede estar asociado a distintos turnos
// idServicio referencia a casino-service (no FK directa por ser microservicios distintos)
class TurnoServicio {
    constructor(idTurnoServicio, idTurno, idServicio) {
        this.idTurnoServicio = idTurnoServicio;
        this.idTurno         = idTurno;
        this.idServicio      = idServicio;
    }
}

module.exports = TurnoServicio;
