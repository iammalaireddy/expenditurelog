import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { salaries } from '../../../db/schema.js'

type SalaryInput = {
  id?: number
  month: string
  baseSalaryCents: number
}

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

function validAmount(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

export const Route = createFileRoute('/api/salaries')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const start = url.searchParams.get('start')
        const end = url.searchParams.get('end')

        const rows = start && end
          ? await db
              .select()
              .from(salaries)
              .where(and(gte(salaries.month, start), lte(salaries.month, end)))
              .orderBy(asc(salaries.month))
          : await db.select().from(salaries).orderBy(asc(salaries.month))

        return Response.json(rows)
      },
      POST: async ({ request }) => {
        const input = (await request.json()) as SalaryInput
        if (!input.month || !monthPattern.test(input.month) || !validAmount(input.baseSalaryCents)) {
          return Response.json({ error: 'Enter a valid month and salary amount.' }, { status: 400 })
        }

        const [created] = await db
          .insert(salaries)
          .values({
            month: input.month,
            baseSalaryCents: input.baseSalaryCents,
          })
          .returning()

        return Response.json(created, { status: 201 })
      },
      PATCH: async ({ request }) => {
        const input = (await request.json()) as SalaryInput
        if (
          !input.id ||
          !input.month ||
          !monthPattern.test(input.month) ||
          !validAmount(input.baseSalaryCents)
        ) {
          return Response.json({ error: 'Enter a valid salary before saving.' }, { status: 400 })
        }

        const [updated] = await db
          .update(salaries)
          .set({
            month: input.month,
            baseSalaryCents: input.baseSalaryCents,
            updatedAt: new Date(),
          })
          .where(eq(salaries.id, input.id))
          .returning()

        if (!updated) return Response.json({ error: 'Salary not found.' }, { status: 404 })
        return Response.json(updated)
      },
      DELETE: async ({ request }) => {
        const id = Number(new URL(request.url).searchParams.get('id'))
        if (!Number.isInteger(id) || id < 1) {
          return Response.json({ error: 'A valid salary ID is required.' }, { status: 400 })
        }

        const [deleted] = await db.delete(salaries).where(eq(salaries.id, id)).returning({ id: salaries.id })
        if (!deleted) return Response.json({ error: 'Salary not found.' }, { status: 404 })
        return Response.json(deleted)
      },
    },
  },
})
