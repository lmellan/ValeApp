const axios = require('axios');
const valeRepository = require('../repository/valeRepository');
const Vale = require('../model/vale');

const USUARIO_SERVICE_URL = process.env.USUARIO_SERVICE_URL || 'http://localhost:3001';
const CONFIGURACION_SERVICE_URL = process.env.CONFIGURACION_SERVICE_URL || 'http://localhost:3003';
const CASINO_SERVICE_URL = process.env.CASINO_SERVICE_URL || 'http://localhost:3004';

const esNoUtilizado = (vale) => vale.estadoUso === 'NO_UTILIZADO' || vale.estado === 'No utilizado';

const toDateOnly = (value) => {
    if (!value) return '';
    if (value instanceof Date) return toInputDate(value);
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? text.slice(0, 10) : toInputDate(parsed);
};

const toHourMinute = (value, fallback) => (value ? String(value).slice(0, 5) : fallback);
const toMinutes = (time) => {
    const [hours, minutes] = String(time || '00:00').slice(0, 5).split(':').map(Number);
    return (hours * 60) + minutes;
};

const expandirIntervalo = (inicio, fin) => {
    const a = toMinutes(inicio);
    const b = toMinutes(fin);
    if (b >= a) {
        return [[a, b]];
    }
    return [[a, 24 * 60 - 1], [0, b]];
};

const intervalosSeCruzan = (inicioA, finA, inicioB, finB) => {
    const segmentosA = expandirIntervalo(inicioA, finA);
    const segmentosB = expandirIntervalo(inicioB, finB);

    return segmentosA.some(([aInicio, aFin]) => segmentosB.some(([bInicio, bFin]) => aInicio <= bFin && aFin >= bInicio));
};
const fechaBaseVale = (vale) => toDateOnly(vale.fechaUso || vale.fechaExpiracion);
const fechaExpiracionVale = (vale) => toDateOnly(vale.fechaExpiracion || vale.fechaUso);
const fechaFinValidez = (vale) => new Date(`${fechaExpiracionVale(vale)}T${toHourMinute(vale.horaFinValidez, '23:59')}:59`);

const calcularExpirado = (vale, ahora = new Date()) => Boolean(vale.expirado) || fechaFinValidez(vale) < ahora;

const esValeDeHoy = (vale, ahora = new Date()) => fechaBaseVale(vale) === toInputDate(ahora);

const estaDentroDeRango = (vale, ahora = new Date()) => {
    const inicio = new Date(`${fechaBaseVale(vale)}T${toHourMinute(vale.horaInicioValidez, '00:00')}:00`);
    const fin = fechaFinValidez(vale);
    return ahora >= inicio && ahora <= fin;
};
const obtenerServicioAlimentacion = async (idServicio) => {
    const response = await axios.get(`${CASINO_SERVICE_URL}/servicios-alimentacion/${idServicio}`, { timeout: 2000 });
    return response.data;
};

const obtenerValorConfigurado = async (idTipoComensal, idServicio) => {
    const response = await axios.get(`${CONFIGURACION_SERVICE_URL}/valorizaciones-vales/valor`, {
        params: { idTipoComensal, idServicio },
        timeout: 2000
    });
    return response.data.valor;
};

const obtenerConfiguracionFuncionario = async (idFuncionario) => {
    const response = await axios.get(`${CONFIGURACION_SERVICE_URL}/funcionarios/${idFuncionario}/configuracion`, { timeout: 2000 });
    return response.data;
};

const prepararValeConValorizacion = async (valeData) => {
    const config = await obtenerConfiguracionFuncionario(valeData.idFuncionario);
    if (!config.turno) {
        const error = new Error('El funcionario no tiene turno configurado.');
        error.status = 400;
        throw error;
    }
    if (!config.tipoComensal) {
        const error = new Error('El funcionario no tiene tipo de comensal configurado.');
        error.status = 400;
        throw error;
    }
    const servicio = await obtenerServicioAlimentacion(valeData.idServicio);
    if (!intervalosSeCruzan(servicio.horaInicio, servicio.horaFin, config.turno.horaInicio, config.turno.horaFin)) {
        const error = new Error(`El servicio ${servicio.nombre} no coincide con el horario del turno del funcionario.`);
        error.status = 400;
        throw error;
    }
    let valor;
    try {
        valor = await obtenerValorConfigurado(config.tipoComensal.idTipoComensal, valeData.idServicio);
    } catch (err) {
        const error = new Error(`No existe una valorización activa para el tipo de comensal "${config.tipoComensal.nombre}" y el servicio "${servicio.nombre}".`);
        error.status = 400;
        throw error;
    }

    return {
        ...valeData,
        valor,
        horaInicioValidez: servicio.horaInicio || '00:00',
        horaFinValidez: servicio.horaFin || '23:59'
    };
};

