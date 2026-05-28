\connect usuario_db

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    rol TEXT NOT NULL CHECK (rol IN ('Funcionario', 'Administrador', 'Cajero')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO usuarios (id_usuario, nombre, correo, rol, activo) VALUES
    (1, 'Funcionario Mock', 'funcionario1@vales.cl', 'Funcionario', true),
    (2, 'Cajero Mock', 'cajero2@vales.cl', 'Cajero', true),
    (3, 'Administrador Mock', 'admin3@vales.cl', 'Administrador', true)
ON CONFLICT (id_usuario) DO NOTHING;

SELECT setval('usuarios_id_usuario_seq', GREATEST((SELECT MAX(id_usuario) FROM usuarios), 1));

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO usuario_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO usuario_user;
