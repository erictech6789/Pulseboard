import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type DB } from '@/lib/db'
import { createResetToken, verifyResetToken, consumeResetToken } from '@/lib/auth/reset'

let db: DB

beforeEach(() => {
  db = createTestDb()
  db.prepare(`INSERT INTO teams (id, name, plan) VALUES (1, 'Platform', 'pro')`).run()
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, team_id, timezone, created_at)
     VALUES (1, 'Ada Okafor', 'ada@pulseboard.dev', 'x', 1, 'UTC', '2026-01-01T00:00:00.000Z')`,
  ).run()
})

describe('password reset tokens', () => {
  it('verifies a token that was just issued', () => {
    const token = createResetToken(db, 1)
    expect(verifyResetToken(db, token)).toBe(1)
  })

  it('rejects a token that does not exist', () => {
    expect(verifyResetToken(db, 'made-up-token')).toBeNull()
  })

  it('rejects a token that has already been used', () => {
    const token = createResetToken(db, 1)
    consumeResetToken(db, token)
    expect(verifyResetToken(db, token)).toBeNull()
  })

  it('rejects a token that is more than an hour old', () => {
    const issued = new Date('2026-09-08T09:00:00.000Z')
    const token = createResetToken(db, 1, issued)

    const twoHoursLater = new Date('2026-09-08T11:00:00.000Z')
    expect(verifyResetToken(db, token, twoHoursLater)).toBeNull()
  })
})
