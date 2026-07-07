# Flujo, supuestos y decisiones de ValeApp

Este documento describe el flujo funcional real de la aplicación tal como está implementada, los supuestos que se tomaron durante el desarrollo, las funcionalidades que **no** se implementaron (con su justificación) y cómo se habrían implementado si el alcance lo hubiera permitido.

Complementa a [`ARCHITECTURE.md`](ARCHITECTURE.md), que describe la estructura técnica (servicios, puertos, comunicación).

---

## 1. Flujo actual de la aplicación

### 1.1 Visión general

ValeApp digitaliza la emisión y control de vales de alimentación. Intervienen tres roles humanos (Administrador, Funcionario, Cajero) y un proceso automático del sistema.

```
Administrador configura el sistema
        ↓
Sistema genera vales base automáticamente (job mensual)
        ↓
Funcionario consulta sus vales del día
        ↓
Funcionario imprime el comprobante
        ↓
Funcionario presenta el vale en el casino
        ↓
Cajero valida el vale
        ↓
Cajero registra la entrega (canje)
        ↓
Sistema marca el vale como UTILIZADO
        ↓
Administrador consulta reportes
```

### 1.2 Flujo del Administrador

El administrador entra a `/admin` y accede a seis módulos:

1. **Usuarios** — crea y edita usuarios. Al crear un funcionario puede asignarle un **tipo de comensal** y un **turno** (uno de los tres fijos).
2. **Tipos de comensal** — define categorías (Obrero, Jefe, Gerente, Secretaria) con su cantidad de vales y si permiten emisión múltiple.
3. **Servicios de alimentación** — gestiona los servicios. Los servicios **Base** tienen nombre y horario fijos (bloqueados en la UI) y se asocian a uno o más turnos mediante checkboxes; los servicios **Adicionales** permiten editar nombre y horario libremente.
4. **Valorización de vales** — define el precio de cada combinación tipo de comensal × servicio.
5. **Vales adicionales** — crea vales excepcionales (capacitación, reunión, evento) asignados manualmente a un funcionario, con motivo obligatorio.
6. **Reportes** — consulta uso, emisión y auditoría con filtros por período (diario, semanal, mensual, anual).

### 1.3 Flujo del Sistema (generación automática)

El `vale-service` corre un job al arrancar y cada 6 horas:

1. Detecta si hoy es el primer día hábil del mes.
2. Consulta a `configuracion-service` la configuración de cada funcionario (turno vigente + tipo de comensal).
3. Obtiene los servicios habilitados para ese turno.
4. Genera un vale base (`tipoAsignacion = POR_TURNO`, `estadoUso = NO_UTILIZADO`) por cada combinación funcionario × servicio, evitando duplicados.

### 1.4 Flujo del Funcionario

1. Inicia sesión y llega a `/funcionario`.
2. Ve únicamente **sus** vales del día, con estado calculado (disponible, utilizado, expirado).
3. Puede imprimir un vale disponible: se abre la vista `/funcionario/impresion/:idVale`, que simula el comprobante y registra la fecha/hora de impresión (imprimir **no** equivale a canjear).

### 1.5 Flujo del Cajero

1. Inicia sesión y llega a `/cajero`.
2. Ingresa el código del vale y presiona **Validar** (o Enter).
3. El backend verifica existencia, propiedad, estado de uso, expiración y horario. Si es válido, la UI muestra una tarjeta con el funcionario, servicio, horario límite y valor.
4. El cajero presiona **Registrar Entrega**: el vale pasa a `UTILIZADO`, se guarda el id del cajero y la fecha/hora del canje.
5. La operación queda en el **historial local** de la sesión del cajero y el formulario se limpia para el siguiente vale.

---

## 2. Supuestos que se tomaron

Estos supuestos se adoptaron para acotar el alcance manteniendo coherencia con las reglas de negocio del documento `valeapp flujo`.

| # | Supuesto | Razón |
|---|---|---|
| S1 | **Los turnos son tres y fijos** (08:00–16:00, 16:00–24:00, 24:00–08:00). | El caso de negocio describe una empresa con jornadas fijas. No se construyó UI de creación de turnos; el administrador solo los **selecciona** al crear/editar un usuario. |
| S2 | **El horario y nombre de los servicios Base no se modifican.** | Los servicios base deben coincidir con las ventanas de los turnos para que la generación automática de vales sea válida. Cambiarlos rompería la regla "vale por turno en función del servicio". Solo los servicios Adicionales son totalmente editables. |
| S3 | **Un funcionario tiene un solo tipo de comensal y un solo turno vigente.** | Regla R15 y R18 del documento de negocio. Los cambios de turno se modelan cerrando la asignación anterior (`fecha_fin`) y creando una nueva. |
| S4 | **La generación de vales base ocurre el primer día hábil del mes.** | Interpretación del proceso mensual descrito. Existe además un job de recuperación al arrancar el servicio por si estuvo caído ese día. |
| S5 | **La disponibilidad del vale se calcula, no se almacena.** | Regla R29. El estado que se guarda es `estadoUso` + `expirado`; "disponible/expirado/utilizado" se deriva en cada consulta. |
| S6 | **La sesión se maneja con el id de usuario en headers** (`x-usuario-id`, `x-funcionario-id`) y en `localStorage`. | Suficiente para un prototipo funcional demostrable sin infraestructura de auth. Ver sección 3. |
| S7 | **El valor monetario vive en el vale, no en el servicio.** | Regla R24. El precio se resuelve al momento de generar el vale consultando la valorización (tipo de comensal × servicio). |
| S8 | **Los datos de prueba (usuarios, casinos, servicios) se cargan por scripts SQL de inicialización.** | Permite levantar el sistema con datos coherentes sin capturas manuales. |

