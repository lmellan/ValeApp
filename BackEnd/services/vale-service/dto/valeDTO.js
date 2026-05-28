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
    fechaHoraCanje: valeEntity.fechaHoraCanje
});

const crearValeInputDTO = (body) => {
    if (!body.idVale || !body.idFuncionario || !body.idServicio || !body.valor || !body.fechaUso) {
        throw new Error('Faltan campos obligatorios: idVale, idFuncionario, idServicio, valor y fechaUso.');
    }
    if (!body.motivo) {
        throw new Error('Todo vale adicional debe tener motivo.');
    }

    return {
        idVale: body.idVale,
        idFuncionario: parseInt(body.idFuncionario),
        idServicio: parseInt(body.idServicio),
        estadoUso: 'NO_UTILIZADO',
        expirado: false,
        tipoAsignacion: 'ADMINISTRATIVA',
        valor: parseInt(body.valor),
        fechaUso: body.fechaUso,
        horaInicioValidez: body.horaInicioValidez || '00:00',
        horaFinValidez: body.horaFinValidez || '23:59',
        fechaExpiracion: body.fechaExpiracion || body.fechaUso,
        motivo: body.motivo
    };
};

const generarValesBaseInputDTO = (body) => ({
    fechaUso: body.fechaUso,
    valor: body.valor ? parseInt(body.valor) : 3500
});

module.exports = {
    infoValeResponseDTO,
    crearValeInputDTO,
    generarValesBaseInputDTO
};
