const axios = require('axios');
const valeRepository = require('../repository/valeRepository');
const Vale = require('../model/vale');

const USUARIO_SERVICE_URL = process.env.USUARIO_SERVICE_URL || 'http://localhost:3001';
const CONFIGURACION_SERVICE_URL = process.env.CONFIGURACION_SERVICE_URL || 'http://localhost:3003';
const CASINO_SERVICE_URL = process.env.CASINO_SERVICE_URL || 'http://localhost:3004';

const esNoUtilizado = (vale) => vale.estadoUso === 'NO_UTILIZADO' || vale.estado === 'No utilizado';

const fechaFinValidez = (vale) => new Date(`${vale.fechaExpiracion || vale.fechaUso}T${vale.horaFinValidez || '23:59'}:59`);

const calcularExpirado = (vale, ahora = new Date()) => Boolean(vale.expirado) || fechaFinValidez(vale) < ahora;

const estaDentroDeRango = (vale, ahora = new Date()) => {
    const inicio = new Date(`${vale.fechaUso || vale.fechaExpiracion}T${vale.horaInicioValidez || '00:00'}:00`);
    const fin = fechaFinValidez(vale);
    return ahora >= inicio && ahora <= fin;
};

const obtenerRolUsuario = async (idUsuario) => {
    const response = await axios.get(`${USUARIO_SERVICE_URL}/usuarios/${idUsuario}/rol`, { timeout: 2000 });
    return response.data.rol;
};

const validarPermisoCajero = async (idUsuario) => {
    const rol = await obtenerRolUsuario(idUsuario);
    if (rol !== 'Cajero' && rol !== 'Administrador') {
        const error = new Error('No tienes permisos para realizar esta accion.');
        error.status = 403;
        throw error;
    }
};

const validarReglasVale = async (idVale) => {
    await valeRepository.actualizarExpirados();
    const vale = await valeRepository.obtenerPorId(idVale);

    if (!vale) {
        const error = new Error('Vale no encontrado');
        error.status = 404;
        throw error;
    }
    if (!esNoUtilizado(vale)) {
        const error = new Error('Regla R32: El vale ya fue utilizado y no puede volver a usarse.');
        error.status = 400;
        throw error;
    }
    if (calcularExpirado(vale)) {
        const error = new Error('Regla R31: El vale esta expirado y no puede usarse.');
        error.status = 400;
        throw error;
    }
    if (vale.idServicio) {
        const disponibilidad = await axios.get(`${CASINO_SERVICE_URL}/servicios-alimentacion/${vale.idServicio}/disponibilidad`, { timeout: 2000 });
        if (!disponibilidad.data.disponible) {
            const error = new Error(disponibilidad.data.motivo || 'Servicio no disponible.');
            error.status = 400;
            throw error;
        }
    }
    if (!estaDentroDeRango(vale)) {
        const error = new Error('El vale esta fuera de su rango horario de validez.');
        error.status = 400;
        throw error;
    }
    const config = await axios.get(`${CONFIGURACION_SERVICE_URL}/funcionarios/${vale.idFuncionario}/configuracion`, { timeout: 2000 });
    const permiteEmisionMultiple = Boolean(config.data.tipoComensal?.emisionMultiple);
    if (!permiteEmisionMultiple) {
        const coincidencias = await valeRepository.contarCoincidenciasUsadas(vale);
        if (coincidencias > 0) {
            const error = new Error('Regla R40: el tipo de comensal no permite usar vales con horarios coincidentes.');
            error.status = 400;
            throw error;
        }
    }

    return vale;
};

const validarVale = async (idVale, idUsuario) => {
    await validarPermisoCajero(idUsuario);
    const vale = await validarReglasVale(idVale);
    return { mensaje: 'Vale valido para canje.', vale };
};

const registrarCanjeVale = async (idVale, idCajero) => {
    await validarVale(idVale, idCajero);
    const fechaHoraCanje = new Date().toISOString();
    const resultado = await valeRepository.marcarCanjeadoSiDisponible(idVale, idCajero, fechaHoraCanje);

    if (resultado.changes === 0) {
        const error = new Error('El vale no pudo canjearse porque ya fue usado o expiro.');
        error.status = 409;
        throw error;
    }

    return 'Vale validado y canjeado con exito';
};

