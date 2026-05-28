# Base de datos ValeApp

ValeApp usa PostgreSQL con una base por microservicio propietario de datos:

- `usuario_db`: usuarios, roles y estado activo.
- `vale_db`: vales, impresion, expiracion y canjes.
- `audit_db`: logs de auditoria.
- `configuracion_db`: tipos de comensal, turnos y asociaciones turno-servicio.
- `casino_db`: casinos y servicios de alimentacion.

Los servicios comparten el mismo servidor PostgreSQL para desarrollo, pero no comparten tablas ni hacen foreign keys entre bases. Cuando un servicio necesita datos de otro, debe consultar su API HTTP.

## Levantar PostgreSQL y pgAdmin

```bash
docker compose up -d postgres pgadmin
```

pgAdmin queda disponible en:

```text
http://localhost:5050
```

Credenciales:

```text
Email: admin@valeapp.local
Password: admin
```

Servidor PostgreSQL:

```text
Host: postgres
Port: 5432
```

Si conectas desde tu maquina fuera de Docker, usa:

```text
Host: localhost
Port: 15434
```
