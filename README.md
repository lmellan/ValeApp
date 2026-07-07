# ValeApp

Sistema web para gestionar vales de alimentación en organizaciones. Desarrollado para el Caso 18: Sistema de Emisión y Control de Vales de Alimentación.

Documentación técnica:
- Arquitectura: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Flujo funcional y decisiones: [docs/FLUJO_Y_DECISIONES.md](docs/FLUJO_Y_DECISIONES.md)
- Base de datos PostgreSQL: [BackEnd/database/postgres/README.md](BackEnd/database/postgres/README.md)

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind CSS 3, React Router 6, Axios |
| Backend | Node.js, Express |
| Base de datos | PostgreSQL 16 en Docker |
| Pruebas manuales | Colecciones Postman |

## Requisitos

- Node.js 18 o superior
- npm
- Docker Desktop
- PowerShell en Windows para `start-all.ps1` y `stop-all.ps1`

## Estructura

```text
ValeApp/
  BackEnd/
    docker-compose.yml
    start-all.ps1
    stop-all.ps1
    database/postgres/init/     scripts SQL de inicialización
    services/
      vale-service/             :3000
      usuario-service/          :3001
      audit-service/            :3002
      configuracion-service/    :3003
      casino-service/           :3004
      reporte-service/          :3005
      notificacion-service/     :3006
  Frontend/
    src/pages/                  vistas por rol
    src/features/               módulos funcionales
    src/shared/                 componentes, tipos, cliente HTTP y configuración
  docs/
  Mokcups/
```

## Levantar el backend

```powershell
cd BackEnd
docker compose up -d postgres
.\start-all.ps1
```

Si prefieres levantar manualmente, abre una terminal por servicio y ejecuta `npm install && npm start` dentro de cada carpeta de `BackEnd/services/*`.

Para detener los servicios abiertos por el script:

```powershell
cd BackEnd
.\stop-all.ps1
```

PostgreSQL solo ejecuta los scripts de `database/postgres/init/` la primera vez que el volumen está vacío. Para recrear la BD desde cero:

```powershell
cd BackEnd
docker compose down -v
docker compose up -d postgres
```

## Datos iniciales de la BD

Al levantar PostgreSQL desde cero se crean y pueblan automáticamente:

- `usuario_db`: roles y usuarios base.
- `casino_db`: `Casino 1`, `Casino 2`, cinco servicios base y dos servicios adicionales.
- `configuracion_db`: tipos de comensal, tres turnos fijos, asignaciones iniciales, servicios por turno y valorizaciones.
- `vale_db`: tabla de vales vacía. Los vales se generan desde la aplicación, no desde datos demo.
- `audit_db`: tabla de auditoría.

Servicios base por defecto:

| Servicio | Horario | Casino |
|---|---:|---|
| Desayuno | 08:00 a 10:00 | Casino 1 |
| Almuerzo | 12:00 a 15:00 | Casino 1 |
| Once | 16:00 a 18:00 | Casino 2 |
| Cena 1 | 20:00 a 23:00 | Casino 2 |
| Cena 2 | 00:00 a 03:00 | Casino 2 |

Servicios adicionales por defecto:

| Servicio | Horario | Casino |
|---|---:|---|
| Box lunch | 09:00 a 18:00 | Casino 2 |
| Colación Visitas | 08:00 a 23:59 | Casino 1 |

Turnos fijos:

| Turno | Horario | Servicios base |
|---|---:|---|
| Turno 1 | 08:00 a 16:00 | Desayuno, Almuerzo |
| Turno 2 | 16:00 a 23:59 | Once, Cena 1 |
| Turno 3 | 00:00 a 08:00 | Cena 2, Desayuno |

## Levantar el frontend

```powershell
cd Frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`.

Variables opcionales en `Frontend/.env`:

```text
VITE_USER_API_URL=http://localhost:3001
VITE_VALE_API_URL=http://localhost:3000
VITE_CONFIGURACION_API_URL=http://localhost:3003
VITE_CASINO_API_URL=http://localhost:3004
```

## Funcionalidades implementadas

### Administrador

