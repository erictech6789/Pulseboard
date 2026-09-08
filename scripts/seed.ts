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

  // Every first/last pairing, shuffled, so no two seeded people share a name.
  const combos: string[] = []
  for (const first of FIRST) for (const last of LAST) combos.push(`${first} ${last}`)

  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[combos[i], combos[j]] = [combos[j], combos[i]]
  }

  combos
    .filter((name) => name !== 'Ada Okafor')
    .slice(0, 23)
    .forEach((name, i) => {
      const email = `${name.toLowerCase().replace(' ', '.')}@pulseboard.dev`
      const created = new Date(Date.UTC(2026, 0, 5 + (i % 60), 8, 0, 0)).toISOString()

      userIds.push(
        Number(
          insertUser.run(name, email, demoHash, pick(teamIds), pick(zones), created).lastInsertRowid,
        ),
      )
    })

  const insertEvent = db.prepare(
    `INSERT INTO events (user_id, kind, detail, created_at) VALUES (?, ?, ?, ?)`,
  )

  const START = Date.UTC(2026, 7, 1)
  const DAYS = 38
  let seq = 0

  for (let day = 0; day < DAYS; day++) {
    const date = new Date(START + day * 86_400_000)
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6

    // Weekdays are busy, weekends are quiet, and the team is growing slowly.
    const base = weekend ? 4 : 14
    const growth = Math.round((day / DAYS) * 6)
    const noise = Math.round(random() * 5) - 2
    const count = Math.max(1, base + growth + noise)

    for (let n = 0; n < count; n++) {
      const at = new Date(
        date.getTime() + (8 + (n % 10)) * 3_600_000 + ((n * 17) % 60) * 60_000,
      )
      insertEvent.run(pick(userIds), pick(KINDS), `seq ${++seq}`, at.toISOString())
    }
  }

  console.log(`Seeded ${TEAMS.length} teams, ${userIds.length} users, ${seq} events.`)
  console.log('Sign in with ada@pulseboard.dev / password123')
}

main()
