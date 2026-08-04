import { asc, eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { notes } from '../../../db/schema.js'

export const Route = createFileRoute('/api/notes')({
  server: {
    handlers: {
      GET: async () => {
        const [row] = await db.select().from(notes).orderBy(asc(notes.id)).limit(1)
        return Response.json({ content: row?.content ?? '' })
      },
      PUT: async ({ request }) => {
        const input = (await request.json()) as { content?: string }
        const content = typeof input.content === 'string' ? input.content.slice(0, 5000) : ''
        const now = new Date()
        const existing = await db.select({ id: notes.id }).from(notes).orderBy(asc(notes.id)).limit(1)
        if (existing[0]) {
          await db.update(notes).set({ content, updatedAt: now }).where(eq(notes.id, existing[0].id))
        } else {
          await db.insert(notes).values({ content, createdAt: now, updatedAt: now })
        }
        return Response.json({ content })
      },
    },
  },
})
