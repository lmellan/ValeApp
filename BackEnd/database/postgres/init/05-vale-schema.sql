\connect vale_db

CREATE TABLE IF NOT EXISTS vales (
    id_vale TEXT PRIMARY KEY,
    id_funcionario INTEGER NOT NULL,
    id_servicio INTEGER NOT NULL,
    estado_uso TEXT NOT NULL CHECK (estado_uso IN ('NO_UTILIZADO', 'UTILIZADO')),
    expirado BOOLEAN NOT NULL DEFAULT false,
    tipo_asignacion TEXT NOT NULL CHECK (tipo_asignacion IN ('POR_TURNO', 'ADMINISTRATIVA')),
    valor INTEGER NOT NULL CHECK (valor >= 0),
    fecha_uso DATE NOT NULL,
    hora_inicio_validez TIME NOT NULL,
    hora_fin_validez TIME NOT NULL,
    fecha_expiracion DATE NOT NULL,
    motivo TEXT,
    fecha_hora_impresion TIMESTAMPTZ,
    id_cajero_canje INTEGER,
    fecha_hora_canje TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT motivo_requerido_para_administrativa
        CHECK (tipo_asignacion <> 'ADMINISTRATIVA' OR motivo IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_vales_funcionario ON vales (id_funcionario);
CREATE INDEX IF NOT EXISTS idx_vales_servicio ON vales (id_servicio);
CREATE INDEX IF NOT EXISTS idx_vales_fecha_uso ON vales (fecha_uso);
CREATE INDEX IF NOT EXISTS idx_vales_estado_uso ON vales (estado_uso);

INSERT INTO vales
    (id_vale, id_funcionario, id_servicio, estado_uso, expirado, tipo_asignacion, valor, fecha_uso, hora_inicio_validez, hora_fin_validez, fecha_expiracion, motivo, id_cajero_canje, fecha_hora_canje)
VALUES
    ('VALE-1001', 1, 2, 'NO_UTILIZADO', false, 'POR_TURNO', 3500, '2026-12-31', '00:00', '23:59', '2026-12-31', NULL, NULL, NULL),
    ('VALE-1002', 1, 2, 'UTILIZADO', false, 'POR_TURNO', 3500, '2026-12-31', '00:00', '23:59', '2026-12-31', NULL, 2, '2026-01-01T12:00:00Z'),
    ('VALE-1003', 1, 3, 'NO_UTILIZADO', true, 'ADMINISTRATIVA', 4000, '2025-01-01', '00:00', '23:59', '2025-01-01', 'Vale adicional de prueba expirado', NULL, NULL)
ON CONFLICT (id_vale) DO NOTHING;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vale_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vale_user;
