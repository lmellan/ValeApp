class Vale {
    constructor(data) {
        this.idVale = data.idVale;
        this.idFuncionario = data.idFuncionario;
        this.idServicio = data.idServicio;
        this.estadoUso = data.estadoUso || data.estado || 'NO_UTILIZADO';
        this.expirado = Boolean(data.expirado);
        this.tipoAsignacion = data.tipoAsignacion;
        this.valor = data.valor;
        this.fechaUso = data.fechaUso || data.fechaExpiracion;
        this.horaInicioValidez = data.horaInicioValidez || '00:00';
        this.horaFinValidez = data.horaFinValidez || '23:59';
        this.fechaExpiracion = data.fechaExpiracion;
        this.motivo = data.motivo || null;
        this.fechaHoraImpresion = data.fechaHoraImpresion || null;
        this.idCajeroCanje = data.idCajeroCanje || null;
        this.fechaHoraCanje = data.fechaHoraCanje || null;
    }
}

module.exports = Vale;
