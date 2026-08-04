import { asc, eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { notes } from '../../../db/schema.js'

export const Route = createFileRoute('/api/notes')({
  server: {
    handlers: {
      GET: async () => {
        const rows = await db.select().from(notes).orderBy(asc(notes.createdAt), asc(notes.id))
        return Response.json(rows)
      },
      POST: async ({ request }) => {
        const input = (await request.json()) as { content?: string }
        const content = typeof input.content === 'string' ? input.content.trim().slice(0, 5000) : ''
        if (!content) {
          return Response.json({ error: 'Enter a reminder first.' }, { status: 400 })
        }
        const now = new Date()
        const [created] = await db.insert(notes).values({ content, createdAt: now, updatedAt: now }).returning()
        return Response.json(created, { status: 201 })
      },
      DELETE: async ({ request }) => {
        const id = Number(new URL(request.url).searchParams.get('id'))
        if (!Number.isInteger(id) || id < 1) {
          return Response.json({ error: 'A valid note ID is required.' }, { status: 400 })
        }
        const [deleted] = await db.delete(notes).where(eq(notes.id, id)).returning({ id: notes.id })
        if (!deleted) return Response.json({ error: 'Note not found.' }, { status: 404 })
        return Response.json(deleted)
      },
    },
  },
})
