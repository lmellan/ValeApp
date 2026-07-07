\connect usuario_db

DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    codigo TEXT NOT NULL UNIQUE,
    contrasena TEXT NOT NULL DEFAULT 'cambio123',
    id_tipo_comensal INTEGER,
    tipo_comensal TEXT,
    turno TEXT,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO roles (id_rol, nombre, descripcion) VALUES
    (1, 'Funcionario', 'Funcionario del sistema con permisos de uso de vales.'),
    (2, 'Cajero', 'Usuario autorizado para validar y canjear vales.'),
    (3, 'Administrador', 'Usuario con permisos administrativos del sistema.')
ON CONFLICT (id_rol) DO NOTHING;

INSERT INTO usuarios (id_usuario, nombre, correo, codigo, contrasena, id_tipo_comensal, tipo_comensal, turno, id_rol, activo) VALUES
    (1, 'Lorna Mella', 'lmella@valeapp.cl', '123456', 'vale123', 1, 'Obrero', '08:00 - 16:00', 1, true),
    (2, 'Rock Dabre', 'rdabre@valeapp.cl', '234567', 'vale123', 2, 'Jefe', '16:00 - 23:59', 1, true),
    (3, 'María Soto', 'msoto@valeapp.cl', '345678', 'vale123', 3, 'Gerente', '08:00 - 16:00', 1, true),
    (4, 'Ana González', 'agonzalez@valeapp.cl', '456789', 'vale123', 4, 'Secretaria', '16:00 - 23:59', 1, true),
    (5, 'Carlos Pérez', 'cperez@valeapp.cl', 'CAJ002', 'cajero123', NULL, NULL, NULL, 2, true),
    (6, 'Joaquín Navarro', 'jnavarro@valeapp.cl', 'CAJ001', 'cajero123', NULL, NULL, NULL, 2, true),
    (7, 'Benjamín Vilches', 'bvilches@valeapp.cl', 'ADM001', 'admin123', NULL, NULL, NULL, 3, true),
    (8, 'Manuel Torres', 'mtorres@valeapp.cl', 'ADM002', 'admin123', NULL, NULL, NULL, 3, true)
ON CONFLICT (correo) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        codigo = EXCLUDED.codigo,
        contrasena = EXCLUDED.contrasena,
        id_tipo_comensal = EXCLUDED.id_tipo_comensal,
        tipo_comensal = EXCLUDED.tipo_comensal,
        turno = EXCLUDED.turno,
        id_rol = EXCLUDED.id_rol,
        activo = EXCLUDED.activo;

SELECT setval('roles_id_rol_seq', GREATEST((SELECT MAX(id_rol) FROM roles), 1));
SELECT setval('usuarios_id_usuario_seq', GREATEST((SELECT MAX(id_usuario) FROM usuarios), 1));

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO usuario_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO usuario_user;

