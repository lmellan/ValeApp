const repository = require('../repository/reporteRepository');
const ReporteResumen = require('../model/reporteResumen');

const obtenerResumenVales = async () => {
    const resumen = await repository.obtenerResumenValesGenerico();

    return new ReporteResumen({
        totalEmitidos: resumen.totalEmitidos,
        utilizados: resumen.utilizados,
        noUtilizados: resumen.noUtilizados,
        expirados: resumen.expirados,
        adicionales: resumen.adicionales,
        porTurno: resumen.porTurno,
        valorTotal: resumen.valorTotal
    });
};

module.exports = { obtenerResumenVales };
