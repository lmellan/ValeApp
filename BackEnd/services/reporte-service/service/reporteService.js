const repository = require('../repository/reporteRepository');
const ReporteResumen = require('../model/reporteResumen');

const normalizarEstado = (vale) => vale.estadoUso || (vale.estado === 'Utilizado' ? 'UTILIZADO' : 'NO_UTILIZADO');

const obtenerResumenVales = async () => {
    const vales = await repository.obtenerVales();

    return new ReporteResumen({
        totalEmitidos: vales.length,
        utilizados: vales.filter(v => normalizarEstado(v) === 'UTILIZADO').length,
        noUtilizados: vales.filter(v => normalizarEstado(v) === 'NO_UTILIZADO').length,
        expirados: vales.filter(v => Boolean(v.expirado)).length,
        adicionales: vales.filter(v => v.tipoAsignacion === 'ADMINISTRATIVA' || v.tipoAsignacion === 'Adicional').length,
        porTurno: vales.filter(v => v.tipoAsignacion === 'POR_TURNO' || v.tipoAsignacion === 'Base').length,
        valorTotal: vales.reduce((total, vale) => total + Number(vale.valor || 0), 0)
    });
};

module.exports = { obtenerResumenVales };
