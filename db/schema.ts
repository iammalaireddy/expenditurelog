import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  month: text('month').notNull(),
  category: text('category').notNull(),
  name: text('name').notNull(),
  plannedCents: integer('planned_cents').notNull().default(0),
  actualCents: integer('actual_cents').notNull().default(0),
  notes: text('notes').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert
