import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { readSession, SESSION_COOKIE } from '@/lib/auth/session'
import { listActivity, countActivity } from '@/lib/queries/activity'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const store = await cookies()
  const userId = readSession(store.get(SESSION_COOKIE)?.value)
  if (!userId) redirect('/')

  const db = getDb()
  const rows = listActivity(db)
  const total = countActivity(db)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">{total} events recorded.</p>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-muted">
            <th className="py-2 font-medium">When</th>
            <th className="py-2 font-medium">User</th>
            <th className="py-2 font-medium">Event</th>
            <th className="py-2 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-100">
              <td className="py-2 text-muted">{row.created_at.slice(0, 16).replace('T', ' ')}</td>
              <td className="py-2">{row.user_name}</td>
              <td className="py-2">{row.kind}</td>
              <td className="py-2 text-muted">{row.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
