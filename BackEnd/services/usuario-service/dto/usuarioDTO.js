const usuarioResponseDTO = (usuario) => ({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    codigo: usuario.codigo,
    rol: usuario.rol,
    id_tipo_comensal: usuario.id_tipo_comensal,
    tipo_comensal: usuario.tipo_comensal,
    turno: usuario.turno,
    activo: Boolean(usuario.activo)
});

const crearUsuarioInputDTO = (body) => {
    if (!body.nombre || !body.correo || !body.rol || !body.contrasena) {
        throw new Error('Faltan campos obligatorios: nombre, correo, contraseña y rol.');
    }
    return {
        nombre: body.nombre,
        correo: body.correo,
        codigo: body.codigo,
        contrasena: body.contrasena,
        rol: body.rol,
        id_tipo_comensal: body.id_tipo_comensal ? Number(body.id_tipo_comensal) : null,
        tipo_comensal: body.tipo_comensal,
        turno: body.turno,
        activo: body.activo !== false
    };
};

module.exports = { usuarioResponseDTO, crearUsuarioInputDTO };
