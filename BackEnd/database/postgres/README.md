# Base de datos ValeApp

ValeApp usa PostgreSQL con una base por microservicio propietario de datos.

| Base | Servicio propietario | Contenido |
|---|---|---|
| `usuario_db` | `usuario-service` | usuarios, roles, códigos, turnos visibles y estado activo |
| `vale_db` | `vale-service` | vales base y adicionales, impresión, expiración y canjes |
| `audit_db` | `audit-service` | logs de auditoría |
| `configuracion_db` | `configuracion-service` | tipos de comensal, turnos, servicios por turno, valorizaciones |
| `casino_db` | `casino-service` | casinos y servicios de alimentación |

Los servicios comparten el mismo servidor PostgreSQL en desarrollo, pero no comparten tablas ni foreign keys entre bases. La integración entre servicios se hace por HTTP.

## Levantar PostgreSQL y pgAdmin

```powershell
cd BackEnd
docker compose up -d postgres pgadmin
```

pgAdmin:

```text
http://localhost:5050
Email: admin@valeapp.local
Password: admin
```

Conexión desde pgAdmin dentro de Docker:

```text
Host: postgres
Port: 5432
```

Conexión desde la máquina host:

```text
Host: localhost
Port: 15434
```

## Inicialización automática

Los scripts de `database/postgres/init/` se ejecutan automáticamente cuando el volumen de Postgres está vacío.

Datos iniciales relevantes:

- Usuarios base: 4 funcionarios, 2 cajeros y 2 administradores.
- Turnos fijos:
  - Turno 1: `08:00 - 16:00`
  - Turno 2: `16:00 - 23:59`
  - Turno 3: `00:00 - 08:00`
- Tipos de comensal: Obrero, Jefe, Gerente, Secretaria.
- Casinos: Casino 1 y Casino 2.
- Servicios base: Desayuno, Almuerzo, Once, Cena 1, Cena 2.
- Servicios adicionales: Box lunch y Colación Visitas.
- Valorizaciones para todos los tipos de comensal y servicios iniciales.
- `vale_db` parte sin vales demo; los vales se generan desde la aplicación.

## Resetear la base

Postgres no vuelve a ejecutar los scripts si el volumen ya existe. Para recrear todo desde cero:

```powershell
cd BackEnd
docker compose down -v
docker compose up -d postgres
```

Luego vuelve a levantar los servicios con:

```powershell
.\start-all.ps1
```
