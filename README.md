# ValeApp

Mockups HTML del Caso 18: "Sistema de Emision y Control de Vales de Alimentacion".

Proyecto desarrollado por el grupo LosPapus.

## Descripcion

ValeApp es una propuesta de sistema web para emitir, imprimir, validar y controlar vales de alimentacion en una empresa con funcionarios, cajeros y administradores.

Los mockups permiten recorrer los principales perfiles del sistema:

- Administrador: gestion de usuarios, tipos de comensal, servicios, reglas de vales, vales adicionales y reportes.
- Funcionario: consulta de servicios disponibles e impresion de vale.
- Cajero: validacion y registro de canje de vales.

## Como ver los mockups

1. Abrir el archivo `inicio_sesion.html` en un navegador web.
2. Seleccionar uno de los codigos de usuario disponibles.
3. Presionar el boton `Ingresar`.
4. Navegar por las pantallas del perfil seleccionado.

El punto de partida del prototipo siempre es:

```text
inicio_sesion.html
```

## Codigos de prueba

Usar estos codigos en la vista inicial `inicio_sesion.html`:

| Codigo | Perfil | Pantalla de destino |
| --- | --- | --- |
| `ADM1203` | Administrador | `Administrador/vista_principal.html` |
| `FUN1203` | Funcionario | `Funcionario/vista_principal.html` |
| `CAJ1203` | Cajero | `Cajero/vista_principal.html` |

La contrasena visible en el mockup es de referencia para el prototipo.

## Estructura principal

```text
ValeApp/
+-- inicio_sesion.html
+-- logo_valeapp.png
+-- Administrador/
|   +-- vista_principal.html
|   +-- admin_usuarios.html
|   +-- admin_tipos_comensal.html
|   +-- admin_servicios.html
|   +-- admin_reglas_vales.html
|   +-- admin_vales_adicionales.html
|   +-- admin_reportes.html
+-- Funcionario/
|   +-- vista_principal.html
|   +-- impresion.html
+-- Cajero/
    +-- vista_principal.html
```

## Recomendacion para revision

Para revisar el flujo completo, partir desde `inicio_sesion.html` y probar los perfiles en este orden:

1. `ADM1203` para revisar la administracion del sistema.
2. `FUN1203` para revisar la emision e impresion de vales.
3. `CAJ1203` para revisar la validacion del vale por parte del cajero.

En el perfil de cajero, el codigo de vale de prueba es:

```text
VALE123
```

---

## BackEnd — Microservicios

El backend esta compuesto por siete microservicios independientes en Node.js/Express. Cada uno corre en su propio puerto y debe iniciarse por separado.

### Requisitos previos

- Node.js (v18 o superior)
- npm

### Instalacion de dependencias

Ejecutar una vez antes de levantar los servicios por primera vez:

```bash
cd BackEnd/vale-service && npm install
cd BackEnd/usuario-service && npm install
cd BackEnd/audit-service && npm install
cd BackEnd/configuracion-service && npm install
cd BackEnd/casino-service && npm install
cd BackEnd/reporte-service && npm install
cd BackEnd/notificacion-service && npm install
```

### Levantar los servicios

Cada microservicio debe ejecutarse en una terminal separada:

```bash
# vale-service — logica central de vales (puerto 3000)
cd BackEnd/vale-service && node index.js

# usuario-service — gestion de usuarios y roles (puerto 3001)
cd BackEnd/usuario-service && node index.js

# audit-service — registro de eventos (puerto 3002)
cd BackEnd/audit-service && node index.js

# configuracion-service — turnos y tipos de comensal (puerto 3003)
cd BackEnd/configuracion-service && node index.js

# casino-service — casinos y servicios de alimentacion (puerto 3004)
cd BackEnd/casino-service && node index.js

# reporte-service — generacion de reportes administrativos (puerto 3005)
cd BackEnd/reporte-service && node index.js

# notificacion-service — envio de resumenes semanales (puerto 3006)
cd BackEnd/notificacion-service && node index.js
```

### Puertos y responsabilidades

| Servicio | Puerto | Responsabilidad |
| --- | --- | --- |
| `vale-service` | 3000 | Ciclo de vida del vale: generacion, validacion, canje |
| `usuario-service` | 3001 | Usuarios y roles (Funcionario, Cajero, Administrador) |
| `audit-service` | 3002 | Registro de eventos de auditoria |
| `configuracion-service` | 3003 | Turnos, tipos de comensal y reglas de emision |
| `casino-service` | 3004 | Casinos y servicios de alimentacion |
| `reporte-service` | 3005 | Generacion de reportes administrativos |
| `notificacion-service` | 3006 | Envio de resumenes semanales a funcionarios |

