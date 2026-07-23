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
- Netlify Database managed Postgres
- Drizzle ORM and generated database migrations
- Lucide React icons

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the project with Netlify’s local environment so the database-backed API is available:

```bash
netlify dev --port 8889
```

Open `http://localhost:8889` in a browser.

## Database

The schema is defined in `db/schema.ts`. Netlify provisions the database on first connection and applies migrations from `netlify/database/migrations/` during deployment.

After changing the schema, generate a migration:

```bash
npx drizzle-kit generate --name describe_change
```