- Crear y editar usuarios.
- Código automático secuencial por rol: `FUN001`, `CAJ001`, `ADM001`, etc.
- Asignar tipo de comensal y turno a funcionarios.
- Gestionar tipos de comensal y modalidad de emisión: un vale por horario o múltiples vales por horario.
- Gestionar servicios de alimentación. Los servicios creados desde la UI son adicionales; los base vienen definidos por la plataforma.
- Definir valorizaciones por tipo de comensal y servicio.
- Crear, editar y eliminar asignaciones de vales adicionales.
- Consultar reportes y auditoría.

### Sistema

- Genera vales base mensuales para funcionarios activos según su turno vigente.
- Si cambia el turno de un funcionario, elimina vales base futuros no utilizados y genera los correspondientes al nuevo turno.
- Calcula expiración usando la zona horaria `America/Santiago` y la hora final real del servicio.

### Funcionario

- Ve solo sus vales del día.
- Puede imprimir únicamente si el vale corresponde al día actual, está dentro de horario, no está expirado y no ha sido utilizado.
- Si el vale ya fue utilizado o expiró, no permite imprimir.

### Cajero

- Valida el código del vale.
- Registra la entrega del alimento.
- Marca el vale como utilizado.

## Credenciales de prueba

| Rol | Correo | Código | Contraseña |
|---|---|---|---|
| Funcionario Obrero | lmella@valeapp.cl | 123456 | vale123 |
| Funcionario Jefe | rdabre@valeapp.cl | 234567 | vale123 |
| Funcionario Gerente | msoto@valeapp.cl | 345678 | vale123 |
| Funcionario Secretaria | agonzalez@valeapp.cl | 456789 | vale123 |
| Cajero | jnavarro@valeapp.cl | CAJ001 | cajero123 |
| Cajero | cperez@valeapp.cl | CAJ002 | cajero123 |
| Administrador | bvilches@valeapp.cl | ADM001 | admin123 |
| Administrador | mtorres@valeapp.cl | ADM002 | admin123 |

## Cómo probar rápido

1. Levanta PostgreSQL y los servicios.
2. Entra como administrador (`ADM001` / `admin123`).
3. Revisa Usuarios, Servicios, Tipos de comensal y Valorización.
4. Crea una asignación en Vales adicionales para un funcionario cuyo turno se cruce con el horario del servicio.
5. Entra como funcionario y revisa los vales del día.
6. Entra como cajero y valida/canjea el código del vale.

Los vales base se generan por el job del `vale-service`. Para generarlos manualmente puedes usar:

```http
POST /sistema/vales-base/generar
POST /sistema/funcionarios/:id/vales-base/recalcular
```

## Endpoints principales

### vale-service `:3000`

```text
GET    /vales/todos
GET    /vales/resumen
GET    /vales/:idVale
POST   /vales/:idVale/validar
POST   /vales/:idVale/canjear
POST   /vales/:idVale/imprimir
GET    /funcionarios/:id/vales
GET    /funcionarios/:id/vales-disponibles
GET    /funcionarios/:id/vales/resumen
GET    /administrador/vales
POST   /administrador/vales
PUT    /administrador/vales/:idVale
DELETE /administrador/vales/:idVale
POST   /sistema/vales-base/generar
POST   /sistema/funcionarios/:id/vales-base/recalcular
```

### usuario-service `:3001`

```text
GET    /usuarios
GET    /usuarios/:id
GET    /usuarios/:id/rol
GET    /usuarios/:id/correo
POST   /usuarios
POST   /usuarios/login
PUT    /usuarios/:id
```

### configuracion-service `:3003`

```text
GET    /tipos-comensal
POST   /tipos-comensal
PUT    /tipos-comensal/:id
GET    /turnos
GET    /turnos/:id/servicios
POST   /asignaciones-turno
GET    /funcionarios/:id/configuracion
POST   /funcionarios/:id/tipo-comensal
DELETE /funcionarios/:id/tipo-comensal
GET    /valorizaciones-vales
POST   /valorizaciones-vales
GET    /valorizaciones-vales/valor
```

### casino-service `:3004`

```text
GET    /casinos
GET    /servicios-alimentacion
GET    /servicios-alimentacion/:id
POST   /servicios-alimentacion
PUT    /servicios-alimentacion/:id
GET    /servicios-alimentacion/:id/disponibilidad
```

## Tests

```powershell
cd BackEnd
npm test
```

El frontend se valida por build y pruebas manuales:

```powershell
cd Frontend
npm run build
```