### Endpoints principales

**vale-service (3000)**

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/vales/:idVale` | Consultar un vale por ID |
| POST | `/vales/:idVale/validar` | Validar y marcar vale como utilizado (requiere header `x-usuario-id`) |
| GET | `/funcionarios/:idFuncionario/vales-disponibles` | Listar vales disponibles de un funcionario |
| POST | `/administrador/vales` | Crear un vale adicional |

**usuario-service (3001)**

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/usuarios/:idUsuario/rol` | Obtener el rol de un usuario |

**audit-service (3002)**

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| POST | `/logs` | Registrar un evento de auditoria |

**configuracion-service (3003)**

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/tipos-comensal` | Listar tipos de comensal |
| GET | `/turnos` | Listar turnos |
| GET | `/funcionarios/:id/configuracion` | Obtener turno vigente y tipo comensal de un funcionario |

**casino-service (3004)**

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/casinos` | Listar casinos |
| GET | `/servicios-alimentacion` | Listar servicios de alimentacion |
| GET | `/servicios-alimentacion/:id/disponibilidad` | Verificar si un servicio esta activo y en horario |

### Datos de prueba

Los servicios con base de datos SQLite se auto-poblaran al iniciar. Los datos de prueba disponibles son:

**vale-service**

| idVale | idFuncionario | Estado | Disponible |
| --- | --- | --- | --- |
| `VALE-1001` | 1 | No utilizado | Si |
| `VALE-1002` | 1 | Utilizado | No (ya canjeado) |
| `VALE-1003` | 1 | No utilizado | No (expirado) |

**usuario-service** (datos mock, sin base de datos)

| ID | Rol |
| --- | --- |
| 1 | Funcionario |
| 2 | Cajero |
| 3 | Administrador |

**configuracion-service**

| Tipo Comensal | Vales permitidos |
| --- | --- |
| Obrero (ID 1) | 1 |
| Jefe (ID 2) | 2 |
| Gerente (ID 3) | 3 |

**casino-service**

| ID | Servicio | Horario | Casino |
| --- | --- | --- | --- |
| 1 | Desayuno | 08:00–10:00 | Casino Central |
| 2 | Almuerzo | 12:00–14:00 | Casino Central |
| 3 | Cena | 19:00–21:00 | Casino Central |
| 4 | Once | 16:00–18:00 | Casino Norte |
| 5 | Box Lunch | 11:00–15:00 | Casino Norte |

---

## Pruebas con Postman

La carpeta `test_jsons/` contiene las colecciones exportadas de Postman para probar cada microservicio de forma local.

### Requisitos

