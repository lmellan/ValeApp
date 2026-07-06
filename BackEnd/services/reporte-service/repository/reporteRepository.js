const axios = require('axios');

const VALE_SERVICE_URL = process.env.VALE_SERVICE_URL || 'http://localhost:3000';

const obtenerResumenValesGenerico = async () => {
    const response = await axios.get(`${VALE_SERVICE_URL}/vales/resumen`, { timeout: 2000 });
    return response.data;
};

module.exports = { obtenerResumenValesGenerico };
