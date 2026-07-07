const usuarioService = require('../service/usuarioService');
const repository = require('../repository/usuarioRepository');
const { usuarioResponseDTO, crearUsuarioInputDTO } = require('../dto/usuarioDTO');

const listarUsuarios = async (req, res) => {
    try {
        const filtros = { rol: req.query.rol, activo: req.query.activo };
        const usuarios = await usuarioService.listarUsuarios(filtros);
        res.json(usuarios.map(usuarioResponseDTO));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerRolUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerUsuario(req.params.idUsuario);
        res.json({ id: usuario.id, rol: usuario.rol, activo: usuario.activo });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const obtenerDatosUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerUsuario(req.params.idUsuario);
        res.json(usuarioResponseDTO(usuario));
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const obtenerCorreoUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.obtenerUsuario(req.params.idUsuario);
        res.json({ id: usuario.id, correo: usuario.correo });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const crearUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.crearUsuario(crearUsuarioInputDTO(req.body));
        res.status(201).json(usuarioResponseDTO(usuario));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const identificador = req.body.identificador || req.body.correo;
        const { contrasena } = req.body;
        if (!identificador || !contrasena) {
            return res.status(400).json({ error: 'Código o correo y contraseña son obligatorios.' });
        }
        const usuario = await repository.obtenerPorCorreoOCodigo(identificador);
        if (!usuario || String(usuario.contrasena).trim() !== String(contrasena || '').trim()) {
            return res.status(401).json({ error: 'Código, correo o contraseña incorrectos.' });
        }
        res.json(usuarioResponseDTO(usuario));
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const editarUsuario = async (req, res) => {
    try {
        const usuario = await usuarioService.editarUsuario(req.params.idUsuario, req.body);
        res.json(usuarioResponseDTO(usuario));
    } catch (error) {
        res.status(error.message.includes('no encontrado') ? 404 : 400).json({ error: error.message });
    }
};

module.exports = {
    listarUsuarios,
    obtenerRolUsuario,
    obtenerDatosUsuario,
    obtenerCorreoUsuario,
    crearUsuario,
    loginUsuario,
    editarUsuario
};
