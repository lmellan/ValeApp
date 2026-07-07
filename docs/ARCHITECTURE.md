# Arquitectura ValeApp

## Descripción general

ValeApp es una SPA React que consume siete microservicios Node.js/Express independientes. Cada microservicio con datos propios tiene su propia base de datos PostgreSQL. Los servicios de reporte y notificación son orquestadores: no tienen base de datos propia y obtienen información consultando a otros servicios vía HTTP.

---

## Diagrama de servicios

```
┌─────────────────────────────────────────────────────┐
│  Browser  —  React 18 + Vite  :5173                 │
└──────┬──────────────────────────────────────────────┘
       │ HTTP (Axios)
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Microservicios Backend                                              │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  usuario-service │  │  vale-service    │  │  audit-service   │   │
│  │  :3001           │  │  :3000           │  │  :3002           │   │
│  │  usuario_db      │  │  vale_db         │  │  audit_db        │   │
│  └──────────────────┘  └────────┬─────────┘  └──────────────────┘   │
│                                 │ llama a                            │
│  ┌──────────────────┐  ┌────────▼─────────┐                         │
│  │  casino-service  │◄─┤  configuracion-  │                         │
│  │  :3004           │  │  service  :3003  │                         │
│  │  casino_db       │  │  configuracion_db│                         │
│  └──────────────────┘  └──────────────────┘                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Servicios orquestadores (sin BD propia)                     │   │
│  │                                                              │   │
│  │  reporte-service :3005  ──────────────► vale-service         │   │
│  │                                                              │   │
│  │  notificacion-service :3006  ─────────► usuario-service      │   │
│  │                              └─────────► vale-service        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  PostgreSQL 16  :15434  (Docker)                    │
│  usuario_db · vale_db · audit_db                    │
│  configuracion_db · casino_db                       │
└─────────────────────────────────────────────────────┘
```

---

## Inventario de servicios

| Servicio | Puerto | Base de datos | Responsabilidad |
|---|---|---|---|
| `vale-service` | 3000 | `vale_db` | Ciclo de vida de vales: generación automática, impresión, validación, canje |
| `usuario-service` | 3001 | `usuario_db` | Autenticación, CRUD de usuarios y roles |
| `audit-service` | 3002 | `audit_db` | Registro de eventos auditables |
| `configuracion-service` | 3003 | `configuracion_db` | Tipos de comensal, turnos, asociaciones turno-servicio, precios |
| `casino-service` | 3004 | `casino_db` | Casinos y servicios de alimentación |
| `reporte-service` | 3005 | — | Agrega datos de `vale-service` para reportes administrativos |
| `notificacion-service` | 3006 | — | Genera payload de notificación consultando usuario y resumen de vales |

---

## Comunicación entre servicios

Todas las llamadas entre servicios son HTTP síncronas con `axios`. Se utiliza un timeout de 2 000 ms. No hay implementación de reintentos, circuit breaker ni service discovery.

| Origen | Destino | Endpoint | Motivo |
|---|---|---|---|
| `vale-service` | `audit-service` | `POST /logs` | Registrar validaciones y canjes |
| `vale-service` | `configuracion-service` | `GET /funcionarios/:id/configuracion` | Obtener turno vigente y tipo de comensal al generar vales base |
| `configuracion-service` | `casino-service` | `GET /servicios-alimentacion/:id` | Validar que el servicio existe antes de asociarlo a un turno |
| `reporte-service` | `vale-service` | `GET /vales/resumen` | Obtener datos agregados para el reporte administrativo |
| `notificacion-service` | `usuario-service` | `GET /usuarios/:id/correo` | Obtener únicamente el correo del funcionario |
| `notificacion-service` | `vale-service` | `GET /funcionarios/:id/vales/resumen` | Obtener resumen de vales para el cuerpo de la notificación |

---

## Propiedad de datos

Cada servicio con base de datos propia es el único que escribe en ella. El acceso cruzado a datos se hace siempre a través de la API del servicio propietario, nunca consultando directamente la base de datos ajena.

