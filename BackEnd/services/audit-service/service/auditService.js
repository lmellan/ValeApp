const repository = require('../repository/auditRepository');
const AuditLog = require('../model/auditLog');

const registrarLog = (datos) => repository.registrar(new AuditLog(datos));

const listarLogs = () => repository.listar();

module.exports = { registrarLog, listarLogs };
