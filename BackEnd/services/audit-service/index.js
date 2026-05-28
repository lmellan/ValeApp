const express = require('express');
const auditController = require('./controller/auditController');

const app = express();
const port = 3002;

app.use(express.json());

app.post('/logs', auditController.registrarLog);
app.get('/logs', auditController.listarLogs);

app.listen(port, () => {
    console.log(`Audit-Service escuchando en http://localhost:${port}`);
});
