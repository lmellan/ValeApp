\connect configuracion_db

CREATE TABLE IF NOT EXISTS tipos_comensal (
    id_tipo_comensal SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    cantidad_vales INTEGER NOT NULL DEFAULT 1 CHECK (cantidad_vales > 0),
    emision_multiple BOOLEAN NOT NULL DEFAULT false,
    color TEXT NOT NULL DEFAULT '#0f4c81'
);

ALTER TABLE tipos_comensal ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#0f4c81';

CREATE TABLE IF NOT EXISTS turnos (
    id_turno SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS asignaciones_turno (
    id_asignacion SERIAL PRIMARY KEY,
    id_funcionario INTEGER NOT NULL,
    id_turno INTEGER NOT NULL REFERENCES turnos(id_turno),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE
);

CREATE TABLE IF NOT EXISTS turno_servicios (
    id_turno_servicio SERIAL PRIMARY KEY,
    id_turno INTEGER NOT NULL REFERENCES turnos(id_turno),
    id_servicio INTEGER NOT NULL,
    UNIQUE (id_turno, id_servicio)
);

CREATE TABLE IF NOT EXISTS funcionario_tipo_comensal (
    id_funcionario INTEGER PRIMARY KEY,
    id_tipo_comensal INTEGER NOT NULL REFERENCES tipos_comensal(id_tipo_comensal)
);
CREATE TABLE IF NOT EXISTS valorizaciones_vale (
    id_valorizacion SERIAL PRIMARY KEY,
    id_tipo_comensal INTEGER NOT NULL REFERENCES tipos_comensal(id_tipo_comensal),
    id_servicio INTEGER NOT NULL,
    valor INTEGER NOT NULL CHECK (valor >= 0),
    activo BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (id_tipo_comensal, id_servicio)
);

INSERT INTO tipos_comensal (id_tipo_comensal, nombre, descripcion, cantidad_vales, emision_multiple, color) VALUES
    (1, 'Obrero', 'Funcionario de planta operativa', 1, false, '#0ea5e9'),
    (2, 'Jefe', 'Jefatura de area', 1, true, '#10b981'),
    (3, 'Gerente', 'Gerencia de unidad', 1, true, '#f59e0b'),
    (4, 'Secretaria', 'Apoyo administrativo y secretaria de gerencia', 1, false, '#f43f5e')
ON CONFLICT (id_tipo_comensal) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion,
        cantidad_vales = EXCLUDED.cantidad_vales,
        emision_multiple = EXCLUDED.emision_multiple,
        color = EXCLUDED.color;

INSERT INTO turnos (id_turno, nombre, hora_inicio, hora_fin) VALUES
    (1, 'Turno 1', '08:00', '16:00'),
    (2, 'Turno 2', '16:00', '23:59'),
    (3, 'Turno 3', '00:00', '08:00')
ON CONFLICT (id_turno) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        hora_inicio = EXCLUDED.hora_inicio,
        hora_fin = EXCLUDED.hora_fin;

INSERT INTO asignaciones_turno (id_asignacion, id_funcionario, id_turno, fecha_inicio, fecha_fin) VALUES
    (1, 1, 1, '2025-01-01', NULL),
    (2, 2, 2, '2025-01-01', NULL),
    (3, 3, 1, '2025-01-01', NULL),
    (4, 4, 2, '2025-01-01', NULL)
ON CONFLICT (id_asignacion) DO NOTHING;

INSERT INTO turno_servicios (id_turno, id_servicio) VALUES
    (1, 1),
    (1, 2),
    (2, 3),
    (2, 4),
    (3, 5),
    (3, 1)
ON CONFLICT (id_turno, id_servicio) DO NOTHING;

INSERT INTO funcionario_tipo_comensal (id_funcionario, id_tipo_comensal) VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4)
ON CONFLICT (id_funcionario) DO UPDATE SET id_tipo_comensal = EXCLUDED.id_tipo_comensal;
INSERT INTO valorizaciones_vale (id_tipo_comensal, id_servicio, valor, activo) VALUES
    (1, 1, 2500, true), (1, 2, 3500, true), (1, 3, 2500, true), (1, 4, 3500, true), (1, 5, 3500, true), (1, 6, 4000, true), (1, 7, 3500, true),
    (2, 1, 3000, true), (2, 2, 4500, true), (2, 3, 3000, true), (2, 4, 4500, true), (2, 5, 4500, true), (2, 6, 5000, true), (2, 7, 4500, true),
    (3, 1, 3500, true), (3, 2, 5500, true), (3, 3, 3500, true), (3, 4, 5500, true), (3, 5, 5500, true), (3, 6, 6000, true), (3, 7, 5500, true),
    (4, 1, 2500, true), (4, 2, 3500, true), (4, 3, 2500, true), (4, 4, 3500, true), (4, 5, 3500, true), (4, 6, 4000, true), (4, 7, 3500, true)
ON CONFLICT (id_tipo_comensal, id_servicio) DO UPDATE
    SET valor = EXCLUDED.valor,
        activo = EXCLUDED.activo;

SELECT setval('tipos_comensal_id_tipo_comensal_seq', GREATEST((SELECT MAX(id_tipo_comensal) FROM tipos_comensal), 1));
SELECT setval('turnos_id_turno_seq', GREATEST((SELECT MAX(id_turno) FROM turnos), 1));
SELECT setval('asignaciones_turno_id_asignacion_seq', GREATEST((SELECT MAX(id_asignacion) FROM asignaciones_turno), 1));
SELECT setval('turno_servicios_id_turno_servicio_seq', GREATEST((SELECT MAX(id_turno_servicio) FROM turno_servicios), 1));
SELECT setval('valorizaciones_vale_id_valorizacion_seq', GREATEST((SELECT MAX(id_valorizacion) FROM valorizaciones_vale), 1));

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO configuracion_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO configuracion_user;







