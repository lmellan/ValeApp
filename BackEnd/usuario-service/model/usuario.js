// Este modelo representa la estructura central de identidad
class Usuario {
    constructor(id, nombre, email, rol) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol; // 'Funcionario', 'Administrador' o 'Cajero'
    }
}

module.exports = Usuario;