import { jsPDF } from 'jspdf';
import { STATUS_META, REPORT_ACTION_META } from '@/lib/constants';

// Ink-on-paper palette: readable in print, and the app's teal as the only accent.
const INK = [15, 23, 42];
const MUTED = [104, 116, 130];
const LINE = [223, 228, 234];
const WASH = [245, 247, 249];
const TEAL = [12, 104, 98];

const PAGE = { w: 210, h: 297, margin: 16 };
const BOTTOM = PAGE.h - 24;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const statusLabel = (key) => STATUS_META[key]?.label || (key ? String(key).replace(/_/g, ' ') : '—');
const actionLabel = (key) => REPORT_ACTION_META[key]?.label || String(key || '').replace(/_/g, ' ');

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatStamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${formatDate(value)}, ${time}`;
}

/**
 * A clean, printable summary of every repair: header, summary tiles,
 * the computers currently marked repaired, then the maintenance work log.
 */
export function buildMaintenancePdf(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const left = PAGE.margin;
  const right = PAGE.w - PAGE.margin;
  const width = right - left;
  let y = 20;

  const breakPage = (height) => {
    if (y + height <= BOTTOM) return;
    doc.addPage();
    y = 20;
  };

  const rule = (gap = 0) => {
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.4);
    doc.line(left, y, right, y);
    y += gap;
  };

  // ---- Header -------------------------------------------------------------
  doc.setCharSpace(0.6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...TEAL);
  doc.text('LABTRACK PRO · FCI', left, y);
  doc.setCharSpace(0);

  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('Lab maintenance report', left, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const meta = `All recorded maintenance · Generated ${formatStamp(data.generated_at)}${
    data.generated_by ? ` · Exported by ${data.generated_by}` : ''
  }`;
  doc.text(meta, left, y);
  y += 4;
  rule(9);

  // ---- Summary tiles ------------------------------------------------------
  const stats = data.summary || [];
  const columns = 4;
  const gap = 4;
  const tileW = (width - gap * (columns - 1)) / columns;
  const tileH = 17;

  stats.forEach((stat, index) => {
    const column = index % columns;
    if (column === 0 && index > 0) y += tileH + gap;
    const x = left + column * (tileW + gap);
    doc.setFillColor(...WASH);
    doc.roundedRect(x, y, tileW, tileH, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...INK);
    doc.text(String(stat.value ?? 0), x + 3.5, y + 8.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(String(stat.label || '').toUpperCase(), x + 3.5, y + 13.6);
  });
  y += tileH + 11;

  const section = (title, count) => {
    breakPage(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...INK);
    doc.text(title, left, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${count} ${count === 1 ? 'entry' : 'entries'}`, right, y, { align: 'right' });
    y += 4;
    rule(6);
  };

  const empty = (message) => {
    breakPage(10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(message, left, y);
    doc.setFont('helvetica', 'normal');
    y += 9;
  };

  // ---- Repaired items -----------------------------------------------------
  const repaired = data.repaired_items || [];
  section('Repaired computers', repaired.length);

  if (repaired.length === 0) {
    empty('No computer is currently marked repaired.');
  } else {
    const colComputer = 42;
    doc.setFillColor(...INK);
    doc.roundedRect(left, y, width, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('COMPUTER', left + 4, y + 4.6);
    doc.text('LAB', left + 4 + colComputer, y + 4.6);
    doc.text('STATE', right - 4, y + 4.6, { align: 'right' });
    y += 7;

    repaired.forEach((item) => {
      breakPage(9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text(String(item.identifier), left + 4, y + 5.2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(String(item.lab), left + 4 + colComputer, y + 5.2);
      doc.setTextColor(...TEAL);
      doc.text('Repaired', right - 4, y + 5.2, { align: 'right' });
      y += 8;
      rule();
    });
    y += 5;
  }

  // ---- Work log -----------------------------------------------------------
  const log = data.work_log || [];
  section('Maintenance work log', log.length);

  if (log.length === 0) {
    empty('No maintenance activity has been recorded yet.');
  } else {
    log.forEach((entry) => {
      const detail = String(entry.description || '').trim();
      const lines = detail ? doc.splitTextToSize(detail, width - 6) : [];
      const move = entry.from || entry.to ? `${statusLabel(entry.from)} → ${statusLabel(entry.to)}` : '';
      const blockHeight = 6 + (move ? 4.2 : 0) + lines.length * 4 + 3.5;
      breakPage(blockHeight + 3);

      const title = [entry.pc, entry.lab].filter(Boolean).join(' · ') || actionLabel(entry.action);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(title, left, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(formatDate(entry.occurred_at), right, y + 4, { align: 'right' });
      y += 5;

      const trail = [actionLabel(entry.action), move, entry.by ? `by ${entry.by}` : ''].filter(Boolean).join('  ·  ');
      doc.setFontSize(8);
      doc.setTextColor(...TEAL);
      doc.text(trail, left, y + 3.5);
      y += 4.2;

      if (lines.length) {
        doc.setTextColor(...MUTED);
        doc.setFontSize(8.5);
        doc.text(lines, left, y + 3.2);
        y += lines.length * 4;
      }
      y += 3.5;
      rule(5);
    });

    if (data.truncated) {
      breakPage(8);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('The log is capped at the most recent 400 maintenance entries.', left, y + 3);
      y += 8;
    }
  }

  // ---- Footers ------------------------------------------------------------
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.4);
    doc.line(left, PAGE.h - 16, right, PAGE.h - 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text('LabTrack Pro · FCI', left, PAGE.h - 11);
    doc.text(`Page ${page} of ${pages}`, right, PAGE.h - 11, { align: 'right' });
  }

  return doc;
}

/** The same work log as a spreadsheet-friendly CSV. */
export function maintenanceCsv(data) {
  const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['LabTrack Pro — maintenance report'],
    ['Generated', formatStamp(data.generated_at)],
    ['Exported by', data.generated_by || '—'],
    [],
    ['Summary'],
    ['Metric', 'Value'],
    ...(data.summary || []).map((stat) => [stat.label, stat.value]),
    [],
    ['Repaired computers'],
    ['Computer', 'Lab'],
    ...(data.repaired_items || []).map((item) => [item.identifier, item.lab]),
    [],
    ['Maintenance work log'],
    ['Date', 'Computer', 'Lab', 'Work', 'From', 'To', 'Description', 'By'],
    ...(data.work_log || []).map((entry) => [
      formatDate(entry.occurred_at),
      entry.pc,
      entry.lab,
      actionLabel(entry.action),
      statusLabel(entry.from),
      statusLabel(entry.to),
      entry.description,
      entry.by,
    ]),
  ];

  return rows.map((row) => row.map(cell).join(',')).join('\r\n');
}