<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# BJeans.co Project Guide

## Overview

- Frontend: Next.js app in repository root.
- Backend: Express + MongoDB in `backend/`.
- Database: MongoDB Atlas (connection string stored in `backend/.env`).

## Key Paths

- Frontend routes: `src/app/**/page.tsx`
- Backend entry: `backend/src/server.js`
- Backend routes index: `backend/src/routes/index.js`
- Backend models: `backend/src/models/*.js`
- Backend config: `backend/src/config/database.js`
- Backend schema validation script: `backend/scripts/mongodb-schema-validation.js`

## Run Commands (Windows)

- Frontend dev:
  - `npm run dev`
- Backend dev:
  - `npm.cmd run dev --prefix backend`
- Install backend deps:
  - `npm.cmd install --prefix backend`

## Backend API Base

- Base URL: `http://localhost:5000/api`
- Health check: `GET /health`
- Users: `GET/POST /users`, `GET/PATCH/DELETE /users/:id`
- Products: `GET/POST /products`, `GET/PATCH/DELETE /products/:id`
- Orders: `GET/POST /orders`, `GET/PATCH/DELETE /orders/:id`
- Orders split list: `GET /orders/:id/splits`
- Orders payment: `PATCH /orders/:id/payment`
- Measurement Profiles: `GET/POST /measurement-profiles`, `GET/PATCH/DELETE /measurement-profiles/:id`
- Materials: `GET/POST /materials`, `GET/PATCH/DELETE /materials/:id`
- Custom Options: `GET/POST /custom-options`, `GET/PATCH/DELETE /custom-options/:id`
- Carts: `GET/POST /carts`, `GET/PATCH/DELETE /carts/:id`
- Checkout: `POST /checkout`

## Environment Files

- Backend env: `backend/.env` (do not commit secrets)
- Example: `backend/.env.example`

## MongoDB MCP (VS Code)

- Settings stored in user settings (`%APPDATA%\Code\User\settings.json`).
- MCP is configured as read-write and starts with prompt:
  - `mdb.mcp.readOnly`: `false`
  - `mdb.mcp.server`: `prompt`
- Atlas Admin tools require Service Account credentials:
  - `mdb.mcp.apiClientId`
  - `mdb.mcp.apiClientSecret`
- After editing settings, start MCP server via **MongoDB: Start MCP Server**.
- MCP is running and Atlas is reachable.

## Notes

- Keep backend running before testing API routes.
- Confirm MongoDB connection via backend startup logs.
- Schema validation script requires `mongosh` on the system.

## Progress Log

- **2026-05-11**
  - Backend Express + MongoDB Atlas connected.
  - Core schemas and CRUD endpoints implemented (users, products, materials, orders, carts, custom options, measurement profiles).
  - Unified checkout + order splitting + payment update endpoint.
  - MongoDB indexes and seed data applied.
  - Joi validation for checkout and payment update.
  - Schema validation script created and executed via mongosh.
