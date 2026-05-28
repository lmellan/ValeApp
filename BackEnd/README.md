# ValeApp Backend

Backend de ValeApp implementado con microservicios Node.js/Express y PostgreSQL.

## Requisitos

Antes de ejecutar el backend, tener instalado:

- Node.js 18 o superior
- npm
- Docker Desktop
- Postman Desktop

 

## Estructura

```text
BackEnd/
+-- docker-compose.yml
+-- database/
|   +-- postgres/
|       +-- init/
+-- services/
|   +-- audit-service/
|   +-- casino-service/
|   +-- configuracion-service/
|   +-- notificacion-service/
|   +-- reporte-service/
|   +-- usuario-service/
|   +-- vale-service/
+-- test_jsons/
```

Cada microservicio mantiene la estructura:

```text
controller/
dto/
model/
repository/
service/
```

## Base De Datos

El backend usa PostgreSQL con una base por microservicio propietario de datos:

```text
usuario_db
vale_db
audit_db
configuracion_db
casino_db
```

El contenedor expone PostgreSQL en el puerto local `15434` para evitar conflictos con otros PostgreSQL instalados en la maquina.

Levantar PostgreSQL desde `BackEnd/`:

```bash
docker compose up -d postgres
```
 
## Instalar Dependencias

Ejecutar una vez:

```bash
cd services/usuario-service && npm install
cd ../audit-service && npm install
cd ../casino-service && npm install
cd ../configuracion-service && npm install
cd ../vale-service && npm install
cd ../reporte-service && npm install
cd ../notificacion-service && npm install
```

## Levantar Servicios

Primero levantar PostgreSQL desde `BackEnd/`:

```bash
docker compose up -d postgres
```

Luego abrir una terminal por servicio:

```bash
cd services/usuario-service && npm start
cd services/audit-service && npm start
cd services/casino-service && npm start
cd services/configuracion-service && npm start
cd services/vale-service && npm start
cd services/reporte-service && npm start
cd services/notificacion-service && npm start
```

## Servicios

| Servicio | Puerto | Responsabilidad |
| --- | --- | --- |
| `vale-service` | 3000 | Vales, impresion, validacion, canje y generacion base |
| `usuario-service` | 3001 | Usuarios, roles y estado activo |
| `audit-service` | 3002 | Logs de auditoria |
| `configuracion-service` | 3003 | Tipos de comensal, turnos y asociaciones |
| `casino-service` | 3004 | Casinos y servicios de alimentacion |
| `reporte-service` | 3005 | Reportes administrativos |
| `notificacion-service` | 3006 | Resumenes/notificaciones |

## Datos De Prueba

Los scripts de `database/postgres/init/` crean datos iniciales.

Usuarios:

| ID | Rol |
| --- | --- |
| 1 | Funcionario |
| 2 | Cajero |
| 3 | Administrador |

Vales:

| Vale | Funcionario | Estado | Nota |
| --- | --- | --- | --- |
| `VALE-1001` | 1 | `NO_UTILIZADO` | Vale base |
| `VALE-1002` | 1 | `UTILIZADO` | Ya canjeado |
| `VALE-1003` | 1 | `NO_UTILIZADO` | Expirado |

Servicios de alimentacion:

| ID | Servicio | Horario | Casino |
| --- | --- | --- | --- |
| 1 | Desayuno | 08:00-10:00 | Casino Central |
| 2 | Almuerzo | 12:00-14:00 | Casino Central |
| 3 | Cena | 19:00-21:00 | Casino Central |
| 4 | Once | 16:00-18:00 | Casino Norte |
| 5 | Box Lunch | 11:00-15:00 | Casino Norte |

## Pruebas Con Postman

Las colecciones estan en:

```text
test_jsons/
```

Como importarlas:

1. Abrir Postman Desktop.
2. Click en **Import**.
3. Elegir **Folder**.
4. Seleccionar `BackEnd/test_jsons/`.
5. Importar las colecciones.

Las colecciones prueban todos los endpoints declarados por los microservicios y algunos casos negativos.

Orden recomendado:

1. `UsuarioService (3001)`
2. `AuditService (3002)`
3. `CasinoService (3004)`
4. `ConfigurationService (3003)`
5. `ValeService (3000)`
6. `ReporteService (3005)`
7. `NotificacionService (3006)`

Antes de correrlas, todos los servicios deben estar activos.

## Endpoints Principales

`vale-service`

```text
GET  /vales/todos
GET  /vales/:idVale
GET  /funcionarios/:idFuncionario/vales-disponibles
POST /vales/:idVale/imprimir
POST /vales/:idVale/validar
POST /vales/:idVale/canjear
POST /administrador/vales
POST /sistema/vales-base/generar
```

`usuario-service`

```text
GET  /usuarios
GET  /usuarios/:idUsuario
GET  /usuarios/:idUsuario/rol
POST /usuarios
PUT  /usuarios/:idUsuario
```

`audit-service`

```text
POST /logs
GET  /logs
```

`configuracion-service`

```text
GET  /tipos-comensal
GET  /tipos-comensal/:idTipoComensal
POST /tipos-comensal
GET  /turnos
GET  /turnos/:idTurno
POST /turnos
GET  /turnos/:idTurno/servicios
POST /turnos/:idTurno/servicios
POST /asignaciones-turno
GET  /funcionarios/:idFuncionario/configuracion
POST /funcionarios/:idFuncionario/tipo-comensal
```

`casino-service`

```text
GET  /casinos
GET  /casinos/:idCasino
GET  /casinos/:idCasino/servicios
POST /casinos
GET  /servicios-alimentacion
GET  /servicios-alimentacion/:idServicio
POST /servicios-alimentacion
GET  /servicios-alimentacion/:idServicio/disponibilidad
```

`reporte-service`

```text
GET /reportes/resumen
```

`notificacion-service`

```text
POST /notificaciones/resumen-semanal/:idFuncionario
```
