\connect casino_db

CREATE TABLE IF NOT EXISTS casinos (
    id_casino SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    direccion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS servicios_alimentacion (
    id_servicio SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    id_casino INTEGER NOT NULL REFERENCES casinos(id_casino),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO casinos (id_casino, nombre, direccion, activo) VALUES
    (1, 'Casa Matriz', 'Casino central', true),
    (2, 'Sucursal Norte', 'Casino sucursal norte', true),
    (3, 'Sucursal Sur', 'Casino sucursal sur', true)
ON CONFLICT (id_casino) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        direccion = EXCLUDED.direccion,
        activo = EXCLUDED.activo;

INSERT INTO servicios_alimentacion (id_servicio, nombre, categoria, hora_inicio, hora_fin, id_casino, activo) VALUES
    (1, 'Desayuno', 'Base', '08:00', '10:00', 1, true),
    (2, 'Almuerzo', 'Base', '12:00', '15:00', 1, true),
    (3, 'Once', 'Base', '16:00', '18:00', 2, true),
    (4, 'Cena 1', 'Base', '20:00', '23:00', 3, true),
    (5, 'Cena 2', 'Base', '00:00', '03:00', 3, true),
    (6, 'Box lunch', 'Adicional', '09:00', '18:00', 2, true)
ON CONFLICT (id_servicio) DO UPDATE
    SET nombre = EXCLUDED.nombre,
        categoria = EXCLUDED.categoria,
        hora_inicio = EXCLUDED.hora_inicio,
        hora_fin = EXCLUDED.hora_fin,
        id_casino = EXCLUDED.id_casino,
        activo = EXCLUDED.activo;

SELECT setval('casinos_id_casino_seq', GREATEST((SELECT MAX(id_casino) FROM casinos), 1));
SELECT setval('servicios_alimentacion_id_servicio_seq', GREATEST((SELECT MAX(id_servicio) FROM servicios_alimentacion), 1));

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO casino_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO casino_user;
