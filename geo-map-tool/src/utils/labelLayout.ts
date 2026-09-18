import { measureTextWidth } from './measureText';
import { LABEL_FONT_MM } from '../types/geo';

export interface LabelCandidate {
  index: number;
  name: string;
  cap: string;
  x: number;
  y: number;
  area: number;
}

export interface PlacedLabel {
  index: number;
  name: string;
  cap: string;
  x: number;
  y: number;
  mode: 'text' | 'number';
  /** Only set for mode 'number' — the numbered marker's digits. */
  number?: number;
}

export interface LegendEntry {
  number: number;
  name: string;
  cap: string;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const NUMBER_FONT_MM = LABEL_FONT_MM;
export const LABEL_LINE_HEIGHT = 1.1;

function boxesOverlap(a: Box, b: Box, padding = 0.4): boolean {
  return (
    Math.abs(a.x - b.x) * 2 < a.width + b.width + padding * 2 &&
    Math.abs(a.y - b.y) * 2 < a.height + b.height + padding * 2
  );
}

/**
 * Reference-style labeling: every label uses the SAME small font (like the hand-made Valencia map).
 * Labels may spill past their polygon's borders — the only thing that matters is not colliding with
 * an already-placed label. Bigger municipalities are placed first, so in dense clusters the tiny
 * ones collide and fall back to a numbered marker + legend entry.
 */
export function computeLabelLayout(
  candidates: LabelCandidate[],
): { placements: PlacedLabel[]; legend: LegendEntry[] } {
  const lineHeight = LABEL_FONT_MM * LABEL_LINE_HEIGHT;
  const numberBoxSize = NUMBER_FONT_MM * 1.4;

  const order = [...candidates].sort((a, b) => b.area - a.area);

  const placedBoxes: Box[] = [];
  const results: PlacedLabel[] = [];
  const needsNumber: LabelCandidate[] = [];

  for (const c of order) {
    if (!c.name && !c.cap) continue;

    const lineCount = (c.name ? 1 : 0) + (c.cap ? 1 : 0);
    const textWidth = Math.max(measureTextWidth(c.name, LABEL_FONT_MM), measureTextWidth(c.cap, LABEL_FONT_MM));
    const box: Box = { x: c.x, y: c.y, width: textWidth, height: lineHeight * lineCount };

    if (!placedBoxes.some((p) => boxesOverlap(p, box))) {
      results.push({ index: c.index, name: c.name, cap: c.cap, x: c.x, y: c.y, mode: 'text' });
      placedBoxes.push(box);
    } else {
      needsNumber.push(c);
    }
  }

  // Every leftover municipality gets a number + legend entry.
  // Assign numbers in reading order (top-to-bottom, left-to-right) for an easy-to-scan legend.
  const rowThreshold = NUMBER_FONT_MM * 3;
  const numbered = [...needsNumber].sort((a, b) => {
    const rowA = Math.round(a.y / rowThreshold);
    const rowB = Math.round(b.y / rowThreshold);
    if (rowA !== rowB) return rowA - rowB;
    return a.x - b.x;
  });

  const legend: LegendEntry[] = [];
  numbered.forEach((c, i) => {
    const number = i + 1;
    placedBoxes.push({ x: c.x, y: c.y, width: numberBoxSize, height: numberBoxSize });
    results.push({
      index: c.index,
      name: c.name,
      cap: c.cap,
      x: c.x,
      y: c.y,
      mode: 'number',
      number,
    });
    legend.push({ number, name: c.name, cap: c.cap });
  });

  return { placements: results, legend };
}
