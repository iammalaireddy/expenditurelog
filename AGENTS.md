# Threefold Project Guide

## Overview

Threefold is a household expense planner for a rolling 36-month window beginning with the current month. Users can create, update, and remove expense items while comparing planned and actual amounts.

## Architecture

- `src/routes/index.tsx` contains the main React dashboard, client-side view state, 36-month date generation, and expense form interactions.
- `src/routes/api/expenses.ts` exposes the database-backed JSON API for listing, creating, updating, and deleting expenses.
- `src/routes/api/salaries.ts` exposes the equivalent JSON API for salary records.
- `db/schema.ts` defines the Drizzle ORM (SQLite dialect) schema for persisted expense and salary records.
- `db/index.ts` creates the Drizzle client bound to the Cloudflare D1 database via the `DB` binding (accessed through `cloudflare:workers`).
- `wrangler.jsonc` declares the Cloudflare Worker config and the D1 database binding.
- `migrations/` contains the SQL migrations applied with `wrangler d1 migrations apply`.
- `src/styles.css` contains the complete visual system and responsive layout.

## Technology

- TanStack Start and TanStack Router
- React 19 and TypeScript
- Tailwind CSS 4 with custom global CSS
- Cloudflare D1 (SQLite) via Drizzle ORM and Drizzle Kit
- Cloudflare Workers (deployment target) via `@cloudflare/vite-plugin` and `wrangler`
- Lucide React icons

## Conventions

- Use PascalCase for React components and camelCase for functions and variables.
- Keep API request and response amounts as integer cents to avoid floating-point currency errors.
- Store months as sortable `YYYY-MM` strings.
- Keep the rolling month range dynamic rather than hard-coding calendar dates.
- Use existing CSS variables in `src/styles.css` when extending the palette.
- Preserve loading, empty, validation, and error states when changing data flows.

## Database Changes

Update `db/schema.ts`, then generate a named migration with:

```bash
npx drizzle-kit generate --name describe_change
```

Migration names should use snake case and begin with an action such as `add`, `create`, or `alter`. Apply new migrations locally with `pnpm db:migrate:local` and to production with `pnpm db:migrate:remote` after deploying.

## Non-Obvious Decisions

- The application uses a single shared household ledger and does not include authentication.
- Planned and actual values live on the same expense record so users can update a monthly item as spending occurs.
- The dashboard always requests only the current 36-month horizon, while existing records outside that horizon remain untouched in the database.
- The D1 binding is read via `cloudflare:workers`'s `env` export at module scope in `db/index.ts`. This is safe specifically for Cloudflare Workers bindings (unlike `process.env`, which must be read per-request).
