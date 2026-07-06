const service = require('../service/casinoService');
const dto = require('../dto/casinoDTO');

const errorMessage = (err) => err.message || err.detail || err.toString();

const listarCasinos = async (req, res) => {
    try {
        const rows = await service.listarCasinos();
        res.status(200).json(rows.map(dto.casinoResponseDTO));
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
};

const obtenerCasino = async (req, res) => {
    try {
        const row = await service.obtenerCasino(req.params.idCasino);
        res.status(200).json(dto.casinoResponseDTO(row));
    } catch (err) {
        res.status(404).json({ error: errorMessage(err) });
    }
};

const crearCasino = async (req, res) => {
    try {
        const datos = dto.crearCasinoInputDTO(req.body);
        const id = await service.crearCasino(datos);
        res.status(201).json({ mensaje: 'Casino creado.', idCasino: id });
    } catch (err) {
        res.status(400).json({ error: errorMessage(err) });
    }
};

const obtenerServiciosPorCasino = async (req, res) => {
    try {
        const rows = await service.obtenerServiciosPorCasino(req.params.idCasino);
        res.status(200).json(rows.map(dto.servicioResponseDTO));
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
};

const listarServicios = async (req, res) => {
    try {
        const rows = await service.listarServicios();
        res.status(200).json(rows.map(dto.servicioResponseDTO));
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
};

const obtenerServicio = async (req, res) => {
    try {
        const row = await service.obtenerServicio(req.params.idServicio);
        res.status(200).json(dto.servicioResponseDTO(row));
    } catch (err) {
        res.status(404).json({ error: errorMessage(err) });
    }
};

const crearServicio = async (req, res) => {
    try {
        const datos = dto.crearServicioInputDTO(req.body);
        const id = await service.crearServicio(datos);
        res.status(201).json({ mensaje: 'Servicio de alimentación creado.', idServicio: id });
    } catch (err) {
        res.status(400).json({ error: errorMessage(err) });
    }
};

const editarServicio = async (req, res) => {
    try {
        const datos = dto.crearServicioInputDTO(req.body);
        const row = await service.editarServicio(req.params.idServicio, datos);
        res.status(200).json(dto.servicioResponseDTO(row));
    } catch (err) {
        const message = errorMessage(err);
        res.status(message.includes('no encontrado') ? 404 : 400).json({ error: message });
    }
};

const verificarDisponibilidad = async (req, res) => {
    try {
        const resultado = await service.verificarDisponibilidad(req.params.idServicio);
        res.status(200).json(resultado);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
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
    editarServicio,
    verificarDisponibilidad
};
