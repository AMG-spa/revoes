import type { FeatureCollection, Geometry } from 'geojson';

export type GeoProperties = Record<string, string | number | boolean | null>;

export type GeoFeatureCollection = FeatureCollection<Geometry, GeoProperties>;

/** Property injected into each feature once a name lookup table has been joined. */
export const NAME_JOIN_PROPERTY = 'NOMBRE_JOIN';

/** A3 sheet. The long/short sides are assigned to width/height at render time based on the region's shape. */
export const A3_LONG_MM = 420;
export const A3_SHORT_MM = 297;

export const MARGIN_MM = 10;
export const HEADER_HEIGHT_MM = 50;
/** Horizontal band below the map reserved for the numbered legend. */
export const LEGEND_BAND_HEIGHT_MM = 52;

/** Single uniform label size (mm) for every municipality — matching the reference map's tiny, even lettering. */
export const LABEL_FONT_MM = 1;
