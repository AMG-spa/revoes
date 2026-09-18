import type { GeoJsonProperties, Geometry, Position } from 'geojson';
import polylabel from 'polylabel';

type Ring = [number, number][];
type Projection = (coords: Position) => [number, number] | null;

function projectRing(ring: Position[], project: Projection): Ring {
  const out: Ring = [];
  for (const coord of ring) {
    const p = project(coord);
    if (p) out.push(p);
  }
  return out;
}

function ringArea(ring: Ring): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum / 2);
}

/** Extracts, for a Polygon/MultiPolygon, the exterior+hole rings (projected) of the largest sub-polygon. */
function largestPolygonRings(geometry: Geometry, project: Projection): Ring[] | null {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => projectRing(ring, project));
  }
  if (geometry.type === 'MultiPolygon') {
    let best: Ring[] | null = null;
    let bestArea = -Infinity;
    for (const polygon of geometry.coordinates) {
      const rings = polygon.map((ring) => projectRing(ring, project));
      const area = rings.length ? ringArea(rings[0]) : 0;
      if (area > bestArea) {
        bestArea = area;
        best = rings;
      }
    }
    return best;
  }
  return null;
}

export interface PoleResult {
  x: number;
  y: number;
  area: number;
}

/** Finds the pole of inaccessibility (best interior point for a label) in projected (screen) space. */
export function findLabelPoint(geometry: Geometry, project: Projection): PoleResult | null {
  const rings = largestPolygonRings(geometry, project);
  if (!rings || rings.length === 0 || rings[0].length < 3) return null;
  const result = polylabel(rings, 0.5);
  return { x: result[0], y: result[1], area: ringArea(rings[0]) };
}

export function featureLabel(
  properties: GeoJsonProperties,
  nameField: string | null,
  capField: string | null,
): { name: string; cap: string } {
  const props = (properties ?? {}) as Record<string, unknown>;
  const name = nameField && props[nameField] != null ? String(props[nameField]) : '';
  const cap = capField && props[capField] != null ? String(props[capField]) : '';
  return { name, cap };
}
