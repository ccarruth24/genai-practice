# SmartPantry

A lightweight prototype for testing household replenishment predictions and simulated SMS reorder alerts.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- No application-specific environment variables are required.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/smart-pantry` — React frontend and in-memory setup flow
- `artifacts/api-server/src/routes/smart-pantry.ts` — simulated alert endpoint
- `lib/api-spec/openapi.yaml` — API contract

## Architecture decisions

- Receipt screenshots remain browser-local and are not uploaded.
- The app intentionally has no authentication or persistent database state.
- SMS delivery is simulated on screen; the endpoint never sends a real message.

## Product

Users can choose a household profile, upload a receipt screenshot or use demo receipt data, adjust replenishment cadence, configure alert preferences, activate the pantry, and trigger a simulated SMS alert.

## User preferences

- Keep SmartPantry sleek, exceptionally easy to use, and low-friction: make the demo path one tap, keep optional choices secondary, and prioritize touch-friendly mobile interactions.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
