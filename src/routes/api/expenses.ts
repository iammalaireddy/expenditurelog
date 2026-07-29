import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { expenses } from '../../../db/schema.js'

type ExpenseInput = {
  id?: number
  month?: string
  category?: string
  name?: string
  plannedCents?: number
  actualCents?: number
  notes?: string
}

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

function validAmount(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

export const Route = createFileRoute('/api/expenses')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const start = url.searchParams.get('start')
        const end = url.searchParams.get('end')

        const rows = start && end
          ? await db
              .select()
              .from(expenses)
              .where(and(gte(expenses.month, start), lte(expenses.month, end)))
              .orderBy(asc(expenses.month), asc(expenses.id))
          : await db.select().from(expenses).orderBy(asc(expenses.month), asc(expenses.id))

        return Response.json(rows)
      },
      POST: async ({ request }) => {
        const input = (await request.json()) as ExpenseInput
        if (
          !input.month ||
          !monthPattern.test(input.month) ||
          !input.category?.trim() ||
          !input.name?.trim() ||
          !validAmount(input.plannedCents) ||
          !validAmount(input.actualCents)
        ) {
          return Response.json({ error: 'Enter a valid month, name, category, and amounts.' }, { status: 400 })
        }

        const now = new Date()
        const [created] = await db
          .insert(expenses)
          .values({
            month: input.month,
            category: input.category.trim(),
            name: input.name.trim(),
            plannedCents: input.plannedCents,
            actualCents: input.actualCents,
            notes: input.notes?.trim() ?? '',
            createdAt: now,
            updatedAt: now,
          })
          .returning()

        return Response.json(created, { status: 201 })
      },
      PATCH: async ({ request }) => {
        const input = (await request.json()) as ExpenseInput
        if (
          !input.id ||
          !input.month ||
          !monthPattern.test(input.month) ||
          !input.category?.trim() ||
          !input.name?.trim() ||
          !validAmount(input.plannedCents) ||
          !validAmount(input.actualCents)
        ) {
          return Response.json({ error: 'Enter a valid expense before saving.' }, { status: 400 })
        }

        const [updated] = await db
          .update(expenses)
          .set({
            month: input.month,
            category: input.category.trim(),
            name: input.name.trim(),
            plannedCents: input.plannedCents,
            actualCents: input.actualCents,
            notes: input.notes?.trim() ?? '',
            updatedAt: new Date(),
          })
          .where(eq(expenses.id, input.id))
          .returning()

        if (!updated) return Response.json({ error: 'Expense not found.' }, { status: 404 })
        return Response.json(updated)
      },
      DELETE: async ({ request }) => {
        const id = Number(new URL(request.url).searchParams.get('id'))
        if (!Number.isInteger(id) || id < 1) {
          return Response.json({ error: 'A valid expense ID is required.' }, { status: 400 })
        }

        const [deleted] = await db.delete(expenses).where(eq(expenses.id, id)).returning({ id: expenses.id })
        if (!deleted) return Response.json({ error: 'Expense not found.' }, { status: 404 })
        return Response.json(deleted)
      },
    },
  },
})
