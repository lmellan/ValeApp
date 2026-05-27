# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ValeApp is a food-voucher ("vale de alimentación") management system for a company. It consists of HTML mockups and a Node.js microservices backend. The system has three user roles: **Funcionario** (employee who uses vouchers), **Cajero** (cashier who validates them), and **Administrador** (manages users and extra vouchers).

## Running the Services

Each microservice must be started independently in its own terminal. No shared `package.json` or start script exists at the root.

```bash
# vale-service (core logic, port 3000)
cd BackEnd/vale-service && node index.js

# usuario-service (user/role lookup, port 3001)
cd BackEnd/usuario-service && node index.js

# audit-service (event logging, port 3002)
cd BackEnd/audit-service && node index.js

# configuracion-service (turnos, tipos de comensal, port 3003)
cd BackEnd/configuracion-service && node index.js

# casino-service (casinos y servicios de alimentación, port 3004)
cd BackEnd/casino-service && node index.js
```

Install dependencies before first run:
```bash
cd BackEnd/vale-service && npm install
cd BackEnd/usuario-service && npm install
cd BackEnd/audit-service && npm install
cd BackEnd/configuracion-service && npm install
cd BackEnd/casino-service && npm install
```

No test runner is configured (`npm test` exits with error on all services).

## Backend Architecture

Five independent Node.js/Express microservices communicating via HTTP:

```
vale-service (3000)
  ├── controller/valeController.js   ← HTTP layer, calls usuario-service & audit-service
  ├── service/valeService.js         ← Business rules (R27, R29, R30, R32)
  ├── repository/database.js         ← SQLite (vales.db), auto-seeds 3 test vales on start
  └── dto/valeDTO.js                 ← Input validation + response shaping

usuario-service (3001)
  ├── controller/usuarioController.js ← Returns user role (currently MOCK data, not real DB)
  └── model/usuario.js               ← Usuario class (defined but unused by controller)

audit-service (3002)
  └── index.js                       ← Receives POST /logs, prints to console only

configuracion-service (3003)
  ├── controller/configuracionController.js ← HTTP layer
  ├── service/configuracionService.js       ← Business rules for turnos & tipos de comensal
  ├── repository/database.js               ← SQLite (configuracion.db), auto-seeds test data
  ├── dto/configuracionDTO.js              ← Input validation + response shaping
  └── model/                              ← turno.js, tipoComensal.js, asignacionTurno.js, turnoServicio.js

casino-service (3004)
  ├── controller/casinoController.js ← HTTP layer
  ├── service/casinoService.js       ← Business rules for casinos & servicios de alimentación
  ├── repository/database.js         ← SQLite (casino.db), auto-seeds test data
  ├── dto/casinoDTO.js               ← Input validation + response shaping
  └── model/                         ← casino.js, servicioAlimentacion.js
```

**Inter-service calls** (all from `valeController.js`):
- `validarVale` → GET `usuario-service:3001/usuarios/:id/rol` to verify role is Cajero/Administrador
- `validarVale` → POST `audit-service:3002/logs` (non-blocking, failure is silently ignored)

**Planned inter-service calls** (not yet implemented):
- `vale-service` → `configuracion-service:3003/funcionarios/:id/configuracion` (turno + tipo comensal)
- `vale-service` → `casino-service:3004/servicios-alimentacion/:id/disponibilidad` (service availability)

## Endpoints per Service

### vale-service (3000)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/vales/:idVale` | Consult a vale directly from DB |
| POST | `/vales/:idVale/validar` | Validate + mark as used; requires `x-usuario-id` header |
| GET | `/funcionarios/:idFuncionario/vales-disponibles` | List non-used, non-expired vales |
| POST | `/administrador/vales` | Create an additional vale |

### usuario-service (3001)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/usuarios/:idUsuario/rol` | Returns role for user ID |

### audit-service (3002)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/logs` | Receives audit log event |

### configuracion-service (3003)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/tipos-comensal` | List all tipos de comensal |
| GET | `/tipos-comensal/:id` | Get tipo de comensal by ID |
| POST | `/tipos-comensal` | Create tipo de comensal |
| GET | `/turnos` | List all turnos |
| GET | `/turnos/:id` | Get turno by ID |
| POST | `/turnos` | Create turno |
| GET | `/turnos/:id/servicios` | Get servicios habilitados for a turno |
| POST | `/turnos/:id/servicios` | Add servicio to a turno |
| POST | `/asignaciones-turno` | Create turno assignment for a funcionario |
| GET | `/funcionarios/:id/configuracion` | Get turno vigente + tipo comensal (main endpoint for vale-service) |
| POST | `/funcionarios/:id/tipo-comensal` | Assign tipo comensal to funcionario |

