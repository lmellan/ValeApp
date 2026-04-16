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
