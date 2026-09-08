import { getDb } from '../lib/db'
import { hashPassword } from '../lib/password'

const TEAMS = [
  { name: 'Platform', plan: 'pro' },
  { name: 'Growth', plan: 'free' },
  { name: 'Support', plan: 'free' },
]

const FIRST = ['Ada', 'Marta', 'Ken', 'Priya', 'Noah', 'Lena', 'Omar', 'Iris']
const LAST = ['Okafor', 'Lindqvist', 'Sato', 'Raman', 'Bergman', 'Cruz', 'Haddad']
const KINDS = ['login', 'report.viewed', 'invite.sent', 'settings.updated', 'export.requested']

/** Small deterministic generator so the seed data is identical on every machine. */
function makeRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const random = makeRandom(20260908)
const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)]

function main() {
  const db = getDb()

  const insertTeam = db.prepare(`INSERT INTO teams (name, plan) VALUES (?, ?)`)
  const teamIds = TEAMS.map((team) => Number(insertTeam.run(team.name, team.plan).lastInsertRowid))

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, password_hash, team_id, timezone, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )

  const demoHash = hashPassword('password123')
  const userIds: number[] = []

  userIds.push(
    Number(
      insertUser.run(
        'Ada Okafor',
        'ada@pulseboard.dev',
        demoHash,
        teamIds[0],
        'Europe/London',
        new Date('2026-01-04T09:00:00Z').toISOString(),
      ).lastInsertRowid,
    ),
  )

  const zones = ['UTC', 'Europe/Berlin', 'America/New_York', 'Asia/Tokyo', 'Australia/Sydney']

  for (let i = 0; i < 23; i++) {
    const name = `${pick(FIRST)} ${pick(LAST)}`
    const email = `${name.toLowerCase().replace(/[^a-z]/g, '.')}${i}@pulseboard.dev`
    const created = new Date(Date.UTC(2026, 0, 5 + (i % 60), 8, 0, 0)).toISOString()

    userIds.push(
      Number(insertUser.run(name, email, demoHash, pick(teamIds), pick(zones), created).lastInsertRowid),
    )
  }

  const insertEvent = db.prepare(
    `INSERT INTO events (user_id, kind, detail, created_at) VALUES (?, ?, ?, ?)`,
  )

  for (let i = 0; i < 480; i++) {
    const at = new Date(Date.UTC(2026, 7, 1 + (i % 38), 6 + (i % 12), (i * 7) % 60, 0))
    insertEvent.run(pick(userIds), pick(KINDS), `seq ${i + 1}`, at.toISOString())
  }

  console.log(`Seeded ${TEAMS.length} teams, ${userIds.length} users, 480 events.`)
  console.log('Sign in with ada@pulseboard.dev / password123')
}

main()
