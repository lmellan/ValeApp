const auditService = require('../service/auditService');
const { crearLogInputDTO, logResponseDTO } = require('../dto/auditDTO');

const registrarLog = async (req, res) => {
    try {
        const log = await auditService.registrarLog(crearLogInputDTO(req.body));
        console.log(`[AUDITORIA - ${log.timestamp}] Evento: ${log.evento} | Detalle: ${log.detalle}`);
        res.status(202).json({ mensaje: 'Registro de auditoria recibido', log: logResponseDTO(log) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const listarLogs = async (req, res) => {
    try {
        const logs = await auditService.listarLogs();
        res.json(logs.map(logResponseDTO));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { registrarLog, listarLogs };
