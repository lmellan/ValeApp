const axios = require('axios');

const generarPayloadNotificacion = async (idFuncionario) => {
    
    const userRes = await axios.get(`http://localhost:3001/usuarios/${idFuncionario}`);
    const correo = userRes.data.correo;
    
    
    const valesRes = await axios.get(`http://localhost:3000/funcionarios/${idFuncionario}/vales-disponibles`);
    const valesDisponibles = valesRes.data;
    
    return {
        destinatario: correo,
        asunto: "Resumen Semanal de Vales",
        cuerpo: `Tienes ${valesDisponibles.length} vales disponibles para usar.`
    };
};

module.exports = { generarPayloadNotificacion };