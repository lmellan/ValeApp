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

-- Los vales se generan por la aplicacion: los base por turno y los adicionales desde la administracion.
-- Este seed deja la tabla vacia para evitar asignaciones de prueba al levantar la BD.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vale_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vale_user;

