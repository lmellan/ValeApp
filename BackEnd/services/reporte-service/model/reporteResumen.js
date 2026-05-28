class ReporteResumen {
    constructor(data) {
        this.totalEmitidos = data.totalEmitidos;
        this.utilizados = data.utilizados;
        this.noUtilizados = data.noUtilizados;
        this.expirados = data.expirados;
        this.adicionales = data.adicionales;
        this.porTurno = data.porTurno;
        this.valorTotal = data.valorTotal;
    }
}

module.exports = ReporteResumen;
