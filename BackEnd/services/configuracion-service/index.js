const express = require('express');
const app = express();
const port = 3003;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
    .split(',')
    .map(origin => origin.trim());

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});
app.use(express.json());

const ctrl = require('./controller/configuracionController');

// --- Tipos de comensal ---
app.get('/tipos-comensal',                 ctrl.listarTiposComensal);
app.get('/tipos-comensal/:idTipoComensal', ctrl.obtenerTipoComensal);
app.post('/tipos-comensal',                ctrl.crearTipoComensal);
app.put('/tipos-comensal/:idTipoComensal', ctrl.editarTipoComensal);

// --- Turnos ---
app.get('/turnos',            ctrl.listarTurnos);
app.get('/turnos/:idTurno',   ctrl.obtenerTurno);
app.post('/turnos',           ctrl.crearTurno);

// --- Servicios habilitados por turno ---
app.get('/turnos/:idTurno/servicios',                       ctrl.obtenerServiciosPorTurno);
app.post('/turnos/:idTurno/servicios',                      ctrl.agregarServicioATurno);
app.delete('/turnos/:idTurno/servicios/:idServicio',        ctrl.quitarServicioDeTurno);


// --- Valorización de vales ---
app.get('/valorizaciones-vales', ctrl.listarValorizacionesVale);
app.post('/valorizaciones-vales', ctrl.guardarValorizacionVale);
app.get('/valorizaciones-vales/valor', ctrl.obtenerValorVale);
// --- Asignaciones de turno ---
app.post('/asignaciones-turno', ctrl.crearAsignacionTurno);

// --- Configuracion de funcionario (principal para vale-service) ---
// GET /funcionarios/:idFuncionario/configuracion -> turno vigente + tipo de comensal
app.get('/funcionarios/:idFuncionario/configuracion',        ctrl.obtenerConfiguracionFuncionario);
app.post('/funcionarios/:idFuncionario/tipo-comensal',       ctrl.asignarTipoComensalAFuncionario);
app.delete('/funcionarios/:idFuncionario/tipo-comensal',    ctrl.quitarTipoComensalAFuncionario);

app.listen(port, () => {
    console.log(`Configuracion-Service corriendo en http://localhost:${port}`);
});



