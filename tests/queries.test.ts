import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type DB } from '@/lib/db'
import { listUsers } from '@/lib/queries/users'
import { listActivity, countActivity } from '@/lib/queries/activity'

let db: DB

beforeEach(() => {
  db = createTestDb()

  db.prepare(`INSERT INTO teams (id, name, plan) VALUES (1, 'Platform', 'pro')`).run()

  const insertUser = db.prepare(
    `INSERT INTO users (id, name, email, password_hash, team_id, timezone, created_at)
     VALUES (?, ?, ?, 'x', 1, 'UTC', '2026-01-01T00:00:00.000Z')`,
  )
  insertUser.run(1, 'Ada Okafor', 'ada@pulseboard.dev')
  insertUser.run(2, 'Ken Sato', 'ken@pulseboard.dev')

  const insertEvent = db.prepare(
    `INSERT INTO events (user_id, kind, detail, created_at) VALUES (?, 'login', '', ?)`,
  )
  insertEvent.run(1, '2026-09-01T10:00:00.000Z')
  insertEvent.run(1, '2026-09-02T10:00:00.000Z')
  insertEvent.run(2, '2026-09-03T10:00:00.000Z')
})

describe('listUsers', () => {
  it('returns every user with their team and event count', () => {
    const users = listUsers(db)

    expect(users).toHaveLength(2)
    expect(users[0]).toMatchObject({ name: 'Ada Okafor', team: 'Platform', eventCount: 2 })
    expect(users[1]).toMatchObject({ name: 'Ken Sato', team: 'Platform', eventCount: 1 })
  })
})

describe('listActivity', () => {
  it('returns events newest first with the user name attached', () => {
    const rows = listActivity(db)

    expect(rows).toHaveLength(3)
    expect(rows[0].user_name).toBe('Ken Sato')
  })

  it('counts every event', () => {
    expect(countActivity(db)).toBe(3)
  })
})
