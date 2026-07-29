# Threefold

Threefold is a household financial tracker for planning and recording expenses across a rolling 36-month window. The window begins with the current month and advances automatically over time.

## Features

- Plan monthly costs such as rent, electricity, school fees, maid fees, transport, grocery, shopping, activities, healthcare, subscriptions, and custom expenses.
- Record actual spending beside each planned amount.
- Browse all 36 months from a horizontal timeline.
- Review monthly totals, remaining budget, spending pace, and category breakdowns.
- Create, edit, and delete persisted expense records.
- Use responsive layouts designed for desktop, tablet, and mobile screens.

## Technology

- TanStack Start with React 19 and TypeScript
- TanStack Router file-based routes
- Tailwind CSS 4 and custom CSS
- Cloudflare D1 (SQLite) via Drizzle ORM
- Deployed as a Cloudflare Worker
- Lucide React icons

## Local Development

Install dependencies:

```bash
pnpm install
```

Generate TypeScript types for your Cloudflare bindings (reads `wrangler.jsonc`):

```bash
pnpm cf-typegen
```

Apply migrations to your local D1 database:

```bash
pnpm db:migrate:local
```

Run the dev server (the Cloudflare Vite plugin simulates the Worker + D1 binding locally):

```bash
pnpm dev
```

Open `http://localhost:3000` in a browser.

## Deploying to Cloudflare

1. Log in to Cloudflare (one time):

   ```bash
   npx wrangler login
   ```

2. Create the D1 database:

   ```bash
   npx wrangler d1 create threefold-expense-planner-db
   ```

   Copy the `database_id` it prints and paste it into `wrangler.jsonc` under `d1_databases[0].database_id`.

3. Apply migrations to the remote (production) database:

   ```bash
   pnpm db:migrate:remote
   ```

4. Build and deploy:

   ```bash
   pnpm deploy
   ```

   This runs `vite build` and then `wrangler deploy`, publishing to a `*.workers.dev` subdomain (or a custom domain if you've configured `routes` in `wrangler.jsonc`).

## Database

The schema is defined in `db/schema.ts`. Migrations live as plain SQL files in `migrations/` and are applied with `wrangler d1 migrations apply`.

After changing the schema, generate a new migration:

```bash
npx drizzle-kit generate --name describe_change
```
