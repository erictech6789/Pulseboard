import type { DB } from '@/lib/db'

export type UserRow = {
  id: number
  name: string
  email: string
  team_id: number
  created_at: string
}

export type UserListItem = {
  id: number
  name: string
  email: string
  team: string
  plan: string
  eventCount: number
}

export function listUsers(db: DB): UserListItem[] {
  const users = db
    .prepare(`SELECT id, name, email, team_id, created_at FROM users ORDER BY name`)
    .all() as UserRow[]

  return users.map((user) => {
    const team = db
      .prepare(`SELECT name, plan FROM teams WHERE id = ?`)
      .get(user.team_id) as { name: string; plan: string }

    const counted = db
      .prepare(`SELECT COUNT(*) AS total FROM events WHERE user_id = ?`)
      .get(user.id) as { total: number }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      team: team.name,
      plan: team.plan,
      eventCount: counted.total,
    }
  })
}
