import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import * as schema from './schema.js'

export function createDb(d1: any) {
  return drizzle(d1, { schema })
}

export const db = createDb(env.DB)
