const service = require('../service/configuracionService');
const dto = require('../dto/configuracionDTO');

// --- Tipos de comensal ---

const listarTiposComensal = async (req, res) => {
    try {
        const rows = await service.listarTiposComensal();
        res.status(200).json(rows.map(dto.tipoComenalResponseDTO));
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

const obtenerTipoComensal = async (req, res) => {
    try {
        const row = await service.obtenerTipoComensal(req.params.idTipoComensal);
        res.status(200).json(dto.tipoComenalResponseDTO(row));
    } catch (err) {
        res.status(404).json({ error: err });
    }
};

const crearTipoComensal = async (req, res) => {
    try {
        const datos = dto.crearTipoComensalInputDTO(req.body);
        const id = await service.crearTipoComensal(datos);
        res.status(201).json({ mensaje: 'Tipo de comensal creado.', idTipoComensal: id });
    } catch (err) {
        res.status(400).json({ error: err.message || err });
    }
};


const editarTipoComensal = async (req, res) => {
    try {
        const datos = dto.crearTipoComensalInputDTO(req.body);
        const row = await service.editarTipoComensal(req.params.idTipoComensal, datos);
        res.status(200).json(dto.tipoComenalResponseDTO(row));
    } catch (err) {
        const message = err.message || err;
        res.status(String(message).includes('no encontrado') ? 404 : 400).json({ error: message });
    }
};
// --- Turnos ---

const listarTurnos = async (req, res) => {
    try {
        const rows = await service.listarTurnos();
        res.status(200).json(rows.map(dto.turnoResponseDTO));
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

const obtenerTurno = async (req, res) => {
    try {
        const row = await service.obtenerTurno(req.params.idTurno);
        res.status(200).json(dto.turnoResponseDTO(row));
    } catch (err) {
        res.status(404).json({ error: err });
    }
};

const crearTurno = async (req, res) => {
    try {
        const datos = dto.crearTurnoInputDTO(req.body);
        const id = await service.crearTurno(datos);
        res.status(201).json({ mensaje: 'Turno creado.', idTurno: id });
    } catch (err) {
        res.status(400).json({ error: err.message || err });
    }
};

// --- Servicios por turno ---

const obtenerServiciosPorTurno = async (req, res) => {
    try {
        const servicios = await service.obtenerServiciosPorTurno(req.params.idTurno);
        res.status(200).json({ idTurno: req.params.idTurno, serviciosHabilitados: servicios });
    } catch (err) {
        res.status(500).json({ error: err });
    }
};

const agregarServicioATurno = async (req, res) => {
    try {
        const idTurno    = req.params.idTurno;
        const idServicio = req.body.idServicio;
        if (!idServicio) return res.status(400).json({ error: 'idServicio es requerido.' });
        await service.agregarServicioATurno(idTurno, idServicio);
        res.status(201).json({ mensaje: 'Servicio asociado al turno.' });
    } catch (err) {
        res.status(400).json({ error: err });
    }
};

const quitarServicioDeTurno = async (req, res) => {
    try {
        await service.quitarServicioDeTurno(req.params.idTurno, req.params.idServicio);
        res.status(200).json({ mensaje: 'Servicio removido del turno.' });
    } catch (err) {
        res.status(400).json({ error: err.message || err });
    }
};

// --- Asignaciones de turno ---

const crearAsignacionTurno = async (req, res) => {
    try {
        const datos = dto.crearAsignacionTurnoInputDTO(req.body);
        const id = await service.crearAsignacionTurno(datos);
        res.status(201).json({ mensaje: 'Asignación de turno creada.', idAsignacion: id });
    } catch (err) {
        res.status(400).json({ error: err.message || err });
    }
};

// --- Configuración de funcionario (endpoint principal para vale-service) ---
// Devuelve turno vigente + tipo de comensal del funcionario en una sola llamada

const obtenerConfiguracionFuncionario = async (req, res) => {
    const idFuncionario = req.params.idFuncionario;
    try {
        const [turno, tipoComensal] = await Promise.all([
            service.obtenerTurnoVigente(idFuncionario),
            service.obtenerTipoComensalPorFuncionario(idFuncionario)
        ]);

        if (!turno && !tipoComensal) {
            return res.status(404).json({ error: 'No se encontró configuración para el funcionario.' });
        }

        res.status(200).json(dto.configuracionFuncionarioResponseDTO(turno, tipoComensal));
    } catch (err) {
        res.status(500).json({ error: err });
    }
};



// --- Valorización de vales ---

const listarValorizacionesVale = async (req, res) => {
    try {
        const rows = await service.listarValorizacionesVale();
        res.status(200).json(rows.map(dto.valorizacionValeResponseDTO));
    } catch (err) {
        res.status(500).json({ error: err.message || err });
    }
};

const guardarValorizacionVale = async (req, res) => {
    try {
        const datos = dto.guardarValorizacionValeInputDTO(req.body);
        const row = await service.guardarValorizacionVale(datos);
        res.status(200).json(dto.valorizacionValeResponseDTO(row));
    } catch (err) {
        res.status(400).json({ error: err.message || err });
    }
};

const obtenerValorVale = async (req, res) => {
    try {
        const idTipoComensal = parseInt(req.query.idTipoComensal);
        const idServicio = parseInt(req.query.idServicio);
        if (!idTipoComensal || !idServicio) {
            return res.status(400).json({ error: 'idTipoComensal e idServicio son requeridos.' });
        }
        const row = await service.obtenerValorVale(idTipoComensal, idServicio);
        res.status(200).json(dto.valorizacionValeResponseDTO(row));
    } catch (err) {
        res.status(404).json({ error: err.message || err });
    }
};
const quitarTipoComensalAFuncionario = async (req, res) => {
    try {
        await service.quitarTipoComensalAFuncionario(req.params.idFuncionario);
        res.status(200).json({ mensaje: 'Tipo de comensal removido del funcionario.' });
    } catch (err) {
        res.status(400).json({ error: err.message || err });
    }
};
const asignarTipoComensalAFuncionario = async (req, res) => {
    try {
        const idFuncionario   = req.params.idFuncionario;
        const idTipoComensal  = req.body.idTipoComensal;
        if (!idTipoComensal) return res.status(400).json({ error: 'idTipoComensal es requerido.' });
        await service.asignarTipoComensalAFuncionario(idFuncionario, idTipoComensal);
        res.status(200).json({ mensaje: 'Tipo de comensal asignado al funcionario.' });
    } catch (err) {
        res.status(400).json({ error: err });
    }
};

module.exports = {
    listarTiposComensal,
    obtenerTipoComensal,
    crearTipoComensal,
    editarTipoComensal,
    listarTurnos,
    obtenerTurno,
    crearTurno,
    obtenerServiciosPorTurno,
    agregarServicioATurno,
    quitarServicioDeTurno,
    crearAsignacionTurno,
    obtenerConfiguracionFuncionario,
    asignarTipoComensalAFuncionario,
    quitarTipoComensalAFuncionario,
    listarValorizacionesVale,
    guardarValorizacionVale,
    obtenerValorVale
};





