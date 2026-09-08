import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type DB } from '@/lib/db'
import { usersDueForDigest, digestSubject } from '@/lib/digest'

let db: DB

beforeEach(() => {
  db = createTestDb()
  db.prepare(`INSERT INTO teams (id, name, plan) VALUES (1, 'Platform', 'pro')`).run()
})

function addUser(id: number, name: string, timezone: string) {
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, team_id, timezone, created_at)
     VALUES (?, ?, ?, 'x', 1, ?, '2026-01-01T00:00:00.000Z')`,
  ).run(id, name, `${name.toLowerCase()}@pulseboard.dev`, timezone)
}

describe('daily digest', () => {
  it('sends to nobody when there are no users', () => {
    expect(usersDueForDigest(db, new Date('2026-09-08T09:00:00.000Z'))).toHaveLength(0)
  })

  it('stamps the subject line with the date', () => {
    expect(digestSubject(new Date('2026-09-08T09:00:00.000Z'))).toBe(
      'Your Pulseboard digest for 2026-09-08',
    )
  })

  it('sends at 09:00 in each user local timezone', () => {
    addUser(1, 'Ken', 'Asia/Tokyo')
    addUser(2, 'Ada', 'UTC')

    // 00:00 UTC is 09:00 in Tokyo, so Ken is due and Ada is not.
    const due = usersDueForDigest(db, new Date('2026-09-08T00:00:00.000Z'))

    expect(due.map((user) => user.name)).toEqual(['Ken'])
  })
})
