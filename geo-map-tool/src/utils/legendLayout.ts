import type { LegendEntry } from './labelLayout';
import { measureTextWidth } from './measureText';

const MAX_COLUMN_WIDTH_MM = 58;
const MIN_COLUMN_WIDTH_MM = 16;
export const COLUMN_GAP_MM = 4;
const MAX_COLUMNS = 14;
const MIN_LEGEND_FONT_MM = 1.3;

const FONT_CANDIDATE_FACTORS = [1, 0.85, 0.7, 0.55, 0.42, 0.32];

/** Reference-style legend line: "1 - Albalat dels Sorells 46135". */
export function entryText(e: LegendEntry): string {
  const label = e.name || '—';
  return `${e.number} - ${label}${e.cap ? ` ${e.cap}` : ''}`;
}

export function truncateToWidth(text: string, fontSizeMm: number, maxWidthMm: number): string {
  if (measureTextWidth(text, fontSizeMm) <= maxWidthMm) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const candidate = `${text.slice(0, mid)}…`;
    if (measureTextWidth(candidate, fontSizeMm) <= maxWidthMm) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo <= 0 ? '…' : `${text.slice(0, lo)}…`;
}

interface LegendLayout {
  fontSize: number;
  lineHeight: number;
  titleHeight: number;
  padding: number;
  columns: { entries: LegendEntry[]; width: number }[];
  truncatedCount: number;
}

function tryLayout(entries: LegendEntry[], fontSize: number, availW: number, availH: number): LegendLayout | null {
  const lineHeight = fontSize * 1.4;
  const titleHeight = fontSize * 1.8;
  const padding = fontSize * 0.9;

  const rowsAvailable = Math.max(1, Math.floor((availH - titleHeight - padding * 2) / lineHeight));

  for (let numColumns = 1; numColumns <= MAX_COLUMNS; numColumns++) {
    const rowsPerColumn = Math.ceil(entries.length / numColumns);
    if (rowsPerColumn > rowsAvailable) continue;

    const columns: { entries: LegendEntry[]; width: number }[] = [];
    for (let c = 0; c < numColumns; c++) {
      const chunk = entries.slice(c * rowsPerColumn, (c + 1) * rowsPerColumn);
      if (chunk.length === 0) continue;
      const maxWidth = chunk.reduce((max, e) => Math.max(max, measureTextWidth(entryText(e), fontSize)), 0);
      columns.push({ entries: chunk, width: Math.min(Math.max(maxWidth, MIN_COLUMN_WIDTH_MM), MAX_COLUMN_WIDTH_MM) });
    }

    const totalWidth =
      columns.reduce((sum, col) => sum + col.width, 0) + COLUMN_GAP_MM * (columns.length - 1) + padding * 2;
    if (totalWidth <= availW) {
      return { fontSize, lineHeight, titleHeight, padding, columns, truncatedCount: 0 };
    }
  }
  return null;
}

export function computeLegendLayout(
  legend: LegendEntry[],
  availW: number,
  availH: number,
  baseFontSize: number,
): LegendLayout {
  for (const factor of FONT_CANDIDATE_FACTORS) {
    const fontSize = Math.max(baseFontSize * factor, MIN_LEGEND_FONT_MM);
    const layout = tryLayout(legend, fontSize, availW, availH);
    if (layout) return layout;
    if (fontSize <= MIN_LEGEND_FONT_MM) break;
  }

  // Nothing fits cleanly even at the smallest font — pack as many as possible and note the rest.
  const fontSize = MIN_LEGEND_FONT_MM;
  const lineHeight = fontSize * 1.4;
  const titleHeight = fontSize * 1.8;
  const padding = fontSize * 0.9;
  const rowsAvailable = Math.max(1, Math.floor((availH - titleHeight - padding * 2) / lineHeight));
  const numColumns = Math.max(
    1,
    Math.min(MAX_COLUMNS, Math.floor((availW - padding * 2 + COLUMN_GAP_MM) / (MIN_COLUMN_WIDTH_MM + COLUMN_GAP_MM))),
  );
  const capacity = rowsAvailable * numColumns;
  const shown = legend.slice(0, Math.max(0, capacity - 1));
  const truncatedCount = legend.length - shown.length;

  const columns: { entries: LegendEntry[]; width: number }[] = [];
  const rowsPerColumn = Math.ceil(shown.length / numColumns) || 1;
  for (let c = 0; c < numColumns; c++) {
    const chunk = shown.slice(c * rowsPerColumn, (c + 1) * rowsPerColumn);
    if (chunk.length === 0) continue;
    columns.push({ entries: chunk, width: MIN_COLUMN_WIDTH_MM + 10 });
  }

  return { fontSize, lineHeight, titleHeight, padding, columns, truncatedCount };
}
