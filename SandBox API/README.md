Claro. Puedes copiar esto tal cual en un archivo llamado:

```txt
README.md
```

---

````md
# ValeApp Sandbox API

## Descripción

Esta Sandbox API fue creada para simular el comportamiento del backend del módulo de vales de ValeApp.

El objetivo de esta API no es implementar toda la lógica real del sistema, sino mostrar cómo se comunicaría el frontend con el backend para los principales flujos relacionados con los vales de alimentación.

La API permite probar operaciones como:

- Impresión de un vale normal por parte de un funcionario.
- Creación de un vale adicional por parte de un administrador.
- Validación de un vale por parte de un cajero.
- Registro de uso/canje de un vale.
- Consulta de información de un vale.

Esta API fue construida usando **Postman Mock Server**, por lo que las respuestas son simuladas a partir de ejemplos definidos en la colección de Postman.

---

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

| Actor         | Acción                | Método | Endpoint                         |
| ------------- | --------------------- | ------ | -------------------------------- |
| Funcionario   | Imprimir vale normal  | POST   | `/vales/imprimir`                |
| Administrador | Crear vale adicional  | POST   | `/vales/adicional`               |
| Cajero        | Validar vale          | GET    | `/vales/VALE-0001/validar`       |
| Cajero        | Registrar uso de vale | POST   | `/vales/VALE-0001/registrar-uso` |
| Sistema       | Consultar vale        | GET    | `/vales/VALE-0001`               |

---

# 1. Consultar vale

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
  "tipoVale": "Normal",
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

# 2. Validar vale

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
  "tipoVale": "Normal",
  "valor": 3000
}
```

Este endpoint también puede probarse desde el navegador.

---

# 3. Imprimir vale normal

Este endpoint simula la impresión de un vale normal por parte de un funcionario.

## Request

```http
POST /vales/imprimir
```

URL completa:

```txt
https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io/vales/imprimir
```

## Body JSON

```json
{
  "idFuncionario": 1,
  "idServicio": 2,
  "fechaUso": "2026-10-24"
}
```

## Response 201

```json
{
  "idVale": "VALE-0001",
  "fechaAsignacion": "2026-10-24",
  "fechaUso": "2026-10-24",
  "fechaCanje": null,
  "estado": "Emitido",
  "tipoVale": "Normal",
  "valor": 3000,
  "motivo": null
}
```

Este endpoint debe probarse desde Postman, porque usa el método `POST`.

---

# 4. Crear vale adicional

Este endpoint simula la creación de un vale adicional por parte de un administrador.

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
  "tipoVale": "Adicional",
  "valor": 5500,
  "motivo": "Capacitación interna"
}
```

---

# 5. Registrar uso del vale

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
| Funcionario          | Imprime o recibe vales                     |
| Administrador        | Crea vales adicionales                     |
| Cajero               | Valida y registra el uso de vales          |
| ServicioAlimentacion | Define el servicio asociado al vale        |
| Vale                 | Entidad principal de la API                |
| Casino               | Contexto donde se registra el uso del vale |

---

## Consideraciones

Esta API es una simulación. Por lo tanto:

* No tiene una base de datos real.
* Las respuestas no cambian dinámicamente.
* Los datos no se guardan realmente.
* Sirve para probar la estructura de comunicación entre frontend y backend.
* Permite validar los formatos de request y response esperados.

Por ejemplo, aunque se ejecute `POST /vales/VALE-0001/registrar-uso`, el mock no actualiza realmente una base de datos. Solo devuelve la respuesta simulada definida en Postman.

---

## Resumen

La Sandbox API de ValeApp permite representar de forma simple el funcionamiento del módulo de vales, mostrando cómo interactúan los principales actores del sistema:

* El funcionario imprime un vale.
* El administrador crea un vale adicional.
* El cajero valida un vale.
* El cajero registra el uso del vale.
* El sistema permite consultar la información de un vale.

Esta API permite probar los flujos principales sin requerir todavía una implementación real del backend.

```
```
