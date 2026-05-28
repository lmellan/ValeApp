const express = require('express');
const app = express();
const port = 3003;

app.use(express.json());

const ctrl = require('./controller/configuracionController');

// --- Tipos de comensal ---
app.get('/tipos-comensal',                 ctrl.listarTiposComensal);
app.get('/tipos-comensal/:idTipoComensal', ctrl.obtenerTipoComensal);
app.post('/tipos-comensal',                ctrl.crearTipoComensal);

// --- Turnos ---
app.get('/turnos',            ctrl.listarTurnos);
app.get('/turnos/:idTurno',   ctrl.obtenerTurno);
app.post('/turnos',           ctrl.crearTurno);

// --- Servicios habilitados por turno ---
app.get('/turnos/:idTurno/servicios',  ctrl.obtenerServiciosPorTurno);
app.post('/turnos/:idTurno/servicios', ctrl.agregarServicioATurno);

// --- Asignaciones de turno ---
app.post('/asignaciones-turno', ctrl.crearAsignacionTurno);

// --- Configuración de funcionario (principal para vale-service) ---
// GET /funcionarios/:idFuncionario/configuracion → turno vigente + tipo de comensal
app.get('/funcionarios/:idFuncionario/configuracion',        ctrl.obtenerConfiguracionFuncionario);
app.post('/funcionarios/:idFuncionario/tipo-comensal',       ctrl.asignarTipoComensalAFuncionario);

app.listen(port, () => {
    console.log(`Configuracion-Service corriendo en http://localhost:${port}`);
});
