const express = require('express');
const { generarResumen } = require('./controller/reporteController');

const app = express();
const PORT = 3004;

app.use(express.json());
app.get('/reportes/resumen', generarResumen);

app.listen(PORT, () => console.log(`Reporte-Service en http://localhost:${PORT}`));