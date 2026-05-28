const db = require('../repository/database');

// --- Tipos de comensal ---

const listarTiposComensal = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM tipos_comensal`, [], (err, rows) => {
            if (err) return reject('Error al consultar tipos de comensal.');
            resolve(rows);
        });
    });
};

const obtenerTipoComensal = (idTipoComensal) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM tipos_comensal WHERE idTipoComensal = ?`, [idTipoComensal], (err, row) => {
            if (err) return reject('Error al consultar tipo de comensal.');
            if (!row) return reject('Tipo de comensal no encontrado.');
            resolve(row);
        });
    });
};

const crearTipoComensal = (datos) => {
    return new Promise((resolve, reject) => {
        const { nombre, descripcion, cantidadVales, emisionMultiple } = datos;
        db.run(
            `INSERT INTO tipos_comensal (nombre, descripcion, cantidadVales, emisionMultiple) VALUES (?, ?, ?, ?)`,
            [nombre, descripcion, cantidadVales, emisionMultiple],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) return reject('Ya existe un tipo de comensal con ese nombre.');
                    return reject('Error al crear tipo de comensal.');
                }
                resolve(this.lastID);
            }
        );
    });
};

// --- Turnos ---

const listarTurnos = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM turnos`, [], (err, rows) => {
            if (err) return reject('Error al consultar turnos.');
            resolve(rows);
        });
    });
};

const obtenerTurno = (idTurno) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM turnos WHERE idTurno = ?`, [idTurno], (err, row) => {
            if (err) return reject('Error al consultar turno.');
            if (!row) return reject('Turno no encontrado.');
            resolve(row);
        });
    });
};

const crearTurno = (datos) => {
    return new Promise((resolve, reject) => {
        const { nombre, horaInicio, horaFin } = datos;
        db.run(
            `INSERT INTO turnos (nombre, horaInicio, horaFin) VALUES (?, ?, ?)`,
            [nombre, horaInicio, horaFin],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) return reject('Ya existe un turno con ese nombre.');
                    return reject('Error al crear turno.');
                }
                resolve(this.lastID);
            }
        );
    });
};

// --- Asignaciones de turno ---

// R18/R19: obtiene el turno vigente de un funcionario (fechaFin IS NULL = vigente)
const obtenerTurnoVigente = (idFuncionario) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT t.* FROM turnos t
            INNER JOIN asignaciones_turno a ON a.idTurno = t.idTurno
            WHERE a.idFuncionario = ? AND a.fechaFin IS NULL
            ORDER BY a.fechaInicio DESC
            LIMIT 1
        `;
        db.get(query, [idFuncionario], (err, row) => {
            if (err) return reject('Error al consultar turno vigente.');
            resolve(row || null);
        });
    });
};

const crearAsignacionTurno = (datos) => {
    return new Promise((resolve, reject) => {
        const { idFuncionario, idTurno, fechaInicio, fechaFin } = datos;

        // Cerrar asignación vigente anterior antes de crear la nueva
        db.run(
            `UPDATE asignaciones_turno SET fechaFin = ? WHERE idFuncionario = ? AND fechaFin IS NULL`,
            [fechaInicio, idFuncionario],
            (err) => {
                if (err) return reject('Error al cerrar asignación anterior.');

                db.run(
                    `INSERT INTO asignaciones_turno (idFuncionario, idTurno, fechaInicio, fechaFin) VALUES (?, ?, ?, ?)`,
                    [idFuncionario, idTurno, fechaInicio, fechaFin],
                    function (err) {
                        if (err) return reject('Error al crear asignación de turno.');
                        resolve(this.lastID);
                    }
                );
            }
        );
    });
};

// --- Servicios por turno ---

// R20: obtiene los servicios de alimentación habilitados para un turno
const obtenerServiciosPorTurno = (idTurno) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT idServicio FROM turno_servicios WHERE idTurno = ?`,
            [idTurno],
            (err, rows) => {
                if (err) return reject('Error al consultar servicios del turno.');
                resolve(rows.map(r => r.idServicio));
            }
        );
    });
};

const agregarServicioATurno = (idTurno, idServicio) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO turno_servicios (idTurno, idServicio) VALUES (?, ?)`,
            [idTurno, idServicio],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) return reject('El servicio ya está asociado a ese turno.');
                    return reject('Error al asociar servicio al turno.');
                }
                resolve(this.lastID);
            }
        );
    });
};

// --- Tipo de comensal por funcionario ---

// R15: Un funcionario tiene un tipo de comensal
const obtenerTipoComensalPorFuncionario = (idFuncionario) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT tc.* FROM tipos_comensal tc
            INNER JOIN funcionario_tipo_comensal ftc ON ftc.idTipoComensal = tc.idTipoComensal
            WHERE ftc.idFuncionario = ?
        `;
        db.get(query, [idFuncionario], (err, row) => {
            if (err) return reject('Error al consultar tipo de comensal del funcionario.');
            resolve(row || null);
        });
    });
};

const asignarTipoComensalAFuncionario = (idFuncionario, idTipoComensal) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO funcionario_tipo_comensal (idFuncionario, idTipoComensal) VALUES (?, ?)`,
            [idFuncionario, idTipoComensal],
            function (err) {
                if (err) return reject('Error al asignar tipo de comensal.');
                resolve();
            }
        );
    });
};

module.exports = {
    listarTiposComensal,
    obtenerTipoComensal,
    crearTipoComensal,
    listarTurnos,
    obtenerTurno,
    crearTurno,
    obtenerTurnoVigente,
    crearAsignacionTurno,
    obtenerServiciosPorTurno,
    agregarServicioATurno,
    obtenerTipoComensalPorFuncionario,
    asignarTipoComensalAFuncionario
};
