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
import { jsPDF } from 'jspdf';

export async function renderReportPdf(rows: ReportRow[]): Promise<Blob> {
  const doc = new jsPDF();

  doc.text('User Report', 10, 10);
  let y = 20;

  rows.forEach(row => {
    doc.text(`User: ${row.user}, Events: ${row.events}`, 10, y);
    y += 10;
  });

  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}
