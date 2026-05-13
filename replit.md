# PharmaTwin

A B2B SaaS Digital Twin Platform that simulates how medications behave in real-world patient lifestyles — modeling adherence, timing conflicts, food interactions, travel disruptions, and cultural factors for pharmaceutical companies.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/pharmatwin run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TanStack Query, Recharts, shadcn/ui, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-zod/src/generated/api.ts` — Zod validation schemas (generated)
- `lib/api-client-react/src/generated/api.ts` — React Query hooks (generated)
- `lib/db/src/schema/` — Drizzle ORM table definitions (medications, profiles, simulations, insights, recommendations)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/simulation-engine.ts` — Rule-based simulation logic
- `artifacts/pharmatwin/src/` — React frontend

## Architecture decisions

- OpenAPI-first: All API contracts defined in YAML before any code is written; frontend and backend both derive types from codegen.
- Rule-based simulation engine: Lifestyle profile attributes (work schedule, fasting, caffeine, travel, stress) are evaluated against medication pharmacokinetics to generate adherence scores, insights, and packaging recommendations deterministically. No external AI dependency.
- The `lib/api-zod/src/index.ts` exports only from `./generated/api` (not `./generated/types`) to avoid duplicate export name conflicts from Orval's split mode.

## Product

- **Dashboard** — Summary stats, average adherence score, friction heatmap by demographic group, recent simulation log
- **Medications** — Register compounds with drug class, half-life, dosing frequency; view associated simulations
- **Lifestyle Profiles** — Define synthetic patient cohorts (work schedule, diet, caffeine, fasting, travel, stress)
- **Simulations** — Run medication × profile pairs; instantly view adherence score, friction insights, and packaging recommendations
- **Run Simulation** — Wizard to select compound + cohort and execute a new simulation

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` then manually set `lib/api-zod/src/index.ts` to only export from `./generated/api` (codegen overwrites it with conflicting exports from `./generated/types`).
- Numeric DB columns (halfLifeHours, sleepHours, adherenceScore, affectedPercentage) come back as strings from Drizzle/pg — always coerce with `Number()` before sending JSON responses.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
