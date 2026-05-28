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
    (1, 'Casino Central', 'Edificio Principal, Piso 1', true),
    (2, 'Casino Norte', 'Edificio Norte, Piso 2', true)
ON CONFLICT (id_casino) DO NOTHING;

INSERT INTO servicios_alimentacion (id_servicio, nombre, categoria, hora_inicio, hora_fin, id_casino, activo) VALUES
    (1, 'Desayuno', 'Desayuno', '08:00', '10:00', 1, true),
    (2, 'Almuerzo', 'Almuerzo', '12:00', '14:00', 1, true),
    (3, 'Cena', 'Cena', '19:00', '21:00', 1, true),
    (4, 'Once', 'Once', '16:00', '18:00', 2, true),
    (5, 'Box Lunch', 'Almuerzo', '11:00', '15:00', 2, true)
ON CONFLICT (id_servicio) DO NOTHING;

SELECT setval('casinos_id_casino_seq', GREATEST((SELECT MAX(id_casino) FROM casinos), 1));
SELECT setval('servicios_alimentacion_id_servicio_seq', GREATEST((SELECT MAX(id_servicio) FROM servicios_alimentacion), 1));

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO casino_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO casino_user;
