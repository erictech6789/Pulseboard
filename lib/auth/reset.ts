import { randomBytes } from 'node:crypto'
import type { DB } from '@/lib/db'

export type ResetToken = {
  id: number
  user_id: number
  token: string
  used: number
  created_at: string
}

export function createResetToken(db: DB, userId: number, now = new Date()): string {
  const token = randomBytes(24).toString('hex')

  db.prepare(
    `INSERT INTO reset_tokens (user_id, token, created_at) VALUES (?, ?, ?)`,
  ).run(userId, token, now.toISOString())

  return token
}

/**
 * Returns the user id the token belongs to, or null if the token is not usable.
 */
export function verifyResetToken(db: DB, token: string, _now = new Date()): number | null {
  const row = db
    .prepare(`SELECT * FROM reset_tokens WHERE token = ?`)
    .get(token) as ResetToken | undefined

  if (!row) return null
  if (row.used) return null

  return row.user_id
}

export function consumeResetToken(db: DB, token: string): void {
  db.prepare(`UPDATE reset_tokens SET used = 1 WHERE token = ?`).run(token)
}
