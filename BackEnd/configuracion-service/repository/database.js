const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./configuracion.db', (err) => {
    if (err) {
        console.error('Error abriendo la base de datos', err.message);
        return;
    }
    console.log('Conectado a la base de datos SQLite de configuracion.');

    // Activar foreign keys
    db.run('PRAGMA foreign_keys = ON');

    db.serialize(() => {
        // Tabla: tipos de comensal
        db.run(`CREATE TABLE IF NOT EXISTS tipos_comensal (
            idTipoComensal   INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre           TEXT NOT NULL UNIQUE,
            descripcion      TEXT,
            cantidadVales    INTEGER NOT NULL DEFAULT 1,
            emisionMultiple  INTEGER NOT NULL DEFAULT 0
        )`);

        // Tabla: turnos
        db.run(`CREATE TABLE IF NOT EXISTS turnos (
            idTurno     INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre      TEXT NOT NULL UNIQUE,
            horaInicio  TEXT NOT NULL,
            horaFin     TEXT NOT NULL
        )`);

        // Tabla: asignaciones de turno por funcionario (historial)
        db.run(`CREATE TABLE IF NOT EXISTS asignaciones_turno (
            idAsignacion  INTEGER PRIMARY KEY AUTOINCREMENT,
            idFuncionario INTEGER NOT NULL,
            idTurno       INTEGER NOT NULL,
            fechaInicio   TEXT NOT NULL,
            fechaFin      TEXT,
            FOREIGN KEY (idTurno) REFERENCES turnos(idTurno)
        )`);

        // Tabla: relación turno → servicios de alimentación habilitados
        db.run(`CREATE TABLE IF NOT EXISTS turno_servicios (
            idTurnoServicio INTEGER PRIMARY KEY AUTOINCREMENT,
            idTurno         INTEGER NOT NULL,
            idServicio      INTEGER NOT NULL,
            UNIQUE(idTurno, idServicio),
            FOREIGN KEY (idTurno) REFERENCES turnos(idTurno)
        )`);

        // Tabla: tipo de comensal por funcionario
        db.run(`CREATE TABLE IF NOT EXISTS funcionario_tipo_comensal (
            idFuncionario  INTEGER PRIMARY KEY,
            idTipoComensal INTEGER NOT NULL,
            FOREIGN KEY (idTipoComensal) REFERENCES tipos_comensal(idTipoComensal)
        )`);

        // --- Datos de prueba ---
        // Tipos de comensal
        db.run(`INSERT OR IGNORE INTO tipos_comensal (idTipoComensal, nombre, descripcion, cantidadVales, emisionMultiple)
                VALUES (1, 'Obrero', 'Funcionario de planta operativa', 1, 0)`);
        db.run(`INSERT OR IGNORE INTO tipos_comensal (idTipoComensal, nombre, descripcion, cantidadVales, emisionMultiple)
                VALUES (2, 'Jefe', 'Jefatura de área', 2, 1)`);
        db.run(`INSERT OR IGNORE INTO tipos_comensal (idTipoComensal, nombre, descripcion, cantidadVales, emisionMultiple)
                VALUES (3, 'Gerente', 'Gerencia de unidad', 3, 1)`);

        // Turnos
        db.run(`INSERT OR IGNORE INTO turnos (idTurno, nombre, horaInicio, horaFin)
                VALUES (1, 'Turno 1', '08:00', '16:00')`);
        db.run(`INSERT OR IGNORE INTO turnos (idTurno, nombre, horaInicio, horaFin)
                VALUES (2, 'Turno 2', '16:00', '00:00')`);
        db.run(`INSERT OR IGNORE INTO turnos (idTurno, nombre, horaInicio, horaFin)
                VALUES (3, 'Turno 3', '00:00', '08:00')`);

        // Asignaciones de turno (funcionario 1 → Turno 1, funcionario 2 → Turno 2)
        db.run(`INSERT OR IGNORE INTO asignaciones_turno (idAsignacion, idFuncionario, idTurno, fechaInicio, fechaFin)
                VALUES (1, 1, 1, '2025-01-01', NULL)`);
        db.run(`INSERT OR IGNORE INTO asignaciones_turno (idAsignacion, idFuncionario, idTurno, fechaInicio, fechaFin)
                VALUES (2, 2, 2, '2025-01-01', NULL)`);

        // Servicios habilitados por turno (idServicio referencia a casino-service)
        db.run(`INSERT OR IGNORE INTO turno_servicios (idTurno, idServicio) VALUES (1, 1)`); // Turno 1 → Desayuno
        db.run(`INSERT OR IGNORE INTO turno_servicios (idTurno, idServicio) VALUES (1, 2)`); // Turno 1 → Almuerzo
        db.run(`INSERT OR IGNORE INTO turno_servicios (idTurno, idServicio) VALUES (2, 3)`); // Turno 2 → Cena
        db.run(`INSERT OR IGNORE INTO turno_servicios (idTurno, idServicio) VALUES (3, 4)`); // Turno 3 → Once

        // Tipo de comensal por funcionario
        db.run(`INSERT OR IGNORE INTO funcionario_tipo_comensal (idFuncionario, idTipoComensal) VALUES (1, 1)`); // Funcionario 1 → Obrero
        db.run(`INSERT OR IGNORE INTO funcionario_tipo_comensal (idFuncionario, idTipoComensal) VALUES (2, 2)`); // Funcionario 2 → Jefe
    });
});

module.exports = db;
