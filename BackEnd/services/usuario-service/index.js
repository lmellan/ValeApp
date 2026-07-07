const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001; // Usamos el 3001 para que no choque con el vale-service (3000)
const usuarioController = require('./controller/usuarioController');

app.use(cors({
  origin: 'http://localhost:4173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));
app.use(express.json());

app.get('/usuarios', usuarioController.listarUsuarios);
app.get('/usuarios/:idUsuario/rol', usuarioController.obtenerRolUsuario);
app.get('/usuarios/:idUsuario/correo', usuarioController.obtenerCorreoUsuario);
app.get('/usuarios/:idUsuario', usuarioController.obtenerDatosUsuario);
app.post('/usuarios', usuarioController.crearUsuario);
app.post('/usuarios/login', usuarioController.loginUsuario);
app.put('/usuarios/:idUsuario', usuarioController.editarUsuario);

app.listen(port, () => {
    console.log(`Usuario-Service corriendo en http://localhost:${port}`);
});
