const express = require('express');
const app = express();
const port = 3001; // Usamos el 3001 para que no choque con el vale-service (3000)
const usuarioController = require('./controller/usuarioController');

app.get('/usuarios/:idUsuario/rol', usuarioController.obtenerRolUsuario);

app.listen(port, () => {
    console.log(`Usuario-Service corriendo en http://localhost:${port}`);
});