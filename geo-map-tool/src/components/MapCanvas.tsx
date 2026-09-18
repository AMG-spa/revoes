import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { topology } from 'topojson-server';
import { mesh } from 'topojson-client';
import type { Position } from 'geojson';
import { useGeoJson } from '../hooks/useGeoJson';
import { useMapConfig } from '../context/MapConfigContext';
import { findLabelPoint, featureLabel } from '../utils/geometry';
import { computeLabelLayout, NUMBER_FONT_MM, LABEL_LINE_HEIGHT, type LabelCandidate } from '../utils/labelLayout';
import { MapLegend } from './MapLegend';
import { TitleBlock } from './TitleBlock';
import {
  NAME_JOIN_PROPERTY,
  A3_LONG_MM,
  A3_SHORT_MM,
  MARGIN_MM,
  HEADER_HEIGHT_MM,
  LEGEND_BAND_HEIGHT_MM,
  LABEL_FONT_MM,
} from '../types/geo';

export interface MapCanvasHandle {
  getSvgElement: () => SVGSVGElement | null;
}

/**
 * Renders the print-ready A3 sheet as an off-screen SVG — the app shows no interactive preview,
 * this component exists purely so the export button has a live document to serialize.
 */
export const MapCanvas = forwardRef<MapCanvasHandle>(function MapCanvas(_, ref) {
  const { geoJson } = useGeoJson();
  const { capField, title } = useMapConfig();
  const svgRef = useRef<SVGSVGElement>(null);

  useImperativeHandle(ref, () => ({
    getSvgElement: () => svgRef.current,
  }));

  const headerHeight = title ? HEADER_HEIGHT_MM : 0;

  const layout = useMemo(() => {
    if (!geoJson || geoJson.features.length === 0) {
      return null;
    }

    // Try both A3 orientations and keep the one that lets the map fill the most space
    // (portrait wins for tall regions, landscape for wide ones) — so the map is always as big as possible.
    const orientations = [
      { paperWidth: A3_LONG_MM, paperHeight: A3_SHORT_MM }, // landscape
      { paperWidth: A3_SHORT_MM, paperHeight: A3_LONG_MM }, // portrait
    ];

    const best = orientations
      .map(({ paperWidth, paperHeight }) => {
        const mapX0 = MARGIN_MM;
        const mapY0 = MARGIN_MM + headerHeight;
        const mapX1 = paperWidth - MARGIN_MM;
        const mapY1 = paperHeight - MARGIN_MM - LEGEND_BAND_HEIGHT_MM;
        const projection = geoMercator().fitExtent([[mapX0, mapY0], [mapX1, mapY1]], geoJson);
        return { paperWidth, paperHeight, mapY1, projection, scale: projection.scale() };
      })
      .sort((a, b) => b.scale - a.scale)[0];

    const { paperWidth, paperHeight, mapY1, projection } = best;
    const pathGenerator = geoPath(projection);
    const project = (c: Position): [number, number] | null =>
      projection([c[0], c[1]]) as [number, number] | null;

    // Build a topology so we can draw the dissolved outer boundary thicker than the shared
    // interior boundaries between municipalities — same technique classic choropleth maps use.
    const topo = topology({ comuni: geoJson });
    const comuniObject = topo.objects.comuni as Parameters<typeof mesh>[1];
    const exteriorPath = pathGenerator(mesh(topo, comuniObject, (a, b) => a === b));
    const interiorPath = pathGenerator(mesh(topo, comuniObject, (a, b) => a !== b));

    const candidates: LabelCandidate[] = [];

    geoJson.features.forEach((feature, index) => {
      const pole = findLabelPoint(feature.geometry, project);
      if (!pole) return;
      const { name, cap } = featureLabel(feature.properties, NAME_JOIN_PROPERTY, capField);
      if (!name && !cap) return;

      candidates.push({ index, name, cap, x: pole.x, y: pole.y, area: pole.area });
    });

    const { placements, legend } = computeLabelLayout(candidates);

    return { paperWidth, paperHeight, mapY1, exteriorPath, interiorPath, placements, legend };
  }, [geoJson, capField, headerHeight]);

  if (!geoJson || !layout) return null;

  const { paperWidth, paperHeight, mapY1 } = layout;

  return (
    <div aria-hidden style={{ position: 'fixed', left: '-10000px', top: 0, width: 0, height: 0, overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${paperWidth} ${paperHeight}`}
        width={paperWidth}
        height={paperHeight}
      >
        <rect x={0} y={0} width={paperWidth} height={paperHeight} fill="#ffffff" />

        {title && <TitleBlock x={MARGIN_MM} y={MARGIN_MM} width={paperWidth - MARGIN_MM * 2} title={title} />}

        <g>
          {layout?.interiorPath && <path d={layout.interiorPath} fill="none" stroke="#555555" strokeWidth={0.15} />}
          {layout?.exteriorPath && <path d={layout.exteriorPath} fill="none" stroke="#000000" strokeWidth={1.1} />}
          <g fontFamily="system-ui, sans-serif" fill="#111111">
            {layout?.placements
              .filter((p) => p.mode === 'text')
              .map((p) => {
                const lineCount = (p.name ? 1 : 0) + (p.cap ? 1 : 0);
                const lineHeight = LABEL_FONT_MM * LABEL_LINE_HEIGHT;
                const startY = p.y - ((lineCount - 1) * lineHeight) / 2;
                let line = 0;
                return (
                  <g key={p.index}>
                    {p.name && (
                      <text
                        x={p.x}
                        y={startY + line++ * lineHeight}
                        fontSize={LABEL_FONT_MM}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {p.name}
                      </text>
                    )}
                    {p.cap && (
                      <text
                        x={p.x}
                        y={startY + line * lineHeight}
                        fontSize={LABEL_FONT_MM}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {p.cap}
                      </text>
                    )}
                  </g>
                );
              })}
            {layout?.placements
              .filter((p) => p.mode === 'number')
              .map((p) => (
                <text
                  key={p.index}
                  x={p.x}
                  y={p.y}
                  fontSize={NUMBER_FONT_MM}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {p.number}
                </text>
              ))}
          </g>
        </g>

        {layout.legend.length > 0 && (
          <MapLegend
            legend={layout.legend}
            columnX={MARGIN_MM}
            columnY={mapY1 + 4}
            columnWidth={paperWidth - MARGIN_MM * 2}
            columnHeight={LEGEND_BAND_HEIGHT_MM - 6}
          />
        )}
      </svg>
    </div>
  );
});
