# Ashen Vale (AI Dungeon)

Monorepo for a chat-driven dungeon crawler, built with a TypeScript/Node backend and a React + Vite frontend. Structured for fast local development with npm workspaces.

## Requirements
- Node.js 20+ (LTS recommended)
- npm 10+

## Monorepo Layout
- `apps/server`: Express API server (game engine + NLU + routes)
- `apps/web`: React client (Vite dev server with API proxy)
- `packages/shared`: Shared types/interfaces between web and server

## Quick Start
1) Install dependencies at the repo root:

```bash
npm install
```

2) Start the API server (port 4000 by default):

```bash
npm run dev:server
```

3) In a separate terminal, start the web app (Vite on port 5173):

```bash
npm run dev:web
```

4) Open the client:
- Web: http://localhost:5173
- The Vite dev server proxies `/api` and `/mcp` to the backend on http://localhost:4000.

## Scripts (root)
- `npm run dev:web` — Run the web app in dev mode
- `npm run dev:server` — Run the server in dev mode
- `npm run build` — Build all workspaces
- `npm run lint` — Lint all workspaces
- `npm run test` — Run tests across workspaces
- `npm run format` — Run formatter across workspaces (if configured per workspace)

## Server Details
- Default port: `4000` (override with `PORT`)
- Health check: `GET /healthz`
- Session routes: `POST /api/session`, etc.
- Game routes: `POST /api/command`, `GET /api/state`, etc.
- MCP routes: `/mcp/*`

### Server Environment Variables
- `PORT` (default `4000`)
- `CLIENT_ORIGIN` (default `http://localhost:5173`)
- `CLIENT_ORIGINS` (comma-separated list; overrides/extends allowed origins)
- `SESSION_TTL_MS` (default `1800000` = 30 minutes)
- `SESSION_MAX` (default `500`)
- `NLU_EXECUTE_THRESHOLD` (default `0.8`)
- `NLU_CONFIRM_THRESHOLD` (default `0.5`)

Run server in dev mode:

```bash
npm --workspace apps/server run dev
```

Build and start the compiled server:

```bash
npm --workspace apps/server run build
npm --workspace apps/server run start
```

## Web (Vite) Details
- Dev server: `http://localhost:5173`
- Proxy: `/api` and `/mcp` forwarded to `http://localhost:4000` by default

### Web Environment Variables
- `VITE_PROXY_TARGET` (dev proxy target; default `http://localhost:4000`)
- `VITE_API_BASE_URL` (absolute API base for non-proxy scenarios, e.g. production)

Common commands:

```bash
npm --workspace apps/web run dev
npm --workspace apps/web run build
npm --workspace apps/web run preview
```

If you’re running the web app against a non-local API without the Vite proxy, set:

```bash
# example
export VITE_API_BASE_URL="https://your-api.example.com"
```

## Testing
Tests currently live in the server workspace:

```bash
# run all workspace tests
npm test

# or just the server tests
npm --workspace apps/server run test
npm --workspace apps/server run test:watch
```

## Troubleshooting
- CORS errors in the browser:
  - Ensure `CLIENT_ORIGIN`/`CLIENT_ORIGINS` include the web origin (e.g., `http://localhost:5173`).
- API requests from the web during dev:
  - Either rely on the Vite proxy (default) or set `VITE_API_BASE_URL` to point to the API.
- Port already in use:
  - Change `PORT` for the server or Vite’s dev server port.

## License
MIT
