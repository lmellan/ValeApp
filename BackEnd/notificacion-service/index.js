const express = require('express');
const { enviarResumenSemanal } = require('./controller/notificacionController');

const app = express();
const PORT = 3006;

app.use(express.json());
app.post('/notificaciones/resumen-semanal/:idFuncionario', enviarResumenSemanal);

app.listen(PORT, () => console.log(`Notificacion-Service en http://localhost:${PORT}`));