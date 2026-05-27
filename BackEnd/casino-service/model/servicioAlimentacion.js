// R22/R23: Un servicio pertenece a un casino y puede estar asociado a muchos vales
// R24: El valor monetario NO está aquí, sino en Vale
class ServicioAlimentacion {
    constructor({ idServicio, nombre, categoria, horaInicio, horaFin, idCasino, activo }) {
        this.idServicio  = idServicio;
        this.nombre      = nombre;
        this.categoria   = categoria;
        this.horaInicio  = horaInicio;
        this.horaFin     = horaFin;
        this.idCasino    = idCasino;
        this.activo      = Boolean(activo);
    }
}

module.exports = ServicioAlimentacion;
