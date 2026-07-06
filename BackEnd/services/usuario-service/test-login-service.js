const service = require('./service/usuarioService');

(async () => {
  try {
    const identificador = process.argv[2] || 'ADM1203';
    const contrasena = process.argv[3] || 'admin123';
    const user = await service.loginUsuario(identificador, contrasena);
    console.log('login success ->', user);
  } catch (err) {
    console.error('login error ->', err.message || err);
  } finally {
    process.exit(0);
  }
})();
