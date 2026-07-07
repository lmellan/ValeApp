const { test } = require('node:test');
const assert = require('node:assert');

const {
  crearTipoComensalInputDTO,
  crearTurnoInputDTO,
  crearAsignacionTurnoInputDTO,
  guardarValorizacionValeInputDTO,
  configuracionFuncionarioResponseDTO
} = require('../services/configuracion-service/dto/configuracionDTO');

// --- Tipo de comensal ---

test('crearTipoComensalInputDTO exige nombre', () => {
  assert.throws(() => crearTipoComensalInputDTO({}), /nombre/);
});

test('crearTipoComensalInputDTO aplica valores por defecto', () => {
  const dto = crearTipoComensalInputDTO({ nombre: 'Obrero' });
  assert.strictEqual(dto.cantidadVales, 1);
  assert.strictEqual(dto.emisionMultiple, false);
  assert.strictEqual(dto.color, '#0f4c81');
  assert.strictEqual(dto.descripcion, null);
});

// --- Turnos ---

test('crearTurnoInputDTO exige nombre, horaInicio y horaFin', () => {
  assert.throws(() => crearTurnoInputDTO({ nombre: 'Turno 1' }), /Faltan campos obligatorios/);
});

test('crearTurnoInputDTO devuelve el turno cuando es valido', () => {
  const dto = crearTurnoInputDTO({ nombre: 'Turno 1', horaInicio: '08:00', horaFin: '16:00' });
  assert.deepStrictEqual(dto, { nombre: 'Turno 1', horaInicio: '08:00', horaFin: '16:00' });
});

// --- Asignaciones de turno ---

test('crearAsignacionTurnoInputDTO exige campos obligatorios', () => {
  assert.throws(() => crearAsignacionTurnoInputDTO({ idFuncionario: 1 }), /Faltan campos obligatorios/);
});

test('crearAsignacionTurnoInputDTO parsea enteros y deja fechaFin nula', () => {
  const dto = crearAsignacionTurnoInputDTO({ idFuncionario: '3', idTurno: '2', fechaInicio: '2025-01-01' });
  assert.strictEqual(dto.idFuncionario, 3);
  assert.strictEqual(dto.idTurno, 2);
  assert.strictEqual(dto.fechaFin, null);
});

// --- Valorizacion ---

test('guardarValorizacionValeInputDTO exige campos obligatorios', () => {
  assert.throws(() => guardarValorizacionValeInputDTO({ idTipoComensal: 1, idServicio: 2 }), /Faltan campos obligatorios/);
});

test('guardarValorizacionValeInputDTO acepta valor 0', () => {
  const dto = guardarValorizacionValeInputDTO({ idTipoComensal: '1', idServicio: '2', valor: '0' });
  assert.strictEqual(dto.valor, 0);
  assert.strictEqual(dto.activo, true);
});

test('guardarValorizacionValeInputDTO respeta activo=false', () => {
  const dto = guardarValorizacionValeInputDTO({ idTipoComensal: 1, idServicio: 2, valor: 100, activo: false });
  assert.strictEqual(dto.activo, false);
});

// --- Configuracion de funcionario ---

test('configuracionFuncionarioResponseDTO devuelve null cuando no hay datos', () => {
  const dto = configuracionFuncionarioResponseDTO(null, null);
  assert.strictEqual(dto.turno, null);
  assert.strictEqual(dto.tipoComensal, null);
});

test('configuracionFuncionarioResponseDTO mapea turno y tipo de comensal', () => {
  const dto = configuracionFuncionarioResponseDTO(
    { idTurno: 1, nombre: 'Turno 1', horaInicio: '08:00', horaFin: '16:00' },
    { idTipoComensal: 2, nombre: 'Jefe', cantidadVales: 1, emisionMultiple: 1, color: '#000' }
  );
  assert.strictEqual(dto.turno.idTurno, 1);
  assert.strictEqual(dto.tipoComensal.emisionMultiple, true);
});
