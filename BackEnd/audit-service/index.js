const express = require('express');
const app = express();
app.use(express.json());
const port = 3002; // El tercer servicio en otro puerto

app.post('/logs', (req, res) => {
    const { evento, detalle, timestamp } = req.body;
    
    // Aquí es donde en un sistema real guardarías esto en una base de datos de logs o Elasticsearch
    console.log(`[AUDITORÍA - ${timestamp}] Evento: ${evento} | Detalle: ${detalle}`);
    
    res.status(202).json({ mensaje: "Registro de auditoría recibido" });
});

app.listen(port, () => {
    console.log(`Audit-Service escuchando en http://localhost:${port}`);
});