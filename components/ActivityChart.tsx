import type { DailyCount } from '@/lib/queries/activity'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDay(day: string): string {
  const [, month, date] = day.split('-')
  return `${MONTHS[Number(month) - 1]} ${Number(date)}`
}

export default function ActivityChart({ data }: { data: DailyCount[] }) {
  if (data.length === 0) return null

  const peak = data.reduce((best, row) => (row.total > best.total ? row : best), data[0])

  return (
    <figure className="card px-4 pb-3 pt-4">
      <figcaption className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium">Events per day</h2>
        <p className="text-xs text-muted">
          {formatDay(data[0].day)} – {formatDay(data[data.length - 1].day)}
        </p>
      </figcaption>

      <div className="mt-4">
        <div className="flex items-center gap-2">
          <span className="num text-[11px] text-muted">{peak.total}</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <div className="mt-1.5 flex h-32 items-end justify-between gap-[2px]">
          {data.map((row) => (
            <div key={row.day} className="flex h-full min-w-[3px] max-w-[24px] flex-1 items-end">
              <div
                title={`${formatDay(row.day)}: ${row.total} events`}
                className="w-full rounded-t bg-accent transition-opacity hover:opacity-70"
                style={{ height: `${Math.max((row.total / peak.total) * 100, 3)}%` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-1.5 h-px bg-rule" />

        <div className="mt-1.5 flex justify-between text-[11px] text-muted">
          <span>{formatDay(data[0].day)}</span>
          <span>{formatDay(data[data.length - 1].day)}</span>
        </div>
      </div>
    </figure>
  )
}
