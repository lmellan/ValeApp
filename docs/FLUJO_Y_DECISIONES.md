# Flujo, supuestos y decisiones de ValeApp

Este documento resume el flujo funcional implementado y las decisiones tomadas durante el desarrollo.

## Flujo principal

```text
Administrador configura usuarios, tipos, servicios y valorizaciones
Sistema genera vales base mensuales según turno
Funcionario consulta sus vales del día
Funcionario imprime un vale disponible
Cajero valida el código y registra la entrega
Sistema marca el vale como UTILIZADO
Administrador consulta reportes
```

## Administrador

El administrador trabaja sobre estas secciones:

1. **Usuarios:** crea y edita usuarios. Si el usuario es funcionario, debe tener tipo de comensal y turno.
2. **Tipos de comensal:** define categorías y modalidad de emisión: un vale por horario o múltiples vales por horario.
3. **Servicios:** consulta servicios base y crea/edita servicios adicionales.
4. **Valorización de vales:** define valor por tipo de comensal y servicio.
5. **Vales adicionales:** asigna vales manuales a funcionarios para una fecha específica.
6. **Reportes:** revisa vales emitidos, utilizados, no utilizados, expirados y adicionales.

## Sistema

El sistema genera vales base por mes para funcionarios activos. Cada funcionario recibe los servicios asociados a su turno:

| Turno | Horario | Servicios base |
|---|---:|---|
| Turno 1 | 08:00 a 16:00 | Desayuno, Almuerzo |
| Turno 2 | 16:00 a 23:59 | Once, Cena 1 |
| Turno 3 | 00:00 a 08:00 | Cena 2, Desayuno |

Si se crea un funcionario a mitad de mes, se generan sus vales desde esa fecha hasta fin de mes. Si se cambia el turno, se eliminan vales base futuros no utilizados y se generan los nuevos según el turno vigente.

## Funcionario

El funcionario ve solo vales del día. Un vale puede estar:

- **Disponible:** corresponde al día actual, está dentro del horario del servicio, no expiró y no fue utilizado.
- **Aún no disponible:** es del día actual, pero el horario del servicio aún no comienza.
- **Expirado:** terminó la fecha/hora de uso.
- **Utilizado:** ya fue canjeado por caja.

La impresión no equivale a canje. El canje lo registra el cajero.

## Cajero

El cajero ingresa el código del vale. El backend valida:

- existencia del vale;
- permisos del cajero;
- fecha actual;
- horario del servicio;
- estado de uso;
- expiración;
- reglas de emisión múltiple del tipo de comensal.

Si todo es válido, registra la entrega y el vale pasa a `UTILIZADO`.

## Supuestos

| # | Supuesto | Decisión |
|---|---|---|
| S1 | Los turnos son fijos. | No se implementa creación de turnos desde UI. |
| S2 | Los servicios base pertenecen a la configuración del sistema. | No se crean desde UI; se cargan por seed. |
| S3 | Los servicios nuevos del administrador son adicionales. | La UI crea servicios adicionales. |
| S4 | El servicio define el horario de uso del vale. | El vale guarda `hora_inicio_validez` y `hora_fin_validez` desde el servicio. |
| S5 | El valor vive en el vale. | Se calcula desde la valorización tipo de comensal + servicio. |
| S6 | Los vales adicionales pueden tener cantidad mayor a 1 solo si el tipo de comensal permite emisión múltiple. | Si no permite múltiple, se fuerza cantidad 1. |
| S7 | La expiración debe considerar Chile. | Se usa `America/Santiago` en la regla de expiración de `vale-service`. |
| S8 | El motivo de vale adicional es opcional en la UI. | El flujo no lo exige como dato de negocio obligatorio. |

## Datos iniciales

La BD se puebla desde `BackEnd/database/postgres/init/` con:

- usuarios base por rol;
- tipos de comensal: Obrero, Jefe, Gerente, Secretaria;
- casinos: Casino 1 y Casino 2;
- servicios base: Desayuno, Almuerzo, Once, Cena 1, Cena 2;
- servicios adicionales: Box lunch y Colación Visitas;
- valorizaciones para todos los tipos de comensal y servicios iniciales;
- asignaciones de turno para los funcionarios base.

`vale_db` no trae vales administrativos de demostración: los vales se generan desde la aplicación.

## Fuera de alcance actual

| Tema | Estado |
|---|---|
| Correos reales | `notificacion-service` no envía correos, solo construye payload. |
| Seguridad productiva | No hay hash de contraseñas ni JWT. |
| Tests frontend | Pendiente. |
| Resiliencia avanzada | No hay retry, circuit breaker ni colas. |
