<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# BJeans.co Project Guide

## Overview

- Frontend: Next.js app in repository root.
- Backend: Next.js App Router API routes under `src/app/api`.
- Database: MongoDB Atlas (connection string stored in `.env.local`).

## Key Paths

- Frontend routes: `src/app/**/page.tsx`
- API routes: `src/app/api/**/route.ts`
- Mongoose connection: `src/backend/config/db.ts`

## Run Commands (Windows)

- App dev:
  - `npm run dev`

## API Base

- Base URL: `/api`
- Health check: `GET /api/health` (to be implemented)
- Users: `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id`
- Products: `GET/POST /api/products`, `GET/PATCH/DELETE /api/products/:id`
- Orders: `GET/POST /api/orders`, `GET/PATCH/DELETE /api/orders/:id`
- Orders split list: `GET /api/orders/:id/splits`
- Orders payment: `PATCH /api/orders/:id/payment`
- Measurement Profiles: `GET/POST /api/measurement-profiles`, `GET/PATCH/DELETE /api/measurement-profiles/:id`
- Materials: `GET/POST /api/materials`, `GET/PATCH/DELETE /api/materials/:id`
- Custom Options: `GET/POST /api/custom-options`, `GET/PATCH/DELETE /api/custom-options/:id`
- Carts: `GET/POST /api/carts`, `GET/PATCH/DELETE /api/carts/:id`
- Checkout: `POST /api/checkout`

## Environment Files

- App env: `.env.local` (do not commit secrets)

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

- Confirm MongoDB connection via app startup logs.
- Schema validation script requires `mongosh` on the system (pending migration).

## Progress Log

- **2026-05-11**
  - Backend Express + MongoDB Atlas connected.
  - Core schemas and CRUD endpoints implemented (users, products, materials, orders, carts, custom options, measurement profiles).
  - Unified checkout + order splitting + payment update endpoint.
  - MongoDB indexes and seed data applied.
  - Joi validation for checkout and payment update.
  - Schema validation script created and executed via mongosh.
- **2026-05-21**
  - Legacy Express backend removed.
  - Next.js API migration started.
