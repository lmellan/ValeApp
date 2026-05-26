# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ValeApp is a food-voucher ("vale de alimentación") management system for a company. It consists of HTML mockups and a Node.js microservices backend. The system has three user roles: **Funcionario** (employee who uses vouchers), **Cajero** (cashier who validates them), and **Administrador** (manages users and extra vouchers).

## Running the Services

Each microservice must be started independently in its own terminal. No shared `package.json` or start script exists at the root.

```bash
# vale-service (core logic, port 3000)
cd valeapp-backend/vale-service && node index.js

# usuario-service (user/role lookup, port 3001)
cd valeapp-backend/usuario-service && node index.js

# audit-service (event logging, port 3002)
cd valeapp-backend/audit-service && node index.js
```

Install dependencies before first run:
```bash
cd valeapp-backend/vale-service && npm install
cd valeapp-backend/usuario-service && npm install
cd valeapp-backend/audit-service && npm install
```

No test runner is configured (`npm test` exits with error on all services).

## Backend Architecture

Three independent Node.js/Express microservices communicating via HTTP (axios):

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
```

**Inter-service calls** (all from `valeController.js`):
- `validarVale` → GET `usuario-service:3001/usuarios/:id/rol` to verify role is Cajero/Administrador
- `validarVale` → POST `audit-service:3002/logs` (non-blocking, failure is silently ignored)

## Implemented Endpoints (vale-service)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/vales/:idVale` | Consult a vale directly from DB |
| POST | `/vales/:idVale/validar` | Validate + mark as used; requires `x-usuario-id` header |
| GET | `/funcionarios/:idFuncionario/vales-disponibles` | List non-used, non-expired vales |
| POST | `/administrador/vales` | Create an additional vale |

| Method | Route | Service | Description |
|--------|-------|---------|-------------|
| GET | `/usuarios/:idUsuario/rol` | usuario-service | Returns role for user ID |
| POST | `/logs` | audit-service | Receives audit log event |

## Business Rules in Code

- **R27**: New vales always start with `estado = 'No utilizado'` (enforced in `crearValeInputDTO`)
- **R29/R30**: Available vales filter requires `estado === 'No utilizado'` AND `fechaExpiracion >= today` (in `valeService.obtenerValesDisponibles`)
- **R32**: A vale with `estado === 'Utilizado'` cannot be reused (in `valeService.validarUsoVale`)

## Test Data (SQLite, auto-seeded)

| idVale | idFuncionario | estado | Result in /vales-disponibles |
|--------|--------------|--------|------------------------------|
| VALE-1001 | 1 | No utilizado | ✅ Appears |
| VALE-1002 | 1 | Utilizado | ❌ Filtered (R32) |
| VALE-1003 | 1 | No utilizado | ❌ Filtered (expired 2025-01-01) |

Mock users in `usuarioController.js`: ID `1` = Funcionario, `2` = Cajero, `3` = Administrador.

## Known Gaps / What's Not Yet Implemented

- `usuario-service` uses hardcoded mock data — `usuario.js` model and SQLite dependency exist but are unused
- `audit-service` only logs to console, no persistence
- No API gateway or shared entry point
- Sandbox API (Postman mock server) has additional endpoints not yet implemented in real backend: `POST /vales/generar-base`, `POST /vales/:id/imprimir`, `GET /vales/:id/validar` (GET version), `POST /vales/:id/registrar-uso`

## Sandbox API Reference

A Postman mock server was used as the original contract for the frontend:
`https://62ce4034-d264-44d5-acb7-6ca81bb547c7.mock.pstmn.io`

Full contract is documented in `SandBox API/README.md`. The real backend implements a subset of these endpoints with slightly different paths/schemas.

## Assignment Context (BackEnd.md)

This project is evaluated as a microservices architecture design exercise. The rubric (`BackEnd.md`) scores: class diagram (15pts), relationships (10pts), separation of responsibilities (15pts), internal structure (10pts), cohesion (10pts), coupling (15pts), and **architectural justification** (25pts). Every criterion requires written justification documenting: alternatives considered → alternatives discarded → selection → technical rationale.
