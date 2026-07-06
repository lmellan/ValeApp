const repo = require('./repository/usuarioRepository');

(async () => {
  try {
    const identificador = process.argv[2] || 'ADM1203';
    const usuario = await repo.obtenerPorCorreoOCodigo(identificador);
    console.log('usuario:', usuario);
  } catch (err) {
    console.error('error:', err.message || err);
  } finally {
    process.exit(0);
  }
})();
