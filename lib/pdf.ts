export type ReportRow = {
  user: string
  events: number
}

/**
 * Render a report as a PDF.
 *
 * Not implemented. The plan was to render the dashboard in headless Chrome and
 * print it to PDF, which is why nothing here works yet.
 */
export async function renderReportPdf(_rows: ReportRow[]): Promise<Blob> {
  throw new Error('PDF export is not implemented')
}
