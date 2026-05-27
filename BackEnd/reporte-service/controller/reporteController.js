const reporteService = require('../service/reporteService');

const generarResumen = async (req, res) => {
    try {
        const reporte = await reporteService.obtenerResumenVales();
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ error: "Error de comunicación con vale-service" });
    }
};

module.exports = { generarResumen };