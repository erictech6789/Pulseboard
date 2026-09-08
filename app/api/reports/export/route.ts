import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { listUsers } from '@/lib/queries/users'
import { renderReportPdf } from '@/lib/pdf'

export async function GET() {
  const rows = listUsers(getDb()).map((user) => ({
    user: user.name,
    events: user.eventCount,
  }))

  const pdf = await renderReportPdf(rows)

  return new NextResponse(pdf, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'attachment; filename="pulseboard-report.pdf"',
    },
  })
}
