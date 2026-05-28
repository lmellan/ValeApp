const repository = require('../repository/usuarioRepository');

const rolesValidos = ['Funcionario', 'Administrador', 'Cajero'];

const validarRol = (rol) => {
    if (!rolesValidos.includes(rol)) {
        throw new Error('Rol invalido. Debe ser Funcionario, Administrador o Cajero.');
    }
};

const listarUsuarios = (filtros) => repository.listar(filtros);

const obtenerUsuario = async (idUsuario) => {
    const usuario = await repository.obtenerPorId(idUsuario);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
};

const crearUsuario = async (datos) => {
    validarRol(datos.rol);
    return repository.crear(datos);
};

const editarUsuario = async (idUsuario, datos) => {
    if (datos.rol) validarRol(datos.rol);
    const usuario = await repository.actualizar(idUsuario, datos);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
};

module.exports = { listarUsuarios, obtenerUsuario, crearUsuario, editarUsuario };
