# Threefold Project Guide

## Overview

Threefold is a household expense planner for a rolling 36-month window beginning with the current month. Users can create, update, and remove expense items while comparing planned and actual amounts.

## Architecture

- `src/routes/index.tsx` contains the main React dashboard, client-side view state, 36-month date generation, and expense form interactions.
- `src/routes/api/expenses.ts` exposes the database-backed JSON API for listing, creating, updating, and deleting expenses.
- `db/schema.ts` defines the Drizzle ORM schema for persisted expense records.
- `db/index.ts` creates the Netlify Database client.
- `netlify/database/migrations/` contains generated migrations that Netlify applies during deployment.
- `src/styles.css` contains the complete visual system and responsive layout.

## Technology

- TanStack Start and TanStack Router
- React 19 and TypeScript
- Tailwind CSS 4 with custom global CSS
- Netlify Database managed Postgres
- Drizzle ORM and Drizzle Kit
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

Migration names should use snake case and begin with an action such as `add`, `create`, or `alter`.

## Non-Obvious Decisions

- The application uses a single shared household ledger and does not include authentication.
- Planned and actual values live on the same expense record so users can update a monthly item as spending occurs.
- The dashboard always requests only the current 36-month horizon, while existing records outside that horizon remain untouched in the database.
