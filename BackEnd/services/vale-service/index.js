const express = require('express');
const app = express();
const port = 3000;

const valeController = require('./controller/valeController');
const valeService = require('./service/valeService');

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-usuario-id, x-funcionario-id');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor ValeApp corriendo al 100%!');
});

// Rutas de vales
app.get('/vales/todos', valeController.obtenerTodosLosVales);
app.get('/vales/resumen', valeController.obtenerResumenGenerico);
app.get('/vales/:idVale', valeController.consultarVale);
app.post('/vales/:idVale/validar', valeController.validarVale);
app.post('/vales/:idVale/canjear', valeController.canjearVale);
app.post('/vales/:idVale/imprimir', valeController.imprimirVale);
app.get('/funcionarios/:idFuncionario/vales-disponibles', valeController.listarValesDisponibles);
app.get('/funcionarios/:idFuncionario/vales/resumen', valeController.obtenerResumenValesFuncionario);
app.get('/administrador/vales', valeController.listarValesAdicionales);
app.post('/administrador/vales', valeController.crearValeAdicional);
app.put('/administrador/vales/:idVale', valeController.actualizarValeAdicional);
app.post('/sistema/vales-base/generar', valeController.generarValesBase);
app.post('/sistema/funcionarios/:idFuncionario/vales-base/recalcular', valeController.recalcularValesBaseFuncionario);

app.listen(port, () => {
  console.log(`Servidor de vales escuchando en http://localhost:${port}`);
});


const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isBusinessDay = (date) => date.getDay() !== 0 && date.getDay() !== 6;

const isFirstBusinessDayOfMonth = (date) => {
  if (!isBusinessDay(date)) return false;
  const cursor = new Date(date.getFullYear(), date.getMonth(), 1);
  while (!isBusinessDay(cursor)) cursor.setDate(cursor.getDate() + 1);
  return toInputDate(cursor) === toInputDate(date);
};

let lastAutoGenerationPeriod = null;

const runMonthlyBaseVoucherJob = async () => {
  const today = new Date();
  if (!isFirstBusinessDayOfMonth(today)) return;

  const periodo = toInputDate(today).slice(0, 7);
  if (lastAutoGenerationPeriod === periodo) return;

  try {
    const result = await valeService.generarValesBase({ periodo });
    lastAutoGenerationPeriod = periodo;
    console.log(`[vale-service] Vales base ${periodo}: ${result.creados.length} creados, ${result.omitidos.length} omitidos.`);
  } catch (err) {
    console.error('[vale-service] Error generando vales base mensuales:', err.message || err);
  }
};

setTimeout(runMonthlyBaseVoucherJob, 5000);
setInterval(runMonthlyBaseVoucherJob, 6 * 60 * 60 * 1000);