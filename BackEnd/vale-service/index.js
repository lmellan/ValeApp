const express = require('express');
const app = express();
const port = 3000;

const valeController = require('./controller/valeController');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Servidor ValeApp corriendo al 100%!');
});

// Rutas de vales
app.get('/vales/todos', valeController.obtenerTodosLosVales);
app.get('/vales/:idVale', valeController.consultarVale);
app.post('/vales/:idVale/validar', valeController.validarVale); // NUEVA RUTA POST
app.get('/funcionarios/:idFuncionario/vales-disponibles', valeController.listarValesDisponibles);
app.post('/administrador/vales', valeController.crearValeAdicional);

app.listen(port, () => {
  console.log(`Servidor de vales escuchando en http://localhost:${port}`);
});