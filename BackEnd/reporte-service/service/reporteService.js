const axios = require('axios');

const obtenerResumenVales = async () => {
    
    const response = await axios.get('http://localhost:3000/vales/todos');
    const vales = response.data;
    
    return {
        totalEmitidos: vales.length,
        utilizados: vales.filter(v => v.estado === 'Utilizado').length,
        noUtilizados: vales.filter(v => v.estado === 'No utilizado').length,
        adicionales: vales.filter(v => v.tipoAsignacion === 'Adicional').length
    };
};

module.exports = { obtenerResumenVales };