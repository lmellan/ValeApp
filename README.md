# ValeApp

Sistema web para gestionar vales de alimentación en organizaciones. Desarrollado por el grupo LosPapus — Caso 18: *Sistema de Emisión y Control de Vales de Alimentación*.

Documentación técnica:
- Arquitectura (servicios, comunicación, propiedad de datos, deuda técnica): [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Flujo funcional, supuestos y decisiones: [`docs/FLUJO_Y_DECISIONES.md`](docs/FLUJO_Y_DECISIONES.md)

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS 3, React Router 6, Axios 1 |
| Backend | Node.js 18+, Express 5 |
| Base de datos | PostgreSQL 16 (Docker) |
| Pruebas manuales | Colecciones Postman |

No hay framework de tests automatizados ni dependencias de mensajería/colas: la comunicación entre servicios es HTTP síncrona (ver [Comunicación y resiliencia](#comunicación-y-resiliencia)).

---

## Requisitos

- Node.js 18 o superior
- npm
- Docker Desktop

---

## Estructura del repositorio

```
ValeApp/
├── BackEnd/
│   ├── docker-compose.yml
│   ├── start-all.ps1           # inicia PostgreSQL + los 7 servicios
│   ├── stop-all.ps1
│   ├── database/postgres/init/ # scripts SQL de inicialización (esquemas + datos)
│   ├── services/
│   │   ├── vale-service/            :3000
│   │   ├── usuario-service/         :3001
│   │   ├── audit-service/           :3002
│   │   ├── configuracion-service/   :3003
│   │   ├── casino-service/          :3004
│   │   ├── reporte-service/         :3005
│   │   └── notificacion-service/    :3006
│   └── test_jsons/             # colecciones Postman
├── Frontend/
│   └── src/
│       ├── pages/              # vistas por rol
│       ├── features/           # módulos (auth, users, servicios, vales, reportes, ...)
│       └── shared/             # componentes, config, tipos y cliente axios
├── Mokcups/                    # prototipos HTML estáticos
└── docs/
    ├── ARCHITECTURE.md
    └── FLUJO_Y_DECISIONES.md
```

### Estructura homogénea de los microservicios

Los **siete** servicios siguen la misma organización por capas:

```
<servicio>/
├── index.js       # arranque Express, CORS y definición de rutas
├── controller/    # traducción HTTP ↔ dominio (valida request, arma respuesta)
├── service/       # lógica de negocio y reglas
├── repository/    # acceso a datos
├── dto/           # mapeo entrada/salida
└── model/         # entidades del dominio
```

En `vale-service`, `usuario-service`, `audit-service`, `configuracion-service` y `casino-service`, la capa `repository` accede a su propia base de datos PostgreSQL.

En `reporte-service` y `notificacion-service` (que **no** tienen base de datos propia), la capa `repository` cumple el mismo rol pero como cliente HTTP hacia otros servicios: encapsula de dónde provienen los datos, manteniendo la misma separación de capas.

---

## Dependencias por servicio

| Servicio | express | pg | axios | cors | BD propia |
|---|:---:|:---:|:---:|:---:|:---:|
| vale-service | ✅ | ✅ | ✅ | — | `vale_db` |
| usuario-service | ✅ | ✅ | ✅ | ✅ | `usuario_db` |
| audit-service | ✅ | ✅ | — | — | `audit_db` |
| configuracion-service | ✅ | ✅ | — | — | `configuracion_db` |
| casino-service | ✅ | ✅ | — | — | `casino_db` |
| reporte-service | ✅ | — | ✅ | — | — (orquestador) |
| notificacion-service | ✅ | — | ✅ | — | — (orquestador) |

- `pg` aparece solo en servicios con base de datos propia.
- `axios` aparece solo en servicios que consultan a otros servicios.
- `cors` se usa como paquete solo en `usuario-service`; el resto aplica cabeceras CORS manualmente en `index.js`.

Frontend: `react`, `react-dom`, `react-router-dom`, `axios` (runtime); `vite`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer` (desarrollo).

---

## Comunicación y resiliencia

Toda la comunicación entre servicios es **HTTP síncrona** mediante `axios`, con un **timeout de 2 000 ms** por llamada. No hay reintentos, circuit breaker, colas ni service discovery: los servicios se descubren por URL fija (variable de entorno con *fallback* a `localhost:PUERTO`).

Único caso de degradación tolerada: al registrar validaciones y canjes, si `audit-service` no responde, `vale-service` continúa la operación y solo registra el fallo por consola (la auditoría no bloquea el canje).

Llamadas reales entre servicios:

| Origen | Destino | Endpoint | Motivo |
|---|---|---|---|
| vale-service | audit-service | `POST /logs` | Registrar validación y canje |
| vale-service | configuracion-service | `GET /funcionarios/:id/configuracion` | Turno y tipo de comensal al generar vales base |
| vale-service | casino-service | `GET /servicios-alimentacion/:id[/disponibilidad]` | Datos y disponibilidad del servicio |
| configuracion-service | casino-service | `GET /servicios-alimentacion/:id` | Validar servicio antes de asociarlo a un turno |
| reporte-service | vale-service | `GET /vales/resumen` | Datos agregados para el reporte |
| notificacion-service | usuario-service | `GET /usuarios/:id/correo` | Solo el correo del funcionario (endpoint específico, sin traer el usuario completo) |
| notificacion-service | vale-service | `GET /funcionarios/:id/vales/resumen` | Resumen de vales para el cuerpo de la notificación |

El endpoint `GET /usuarios/:id/correo` se creó específicamente para reducir el acoplamiento: `notificacion-service` solo necesita el correo, no el objeto usuario completo.

---

## Levantar el backend

**1. Iniciar PostgreSQL** (expone el puerto `15434`):

```bash
cd BackEnd
docker compose up -d postgres
```

La base de datos se **crea y puebla automáticamente** en el primer arranque: los scripts de `database/postgres/init/` (montados en `/docker-entrypoint-initdb.d`) generan los esquemas y cargan datos de demostración (usuarios, casinos, servicios, turnos, valorizaciones y vales de ejemplo).

> ⚠️ Postgres solo ejecuta esos scripts la **primera vez** (volumen vacío). Si ya habías levantado la BD antes y quieres recargar los datos, reinicia el volumen:
> ```bash
> docker compose down -v && docker compose up -d postgres
> ```

**2-a. Iniciar todos los servicios de una vez (Windows):**

```powershell
cd BackEnd
.\start-all.ps1
```

Abre una ventana de PowerShell por cada microservicio. `.\stop-all.ps1` los detiene.

**2-b. Iniciar manualmente (una terminal por servicio):**

```bash
cd BackEnd/services/vale-service && npm install && npm start
cd BackEnd/services/usuario-service && npm install && npm start
cd BackEnd/services/audit-service && npm install && npm start
cd BackEnd/services/configuracion-service && npm install && npm start
cd BackEnd/services/casino-service && npm install && npm start
cd BackEnd/services/reporte-service && npm install && npm start
cd BackEnd/services/notificacion-service && npm install && npm start
```

---

## Levantar el frontend

```bash
cd Frontend
npm install
npm run dev
```

Acceder en: `http://localhost:5173`

Variables de entorno opcionales (`Frontend/.env`); si se omiten, se usa `localhost:PUERTO`:

```
VITE_USER_API_URL=http://localhost:3001
VITE_VALE_API_URL=http://localhost:3000
VITE_CONFIGURACION_API_URL=http://localhost:3003
VITE_CASINO_API_URL=http://localhost:3004
```

---

## Funcionalidades implementadas

### Administrador
- Gestión de usuarios (crear/editar). Al registrar un funcionario se le asigna tipo de comensal y turno.
- Gestión de tipos de comensal (cantidad de vales, emisión múltiple).
- Gestión de servicios de alimentación:
  - Servicios **Base**: nombre y horario fijos (bloqueados en la UI y validados en el backend) y asociación a uno o más turnos.
  - Servicios **Adicionales**: nombre y horario editables.
- Valorización de vales (precio por tipo de comensal × servicio).
- Creación de vales adicionales con motivo.
- Reportes y auditoría con filtros por período.

### Sistema (automático, en vale-service)
- Generación de vales base el primer día hábil del mes (con job de recuperación al arrancar).

### Funcionario
- Consulta de sus vales del día, con estado calculado (disponible, utilizado, expirado).
- Impresión del comprobante. **Puede reimprimir el mismo vale las veces que necesite** mientras esté dentro de su horario de validez y no haya sido canjeado por un cajero.
- El código del vale se muestra en cada tarjeta de la vista principal.

### Cajero
- Validación del vale por código y registro de la entrega (canje).
- Historial de operaciones de la sesión.

---

## Credenciales de prueba

Se puede iniciar sesión con **correo o código**. Datos cargados por `database/postgres/init/01-usuario-schema.sql`:

| Rol | Correo | Código | Contraseña |
|---|---|---|---|
| Funcionario (Obrero) | lmella@valeapp.cl | 123456 | vale123 |
| Funcionario (Jefe) | rdabre@valeapp.cl | 234567 | vale123 |
| Funcionario (Gerente) | msoto@valeapp.cl | 345678 | vale123 |
| Funcionario (Secretaria) | agonzalez@valeapp.cl | 456789 | vale123 |
| Cajero | jnavarro@valeapp.cl | CAJ001 | cajero123 |
| Cajero | cperez@valeapp.cl | CAJ002 | cajero123 |
| Administrador | bvilches@valeapp.cl | ADM001 | admin123 |
| Administrador | mtorres@valeapp.cl | ADM002 | admin123 |

---

## Cómo probar la plataforma

Con la BD recién poblada, el funcionario **Lorna Mella** (id 1) tiene datos de ejemplo para hoy:

| Vale | Servicio | Horario | Estado |
|---|---|---|---|
| `VALE-HOY-1` | Box lunch | 09:00–18:00 | Disponible (imprimible y canjeable) |
| `VALE-HOY-2` | Cena 1 | 20:00–23:00 | Utilizado |
| `VALE-1003` | Once | — | Expirado (histórico, visible en reportes) |

> El vale `VALE-HOY-1` está diseñado para la demostración: su horario 09:00–18:00 cubre el horario de oficina, así que se puede imprimir y canjear durante ese rango. Fuera de esa ventana aparecerá como “Aún no disponible” o “Expirado”.

### 1. Funcionario (consultar e imprimir)

1. Inicia sesión con `lmella@valeapp.cl` (o código `123456`) / `vale123`.
2. En el panel verás los vales de hoy. `VALE-HOY-1` aparece como **Disponible** con su código visible en la tarjeta.
3. Pulsa **Ver impresión** → **Confirmar impresión**. Vuelve al panel y pulsa **Reimprimir vale**: puedes imprimirlo **las veces que quieras** mientras siga disponible y sin canjear.

### 2. Cajero (validar y registrar entrega)

1. Cierra sesión e ingresa con `jnavarro@valeapp.cl` (o `CAJ001`) / `cajero123`.
2. Escribe el código `VALE-HOY-1` y pulsa **Validar** (dentro del horario 09:00–18:00).
3. Se muestra la tarjeta del funcionario y del servicio. Pulsa **Registrar Entrega**: el vale queda **Utilizado** y aparece en el historial.
4. Si vuelves al funcionario y recargas, ese vale ya no será imprimible (fue canjeado).

### 3. Administrador (configurar y reportar)

1. Ingresa con `bvilches@valeapp.cl` (o `ADM001`) / `admin123`.
2. Explora los módulos: **Usuarios** (crea un funcionario con turno y tipo de comensal), **Servicios** (los servicios Base tienen nombre y horario bloqueados; los Adicionales son editables), **Valorización**, **Vales adicionales** y **Reportes** (donde verás los vales de ejemplo, incluido el expirado).

> Para generar vales base a demanda (sin esperar al job mensual) puedes usar `POST /sistema/vales-base/generar` con `{ "fechaUso": "AAAA-MM-DD" }`, o `POST /sistema/funcionarios/:id/vales-base/recalcular` para un funcionario.

---

## Endpoints por servicio

### vale-service `:3000`

```
GET    /vales/todos
GET    /vales/resumen
GET    /vales/:idVale
POST   /vales/:idVale/validar                          Header: x-usuario-id
POST   /vales/:idVale/canjear                          Header: x-usuario-id
POST   /vales/:idVale/imprimir                          Header: x-funcionario-id
GET    /funcionarios/:id/vales
GET    /funcionarios/:id/vales-disponibles
GET    /funcionarios/:id/vales/resumen
GET    /administrador/vales
POST   /administrador/vales
PUT    /administrador/vales/:idVale
POST   /sistema/vales-base/generar
POST   /sistema/funcionarios/:id/vales-base/recalcular
```

### usuario-service `:3001`

```
GET    /usuarios
GET    /usuarios/:id
GET    /usuarios/:id/rol
GET    /usuarios/:id/correo
POST   /usuarios
POST   /usuarios/login
PUT    /usuarios/:id
```

### audit-service `:3002`

```
POST   /logs
GET    /logs
```

### configuracion-service `:3003`

```
GET    /tipos-comensal
GET    /tipos-comensal/:id
POST   /tipos-comensal
PUT    /tipos-comensal/:id
GET    /turnos
GET    /turnos/:id
POST   /turnos
GET    /turnos/:id/servicios
POST   /turnos/:id/servicios
DELETE /turnos/:idTurno/servicios/:idServicio
POST   /asignaciones-turno
GET    /funcionarios/:id/configuracion
POST   /funcionarios/:id/tipo-comensal
DELETE /funcionarios/:id/tipo-comensal
GET    /valorizaciones-vales
POST   /valorizaciones-vales
GET    /valorizaciones-vales/valor
```

### casino-service `:3004`

```
GET    /casinos
GET    /casinos/:id
POST   /casinos
GET    /casinos/:id/servicios
GET    /servicios-alimentacion
GET    /servicios-alimentacion/:id
POST   /servicios-alimentacion
PUT    /servicios-alimentacion/:id
GET    /servicios-alimentacion/:id/disponibilidad
```

### reporte-service `:3005`

```
GET    /reportes/resumen
```

### notificacion-service `:3006`

```
POST   /notificaciones/resumen-semanal/:idFuncionario
```

> El `notificacion-service` construye el payload de la notificación pero no envía correos reales (funcionalidad teórica, ver [`docs/FLUJO_Y_DECISIONES.md`](docs/FLUJO_Y_DECISIONES.md)).

---

## Pruebas con Postman

Las colecciones están en `BackEnd/test_jsons/`. Importar: Postman Desktop → **Import** → **Folder** → seleccionar `BackEnd/test_jsons/`.

Orden recomendado (todos los servicios deben estar activos):

1. `UsuarioService (3001)`
2. `AuditService (3002)`
3. `CasinoService (3004)`
4. `ConfigurationService (3003)`
5. `ValeService (3000)`
6. `ReporteService (3005)`
7. `NotificacionService (3006)`

---

## Tests

El backend incluye un set de pruebas unitarias sobre las validaciones de los DTOs (reglas de negocio puras, sin base de datos). Usan el **runner nativo de Node** (`node:test`), así que **no requieren instalar dependencias**.

```bash
cd BackEnd
npm test
```

Cubren, entre otros: validación de vales adicionales (fechas, campos obligatorios, tipo `ADMINISTRATIVA`), generación de vales base, configuración (tipos de comensal, turnos, asignaciones, valorización) y casinos/servicios. Los archivos están en `BackEnd/tests/`.

> Requiere Node 18+ (el runner `node:test` y los patrones glob de `--test` son estables desde Node 20; probado en Node 22).

El **frontend no tiene tests automatizados**: se valida manualmente siguiendo la guía [Cómo probar la plataforma](#cómo-probar-la-plataforma). Un set de pruebas de UI (Vitest + React Testing Library) queda propuesto como mejora en [`docs/FLUJO_Y_DECISIONES.md`](docs/FLUJO_Y_DECISIONES.md).

---

## Mockups

Prototipos HTML estáticos en `Mokcups/`, independientes de la aplicación real. Punto de entrada: `Mokcups/inicio_sesion.html`. Los siguientes códigos son solo del prototipo estático (no son las credenciales de la app):

| Código | Perfil |
|---|---|
| `ADM1203` | Administrador |
| `FUN1203` | Funcionario |
| `CAJ1203` | Cajero |
