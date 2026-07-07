const { test } = require('node:test');
const assert = require('node:assert');

const {
  crearCasinoInputDTO,
  crearServicioInputDTO,
  servicioResponseDTO
} = require('../services/casino-service/dto/casinoDTO');

// --- Casino ---

test('crearCasinoInputDTO exige nombre', () => {
  assert.throws(() => crearCasinoInputDTO({}), /nombre/);
});

test('crearCasinoInputDTO deja direccion nula por defecto', () => {
  const dto = crearCasinoInputDTO({ nombre: 'Casino Central' });
  assert.strictEqual(dto.direccion, null);
});

// --- Servicio de alimentacion ---

test('crearServicioInputDTO exige campos obligatorios', () => {
  assert.throws(() => crearServicioInputDTO({ nombre: 'Desayuno' }), /Faltan campos obligatorios/);
});

test('crearServicioInputDTO parsea idCasino y activa por defecto', () => {
  const dto = crearServicioInputDTO({ nombre: 'Desayuno', horaInicio: '08:00', horaFin: '10:00', idCasino: '1' });
  assert.strictEqual(dto.idCasino, 1);
  assert.strictEqual(dto.activo, true);
  assert.strictEqual(dto.categoria, null);
});

test('crearServicioInputDTO respeta activo=false', () => {
  const dto = crearServicioInputDTO({ nombre: 'Desayuno', horaInicio: '08:00', horaFin: '10:00', idCasino: 1, activo: false });
  assert.strictEqual(dto.activo, false);
});

test('servicioResponseDTO normaliza activo a booleano', () => {
  const dto = servicioResponseDTO({ idServicio: 1, nombre: 'Desayuno', activo: 1 });
  assert.strictEqual(dto.activo, true);
});
