const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./vales.db', (err) => {
    if (err) {
        console.error('Error abriendo la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        
        db.run(`CREATE TABLE IF NOT EXISTS vales (
            idVale TEXT PRIMARY KEY,
            idFuncionario INTEGER,
            estado TEXT,
            tipoAsignacion TEXT,
            valor INTEGER,
            fechaExpiracion TEXT
        )`, () => {
            // VALE 1: Disponible (No utilizado y fecha del futuro)
            db.run(`INSERT OR IGNORE INTO vales (idVale, idFuncionario, estado, tipoAsignacion, valor, fechaExpiracion) 
                    VALUES ('VALE-1001', 1, 'No utilizado', 'Base', 3500, '2026-12-31')`);
            
            // VALE 2: No disponible por estar Utilizado
            db.run(`INSERT OR IGNORE INTO vales (idVale, idFuncionario, estado, tipoAsignacion, valor, fechaExpiracion) 
                    VALUES ('VALE-1002', 1, 'Utilizado', 'Base', 3500, '2026-12-31')`);

            // VALE 3: No disponible por fecha expirada (Fecha del pasado)
            db.run(`INSERT OR IGNORE INTO vales (idVale, idFuncionario, estado, tipoAsignacion, valor, fechaExpiracion) 
                    VALUES ('VALE-1003', 1, 'No utilizado', 'Adicional', 4000, '2025-01-01')`);
        });
    }
});

module.exports = db;