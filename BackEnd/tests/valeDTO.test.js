const { test } = require('node:test');
const assert = require('node:assert');

const {
  infoValeResponseDTO,
  crearValeInputDTO,
  actualizarValeInputDTO,
  generarValesBaseInputDTO
} = require('../services/vale-service/dto/valeDTO');

// Fechas de calendario local con margen de 2 dias para evitar ambiguedad por zona horaria.
const fechaLocal = (offsetDias) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const manana = fechaLocal(2);
const ayer = fechaLocal(-2);

// --- infoValeResponseDTO ---

test('infoValeResponseDTO deriva impreso=true cuando hay fechaHoraImpresion', () => {
  const dto = infoValeResponseDTO({ idVale: 'V1', fechaHoraImpresion: '2025-01-01T10:00:00Z' });
  assert.strictEqual(dto.impreso, true);
});

test('infoValeResponseDTO deriva impreso=false sin fechaHoraImpresion', () => {
  const dto = infoValeResponseDTO({ idVale: 'V1', fechaHoraImpresion: null });
  assert.strictEqual(dto.impreso, false);
});

test('infoValeResponseDTO normaliza expirado a booleano', () => {
  const dto = infoValeResponseDTO({ idVale: 'V1', expirado: 1 });
  assert.strictEqual(dto.expirado, true);
});

// --- crearValeInputDTO (vale adicional) ---

test('crearValeInputDTO exige idVale', () => {
  assert.throws(() => crearValeInputDTO({ idFuncionario: 1, idServicio: 2, fechaUso: manana }), /ID del vale/);
});

test('crearValeInputDTO exige campos obligatorios', () => {
  assert.throws(() => crearValeInputDTO({ idVale: 'V1' }), /Faltan campos obligatorios/);
});

test('crearValeInputDTO rechaza fecha con formato invalido', () => {
  assert.throws(() => crearValeInputDTO({ idVale: 'V1', idFuncionario: 1, idServicio: 2, fechaUso: '01-01-2025' }), /no es v[aá]lida/);
});

test('crearValeInputDTO rechaza fecha de uso anterior a hoy', () => {
  assert.throws(() => crearValeInputDTO({ idVale: 'V1', idFuncionario: 1, idServicio: 2, fechaUso: ayer }), /anterior a hoy/);
});

test('crearValeInputDTO rechaza fechaExpiracion anterior a fechaUso', () => {
  assert.throws(() => crearValeInputDTO({ idVale: 'V1', idFuncionario: 1, idServicio: 2, fechaUso: manana, fechaExpiracion: ayer }), /anterior a la fecha de uso/);
});

test('crearValeInputDTO produce un vale ADMINISTRATIVA no utilizado', () => {
  const dto = crearValeInputDTO({ idVale: 'V1', idFuncionario: '5', idServicio: '2', fechaUso: manana, valor: '3000', motivo: 'Capacitacion' });
  assert.strictEqual(dto.tipoAsignacion, 'ADMINISTRATIVA');
  assert.strictEqual(dto.estadoUso, 'NO_UTILIZADO');
  assert.strictEqual(dto.expirado, false);
  assert.strictEqual(dto.idFuncionario, 5);
  assert.strictEqual(dto.idServicio, 2);
  assert.strictEqual(dto.valor, 3000);
  assert.strictEqual(dto.fechaExpiracion, manana);
});

test('crearValeInputDTO permite valor nulo', () => {
  const dto = crearValeInputDTO({ idVale: 'V1', idFuncionario: 1, idServicio: 2, fechaUso: manana, valor: '' });
  assert.strictEqual(dto.valor, null);
});

// --- actualizarValeInputDTO (no exige idVale) ---

test('actualizarValeInputDTO no exige idVale', () => {
  const dto = actualizarValeInputDTO({ idFuncionario: 1, idServicio: 2, fechaUso: manana, motivo: 'x' });
  assert.strictEqual(dto.tipoAsignacion, 'ADMINISTRATIVA');
});

// --- generarValesBaseInputDTO ---

test('generarValesBaseInputDTO acepta fechaUso valida', () => {
  const dto = generarValesBaseInputDTO({ fechaUso: '2025-03-10' });
  assert.deepStrictEqual(dto, { fechaUso: '2025-03-10' });
});

test('generarValesBaseInputDTO acepta periodo YYYY-MM', () => {
  const dto = generarValesBaseInputDTO({ periodo: '2025-03' });
  assert.deepStrictEqual(dto, { periodo: '2025-03' });
});

test('generarValesBaseInputDTO rechaza cuerpo vacio', () => {
  assert.throws(() => generarValesBaseInputDTO({}), /fechaUso.*o periodo/);
});
