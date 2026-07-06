const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:3001/usuarios/login', { identificador: 'ADM1203', contrasena: 'admin123' }, { timeout: 5000 });
    console.log('status', res.status);
    console.log('data', res.data);
  } catch (err) {
    if (err.response) {
      console.error('status', err.response.status);
      console.error('data', err.response.data);
    } else {
      console.error('error', err.message);
    }
  }
})();
