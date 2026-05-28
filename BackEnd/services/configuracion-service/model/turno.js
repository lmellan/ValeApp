class Turno {
    constructor(idTurno, nombre, horaInicio, horaFin) {
        this.idTurno    = idTurno;
        this.nombre     = nombre;
        this.horaInicio = horaInicio; // formato HH:MM
        this.horaFin    = horaFin;
    }
}

module.exports = Turno;
