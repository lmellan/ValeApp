// R22: Un casino ofrece cero o más servicios de alimentación
class Casino {
    constructor({ idCasino, nombre, direccion, activo }) {
        this.idCasino  = idCasino;
        this.nombre    = nombre;
        this.direccion = direccion;
        this.activo    = Boolean(activo);
    }
}

module.exports = Casino;
