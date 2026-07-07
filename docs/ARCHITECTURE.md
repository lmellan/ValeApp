# Arquitectura ValeApp

ValeApp es una SPA React que consume microservicios Node.js/Express. Cada servicio con datos propios tiene su base PostgreSQL. Los servicios de reporte y notificación funcionan como orquestadores HTTP.

## Servicios

| Servicio | Puerto | Base de datos | Responsabilidad |
|---|---:|---|---|
| `vale-service` | 3000 | `vale_db` | Ciclo de vida de vales, generación base, impresión, validación y canje |
| `usuario-service` | 3001 | `usuario_db` | Login, CRUD de usuarios, roles y sincronización de configuración |
| `audit-service` | 3002 | `audit_db` | Logs auditables |
| `configuracion-service` | 3003 | `configuracion_db` | Tipos de comensal, turnos, servicios por turno y valorizaciones |
| `casino-service` | 3004 | `casino_db` | Casinos y servicios de alimentación |
| `reporte-service` | 3005 | Sin BD | Agregación de datos para reportes |
| `notificacion-service` | 3006 | Sin BD | Payloads de notificación |

## Propiedad de datos

| Base | Servicio propietario | Tablas principales |
|---|---|---|
| `usuario_db` | `usuario-service` | `usuarios`, `roles` |
| `vale_db` | `vale-service` | `vales` |
| `audit_db` | `audit-service` | `audit_logs` |
| `configuracion_db` | `configuracion-service` | `tipos_comensal`, `turnos`, `asignaciones_turno`, `turno_servicios`, `funcionario_tipo_comensal`, `valorizaciones_vale` |
| `casino_db` | `casino-service` | `casinos`, `servicios_alimentacion` |

Los servicios no consultan tablas de otra base directamente. Cuando necesitan datos externos, llaman al servicio propietario mediante HTTP.

## Comunicación

Las llamadas entre servicios son HTTP síncronas. En la mayoría de los casos se usa timeout de 2 segundos.

| Origen | Destino | Uso |
|---|---|---|
| `vale-service` | `configuracion-service` | Turno vigente, tipo de comensal y valorización |
| `vale-service` | `casino-service` | Datos, horario y disponibilidad de servicios |
| `usuario-service` | `configuracion-service` | Sincronizar tipo de comensal y turno al crear/editar funcionarios |
| `usuario-service` | `vale-service` | Recalcular vales base futuros cuando cambia el turno |
| `configuracion-service` | `casino-service` | Validar servicios antes de asociarlos a turnos |
| `reporte-service` | `vale-service` | Obtener vales y resumen |
| `notificacion-service` | `usuario-service` / `vale-service` | Construir payloads de notificación |

## Frontend

El frontend está organizado por features:

```text
Frontend/src/
  pages/                  vistas por rol
  features/
    auth/
    users/
    tiposComensal/
    servicios/
    valorizacionVales/
    valesAdicionales/
    vales/
    reportes/
  shared/
    components/
    services/
    config/
    types/
```

## Reglas relevantes

- Los turnos son fijos: `08:00-16:00`, `16:00-23:59`, `00:00-08:00`.
- Los servicios base se cargan desde seed y no se crean desde la UI.
- Los servicios creados desde la UI son adicionales.
- Los vales base se generan por turno y servicio asociado.
- Los vales adicionales se crean manualmente para una fecha específica.
- La validación de horario de un vale usa el horario del servicio asociado.
- La expiración se calcula en `vale-service` usando zona horaria `America/Santiago` y `hora_fin_validez`.
- La valorización se resuelve por matriz `tipo de comensal + servicio`.

## Generación automática de vales base

`vale-service` ejecuta un job al arrancar y periódicamente:

1. Determina el período mensual.
2. Obtiene funcionarios activos desde `usuario-service`.
3. Consulta turno vigente y tipo de comensal en `configuracion-service`.
4. Obtiene los servicios asociados al turno.
5. Inserta vales `POR_TURNO`, evitando duplicados por `id_vale`.

Cuando un administrador cambia el turno de un funcionario, `usuario-service` pide a `vale-service` recalcular vales base futuros: elimina los futuros no utilizados y genera los que correspondan al nuevo turno.

## Deuda técnica conocida

| Tema | Estado |
|---|---|
| Contraseñas | Se guardan en texto plano. Para producción se requiere hashing con bcrypt o equivalente. |
| Sesión | Se usa `localStorage` y headers con id de usuario/funcionario. No hay JWT. |
| Resiliencia | No hay retry ni circuit breaker. |
| Notificaciones | Se construye payload, pero no se envían correos reales. |
| Tests | Hay pruebas backend de DTOs. Falta cubrir servicios, repositorios y frontend. |
