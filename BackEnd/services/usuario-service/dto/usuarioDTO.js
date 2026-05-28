const usuarioResponseDTO = (usuario) => ({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: Boolean(usuario.activo)
});

const crearUsuarioInputDTO = (body) => {
    if (!body.nombre || !body.correo || !body.rol) {
        throw new Error('Faltan campos obligatorios: nombre, correo y rol.');
    }
    return {
        nombre: body.nombre,
        correo: body.correo,
        rol: body.rol,
        activo: body.activo !== false
    };
};

module.exports = { usuarioResponseDTO, crearUsuarioInputDTO };
