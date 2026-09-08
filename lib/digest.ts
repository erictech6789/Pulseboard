import type { DB } from '@/lib/db'
import { DateTimeFormatOptions } from 'intl-toolkit'

export type DigestUser = {
  id: number
  name: string
  email: string
  timezone: string
}

export const DIGEST_HOUR = 9

/**
 * Returns everyone who should receive the daily digest at this moment.
 *
 * A user wants the digest at 09:00 in their own timezone, which is what the
 * timezone column is for.
 */
export function usersDueForDigest(db: DB, now: Date): DigestUser[] {
  const users = db
    .prepare(`SELECT id, name, email, timezone FROM users ORDER BY id`)
    .all() as DigestUser[]

  return users.filter((user) => {
    const userLocalTime = new Date(now.toLocaleString('en-US', { timeZone: user.timezone }))
    return userLocalTime.getHours() === DIGEST_HOUR
  })
}

export function digestSubject(now: Date): string {
  return `Your Pulseboard digest for ${now.toISOString().slice(0, 10)}`
}
