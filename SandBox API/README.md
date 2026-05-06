 
# ValeApp Sandbox API

## Descripción

Esta Sandbox API fue creada para simular el comportamiento del backend del módulo de vales de ValeApp.

El objetivo de esta API no es implementar toda la lógica real del sistema, sino mostrar cómo se comunicaría el frontend con el backend para los principales flujos relacionados con los vales de alimentación.

En ValeApp, los vales base no son creados manualmente por el administrador. Estos son generados automáticamente por el sistema según la fecha, el turno asignado al funcionario y los servicios de alimentación correspondientes. Luego, el funcionario puede consultar sus vales disponibles e imprimirlos.

Además, la API permite simular la creación de vales adicionales por parte de un administrador, junto con la validación y registro de uso del vale por parte de un cajero.

Esta API fue construida usando **Postman Mock Server**, por lo que las respuestas son simuladas a partir de ejemplos definidos en la colección de Postman.

 
## Base URL

La URL base de la Sandbox API es:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io
````

Importante: si se abre solo la URL base en el navegador, aparecerá un error como:

```json
{
  "error": {
    "name": "mockRequestNotFoundError",
    "message": "No matching requests"
  }
}
```

Esto es normal, porque la API no tiene configurado un endpoint para la ruta raíz `/`.

Para probar la API se debe usar una ruta completa, por ejemplo:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/VALE-0001
```

---

## Colección de Postman

La colección con los endpoints y ejemplos se encuentra en Postman:

```txt
https://lorna-mella-1967672.postman.co/workspace/Lorna-Mella's-Workspace~40c83e1e-f515-416d-89e7-885ec567b718/collection/54549106-d2102bd2-e7a2-42f8-9b3c-821bbd40d82f?action=share&creator=54549106
```

---

## Endpoints disponibles

| Actor                        | Acción                      | Método | Endpoint                            |
| ---------------------------- | --------------------------- | ------ | ----------------------------------- |
| Sistema / Proceso automático | Generar vales base          | POST   | `/vales/generar-base`               |
| Funcionario                  | Consultar vales disponibles | GET    | `/funcionarios/1/vales-disponibles` |
| Funcionario                  | Imprimir vale disponible    | POST   | `/vales/VALE-0001/imprimir`         |
| Administrador                | Crear vale adicional        | POST   | `/vales/adicional`                  |
| Cajero                       | Validar vale                | GET    | `/vales/VALE-0001/validar`          |
| Cajero                       | Registrar uso de vale       | POST   | `/vales/VALE-0001/registrar-uso`    |
| Sistema                      | Consultar vale              | GET    | `/vales/VALE-0001`                  |

 

# 1. Generar vales base

Este endpoint simula la generación automática de vales base para una fecha determinada. Representa el proceso interno del sistema que asigna vales según los funcionarios, sus turnos y los servicios disponibles.

## Request

```http
POST /vales/generar-base
```

URL completa:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/generar-base
```

## Body JSON

```json
{
  "fechaUso": "2026-10-24"
}
```

## Response 200

```json
{
  "mensaje": "Vales base generados correctamente",
  "fechaUso": "2026-10-24",
  "cantidadValesGenerados": 148
}
```

Este endpoint debe probarse desde Postman, porque usa el método `POST`.

---

# 2. Consultar vales disponibles

Este endpoint permite que un funcionario consulte los vales disponibles que el sistema generó automáticamente para él.

## Request

```http
GET /funcionarios/1/vales-disponibles
```

URL completa:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/funcionarios/1/vales-disponibles
```

## Response 200

```json
[
  {
    "idVale": "VALE-0001",
    "fechaAsignacion": "2026-10-24",
    "fechaUso": "2026-10-24",
    "fechaCanje": null,
    "estado": "Disponible",
    "tipoAsignacion": "Por turno",
    "valor": 3000,
    "motivo": null,
    "servicio": {
      "idServicio": 2,
      "nombre": "Almuerzo"
    }
  },
  {
    "idVale": "VALE-0002",
    "fechaAsignacion": "2026-10-24",
    "fechaUso": "2026-10-24",
    "fechaCanje": null,
    "estado": "Disponible",
    "tipoAsignacion": "Por turno",
    "valor": 2500,
    "motivo": null,
    "servicio": {
      "idServicio": 1,
      "nombre": "Desayuno"
    }
  }
]
```

Este endpoint puede probarse directamente desde el navegador, ya que usa el método `GET`.

---

# 3. Imprimir vale disponible

Este endpoint simula la impresión de un vale que ya fue generado previamente por el sistema.

## Request

```http
POST /vales/VALE-0001/imprimir
```

URL completa:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/VALE-0001/imprimir
```

## Body JSON

```json
{
  "idFuncionario": 1
}
```

## Response 200

```json
{
  "idVale": "VALE-0001",
  "estado": "Emitido",
  "mensaje": "Vale impreso correctamente"
}
```