---

## 3. Funcionalidades que NO se implementaron

### 3.1 Envío real de notificaciones por correo

**Qué falta:** el `notificacion-service` construye el payload de la notificación (destinatario, asunto, cuerpo con el resumen de vales) pero **no envía** correos reales.

**Por qué no se hizo:** se acordó dejar las notificaciones como funcionalidad **teórica**. Requiere un proveedor de correo (SMTP, SendGrid, etc.), credenciales y manejo de colas/reintentos, que exceden el alcance del prototipo y aportan poco a la demostración del flujo central de vales.

**Cómo se habría hecho:**
- Integrar `nodemailer` con un transporte SMTP configurado por variables de entorno (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`).
- Convertir `generarPayloadNotificacion` en un `enviarNotificacion` que, tras construir el payload, llame a `transporter.sendMail(...)`.
- Programar un job semanal (por ejemplo con `node-cron`) que recorra los funcionarios activos y dispare el envío.
- Registrar cada envío en `audit-service` y manejar fallos con reintentos exponenciales.

### 3.2 Contraseñas con hash y autenticación por token

**Qué falta:** las contraseñas se guardan y comparan en **texto plano**. No hay JWT ni expiración de sesión del lado del servidor.

**Por qué no se hizo:** el foco del proyecto era el flujo de negocio de los vales, no la seguridad de producción. Para una demostración local en un entorno controlado, la comparación directa es suficiente y evita complejidad de gestión de tokens.

**Cómo se habría hecho:**
- Al crear/editar usuario, hashear la contraseña con `bcrypt` (`bcrypt.hash(contrasena, 10)`) y guardar solo el hash.
- En el login, validar con `bcrypt.compare(...)`.
- Emitir un **JWT** firmado con un secreto de entorno, con expiración (por ejemplo 8 h), y enviarlo al frontend.
- Sustituir los headers `x-usuario-id` por un `Authorization: Bearer <token>` y un middleware que valide el token y extraiga el id/rol.
- Proteger cada endpoint según el rol contenido en el token (no confiar en el id enviado por el cliente).

### 3.3 Tests automatizados

**Estado actual:** el backend tiene un set de **pruebas unitarias sobre los DTOs** (validaciones de negocio puras) con el runner nativo `node:test`, ejecutable con `npm test` desde `BackEnd/` (sin dependencias adicionales). Cubren validación de vales adicionales, generación de vales base, configuración y casinos/servicios.

**Qué falta:** tests de la capa `service`/`repository` (requieren mocks o una BD de prueba), tests de endpoints de extremo a extremo y tests del frontend.

**Por qué se acotó así:** los DTOs concentran las reglas de validación de entrada y son lógica pura, por lo que dan la mejor relación cobertura/esfuerzo sin infraestructura. La capa de servicio depende de PostgreSQL y de llamadas HTTP entre servicios, cuyo testeo exige mocks o entorno levantado.

**Cómo se completaría:**
- **Backend (servicio/repositorio):** `Jest` + `supertest` por endpoint (casos felices y de error), con una BD de prueba en Docker o mocks del repositorio y de `axios`.
- **Frontend:** `Vitest` + `React Testing Library` para componentes clave (formularios, validaciones, flujo del cajero) con mocks de `axios`. No es imprescindible para el prototipo, pero aportaría en los formularios con más lógica (servicios, vales adicionales).
- **Integración:** un pipeline que levante los servicios y corra las colecciones Postman con `newman`.

### 3.4 Resiliencia entre servicios (retry / circuit breaker)

**Qué falta:** las llamadas HTTP entre servicios usan solo un timeout de 2 000 ms. No hay reintentos ni circuit breaker.

**Por qué no se hizo:** en un entorno local con todos los servicios en la misma máquina, los fallos de red son improbables y añadir esta capa habría sido complejidad sin beneficio observable en la demostración. Se documentó explícitamente lo que **sí** existe (timeout) para no sobrevender la arquitectura.

**Cómo se habría hecho:**
- Envolver las llamadas `axios` con una librería como `axios-retry` (reintentos con backoff exponencial para errores transitorios).
- Añadir un circuit breaker con `opossum`, de modo que si un servicio dependiente falla repetidamente, se corte el flujo y se devuelva una respuesta degradada en lugar de encolar peticiones.
- Definir respuestas de *fallback* (por ejemplo, si `audit-service` no responde, registrar localmente y continuar, como ya se hace parcialmente en el canje).
 
---

## 4. Resumen del estado

| Área | Estado |
|---|---|
| Login y control de acceso por rol | ✅ Implementado |
| Gestión de usuarios (con turno + tipo de comensal) | ✅ Implementado |
| Tipos de comensal, servicios, valorización | ✅ Implementado |
| Asociación turno ↔ servicio (con bloqueo de servicios base) | ✅ Implementado |
| Vales adicionales | ✅ Implementado |
| Generación automática de vales base | ✅ Implementado |
| Consulta e impresión (funcionario) | ✅ Implementado |
| Validación y canje (cajero) con historial | ✅ Implementado |
| Reportes y auditoría | ✅ Implementado |
| Envío real de correos | ⚪ Teórico (ver 3.1) |
| Hash de contraseñas / JWT | ⚪ No implementado (ver 3.2) |
| Tests unitarios de DTOs (backend) | ✅ Implementado (`npm test`, ver 3.3) |
| Tests de servicio/repositorio y frontend | ⚪ No implementado (ver 3.3) |
| Resiliencia (retry / circuit breaker) | ⚪ No implementado (ver 3.4) | 

**Leyenda:** ✅ implementado y funcional · ⚪ fuera del alcance, documentado con su justificación y ruta de implementación.
