const db = require('../repository/database');
const valeService = require('../service/valeService'); // Importamos el servicio
const { infoValeResponseDTO, crearValeInputDTO } = require('../dto/valeDTO');
const axios = require('axios'); // 1. Importamos Axios

const consultarVale = (req, res) => {
    const idVale = req.params.idVale; 
    const query = `SELECT * FROM vales WHERE idVale = ?`;
    
    db.get(query, [idVale], (err, row) => {
        if (err) return res.status(500).json({ error: "Error interno del servidor" });
        if (!row) return res.status(404).json({ error: "Vale no encontrado" });
        res.json(row);
    });
};

const validarVale = async (req, res) => {
    const idVale = req.params.idVale;
    const idUsuario = req.headers['x-usuario-id'] ? req.headers['x-usuario-id'].trim() : null;

    if (!idUsuario) {
        return res.status(401).json({ error: "Identificación de usuario requerida en headers." });
    }

    try {
        // 1. Llamada al servicio de usuarios
        const response = await axios.get(`http://localhost:3001/usuarios/${idUsuario}/rol`, {
            timeout: 2000
        });
        
        const rol = response.data.rol;

        if (rol !== 'Cajero' && rol !== 'Administrador') {
            return res.status(403).json({ error: "No tienes permisos para realizar esta acción." });
        }

        // 2. Lógica de validación del vale
        const mensajeExito = await valeService.validarUsoVale(idVale);

        // 3. Intento de auditoría (no bloqueante)
        try {
            await axios.post('http://localhost:3002/logs', {
                evento: "VALIDACION_VALE",
                detalle: `Usuario ${idUsuario} validó el vale ${idVale}`,
                timestamp: new Date().toISOString()
            });
        } catch (auditErr) {
            console.error("Fallo menor: Auditoría no registrada", auditErr.message);
        }

        return res.status(200).json({ mensaje: mensajeExito });

    } catch (error) {
        console.error("--- ERROR DEBUG ---");
        console.error("Tipo de error:", error.name);
        console.error("Mensaje:", error.message || error); // ✅ FIX AQUÍ
        console.error("Stack:", error.stack);
        
        // Manejo específico de errores de conexión con servicios externos
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: "Servicio de usuarios no disponible. Verifica que el servidor en puerto 3001 esté corriendo." 
            });
        }
        
        // Si el error viene de axios (servicio de usuarios)
        if (error.response) {
            return res.status(error.response.status).json({ 
                error: error.response.data.error || error.response.data 
            });
        }
        
        // Si el error viene del servicio de vales (puede ser string o Error)
        const mensajeError = error.message || error;
        
        // Determinar el código de estado apropiado
        if (mensajeError.includes("no encontrado")) {
            return res.status(404).json({ error: mensajeError });
        }
        if (mensajeError.includes("ya fue utilizado")) {
            return res.status(400).json({ error: mensajeError });
        }
        
        return res.status(500).json({ error: mensajeError });
    }
};

// Agrega esta función al final del archivo antes del module.exports
const listarValesDisponibles = async (req, res) => {
    const idFuncionario = req.params.idFuncionario;
    try {
        const valesEntidades = await valeService.obtenerValesDisponibles(idFuncionario);
        
        // Pasamos cada vale de la base de datos por el DTO para limpiarlo
        const valesDTO = valesEntidades.map(vale => infoValeResponseDTO(vale));
        
        res.status(200).json(valesDTO);
    } catch (errorMensaje) {
        res.status(500).json({ error: errorMensaje });
    }
};

const crearValeAdicional = async (req, res) => {
    try {
        // Validamos y limpiamos el cuerpo de la petición con el DTO de entrada
        const datosValidados = crearValeInputDTO(req.body);
        
        // Ejecutamos la inserción mediante el servicio
        const mensajeExito = await valeService.registrarValeAdicional(datosValidados);
        
        res.status(201).json({ mensaje: mensajeExito, valeCreado: datosValidados.idVale });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { consultarVale, validarVale, listarValesDisponibles, crearValeAdicional };
