// R18: Un funcionario tiene asignaciones de turno
// R19: Una asignación de turno corresponde a un turno
// fechaFin null = asignación vigente actualmente
class AsignacionTurno {
    constructor(idAsignacion, idFuncionario, idTurno, fechaInicio, fechaFin) {
        this.idAsignacion  = idAsignacion;
        this.idFuncionario = idFuncionario;
        this.idTurno       = idTurno;
        this.fechaInicio   = fechaInicio;
        this.fechaFin      = fechaFin || null;
    }
}

module.exports = AsignacionTurno;
