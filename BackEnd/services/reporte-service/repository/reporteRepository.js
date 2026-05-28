const axios = require('axios');

const VALE_SERVICE_URL = process.env.VALE_SERVICE_URL || 'http://localhost:3000';

const obtenerVales = async () => {
    const response = await axios.get(`${VALE_SERVICE_URL}/vales/todos`, { timeout: 2000 });
    return response.data;
};

module.exports = { obtenerVales };