Este endpoint debe probarse desde Postman, porque usa el método `POST`.

---

# 4. Crear vale adicional

Este endpoint simula la creación de un vale adicional por parte de un administrador. A diferencia de los vales base, los vales adicionales se asignan manualmente para casos excepcionales, como reuniones, visitas o capacitaciones.

## Request

```http
POST /vales/adicional
```

URL completa:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/adicional
```

## Body JSON

```json
{
  "idAdministrador": 1,
  "idFuncionario": 3,
  "idServicio": 6,
  "fechaUso": "2026-10-25",
  "valor": 5500,
  "motivo": "Capacitación interna"
}
```

## Response 201

```json
{
  "idVale": "VALE-AD-0001",
  "fechaAsignacion": "2026-10-24",
  "fechaUso": "2026-10-25",
  "fechaCanje": null,
  "estado": "Emitido",
  "tipoAsignacion": "Administrativa",
  "valor": 5500,
  "motivo": "Capacitación interna"
}
```

Este endpoint debe probarse desde Postman, porque usa el método `POST`.

---

# 5. Validar vale

Este endpoint permite que el cajero valide si un vale está vigente y disponible para uso.

## Request

```http
GET /vales/VALE-0001/validar
```

URL completa:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/VALE-0001/validar
```

## Response 200

```json
{
  "idVale": "VALE-0001",
  "valido": true,
  "mensaje": "Vale vigente y disponible para uso",
  "estado": "Emitido",
  "tipoAsignacion": "Por turno",
  "valor": 3000
}
```

Este endpoint puede probarse directamente desde el navegador, ya que usa el método `GET`.

---

# 6. Registrar uso del vale

Este endpoint simula el registro del uso o canje de un vale por parte del cajero.

## Request

```http
POST /vales/VALE-0001/registrar-uso
```

URL completa:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/VALE-0001/registrar-uso
```

## Body JSON

```json
{
  "idCajero": 5,
  "fechaCanje": "2026-10-24T13:20:00"
}
```

## Response 200

```json
{
  "idVale": "VALE-0001",
  "estado": "Utilizado",
  "fechaCanje": "2026-10-24T13:20:00",
  "mensaje": "Uso del vale registrado correctamente"
}
```

Este endpoint debe probarse desde Postman, porque usa el método `POST`.

---

# 7. Consultar vale

Este endpoint permite consultar la información completa de un vale.

## Request

```http
GET /vales/VALE-0001
```

URL completa:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/VALE-0001
```

## Response 200

```json
{
  "idVale": "VALE-0001",
  "fechaAsignacion": "2026-10-24",
  "fechaUso": "2026-10-24",
  "fechaCanje": "2026-10-24T13:20:00",
  "estado": "Utilizado",
  "tipoAsignacion": "Por turno",
  "valor": 3000,
  "motivo": null,
  "funcionario": {
    "idUsuario": 1,
    "nombre": "Lorna Mella"
  },
  "servicio": {
    "idServicio": 2,
    "nombre": "Almuerzo"
  }
}
```

Este endpoint se puede probar directamente desde el navegador, ya que usa el método `GET`.

---

## Cómo probar la API en Postman

1. Abrir Postman.
2. Importar o abrir la colección `ValeApp Sandbox API`.
3. Seleccionar uno de los endpoints.
4. Verificar que la URL use la base del mock server:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io
```

5. En los endpoints `POST`, revisar que el body esté en formato:

```txt
Body → raw → JSON
```

6. Presionar `Send`.
7. Verificar que la respuesta coincida con el JSON esperado.

---

## Cómo probar desde navegador

Solo se pueden probar directamente desde navegador los endpoints `GET`.

Ejemplos:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/funcionarios/1/vales-disponibles
```

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/VALE-0001
```

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/VALE-0001/validar
```

Los endpoints `POST` deben probarse desde Postman.

---

## Relación con el diagrama UML

La Sandbox API se relaciona con las principales clases del diagrama de clases UML:

| Clase UML            | Uso en la API                              |
| -------------------- | ------------------------------------------ |
| Funcionario          | Consulta e imprime vales disponibles       |
| Administrador        | Crea vales adicionales                     |
| Cajero               | Valida y registra el uso de vales          |
| ServicioAlimentacion | Define el servicio asociado al vale        |
| Vale                 | Entidad principal de la API                |
| Casino               | Contexto donde se registra el uso del vale |

 
## Flujo representado por la API

El flujo principal del módulo de vales es:

```txt
1. El sistema genera automáticamente los vales base para una fecha.
2. El funcionario consulta sus vales disponibles.
3. El funcionario imprime un vale disponible.
4. El cajero valida el vale.
5. El cajero registra el uso o canje del vale.
```

Además, se considera un flujo excepcional:

```txt
1. El administrador crea un vale adicional.
2. El funcionario puede utilizarlo según la fecha y servicio asignado.
3. El cajero valida y registra su uso.
```

 
 

