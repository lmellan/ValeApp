const resumenResponseDTO = (resumen) => ({
    totalEmitidos: resumen.totalEmitidos,
    utilizados: resumen.utilizados,
    noUtilizados: resumen.noUtilizados,
    expirados: resumen.expirados,
    adicionales: resumen.adicionales,
    porTurno: resumen.porTurno,
    valorTotal: resumen.valorTotal
});

module.exports = { resumenResponseDTO };
