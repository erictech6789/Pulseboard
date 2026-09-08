import { cookies } from 'next/headers'
import { redirect, useSearchParams } from 'next/navigation'
import { getDb } from '@/lib/db'
import { readSession, SESSION_COOKIE } from '@/lib/auth/session'
import { listActivity, countActivity, dailyCounts } from '@/lib/queries/activity'
import ActivityChart, { formatDay } from '@/components/ActivityChart'
import StatTile from '@/components/StatTile'
import Badge from '@/components/Badge'

export const dynamic = 'force-dynamic'

function formatStamp(iso: string): string {
  return `${formatDay(iso.slice(0, 10))}, ${iso.slice(11, 16)}`
}

const ITEMS_PER_PAGE = 25

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const store = await cookies()
  const userId = readSession(store.get(SESSION_COOKIE)?.value)
  if (!userId) redirect('/')

  const db = getDb()
  const currentPage = Number(searchParams?.page) || 1
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  const rows = listActivity(db, ITEMS_PER_PAGE, offset)
  const total = countActivity(db)
  const daily = dailyCounts(db)

  const people = (db.prepare(`SELECT COUNT(*) AS total FROM users`).get() as { total: number }).total
  const teams = (db.prepare(`SELECT COUNT(*) AS total FROM teams`).get() as { total: number }).total
  const busiest = daily.reduce((best, row) => (row.total > best.total ? row : best), daily[0])
  const average = daily.length ? Math.round(total / daily.length) : 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-0.5 text-sm text-ink2">
          Everything your team has done, newest first.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Events" value={total.toLocaleString()} hint="all time" />
        <StatTile label="People" value={String(people)} hint={`across ${teams} teams`} />
        <StatTile label="Busiest day" value={formatDay(busiest.day)} hint={`${busiest.total} events`} />
        <StatTile label="Daily average" value={String(average)} hint={`over ${daily.length} days`} />
      </div>

      <ActivityChart data={daily} />

      <section className="card overflow-hidden">
        <div className="flex items-baseline justify-between border-b border-hairline px-4 py-3">
          <h2 className="text-sm font-medium">Activity</h2>
          <div className="flex items-center gap-2 text-sm">
            {currentPage > 1 && (
              <a
                href={`/dashboard?page=${currentPage - 1}`}
                className="text-brand-600 hover:underline"
              >
                Previous
              </a>
            )}
            {currentPage < Math.ceil(total / ITEMS_PER_PAGE) && (
              <a
                href={`/dashboard?page=${currentPage + 1}`}
                className="text-brand-600 hover:underline"
              >
                Next
              </a>
            )}
          </div>
          <h2 className="text-sm font-medium">Activity</h2>
          <p className="num text-xs text-muted">
            Page {currentPage} of {Math.ceil(total / ITEMS_PER_PAGE)}
          </p>
        </div>

        <div className="overflow-x-auto px-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                <th className="th w-40">When</th>
                <th className="th w-48">User</th>
                <th className="th w-52">Event</th>
                <th className="th">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-hairline/70 transition hover:bg-plane">
                  <td className="td num whitespace-nowrap text-muted">{formatStamp(row.created_at)}</td>
                  <td className="td whitespace-nowrap">{row.user_name}</td>
                  <td className="td">
                    <Badge>{row.kind}</Badge>
                  </td>
                  <td className="td text-ink2">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