- [Postman](https://www.postman.com/downloads/) instalado
- Todos los microservicios corriendo (ver sección anterior)

### Como importar las colecciones

1. Abrir Postman.
2. Hacer clic en **Import** (boton superior izquierdo).
3. Seleccionar **Folder** y elegir la carpeta `test_jsons/` del proyecto.
4. Postman importara todas las colecciones automaticamente.
5. Cada coleccion corresponde a un microservicio distinto.

---

### ValeService — puerto 3000

| Nombre | Metodo | URL |
| --- | --- | --- |
| Listar todos los vales | GET | `http://localhost:3000/vales/todos` |
| Consultar detalle de un vale | GET | `http://localhost:3000/vales/VALE-1001` |
| Listar vales disponibles por funcionario | GET | `http://localhost:3000/funcionarios/3/vales-disponibles` |
| Validar un vale | POST | `http://localhost:3000/vales/VALE-1001/validar` |
| Crear vale adicional | POST | `http://localhost:3000/administrador/vales` |

**Validar un vale** — requiere el siguiente header:

```
x-usuario-id: 3
```

**Crear vale adicional** — body JSON de ejemplo:

```json
{
  "idVale": "VALE-1007",
  "idFuncionario": 1,
  "tipoAsignacion": "Base",
  "valor": 3500,
  "fechaExpiracion": "2026-12-31"
}
```

---

### UsuarioService — puerto 3001

| Nombre | Metodo | URL |
| --- | --- | --- |
| Obtener rol de usuario | GET | `http://localhost:3001/usuarios/3/rol` |
| Obtener datos de usuario | GET | `http://localhost:3001/usuarios/3` |

> Reemplazar el `3` en la URL por el ID del usuario deseado. IDs disponibles: `1` (Funcionario), `2` (Cajero), `3` (Administrador).

---

### AuditService — puerto 3002

| Nombre | Metodo | URL |
| --- | --- | --- |
| Registrar auditoria | POST | `http://localhost:3002/logs` |

**Body JSON de ejemplo:**

```json
{
  "evento": "VALIDACION_VALE_EXITOSA",
  "detalle": "El usuario con ID 3 validó correctamente el vale VALE-1001",
  "timestamp": "2026-05-27T17:25:00Z"
}
```

---

### ConfigurationService — puerto 3003

#### Tipos de comensal

| Nombre | Metodo | URL |
| --- | --- | --- |
| Listar tipos de comensal | GET | `http://localhost:3003/tipos-comensal` |
| Obtener tipo de comensal | GET | `http://localhost:3003/tipos-comensal/1` |
| Crear tipo de comensal | POST | `http://localhost:3003/tipos-comensal` |

**Crear tipo de comensal** — body JSON de ejemplo:

```json
{
  "nombre": "Alumno Regular",
  "descripcion": "Estudiante con beneficio de alimentación estándar",
  "cantidadVales": 1,
  "emisionMultiple": true
}
```

#### Turnos

| Nombre | Metodo | URL |
| --- | --- | --- |
| Listar todos los turnos | GET | `http://localhost:3003/turnos` |
| Obtener detalle de un turno | GET | `http://localhost:3003/turnos/2` |
| Crear nuevo turno | POST | `http://localhost:3003/turnos` |

**Crear nuevo turno** — body JSON de ejemplo:

```json
{
  "nombre": "Turno 4",
  "horaInicio": "12:00",
  "horaFin": "14:30"
}
```

#### Servicios por turno y asignaciones

| Nombre | Metodo | URL |
| --- | --- | --- |
| Obtener servicios por turno | GET | `http://localhost:3003/turnos/2/servicios` |
| Agregar servicio a un turno | POST | `http://localhost:3003/turnos/2/servicios` |
| Crear asignacion de turno | POST | `http://localhost:3003/asignaciones-turno` |

**Agregar servicio a un turno** — body JSON de ejemplo:

```json
{
  "idServicio": 50
}
```

**Crear asignacion de turno** — body JSON de ejemplo:

```json
{
  "idFuncionario": 1,
  "idTurno": 2,
  "fechaInicio": "2026-05-27",
  "fechaFin": null
}
```

#### Configuracion de funcionarios

| Nombre | Metodo | URL |
| --- | --- | --- |
| Obtener configuracion vigente de funcionario | GET | `http://localhost:3003/funcionarios/2/configuracion` |
| Asignar tipo de comensal a funcionario | POST | `http://localhost:3003/funcionarios/3/tipo-comensal` |

**Asignar tipo de comensal** — body JSON de ejemplo:

```json
{
  "idTipoComensal": 2
}
```

---

### CasinoService — puerto 3004

#### Casinos

| Nombre | Metodo | URL |
| --- | --- | --- |
| Listar todos los casinos | GET | `http://localhost:3004/casinos` |
| Obtener detalle de un casino | GET | `http://localhost:3004/casinos/1` |
| Listar servicios de un casino | GET | `http://localhost:3004/casinos/1/servicios` |
| Crear nuevo casino | POST | `http://localhost:3004/casinos/` |

**Crear nuevo casino** — body JSON de ejemplo:

```json
{
  "nombre": "Casino Papu",
  "direccion": "Edificio Principal, Piso 100"
}
```

#### Servicios de alimentacion

| Nombre | Metodo | URL |
| --- | --- | --- |
| Listar todos los servicios | GET | `http://localhost:3004/servicios-alimentacion` |
| Obtener detalle de un servicio | GET | `http://localhost:3004/servicios-alimentacion/1` |
| Crear nuevo servicio | POST | `http://localhost:3004/servicios-alimentacion` |
| Verificar disponibilidad de servicio | GET | `http://localhost:3004/servicios-alimentacion/1/disponibilidad` |

**Crear nuevo servicio** — body JSON de ejemplo:

```json
{
  "nombre": "Almuerzo Ejecutivo",
  "categoria": "Menú Común",
  "horaInicio": "12:00:00",
  "horaFin": "14:30:00",
  "idCasino": 1
}
```

---

### ReporteService — puerto 3005

| Nombre | Metodo | URL |
| --- | --- | --- |
| Generar resumen general | GET | `http://localhost:3005/reportes/resumen` |

---

### NotificacionService — puerto 3006

| Nombre | Metodo | URL |
| --- | --- | --- |
| Enviar resumen semanal | POST | `http://localhost:3006/notificaciones/resumen-semanal/1` |

> Reemplazar el `1` al final de la URL por el ID del funcionario al que se quiere enviar el resumen.
