import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { readSession, SESSION_COOKIE } from '@/lib/auth/session'
import { listUsers } from '@/lib/queries/users'
import Avatar from '@/components/Avatar'
import Badge from '@/components/Badge'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const store = await cookies()
  const userId = readSession(store.get(SESSION_COOKIE)?.value)
  if (!userId) redirect('/')

  const users = listUsers(getDb())

  // Stable colour per team, assigned by name so it does not shuffle between renders.
  const teams = [...new Set(users.map((user) => user.team))].sort()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Users</h1>
        <p className="mt-0.5 text-sm text-ink2">{users.length} people across all teams.</p>
      </div>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto px-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                <th className="th">Person</th>
                <th className="th w-40">Team</th>
                <th className="th w-28">Plan</th>
                <th className="th w-24 text-right">Events</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-hairline/70 transition hover:bg-plane">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} accent={teams.indexOf(user.team)} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td whitespace-nowrap text-ink2">{user.team}</td>
                  <td className="td">
                    <Badge tone={user.plan === 'pro' ? 'accent' : 'neutral'}>{user.plan}</Badge>
                  </td>
                  <td className="td num text-right">{user.eventCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
