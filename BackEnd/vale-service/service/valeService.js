const db = require('../repository/database');

const validarUsoVale = (idVale) => {
    // Usamos una Promesa para manejar la asincronía de la base de datos de forma limpia
    return new Promise((resolve, reject) => {
        // Primero buscamos el vale
        db.get(`SELECT * FROM vales WHERE idVale = ?`, [idVale], (err, vale) => {
            if (err) return reject("Error en la base de datos");
            if (!vale) return reject("Vale no encontrado");
            
            // REGLA DE NEGOCIO R32: Verificar si ya está utilizado
            if (vale.estado === 'Utilizado') {
                return reject("Regla R32: El vale ya fue utilizado y no puede volver a usarse.");
            }

            // Si pasa la regla (estado no es 'Utilizado'), procedemos a actualizarlo en la BD
            db.run(`UPDATE vales SET estado = 'Utilizado' WHERE idVale = ?`, [idVale], function(err) {
                if (err) return reject("Error actualizando el vale en la base de datos");
                resolve("Vale validado y canjeado con éxito");
            });
        });
    });
};

const obtenerValesDisponibles = (idFuncionario) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM vales WHERE idFuncionario = ?`;
        
        db.all(query, [idFuncionario], (err, rows) => {
            if (err) return reject("Error al consultar vales");

            const fechaActual = new Date(); // Fecha de hoy en el sistema

            // Filtro dinámico calculando la disponibilidad en tiempo real (Regra R29 y R30)
            const valesDisponibles = rows.filter(vale => {
                const fechaVale = new Date(vale.fechaExpiracion);
                
                const noUtilizado = vale.estado === 'No utilizado';
                const noExpirado = fechaVale >= fechaActual; // R30: No debe estar expirado

                return noUtilizado && noExpirado;
            });

            resolve(valesDisponibles);
        });
    });
};

const registrarValeAdicional = (nuevoValeData) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO vales (idVale, idFuncionario, estado, tipoAsignacion, valor, fechaExpiracion) 
                       VALUES (?, ?, ?, ?, ?, ?)`;
        
        const params = [
            nuevoValeData.idVale,
            nuevoValeData.idFuncionario,
            nuevoValeData.estado,
            nuevoValeData.tipoAsignacion,
            nuevoValeData.valor,
            nuevoValeData.fechaExpiracion
        ];

        db.run(query, params, function(err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return reject("El ID de vale ya existe en el sistema.");
                }
                return reject("Error al insertar el vale adicional en la base de datos.");
            }
            resolve("Vale adicional creado y asignado con éxito.");
        });
    });
};

module.exports = { 
    validarUsoVale,           // <--- ESTA ES LA QUE FALTABA
    obtenerValesDisponibles, 
    registrarValeAdicional 
};