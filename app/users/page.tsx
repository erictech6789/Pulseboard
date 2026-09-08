import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { readSession, SESSION_COOKIE } from '@/lib/auth/session'
import { listUsers } from '@/lib/queries/users'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const store = await cookies()
  const userId = readSession(store.get(SESSION_COOKIE)?.value)
  if (!userId) redirect('/')

  const users = listUsers(getDb())

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-muted">{users.length} people across all teams.</p>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-muted">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Email</th>
            <th className="py-2 font-medium">Team</th>
            <th className="py-2 font-medium">Plan</th>
            <th className="py-2 font-medium">Events</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-100">
              <td className="py-2">{user.name}</td>
              <td className="py-2 text-muted">{user.email}</td>
              <td className="py-2">{user.team}</td>
              <td className="py-2 text-muted">{user.plan}</td>
              <td className="py-2">{user.eventCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
