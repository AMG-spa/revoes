import type { LegendEntry } from '../utils/labelLayout';
import { computeLegendLayout, entryText, truncateToWidth, COLUMN_GAP_MM } from '../utils/legendLayout';

interface MapLegendProps {
  legend: LegendEntry[];
  columnX: number;
  columnY: number;
  columnWidth: number;
  columnHeight: number;
}

const BASE_FONT_MM = 1.8;

/** Plain numbered list laid out in columns in the band below the map. */
export function MapLegend({ legend, columnX, columnY, columnWidth, columnHeight }: MapLegendProps) {
  const layout = computeLegendLayout(legend, columnWidth, columnHeight, BASE_FONT_MM);

  return (
    <g transform={`translate(${columnX}, ${columnY})`} fontFamily="system-ui, sans-serif" fill="#111111">
      {layout.truncatedCount > 0 && (
        <text x={0} y={layout.fontSize} fontSize={layout.fontSize * 0.9} fill="#666666">
          (+{layout.truncatedCount} non mostrati)
        </text>
      )}
      {layout.columns.map((col, colIndex) => {
        const colX = layout.columns.slice(0, colIndex).reduce((sum, c) => sum + c.width + COLUMN_GAP_MM, 0);
        return (
          <g key={colIndex}>
            {col.entries.map((entry, rowIndex) => (
              <text
                key={entry.number}
                x={colX}
                y={layout.titleHeight + rowIndex * layout.lineHeight + layout.fontSize}
                fontSize={layout.fontSize}
              >
                {truncateToWidth(entryText(entry), layout.fontSize, col.width)}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}
