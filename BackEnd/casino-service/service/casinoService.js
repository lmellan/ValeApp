const db = require('../repository/database');

// --- Casinos ---

const listarCasinos = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM casinos`, [], (err, rows) => {
            if (err) return reject('Error al consultar casinos.');
            resolve(rows);
        });
    });
};

const obtenerCasino = (idCasino) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM casinos WHERE idCasino = ?`, [idCasino], (err, row) => {
            if (err) return reject('Error al consultar casino.');
            if (!row) return reject('Casino no encontrado.');
            resolve(row);
        });
    });
};

const crearCasino = (datos) => {
    return new Promise((resolve, reject) => {
        const { nombre, direccion } = datos;
        db.run(
            `INSERT INTO casinos (nombre, direccion) VALUES (?, ?)`,
            [nombre, direccion || null],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) return reject('Ya existe un casino con ese nombre.');
                    return reject('Error al crear casino.');
                }
                resolve(this.lastID);
            }
        );
    });
};

// R22: Servicios de alimentación que ofrece un casino
const obtenerServiciosPorCasino = (idCasino) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM servicios_alimentacion WHERE idCasino = ?`,
            [idCasino],
            (err, rows) => {
                if (err) return reject('Error al consultar servicios del casino.');
                resolve(rows);
            }
        );
    });
};

// --- Servicios de alimentación ---

const listarServicios = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM servicios_alimentacion`, [], (err, rows) => {
            if (err) return reject('Error al consultar servicios de alimentación.');
            resolve(rows);
        });
    });
};

const obtenerServicio = (idServicio) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM servicios_alimentacion WHERE idServicio = ?`,
            [idServicio],
            (err, row) => {
                if (err) return reject('Error al consultar servicio.');
                if (!row) return reject('Servicio de alimentación no encontrado.');
                resolve(row);
            }
        );
    });
};

const crearServicio = (datos) => {
    return new Promise((resolve, reject) => {
        const { nombre, categoria, horaInicio, horaFin, idCasino } = datos;
        db.run(
            `INSERT INTO servicios_alimentacion (nombre, categoria, horaInicio, horaFin, idCasino) VALUES (?, ?, ?, ?, ?)`,
            [nombre, categoria || null, horaInicio, horaFin, idCasino],
            function (err) {
                if (err) return reject('Error al crear servicio de alimentación.');
                resolve(this.lastID);
            }
        );
    });
};

// Endpoint principal para vale-service: valida si un servicio existe y está disponible en este momento
// R30: Un vale está disponible solo si el servicio de alimentación está disponible
const verificarDisponibilidad = (idServicio) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT s.*, c.activo AS casinoActivo FROM servicios_alimentacion s
             INNER JOIN casinos c ON c.idCasino = s.idCasino
             WHERE s.idServicio = ?`,
            [idServicio],
            (err, row) => {
                if (err) return reject('Error al verificar disponibilidad.');
                if (!row) return resolve({ disponible: false, motivo: 'Servicio no encontrado.' });
                if (!row.activo) return resolve({ disponible: false, motivo: 'Servicio inactivo.' });
                if (!row.casinoActivo) return resolve({ disponible: false, motivo: 'Casino inactivo.' });

                // Verificar si la hora actual está dentro del rango del servicio
                const ahora = new Date();
                const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
                const dentroDeHorario = horaActual >= row.horaInicio && horaActual <= row.horaFin;

                resolve({
                    disponible: dentroDeHorario,
                    motivo: dentroDeHorario ? null : `Servicio fuera de horario (${row.horaInicio} - ${row.horaFin}).`,
                    servicio: {
                        idServicio:  row.idServicio,
                        nombre:      row.nombre,
                        horaInicio:  row.horaInicio,
                        horaFin:     row.horaFin,
                        idCasino:    row.idCasino
                    }
                });
            }
        );
    });
};

module.exports = {
    listarCasinos,
    obtenerCasino,
    crearCasino,
    obtenerServiciosPorCasino,
    listarServicios,
    obtenerServicio,
    crearServicio,
    verificarDisponibilidad
};