| Base de datos | Servicio propietario | Tablas principales |
|---|---|---|
| `usuario_db` | `usuario-service` | `usuarios`, `roles` |
| `vale_db` | `vale-service` | `vales` |
| `audit_db` | `audit-service` | `audit_logs` |
| `configuracion_db` | `configuracion-service` | `tipos_comensal`, `turnos`, `asignaciones_turno`, `turno_servicios`, `funcionario_tipo_comensal`, `valorizaciones_vale` |
| `casino_db` | `casino-service` | `casinos`, `servicios_alimentacion` |

---

## Frontend

### Estructura de módulos

```
src/
├── pages/           # vistas por rol (Login, Admin, Funcionario, Cajero, Impresion)
├── features/
│   ├── auth/        # AuthContext, useAuth, loginUsuario
│   ├── users/       # CRUD de usuarios (admin)
│   ├── tiposComensal/
│   ├── servicios/   # servicios de alimentación + asociación turno-servicio
│   ├── valorizacionVales/
│   ├── valesAdicionales/
│   ├── vales/       # consulta e impresión (funcionario), validar/canjear (cajero)
│   └── reportes/
└── shared/
    ├── components/  # Header, ProtectedRoute
    ├── services/    # instancia axios
    ├── config/      # URLs de los servicios (VITE_*_API_URL)
    └── types/       # interfaces TypeScript compartidas
```

### Routing por rol

| Ruta | Rol requerido | Página |
|---|---|---|
| `/` | público | LoginPage |
| `/admin` | Administrador | AdminDashboardPage |
| `/admin/:section` | Administrador | AdminSectionPage |
| `/funcionario` | Funcionario | FuncionarioDashboardPage |
| `/funcionario/impresion/:idVale` | Funcionario | ImpresionPage |
| `/cajero` | Cajero | CajeroDashboardPage |

### Variables de entorno (Frontend)

Crear `Frontend/.env` con:

```
VITE_USER_API_URL=http://localhost:3001
VITE_VALE_API_URL=http://localhost:3000
VITE_CONFIGURACION_API_URL=http://localhost:3003
VITE_CASINO_API_URL=http://localhost:3004
```

Si no se define, cada variable cae al valor por defecto (`localhost:PORT`).

---

## Generación automática de vales base

El `vale-service` ejecuta un job interno al iniciar y cada 6 horas:

1. Verifica si hoy es el primer día hábil del mes.
2. Si lo es, consulta `configuracion-service` por la configuración de cada funcionario activo (turno vigente + tipo de comensal).
3. Para cada funcionario, consulta los servicios habilitados para su turno.
4. Genera un vale por cada combinación funcionario × servicio, evitando duplicados.

El job también se ejecuta al arrancar el servicio para recuperar vales del mes actual en caso de reinicio tardío.

---

## Roles y flujo principal

```
Administrador
  └─ Configura tipos de comensal, servicios, precios, vales adicionales

Sistema (job automático)
  └─ Genera vales base el primer día hábil del mes

Funcionario
  └─ Consulta sus vales del día → imprime

Cajero
  └─ Valida vale → registra entrega

Administrador
  └─ Consulta reportes de uso
```

---

## Deuda técnica conocida

| Ítem | Descripción |
|---|---|
| Contraseñas en texto plano | Las contraseñas se guardan y comparan sin hashing. Requiere bcrypt para producción. |
| Sin autenticación basada en tokens | El sistema usa headers `x-usuario-id` sin JWT. No hay expiración de sesión server-side. |
| Sin tests automatizados | Ningún servicio tiene tests unitarios ni de integración. Las colecciones Postman son la única forma de prueba. |
| Notificaciones sin envío real | `notificacion-service` genera el payload pero no implementa envío por correo (SMTP). |
| Sin retry ni circuit breaker | Las llamadas HTTP entre servicios usan solo un timeout de 2 000 ms. Un servicio caído puede degradar a los que dependen de él. |