### casino-service (3004)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/casinos` | List all casinos |
| GET | `/casinos/:id` | Get casino by ID |
| POST | `/casinos` | Create casino |
| GET | `/casinos/:id/servicios` | Get servicios de alimentación for a casino |
| GET | `/servicios-alimentacion` | List all servicios de alimentación |
| GET | `/servicios-alimentacion/:id` | Get servicio by ID |
| POST | `/servicios-alimentacion` | Create servicio de alimentación |
| GET | `/servicios-alimentacion/:id/disponibilidad` | Check if servicio is active and within schedule (main endpoint for vale-service) |

## Business Rules in Code

- **R22**: A casino offers zero or more servicios de alimentación (casino-service)
- **R24**: Monetary value is stored in Vale, NOT in ServicioAlimentacion (casino-service enforces this via DTO)
- **R27**: New vales always start with `estado = 'No utilizado'` (enforced in `crearValeInputDTO`)
- **R29/R30**: Available vales filter requires `estado === 'No utilizado'` AND `fechaExpiracion >= today` (in `valeService.obtenerValesDisponibles`)
- **R30**: Service availability is calculated in real time by casino-service (`/disponibilidad` endpoint checks activo + current time within horaInicio-horaFin)
- **R32**: A vale with `estado === 'Utilizado'` cannot be reused (in `valeService.validarUsoVale`)

## Test Data (SQLite, auto-seeded)

### vale-service
| idVale | idFuncionario | estado | Result in /vales-disponibles |
|--------|--------------|--------|------------------------------|
| VALE-1001 | 1 | No utilizado | ✅ Appears |
| VALE-1002 | 1 | Utilizado | ❌ Filtered (R32) |
| VALE-1003 | 1 | No utilizado | ❌ Filtered (expired 2025-01-01) |

Mock users in `usuarioController.js`: ID `1` = Funcionario, `2` = Cajero, `3` = Administrador.

### configuracion-service
| Entity | ID | Data |
|--------|-----|------|
| Tipo Comensal | 1 | Obrero — 1 vale |
| Tipo Comensal | 2 | Jefe — 2 vales |
| Tipo Comensal | 3 | Gerente — 3 vales |
| Turno | 1 | 08:00–16:00 |
| Turno | 2 | 16:00–00:00 |
| Turno | 3 | 00:00–08:00 |
| Funcionario 1 | config | Turno 1 + Obrero |
| Funcionario 2 | config | Turno 2 + Jefe |

### casino-service
| idServicio | Nombre | Horario | Casino |
|-----------|--------|---------|--------|
| 1 | Desayuno | 08:00–10:00 | Casino Central |
| 2 | Almuerzo | 12:00–14:00 | Casino Central |
| 3 | Cena | 19:00–21:00 | Casino Central |
| 4 | Once | 16:00–18:00 | Casino Norte |
| 5 | Box Lunch | 11:00–15:00 | Casino Norte |

Note: `idServicio` values match those used in `configuracion-service` turno→servicios relationship.

## Known Gaps / What's Not Yet Implemented

- `usuario-service` uses hardcoded mock data — `usuario.js` model and SQLite dependency exist but are unused
- `audit-service` only logs to console, no persistence
- `vale-service` does not yet call `configuracion-service` or `casino-service`
- No API gateway or shared entry point
- Sandbox API (Postman mock server) has additional endpoints not yet implemented in real backend: `POST /vales/generar-base`, `POST /vales/:id/imprimir`, `GET /vales/:id/validar` (GET version), `POST /vales/:id/registrar-uso`

## Sandbox API Reference

A Postman mock server was used as the original contract for the frontend:
`https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io`

Full contract is documented in `SandBox API/README.md`. The real backend implements a subset of these endpoints with slightly different paths/schemas.

## Assignment Context (BackEnd.md)

This project is evaluated as a microservices architecture design exercise. The rubric (`BackEnd.md`) scores: class diagram (15pts), relationships (10pts), separation of responsibilities (15pts), internal structure (10pts), cohesion (10pts), coupling (15pts), and **architectural justification** (25pts). Every criterion requires written justification documenting: alternatives considered → alternatives discarded → selection → technical rationale.
