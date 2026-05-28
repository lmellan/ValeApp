\connect audit_db

CREATE TABLE IF NOT EXISTS audit_logs (
    id_log SERIAL PRIMARY KEY,
    evento TEXT NOT NULL,
    detalle TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO audit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO audit_user;
