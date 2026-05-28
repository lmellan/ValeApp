const express = require('express');
const app = express();
const port = 3001; // Usamos el 3001 para que no choque con el vale-service (3000)
const usuarioController = require('./controller/usuarioController');

app.use(express.json());

app.get('/usuarios', usuarioController.listarUsuarios);
app.get('/usuarios/:idUsuario/rol', usuarioController.obtenerRolUsuario);
app.get('/usuarios/:idUsuario', usuarioController.obtenerDatosUsuario);
app.post('/usuarios', usuarioController.crearUsuario);
app.put('/usuarios/:idUsuario', usuarioController.editarUsuario);

app.listen(port, () => {
    console.log(`Usuario-Service corriendo en http://localhost:${port}`);
});
