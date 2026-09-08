import type { DB } from '@/lib/db'

export type ActivityRow = {
  id: number
  kind: string
  detail: string
  created_at: string
  user_name: string
}

export type DailyCount = {
  day: string
  total: number
}

export function listActivity(db: DB): ActivityRow[] {
  return db
    .prepare(
      `SELECT events.id, events.kind, events.detail, events.created_at, users.name AS user_name
       FROM events
       JOIN users ON users.id = events.user_id
       ORDER BY events.created_at DESC`,
    )
    .all() as ActivityRow[]
}

export function countActivity(db: DB): number {
  const row = db.prepare(`SELECT COUNT(*) AS total FROM events`).get() as { total: number }
  return row.total
}

export function dailyCounts(db: DB): DailyCount[] {
  return db
    .prepare(
      `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS total
       FROM events
       GROUP BY day
       ORDER BY day`,
    )
    .all() as DailyCount[]
}
