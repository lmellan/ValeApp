class TipoComensal {
    constructor(idTipoComensal, nombre, descripcion, cantidadVales, emisionMultiple) {
        this.idTipoComensal  = idTipoComensal;
        this.nombre          = nombre;
        this.descripcion     = descripcion;
        this.cantidadVales   = cantidadVales;       // R17: cantidad de vales permitidos
        this.emisionMultiple = Boolean(emisionMultiple); // R17: si permite emisión múltiple (R40)
    }
}

module.exports = TipoComensal;
