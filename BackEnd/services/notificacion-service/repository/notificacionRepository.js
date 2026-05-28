const axios = require('axios');

const USUARIO_SERVICE_URL = process.env.USUARIO_SERVICE_URL || 'http://localhost:3001';
const VALE_SERVICE_URL = process.env.VALE_SERVICE_URL || 'http://localhost:3000';

const obtenerUsuario = async (idFuncionario) => {
    const response = await axios.get(`${USUARIO_SERVICE_URL}/usuarios/${idFuncionario}`, { timeout: 2000 });
    return response.data;
};

const obtenerVales = async () => {
    const response = await axios.get(`${VALE_SERVICE_URL}/vales/todos`, { timeout: 2000 });
    return response.data;
};

module.exports = { obtenerUsuario, obtenerVales };