const obtenerRolUsuario = async (idUsuario) => {
    const response = await axios.get(`${USUARIO_SERVICE_URL}/usuarios/${idUsuario}/rol`, { timeout: 2000 });
    return response.data.rol;
};

const validarPermisoCajero = async (idUsuario) => {
    const rol = await obtenerRolUsuario(idUsuario);
    if (rol !== 'Cajero' && rol !== 'Administrador') {
        const error = new Error('No tienes permisos para realizar esta acciÃ³n.');
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
        const error = new Error('Regla R31: El vale estÃ¡ expirado y no puede usarse.');
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
        const error = new Error('El vale estÃ¡ fuera de su rango horario de validez.');
        error.status = 400;
        throw error;
    }
    const config = await obtenerConfiguracionFuncionario(vale.idFuncionario);
    const permiteEmisionMultiple = Boolean(config.tipoComensal?.emisionMultiple);
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
    return { mensaje: 'Vale vÃ¡lido para canje.', vale };
};

const registrarCanjeVale = async (idVale, idCajero) => {
    await validarVale(idVale, idCajero);
    const fechaHoraCanje = new Date().toISOString();
    const resultado = await valeRepository.marcarCanjeadoSiDisponible(idVale, idCajero, fechaHoraCanje);

    if (resultado.changes === 0) {
        const error = new Error('El vale no pudo canjearse porque ya fue usado o expirÃ³.');
        error.status = 409;
        throw error;
    }

    return 'Vale validado y canjeado con Ã©xito';
};

const obtenerValesFuncionario = async (idFuncionario) => {
    await valeRepository.actualizarExpirados();
    return valeRepository.listarPorFuncionario(idFuncionario);
};

const obtenerValesDisponibles = async (idFuncionario) => {
    const vales = await obtenerValesFuncionario(idFuncionario);
    return vales.filter((vale) => esNoUtilizado(vale) && !calcularExpirado(vale));
};

const obtenerVale = async (idVale) => {
    await valeRepository.actualizarExpirados();
    return valeRepository.obtenerPorId(idVale);
};

const obtenerResumenValesFuncionario = async (idFuncionario) => {
    await valeRepository.actualizarExpirados();
    return valeRepository.obtenerResumenPorFuncionario(idFuncionario);
};

const obtenerResumenGenerico = async () => {
    await valeRepository.actualizarExpirados();
    return valeRepository.obtenerResumenGeneral();
};


const registrarValeAdicional = async (nuevoValeData) => {
    const config = await obtenerConfiguracionFuncionario(nuevoValeData.idFuncionario);
    const cantidadVales = config.tipoComensal?.emisionMultiple ? Math.max(1, Number(nuevoValeData.cantidadVales || 1)) : 1;
    const creados = [];

    const fechaUso = nuevoValeData.fechaUso;

    for (let copia = 1; copia <= cantidadVales; copia += 1) {
        const idVale = cantidadVales > 1 ? `${nuevoValeData.idVale}-${copia}` : nuevoValeData.idVale;
        try {
            const valeValorizado = await prepararValeConValorizacion({
                ...nuevoValeData,
                idVale,
                fechaUso,
                fechaExpiracion: fechaUso
            });
            await valeRepository.insertar(new Vale(valeValorizado));
            creados.push(idVale);
        } catch (err) {
            if (err.code === '23505' || err.message.includes('UNIQUE constraint failed')) {
                const error = new Error('El ID de vale ya existe en el sistema.');
                error.status = 400;
                throw error;
            }
            if (err.status) throw err;
            throw new Error(err.response?.data?.error || 'Error al insertar el vale adicional en la base de datos.');
        }
    }

    return { mensaje: 'Vale adicional creado y asignado con Ã©xito.', creados };
};const listarValesAdicionales = async () => {
    await valeRepository.actualizarExpirados();
    return valeRepository.listarAdministrativos();
};

