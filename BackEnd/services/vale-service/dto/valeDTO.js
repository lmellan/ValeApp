const getTodayInput = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

const isValidDateInput = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
const isValidMonthInput = (value) => /^\d{4}-\d{2}$/.test(value || '') && Number(value.slice(5, 7)) >= 1 && Number(value.slice(5, 7)) <= 12;

const infoValeResponseDTO = (valeEntity) => ({
    idVale: valeEntity.idVale,
    idFuncionario: valeEntity.idFuncionario,
    idServicio: valeEntity.idServicio,
    estadoUso: valeEntity.estadoUso,
    expirado: Boolean(valeEntity.expirado),
    tipoAsignacion: valeEntity.tipoAsignacion,
    valor: valeEntity.valor,
    fechaUso: valeEntity.fechaUso,
    horaInicioValidez: valeEntity.horaInicioValidez,
    horaFinValidez: valeEntity.horaFinValidez,
    fechaExpiracion: valeEntity.fechaExpiracion,
    motivo: valeEntity.motivo,
    impreso: Boolean(valeEntity.fechaHoraImpresion),
    fechaHoraImpresion: valeEntity.fechaHoraImpresion,
    idCajeroCanje: valeEntity.idCajeroCanje,
    fechaHoraCanje: valeEntity.fechaHoraCanje,
    createdAt: valeEntity.createdAt
});

const validarDatosValeAdicional = (body, requiereId = true) => {
    if (requiereId && !body.idVale) {
        throw new Error('El ID del vale es obligatorio.');
    }
    if (!body.idFuncionario || !body.idServicio || !body.fechaUso) {
        throw new Error('Faltan campos obligatorios: idFuncionario, idServicio y fechaUso.');
    }
    if (!isValidDateInput(body.fechaUso)) {
        throw new Error('La fecha de uso no es valida.');
    }
    if (body.fechaUso < getTodayInput()) {
        throw new Error('La fecha de uso no puede ser anterior a hoy.');
    }

    return {
        idVale: body.idVale,
        idFuncionario: parseInt(body.idFuncionario),
        idServicio: parseInt(body.idServicio),
        estadoUso: 'NO_UTILIZADO',
        expirado: false,
        tipoAsignacion: 'ADMINISTRATIVA',
        valor: body.valor === undefined || body.valor === null || body.valor === '' ? null : parseInt(body.valor),
        fechaUso: body.fechaUso,
        horaInicioValidez: body.horaInicioValidez || '00:00',
        horaFinValidez: body.horaFinValidez || '23:59',
        fechaExpiracion: body.fechaExpiracion || body.fechaUso,
        motivo: body.motivo || null,
        cantidadVales: Math.max(1, parseInt(body.cantidadVales || 1))
    };
};

const crearValeInputDTO = (body) => validarDatosValeAdicional(body, true);

const actualizarValeInputDTO = (body) => validarDatosValeAdicional(body, false);

const generarValesBaseInputDTO = (body) => {
    if (body.fechaUso) {
        if (!isValidDateInput(body.fechaUso)) throw new Error('fechaUso debe tener formato YYYY-MM-DD.');
        return { fechaUso: body.fechaUso };
    }

    const periodo = body.periodo || body.mes || (body.anio && body.mesNumero ? `${body.anio}-${String(body.mesNumero).padStart(2, '0')}` : null);
    if (!isValidMonthInput(periodo)) {
        throw new Error('Debe indicar fechaUso YYYY-MM-DD o periodo/mes YYYY-MM para generar vales base.');
    }

    return { periodo };
};

module.exports = {
    infoValeResponseDTO,
    crearValeInputDTO,
    actualizarValeInputDTO,
    generarValesBaseInputDTO
};
