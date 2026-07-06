const express = require('express');
const app = express();
const port = 3004;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
    .split(',')
    .map(origin => origin.trim());

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});
app.use(express.json());

const ctrl = require('./controller/casinoController');

app.get('/casinos', ctrl.listarCasinos);
app.get('/casinos/:idCasino', ctrl.obtenerCasino);
app.post('/casinos', ctrl.crearCasino);
app.get('/casinos/:idCasino/servicios', ctrl.obtenerServiciosPorCasino);

app.get('/servicios-alimentacion', ctrl.listarServicios);
app.get('/servicios-alimentacion/:idServicio', ctrl.obtenerServicio);
app.post('/servicios-alimentacion', ctrl.crearServicio);
app.put('/servicios-alimentacion/:idServicio', ctrl.editarServicio);
app.get('/servicios-alimentacion/:idServicio/disponibilidad', ctrl.verificarDisponibilidad);

app.listen(port, () => {
    console.log(`Casino-Service corriendo en http://localhost:${port}`);
});