const obtenerValesDisponibles = async (idFuncionario) => {
    await valeRepository.actualizarExpirados();
    const vales = await valeRepository.listarPorFuncionario(idFuncionario);
    return vales.filter((vale) => esNoUtilizado(vale) && !calcularExpirado(vale));
};

const registrarValeAdicional = async (nuevoValeData) => {
    try {
        await valeRepository.insertar(new Vale(nuevoValeData));
        return 'Vale adicional creado y asignado con exito.';
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            const error = new Error('El ID de vale ya existe en el sistema.');
            error.status = 400;
            throw error;
        }
        throw new Error('Error al insertar el vale adicional en la base de datos.');
    }
};

const imprimirVale = async (idVale, idFuncionario) => {
    const vale = await valeRepository.obtenerPorId(idVale);
    if (!vale) {
        const error = new Error('Vale no encontrado');
        error.status = 404;
        throw error;
    }
    if (String(vale.idFuncionario) !== String(idFuncionario)) {
        const error = new Error('El funcionario solo puede imprimir sus propios vales.');
        error.status = 403;
        throw error;
    }
    if (!esNoUtilizado(vale) || calcularExpirado(vale)) {
        const error = new Error('El vale no esta en condiciones validas para imprimir.');
        error.status = 400;
        throw error;
    }

    const fechaHoraImpresion = new Date().toISOString();
    await valeRepository.marcarImpreso(idVale, fechaHoraImpresion);
    return { mensaje: 'Vale impreso correctamente.', fechaHoraImpresion };
};

const generarValesBase = async ({ fechaUso, valor }) => {
    if (!fechaUso) throw new Error('fechaUso es requerida.');

    const usuariosRes = await axios.get(`${USUARIO_SERVICE_URL}/usuarios?rol=Funcionario&activo=true`, { timeout: 2000 });
    const funcionarios = usuariosRes.data;
    const creados = [];
    const omitidos = [];

    for (const funcionario of funcionarios) {
        try {
            const configRes = await axios.get(`${CONFIGURACION_SERVICE_URL}/funcionarios/${funcionario.id}/configuracion`, { timeout: 2000 });
            const { turno, tipoComensal } = configRes.data;
            if (!turno || !tipoComensal) {
                omitidos.push({ idFuncionario: funcionario.id, motivo: 'Sin turno o tipo de comensal.' });
                continue;
            }

            const serviciosRes = await axios.get(`${CONFIGURACION_SERVICE_URL}/turnos/${turno.idTurno}/servicios`, { timeout: 2000 });
            const servicios = serviciosRes.data.serviciosHabilitados.slice(0, tipoComensal.cantidadVales);

            for (const idServicio of servicios) {
                const idVale = `BASE-${fechaUso}-${funcionario.id}-${idServicio}`;
                try {
                    await valeRepository.insertar(new Vale({
                        idVale,
                        idFuncionario: funcionario.id,
                        idServicio,
                        estadoUso: 'NO_UTILIZADO',
                        expirado: false,
                        tipoAsignacion: 'POR_TURNO',
                        valor,
                        fechaUso,
                        horaInicioValidez: '00:00',
                        horaFinValidez: '23:59',
                        fechaExpiracion: fechaUso,
                        motivo: null
                    }));
                    creados.push(idVale);
                } catch (err) {
                    omitidos.push({ idVale, motivo: 'Duplicado o no insertable.' });
                }
            }
        } catch (err) {
            omitidos.push({ idFuncionario: funcionario.id, motivo: 'No se pudo obtener configuracion.' });
        }
    }

    return { creados, omitidos };
};

const obtenerTodosLosVales = async () => {
    await valeRepository.actualizarExpirados();
    return valeRepository.listarTodos();
};

module.exports = {
    validarVale,
    registrarCanjeVale,
    obtenerValesDisponibles,
    registrarValeAdicional,
    imprimirVale,
    generarValesBase,
    obtenerTodosLosVales
};
