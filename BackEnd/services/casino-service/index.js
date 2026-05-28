const express = require('express');
const app  = express();
const port = 3004;

app.use(express.json());

const ctrl = require('./controller/casinoController');

// --- Casinos ---
app.get('/casinos',                          ctrl.listarCasinos);
app.get('/casinos/:idCasino',               ctrl.obtenerCasino);
app.post('/casinos',                         ctrl.crearCasino);
app.get('/casinos/:idCasino/servicios',     ctrl.obtenerServiciosPorCasino);

// --- Servicios de alimentación ---
app.get('/servicios-alimentacion',                              ctrl.listarServicios);
app.get('/servicios-alimentacion/:idServicio',                  ctrl.obtenerServicio);
app.post('/servicios-alimentacion',                             ctrl.crearServicio);

// Endpoint principal para vale-service (R30: disponibilidad calculada)
app.get('/servicios-alimentacion/:idServicio/disponibilidad',  ctrl.verificarDisponibilidad);

app.listen(port, () => {
    console.log(`Casino-Service corriendo en http://localhost:${port}`);
});
