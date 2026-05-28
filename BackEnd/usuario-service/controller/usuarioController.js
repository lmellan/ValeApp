const obtenerRolUsuario = (req, res) => {
    const idUsuario = req.params.idUsuario;
    console.log("Buscando usuario con ID:", idUsuario); // <-- Esto te ayudará a ver qué está llegando

    const usuariosMock = {
        '1': { id: 1, rol: 'Funcionario' },
        '2': { id: 2, rol: 'Cajero' },
        '3': { id: 3, rol: 'Administrador' }
    };

    const usuario = usuariosMock[idUsuario];
    
    if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
};

const obtenerDatosUsuario = (req, res) => {
    const idUsuario = req.params.idUsuario;
    res.json({
        id: idUsuario,
        nombre: "Funcionario Mock",
        correo: `funcionario${idUsuario}@vales.cl`
    });
};


module.exports = { obtenerRolUsuario, obtenerDatosUsuario };