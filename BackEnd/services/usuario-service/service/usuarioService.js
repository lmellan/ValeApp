const repository = require('../repository/usuarioRepository');

const CONFIGURACION_SERVICE_URL = process.env.CONFIGURACION_SERVICE_URL || 'http://localhost:3003';
const VALE_SERVICE_URL = process.env.VALE_SERVICE_URL || 'http://localhost:3000';
const rolesValidos = ['Funcionario', 'Administrador', 'Cajero'];

const validarRol = (rol) => {
    if (!rolesValidos.includes(rol)) {
        throw new Error('Rol inválido. Debe ser Funcionario, Administrador o Cajero.');
    }
};

const sincronizarTipoComensal = async (usuario) => {
    try {
        if (usuario.rol === 'Funcionario' && usuario.id_tipo_comensal) {
            await fetch(`${CONFIGURACION_SERVICE_URL}/funcionarios/${usuario.id}/tipo-comensal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idTipoComensal: usuario.id_tipo_comensal })
            });
            return;
        }

        await fetch(`${CONFIGURACION_SERVICE_URL}/funcionarios/${usuario.id}/tipo-comensal`, { method: 'DELETE' });
    } catch (err) {
        console.warn('[usuarioService] No se pudo sincronizar tipo de comensal:', err.message || err);
    }
};

const getTodayInput = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

const normalizarTurno = (turno) => String(turno || '').replace('24:00', '00:00').replace(/\s/g, '');

const obtenerIdTurnoDesdeTexto = async (turnoTexto) => {
    const response = await fetch(`${CONFIGURACION_SERVICE_URL}/turnos`);
    if (!response.ok) throw new Error('No se pudieron obtener los turnos.');
    const turnos = await response.json();
    const turnoNormalizado = normalizarTurno(turnoTexto);
    const turno = turnos.find(item => normalizarTurno(`${item.horaInicio.slice(0, 5)}-${item.horaFin.slice(0, 5)}`) === turnoNormalizado);
    if (!turno) throw new Error(`No existe turno configurado para ${turnoTexto}.`);
    return turno.idTurno;
};

const sincronizarTurno = async (usuario) => {
    try {
        if (usuario.rol !== 'Funcionario' || !usuario.turno) return;
        const idTurno = await obtenerIdTurnoDesdeTexto(usuario.turno);
        const response = await fetch(`${CONFIGURACION_SERVICE_URL}/asignaciones-turno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idFuncionario: usuario.id, idTurno, fechaInicio: getTodayInput() })
        });
        if (!response.ok) throw new Error(await response.text());
    } catch (err) {
        console.warn('[usuarioService] No se pudo sincronizar turno:', err.message || err);
    }
};

const recalcularValesFuturosPorCambioTurno = async (usuario) => {
    try {
        const response = await fetch(`${VALE_SERVICE_URL}/sistema/funcionarios/${usuario.id}/vales-base/recalcular`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ desdeFecha: getTodayInput() })
        });
        if (!response.ok) throw new Error(await response.text());
    } catch (err) {
        console.warn('[usuarioService] No se pudieron recalcular vales futuros:', err.message || err);
    }
};

const listarUsuarios = (filtros) => repository.listar(filtros);

const obtenerUsuario = async (idUsuario) => {
    const usuario = await repository.obtenerPorId(idUsuario);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
};

const generarCodigoParaRol = (rol) => {
    const prefijos = {
        Funcionario: 'FUN',
        Cajero: 'CAJ',
        Administrador: 'ADM'
    };
    const prefijo = prefijos[rol] || 'USR';
    const numero = crypto.randomInt(1000, 10000);
    return `${prefijo}${numero}`;
};

const loginUsuario = async (identificador, contrasena) => {
    const usuario = await repository.obtenerPorCorreoOCodigo(identificador);
    console.log('[loginUsuario] identificador=', identificador, 'provided=', contrasena);
    console.log('[loginUsuario] usuarioStoreContrasena=', usuario && usuario.contrasena);
    if (!usuario || usuario.contrasena !== contrasena) {
        throw new Error('Código, correo o contraseña incorrectos');
    }
    return usuario;
};

const crearUsuario = async (datos) => {
    validarRol(datos.rol);
    if (!datos.codigo) {
        datos.codigo = await generarCodigoParaRol(datos.rol);
    }
    if (datos.rol === 'Funcionario') {
        if (!datos.id_tipo_comensal || !datos.tipo_comensal || !datos.turno) {
            throw new Error('Funcionario debe tener tipo de comensal y turno.');
        }
    } else {
        datos.id_tipo_comensal = null;
        datos.tipo_comensal = null;
        datos.turno = null;
    }

    const usuario = await repository.crear(datos);
    await sincronizarTipoComensal(usuario);
    await sincronizarTurno(usuario);
    if (usuario.rol === 'Funcionario') {
        await recalcularValesFuturosPorCambioTurno(usuario);
    }
    return usuario;
};

const editarUsuario = async (idUsuario, datos) => {
    if (datos.rol) validarRol(datos.rol);
    const usuarioActual = await repository.obtenerPorId(idUsuario);
    if (!usuarioActual) throw new Error('Usuario no encontrado');

    const rolFinal = datos.rol ?? usuarioActual.rol;
    if (rolFinal === 'Funcionario') {
        if (!datos.id_tipo_comensal && !usuarioActual.id_tipo_comensal && !datos.tipo_comensal && !usuarioActual.tipo_comensal) {
            throw new Error('Funcionario debe tener tipo de comensal.');
        }
        if (!datos.turno && !usuarioActual.turno) {
            throw new Error('Funcionario debe tener turno.');
        }
    } else {
        datos.id_tipo_comensal = null;
        datos.tipo_comensal = null;
        datos.turno = null;
    }

    const turnoAnterior = usuarioActual.turno;
    const tipoComensalAnterior = usuarioActual.id_tipo_comensal;
    const rolAnterior = usuarioActual.rol;
    const activoAnterior = usuarioActual.activo;
    const usuario = await repository.actualizar(idUsuario, datos);
    if (!usuario) throw new Error('Usuario no encontrado');
    await sincronizarTipoComensal(usuario);

    const cambioTurno = datos.turno && datos.turno !== turnoAnterior;
    const cambioTipoComensal = datos.id_tipo_comensal && datos.id_tipo_comensal !== tipoComensalAnterior;
    const cambioRol = datos.rol && datos.rol !== rolAnterior;
    const cambioActivo = datos.activo !== undefined && datos.activo !== activoAnterior;

    if (usuario.rol === 'Funcionario' && cambioTurno) {
        await sincronizarTurno(usuario);
    }
    if (usuarioActual.rol === 'Funcionario' && (cambioTurno || cambioTipoComensal || cambioRol || cambioActivo)) {
        await recalcularValesFuturosPorCambioTurno(usuario);
    }
    return usuario;
};

module.exports = { listarUsuarios, obtenerUsuario, loginUsuario, crearUsuario, editarUsuario };