const actualizarValeAdicional = async (idVale, valeData) => {
    const existente = await valeRepository.obtenerPorId(idVale);
    if (!existente || existente.tipoAsignacion !== 'ADMINISTRATIVA') {
        const error = new Error('Vale adicional no encontrado.');
        error.status = 404;
        throw error;
    }
    if (existente.estadoUso !== 'NO_UTILIZADO') {
        const error = new Error('No se puede editar un vale adicional que ya fue utilizado.');
        error.status = 409;
        throw error;
    }

    const valeValorizado = await prepararValeConValorizacion(valeData);
    const actualizado = await valeRepository.actualizarAdministrativo(idVale, new Vale({
        ...valeValorizado,
        idVale,
        tipoAsignacion: 'ADMINISTRATIVA'
    }));
    if (!actualizado) {
        const error = new Error('No se pudo actualizar el vale adicional.');
        error.status = 409;
        throw error;
    }
    return actualizado;
};

const sincronizarHorariosValeAdicional = async (idServicio, horaInicioValidez, horaFinValidez) => {
    return valeRepository.actualizarHorariosPorServicio(idServicio, horaInicioValidez, horaFinValidez);
};

const eliminarValeAdicional = async (idVale) => {
    const existente = await valeRepository.obtenerPorId(idVale);
    if (!existente || existente.tipoAsignacion !== 'ADMINISTRATIVA') {
        const error = new Error('Vale adicional no encontrado.');
        error.status = 404;
        throw error;
    }
    if (existente.estadoUso !== 'NO_UTILIZADO') {
        const error = new Error('No se puede eliminar un vale adicional que ya fue utilizado.');
        error.status = 409;
        throw error;
    }
    const eliminado = await valeRepository.eliminarAdministrativo(idVale);
    if (!eliminado) {
        const error = new Error('No se pudo eliminar el vale adicional.');
        error.status = 409;
        throw error;
    }
    return { mensaje: 'Vale adicional eliminado correctamente.', idVale: eliminado };
};

const imprimirVale = async (idVale, idFuncionario) => {
    await valeRepository.actualizarExpirados();
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
    if (!esValeDeHoy(vale)) {
        const error = new Error('Solo se pueden imprimir vales del dÃ­a actual.');
        error.status = 400;
        throw error;
    }
    if (!esNoUtilizado(vale)) {
        const error = new Error('El vale ya fue utilizado y no puede imprimirse.');
        error.status = 400;
        throw error;
    }
    if (calcularExpirado(vale)) {
        const error = new Error('El vale estÃ¡ expirado y no puede imprimirse.');
        error.status = 400;
        throw error;
    }
    if (!estaDentroDeRango(vale)) {
        const error = new Error('El vale solo puede imprimirse dentro de su horario de validez.');
        error.status = 400;
        throw error;
    }

    const config = await obtenerConfiguracionFuncionario(vale.idFuncionario);
    const permiteEmisionMultiple = Boolean(config.tipoComensal?.emisionMultiple);
    if (!permiteEmisionMultiple) {
        const coincidencias = await valeRepository.contarCoincidenciasImpresas(vale);
        if (coincidencias > 0) {
            const error = new Error('No se puede imprimir otro vale con horario coincidente para este funcionario.');
            error.status = 409;
            throw error;
        }
    }

    const fechaHoraImpresion = new Date().toISOString();
    await valeRepository.marcarImpreso(idVale, fechaHoraImpresion);
    return { mensaje: 'Vale impreso correctamente.', fechaHoraImpresion };
};

const toInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const obtenerDiasHabilesDelMes = (periodo, desdeFecha = null) => {
    const [year, month] = periodo.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const dates = [];

    while (date.getFullYear() === year && date.getMonth() === month - 1) {
        const day = date.getDay();
        const inputDate = toInputDate(date);
        if (day !== 0 && day !== 6 && (!desdeFecha || inputDate >= desdeFecha)) {
            dates.push(inputDate);
        }
        date.setDate(date.getDate() + 1);
    }

    return dates;
};

