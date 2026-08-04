import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  month: text('month').notNull(),
  category: text('category').notNull(),
  name: text('name').notNull(),
  amountCents: integer('amount_cents').notNull().default(0),
  notes: text('notes').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const salaries = sqliteTable('salaries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  month: text('month').notNull().unique(),
  baseSalaryCents: integer('base_salary_cents').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export type Expense = typeof expenses.$inferSelect
export type NewExpense = typeof expenses.$inferInsert
export type Salary = typeof salaries.$inferSelect
export type NewSalary = typeof salaries.$inferInsert
