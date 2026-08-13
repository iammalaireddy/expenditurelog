import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'

export const Route = createFileRoute('/api/debug')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const sqlResult = await db.run("SELECT sql FROM sqlite_master WHERE type='table' AND name='expenses'")
          const colsResult = await db.run('PRAGMA table_info(expenses)')
          return Response.json({
            sql: sqlResult.results,
            columns: colsResult.results,
          })
        } catch (caught) {
          return Response.json(
            { error: caught instanceof Error ? caught.message : String(caught) },
            { status: 500 },
          )
        }
      },
    },
  },
})