const generarValesBaseParaFecha = async ({ fechaUso, funcionarios }) => {
    const creados = [];
    const omitidos = [];

    for (const funcionario of funcionarios) {
        try {
            const { turno, tipoComensal } = await obtenerConfiguracionFuncionario(funcionario.id);
            if (!turno || !tipoComensal) {
                omitidos.push({ fechaUso, idFuncionario: funcionario.id, motivo: 'Sin turno o tipo de comensal.' });
                continue;
            }

            const serviciosRes = await axios.get(`${CONFIGURACION_SERVICE_URL}/turnos/${turno.idTurno}/servicios`, { timeout: 2000 });
            const servicios = serviciosRes.data.serviciosHabilitados || [];

            for (const idServicio of servicios) {
                const idVale = `BASE-${fechaUso}-${funcionario.id}-${idServicio}`;
                try {
                    const servicio = await obtenerServicioAlimentacion(idServicio);
                    const valor = await obtenerValorConfigurado(tipoComensal.idTipoComensal, idServicio);
                    await valeRepository.insertar(new Vale({
                        idVale,
                        idFuncionario: funcionario.id,
                        idServicio,
                        estadoUso: 'NO_UTILIZADO',
                        expirado: false,
                        tipoAsignacion: 'POR_TURNO',
                        valor,
                        fechaUso,
                        horaInicioValidez: servicio.horaInicio || '00:00',
                        horaFinValidez: servicio.horaFin || '23:59',
                        fechaExpiracion: fechaUso,
                        motivo: null
                    }));
                    creados.push(idVale);
                } catch (err) {
                    omitidos.push({ fechaUso, idVale, motivo: err.response?.data?.error || 'Duplicado, sin valorizaciÃ³n o no insertable.' });
                }
            }
        } catch (err) {
            omitidos.push({ fechaUso, idFuncionario: funcionario.id, motivo: err.response?.data?.error || 'No se pudo obtener configuraciÃ³n.' });
        }
    }

    return { creados, omitidos };
};

const obtenerFuncionariosParaGeneracion = async (idFuncionario = null) => {
    if (idFuncionario) {
        const usuarioRes = await axios.get(`${USUARIO_SERVICE_URL}/usuarios/${idFuncionario}`, { timeout: 2000 });
        const usuario = usuarioRes.data;
        return usuario.rol === 'Funcionario' && usuario.activo ? [usuario] : [];
    }

    const usuariosRes = await axios.get(`${USUARIO_SERVICE_URL}/usuarios?rol=Funcionario&activo=true`, { timeout: 2000 });
    return usuariosRes.data;
};

const generarValesBase = async ({ fechaUso, periodo, idFuncionario = null, desdeFecha = null }) => {
    if (!fechaUso && !periodo) throw new Error('fechaUso o periodo es requerido.');

    const fechas = periodo ? obtenerDiasHabilesDelMes(periodo, desdeFecha) : [fechaUso];
    const funcionarios = await obtenerFuncionariosParaGeneracion(idFuncionario);
    const creados = [];
    const omitidos = [];

    for (const fecha of fechas) {
        const resultado = await generarValesBaseParaFecha({ fechaUso: fecha, funcionarios });
        creados.push(...resultado.creados);
        omitidos.push(...resultado.omitidos);
    }

    return {
        periodo: periodo || fechaUso,
        diasHabiles: fechas.length,
        funcionarios: funcionarios.length,
        creados,
        omitidos
    };
};

const obtenerPeriodoDeFecha = (fecha) => fecha.slice(0, 7);

const recalcularValesBaseFuncionario = async ({ idFuncionario, desdeFecha }) => {
    const fechaInicio = desdeFecha || toInputDate(new Date());
    const periodo = obtenerPeriodoDeFecha(fechaInicio);
    const eliminados = await valeRepository.eliminarValesBaseFuturos(idFuncionario, fechaInicio);
    const resultado = await generarValesBase({ periodo, idFuncionario, desdeFecha: fechaInicio });

    return {
        idFuncionario: parseInt(idFuncionario),
        periodo,
        desdeFecha: fechaInicio,
        eliminados,
        creados: resultado.creados,
        omitidos: resultado.omitidos
    };
};
const obtenerTodosLosVales = async () => {
    await valeRepository.actualizarExpirados();
    return valeRepository.listarTodos();
};

module.exports = {
    validarVale,
    registrarCanjeVale,
    obtenerValesFuncionario,
    obtenerValesDisponibles,
    obtenerVale,
    obtenerResumenValesFuncionario,
    obtenerResumenGenerico,
    registrarValeAdicional,
    listarValesAdicionales,
    actualizarValeAdicional,
    eliminarValeAdicional,
    sincronizarHorariosValeAdicional,
    imprimirVale,
    generarValesBase,
    recalcularValesBaseFuncionario,
    obtenerTodosLosVales
};






