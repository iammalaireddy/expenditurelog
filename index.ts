import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import * as schema from './schema.js'

declare global {
  interface CloudflareEnv {
    DB: D1Database
  }
}

export const db = drizzle((env as unknown as CloudflareEnv).DB, { schema })
