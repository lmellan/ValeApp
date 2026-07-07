const axios = require('axios');
const valeService = require('../service/valeService');
const { infoValeResponseDTO, crearValeInputDTO, actualizarValeInputDTO, generarValesBaseInputDTO } = require('../dto/valeDTO');

const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://localhost:3002';

const statusFromError = (error) => error.status || error.response?.status || 500;
const messageFromError = (error) => error.response?.data?.error || error.message || error;

const auditar = async (evento, detalle) => {
    try {
        await axios.post(`${AUDIT_SERVICE_URL}/logs`, {
            evento,
            detalle,
            timestamp: new Date().toISOString()
        }, { timeout: 2000 });
    } catch (err) {
        console.error('Auditoría no registrada:', err.message);
    }
};

const consultarVale = async (req, res) => {
    try {
        const vale = await valeService.obtenerVale(req.params.idVale);
        if (!vale) return res.status(404).json({ error: 'Vale no encontrado' });
        res.json(infoValeResponseDTO(vale));
    } catch (error) {
        res.status(500).json({ error: messageFromError(error) });
    }
};

const validarVale = async (req, res) => {
    const idUsuario = req.headers['x-usuario-id'] ? req.headers['x-usuario-id'].trim() : null;
    if (!idUsuario) return res.status(401).json({ error: 'Identificación de usuario requerida en headers.' });

    try {
        const resultado = await valeService.validarVale(req.params.idVale, idUsuario);
        await auditar('VALIDACION_VALE_EXITOSA', `Usuario ${idUsuario} validó el vale ${req.params.idVale}`);
        res.status(200).json({
            mensaje: resultado.mensaje,
            vale: infoValeResponseDTO(resultado.vale)
        });
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const canjearVale = async (req, res) => {
    const idUsuario = req.headers['x-usuario-id'] ? req.headers['x-usuario-id'].trim() : null;
    if (!idUsuario) return res.status(401).json({ error: 'Identificación de usuario requerida en headers.' });

    try {
        const mensaje = await valeService.registrarCanjeVale(req.params.idVale, idUsuario);
        await auditar('CANJE_VALE_EXITOSO', `Usuario ${idUsuario} canjeó el vale ${req.params.idVale}`);
        res.status(200).json({ mensaje });
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const listarValesFuncionario = async (req, res) => {
    try {
        const vales = await valeService.obtenerValesFuncionario(req.params.idFuncionario);
        res.status(200).json(vales.map(infoValeResponseDTO));
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const listarValesDisponibles = async (req, res) => {
    try {
        const vales = await valeService.obtenerValesDisponibles(req.params.idFuncionario);
        res.status(200).json(vales.map(infoValeResponseDTO));
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const listarValesAdicionales = async (req, res) => {
    try {
        const vales = await valeService.listarValesAdicionales();
        res.status(200).json(vales.map(infoValeResponseDTO));
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const crearValeAdicional = async (req, res) => {
    try {
        const datosValidados = crearValeInputDTO(req.body);
        const resultado = await valeService.registrarValeAdicional(datosValidados);
        res.status(201).json({ mensaje: resultado.mensaje, valesCreados: resultado.creados });
    } catch (error) {
        res.status(statusFromError(error) === 500 ? 400 : statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const actualizarValeAdicional = async (req, res) => {
    try {
        const datosValidados = actualizarValeInputDTO(req.body);
        const vale = await valeService.actualizarValeAdicional(req.params.idVale, datosValidados);
        res.status(200).json(infoValeResponseDTO(vale));
    } catch (error) {
        res.status(statusFromError(error) === 500 ? 400 : statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const sincronizarHorariosValeAdicional = async (req, res) => {
    try {
        const actualizados = await valeService.sincronizarHorariosValeAdicional(
            req.params.idServicio,
            req.body.horaInicioValidez,
            req.body.horaFinValidez
        );
        res.status(200).json({ mensaje: 'Horarios sincronizados.', valesActualizados: actualizados });
    } catch (error) {
        res.status(statusFromError(error) === 500 ? 400 : statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const eliminarValeAdicional = async (req, res) => {
    try {
        const resultado = await valeService.eliminarValeAdicional(req.params.idVale);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(statusFromError(error) === 500 ? 400 : statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const imprimirVale = async (req, res) => {
    const idFuncionario = req.headers['x-funcionario-id'] || req.body.idFuncionario;
    if (!idFuncionario) return res.status(401).json({ error: 'idFuncionario requerido en header x-funcionario-id o body.' });

    try {
        const resultado = await valeService.imprimirVale(req.params.idVale, idFuncionario);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const generarValesBase = async (req, res) => {
    try {
        const datos = generarValesBaseInputDTO(req.body);
        const resultado = await valeService.generarValesBase(datos);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const recalcularValesBaseFuncionario = async (req, res) => {
    try {
        const resultado = await valeService.recalcularValesBaseFuncionario({
            idFuncionario: req.params.idFuncionario,
            desdeFecha: req.body.desdeFecha
        });
        res.status(200).json(resultado);
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};
const obtenerResumenValesFuncionario = async (req, res) => {
    try {
        const resumen = await valeService.obtenerResumenValesFuncionario(req.params.idFuncionario);
        res.status(200).json(resumen);
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const obtenerResumenGenerico = async (req, res) => {
    try {
        const resumen = await valeService.obtenerResumenGenerico();
        res.status(200).json(resumen);
    } catch (error) {
        res.status(statusFromError(error)).json({ error: messageFromError(error) });
    }
};

const obtenerTodosLosVales = async (req, res) => {
    try {
        const vales = await valeService.obtenerTodosLosVales();
        res.json(vales.map(infoValeResponseDTO));
    } catch (error) {
        res.status(500).json({ error: messageFromError(error) });
    }
};

module.exports = {
    consultarVale,
    validarVale,
    canjearVale,
    listarValesFuncionario,
    listarValesDisponibles,
    listarValesAdicionales,
    obtenerResumenValesFuncionario,
    obtenerResumenGenerico,
    crearValeAdicional,
    actualizarValeAdicional,
    eliminarValeAdicional,
    sincronizarHorariosValeAdicional,
    imprimirVale,
    generarValesBase,
    recalcularValesBaseFuncionario,
    obtenerTodosLosVales
};



