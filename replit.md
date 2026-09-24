# SmartPantry

A lightweight prototype for exploring in-app household replenishment and simulated reorders.

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
- `lib/api-spec/openapi.yaml` — shared health-check contract

## Architecture decisions

- Receipt screenshots remain browser-local and are not uploaded.
- The app intentionally has no authentication or persistent database state.
- Reorders are simulated locally; no purchase, payment, or vendor fulfillment takes place.

## Product

Users can choose a household profile, upload a receipt screenshot or use demo receipt data, adjust replenishment cadence, select items and quantities, and place simulated in-app reorders.

## User preferences

- Keep SmartPantry sleek, exceptionally easy to use, and low-friction: make the demo path one tap, keep optional choices secondary, and prioritize touch-friendly mobile interactions.
- Do not add restock reminders or SMS setup; reordering more items should happen directly in the app.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
