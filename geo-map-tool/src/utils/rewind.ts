import type { GeoFeatureCollection } from '../types/geo';

type Ring = number[][];

/** Signed area under the standard (x right, y up) convention: positive = counter-clockwise. */
function signedArea(ring: Ring): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

function rewindRing(ring: Ring, clockwise: boolean): Ring {
  const isClockwise = signedArea(ring) < 0;
  return isClockwise === clockwise ? ring : ring.slice().reverse();
}

/**
 * d3-geo's planar clip algorithm expects exterior rings wound clockwise (and holes
 * counter-clockwise) in lon/lat space — the opposite of the RFC 7946 convention many
 * GIS export tools (QGIS, geojson.io, turf) now follow. Uploaded files with "correct"
 * RFC 7946 winding render as an inverted giant frame instead of the actual shape, so we
 * normalize every ring here regardless of the source convention.
 */
export function rewindGeoJson(fc: GeoFeatureCollection): GeoFeatureCollection {
  for (const feature of fc.features) {
    const geometry = feature.geometry;
    if (geometry.type === 'Polygon') {
      geometry.coordinates = geometry.coordinates.map((ring, i) =>
        rewindRing(ring as Ring, i === 0) as typeof ring,
      );
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates = geometry.coordinates.map((polygon) =>
        polygon.map((ring, i) => rewindRing(ring as Ring, i === 0) as typeof ring),
      );
    }
  }
  return fc;
}
