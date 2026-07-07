const axios = require('axios');

const USUARIO_SERVICE_URL = process.env.USUARIO_SERVICE_URL || 'http://localhost:3001';
const VALE_SERVICE_URL = process.env.VALE_SERVICE_URL || 'http://localhost:3000';

const obtenerCorreoUsuario = async (idFuncionario) => {
    const response = await axios.get(`${USUARIO_SERVICE_URL}/usuarios/${idFuncionario}/correo`, { timeout: 2000 });
    return response.data;
};

const obtenerResumenValesFuncionario = async (idFuncionario) => {
    const response = await axios.get(`${VALE_SERVICE_URL}/funcionarios/${idFuncionario}/vales/resumen`, { timeout: 2000 });
    return response.data;
};

module.exports = { obtenerCorreoUsuario, obtenerResumenValesFuncionario };
