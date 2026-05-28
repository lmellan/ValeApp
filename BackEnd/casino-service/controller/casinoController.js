const service = require('../service/casinoService');
const dto     = require('../dto/casinoDTO');

// --- Casinos ---

const listarCasinos = async (req, res) => {
    try {
        const rows = await service.listarCasinos();
        res.status(200).json(rows.map(dto.casinoResponseDTO));
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

const obtenerCasino = async (req, res) => {
    try {
        const row = await service.obtenerCasino(req.params.idCasino);
        res.status(200).json(dto.casinoResponseDTO(row));
    } catch (err) {
        res.status(404).json({ error: err });
    }
};

const crearCasino = async (req, res) => {
    try {
        const datos = dto.crearCasinoInputDTO(req.body);
        const id    = await service.crearCasino(datos);
        res.status(201).json({ mensaje: 'Casino creado.', idCasino: id });
    } catch (err) {
        res.status(400).json({ error: err.message || err });
    }
};

// R22: servicios de alimentación que ofrece un casino
const obtenerServiciosPorCasino = async (req, res) => {
    try {
        const rows = await service.obtenerServiciosPorCasino(req.params.idCasino);
        res.status(200).json(rows.map(dto.servicioResponseDTO));
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

// --- Servicios de alimentación ---

const listarServicios = async (req, res) => {
    try {
        const rows = await service.listarServicios();
        res.status(200).json(rows.map(dto.servicioResponseDTO));
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

const obtenerServicio = async (req, res) => {
    try {
        const row = await service.obtenerServicio(req.params.idServicio);
        res.status(200).json(dto.servicioResponseDTO(row));
    } catch (err) {
        res.status(404).json({ error: err });
    }
};

const crearServicio = async (req, res) => {
    try {
        const datos = dto.crearServicioInputDTO(req.body);
        const id    = await service.crearServicio(datos);
        res.status(201).json({ mensaje: 'Servicio de alimentación creado.', idServicio: id });
    } catch (err) {
        res.status(400).json({ error: err.message || err });
    }
};

// Endpoint principal para vale-service: ¿este servicio existe y está disponible ahora?
// R30: disponibilidad calculada en tiempo real
const verificarDisponibilidad = async (req, res) => {
    try {
        const resultado = await service.verificarDisponibilidad(req.params.idServicio);
        res.status(200).json(resultado);
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

module.exports = {
    listarCasinos,
    obtenerCasino,
    crearCasino,
    obtenerServiciosPorCasino,
    listarServicios,
    obtenerServicio,
    crearServicio,
    verificarDisponibilidad
};
