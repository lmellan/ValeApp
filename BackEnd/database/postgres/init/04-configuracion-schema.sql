\connect configuracion_db

CREATE TABLE IF NOT EXISTS tipos_comensal (
    id_tipo_comensal SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    cantidad_vales INTEGER NOT NULL DEFAULT 1 CHECK (cantidad_vales > 0),
    emision_multiple BOOLEAN NOT NULL DEFAULT false
);

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

INSERT INTO tipos_comensal (id_tipo_comensal, nombre, descripcion, cantidad_vales, emision_multiple) VALUES
    (1, 'Obrero', 'Funcionario de planta operativa', 1, false),
    (2, 'Jefe', 'Jefatura de area', 2, true),
    (3, 'Gerente', 'Gerencia de unidad', 3, true)
ON CONFLICT (id_tipo_comensal) DO NOTHING;

INSERT INTO turnos (id_turno, nombre, hora_inicio, hora_fin) VALUES
    (1, 'Turno 1', '08:00', '16:00'),
    (2, 'Turno 2', '16:00', '00:00'),
    (3, 'Turno 3', '00:00', '08:00')
ON CONFLICT (id_turno) DO NOTHING;

INSERT INTO asignaciones_turno (id_asignacion, id_funcionario, id_turno, fecha_inicio, fecha_fin) VALUES
    (1, 1, 1, '2025-01-01', NULL),
    (2, 2, 2, '2025-01-01', NULL)
ON CONFLICT (id_asignacion) DO NOTHING;

INSERT INTO turno_servicios (id_turno, id_servicio) VALUES
    (1, 1),
    (1, 2),
    (2, 3),
    (3, 4)
ON CONFLICT (id_turno, id_servicio) DO NOTHING;

INSERT INTO funcionario_tipo_comensal (id_funcionario, id_tipo_comensal) VALUES
    (1, 1),
    (2, 2)
ON CONFLICT (id_funcionario) DO NOTHING;

SELECT setval('tipos_comensal_id_tipo_comensal_seq', GREATEST((SELECT MAX(id_tipo_comensal) FROM tipos_comensal), 1));
SELECT setval('turnos_id_turno_seq', GREATEST((SELECT MAX(id_turno) FROM turnos), 1));
SELECT setval('asignaciones_turno_id_asignacion_seq', GREATEST((SELECT MAX(id_asignacion) FROM asignaciones_turno), 1));
SELECT setval('turno_servicios_id_turno_servicio_seq', GREATEST((SELECT MAX(id_turno_servicio) FROM turno_servicios), 1));

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO configuracion_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO configuracion_user;
