class TipoComensal {
    constructor(idTipoComensal, nombre, descripcion, cantidadVales, emisionMultiple) {
        this.idTipoComensal  = idTipoComensal;
        this.nombre          = nombre;
        this.descripcion     = descripcion;
        this.cantidadVales   = cantidadVales;       // Campo legado; la cantidad se define al crear el vale.
        this.emisionMultiple = Boolean(emisionMultiple); // R17: si permite emisión múltiple (R40)
    }
}

module.exports = TipoComensal;

