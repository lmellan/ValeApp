const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./casino.db', (err) => {
    if (err) {
        console.error('Error abriendo la base de datos', err.message);
        return;
    }
    console.log('Conectado a la base de datos SQLite de casino.');

    db.run('PRAGMA foreign_keys = ON');

    db.serialize(() => {
        // Tabla: casinos
        db.run(`CREATE TABLE IF NOT EXISTS casinos (
            idCasino   INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre     TEXT NOT NULL UNIQUE,
            direccion  TEXT,
            activo     INTEGER NOT NULL DEFAULT 1
        )`);

        // Tabla: servicios de alimentación (R22: un casino ofrece varios servicios)
        db.run(`CREATE TABLE IF NOT EXISTS servicios_alimentacion (
            idServicio  INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre      TEXT NOT NULL,
            categoria   TEXT,
            horaInicio  TEXT NOT NULL,
            horaFin     TEXT NOT NULL,
            idCasino    INTEGER NOT NULL,
            activo      INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (idCasino) REFERENCES casinos(idCasino)
        )`);

        // --- Datos de prueba ---
        // Casinos
        db.run(`INSERT OR IGNORE INTO casinos (idCasino, nombre, direccion, activo)
                VALUES (1, 'Casino Central', 'Edificio Principal, Piso 1', 1)`);
        db.run(`INSERT OR IGNORE INTO casinos (idCasino, nombre, direccion, activo)
                VALUES (2, 'Casino Norte', 'Edificio Norte, Piso 2', 1)`);

        // Servicios de alimentación (los idServicio coinciden con los usados en configuracion-service)
        db.run(`INSERT OR IGNORE INTO servicios_alimentacion (idServicio, nombre, categoria, horaInicio, horaFin, idCasino, activo)
                VALUES (1, 'Desayuno', 'Desayuno', '08:00', '10:00', 1, 1)`);
        db.run(`INSERT OR IGNORE INTO servicios_alimentacion (idServicio, nombre, categoria, horaInicio, horaFin, idCasino, activo)
                VALUES (2, 'Almuerzo', 'Almuerzo', '12:00', '14:00', 1, 1)`);
        db.run(`INSERT OR IGNORE INTO servicios_alimentacion (idServicio, nombre, categoria, horaInicio, horaFin, idCasino, activo)
                VALUES (3, 'Cena', 'Cena', '19:00', '21:00', 1, 1)`);
        db.run(`INSERT OR IGNORE INTO servicios_alimentacion (idServicio, nombre, categoria, horaInicio, horaFin, idCasino, activo)
                VALUES (4, 'Once', 'Once', '16:00', '18:00', 2, 1)`);
        db.run(`INSERT OR IGNORE INTO servicios_alimentacion (idServicio, nombre, categoria, horaInicio, horaFin, idCasino, activo)
                VALUES (5, 'Box Lunch', 'Almuerzo', '11:00', '15:00', 2, 1)`);
    });
});

module.exports = db;
