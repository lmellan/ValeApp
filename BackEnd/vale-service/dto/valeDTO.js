// Este DTO toma el objeto feo o crudo de la Base de Datos 
// y lo transforma en el formato exacto que documentaron en el README
const infoValeResponseDTO = (valeEntity) => {
    return {
        idVale: valeEntity.idVale,
        estado: valeEntity.estado,
        tipoAsignacion: valeEntity.tipoAsignacion,
        valor: valeEntity.valor
        // Omitimos "idFuncionario" y "fechaExpiracion" porque al frontend no le importan en este JSON
    };
};

// Este DTO toma el JSON que envía el administrador y asegura que tenga el formato correcto para el Servicio
const crearValeInputDTO = (body) => {
    if (!body.idVale || !body.idFuncionario || !body.tipoAsignacion || !body.valor || !body.fechaExpiracion) {
        throw new Error("Faltan campos obligatorios para crear el vale adicional.");
    }
    return {
        idVale: body.idVale,
        idFuncionario: parseInt(body.idFuncionario),
        estado: 'No utilizado', // Todo vale nuevo empieza sin usar (R27)
        tipoAsignacion: body.tipoAsignacion,
        valor: parseInt(body.valor),
        fechaExpiracion: body.fechaExpiracion
    };
};

// Recuerda actualizar las exportaciones al final del archivo
module.exports = { 
    infoValeResponseDTO,
    crearValeInputDTO 
};