import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GeoFeatureCollection, GeoProperties } from '../types/geo';
import { rewindGeoJson } from '../utils/rewind';
import { normalizeJoinKey } from '../utils/lookupTable';

const GEOJSON_QUERY_KEY = ['geojson'] as const;

async function readFileAsGeoJson(file: File): Promise<GeoFeatureCollection> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  let fc: GeoFeatureCollection;
  if (parsed.type === 'FeatureCollection') {
    fc = parsed as GeoFeatureCollection;
  } else if (parsed.type === 'Feature') {
    fc = { type: 'FeatureCollection', features: [parsed] } as GeoFeatureCollection;
  } else if (parsed.type) {
    // Bare geometry — wrap it as a single feature.
    fc = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: parsed, properties: {} }],
    } as GeoFeatureCollection;
  } else {
    throw new Error('Il file non è un GeoJSON valido (manca il campo "type").');
  }

  return rewindGeoJson(fc);
}

function extractPropertyKeys(fc: GeoFeatureCollection): string[] {
  const keys = new Set<string>();
  for (const feature of fc.features) {
    if (feature.properties) {
      for (const key of Object.keys(feature.properties as GeoProperties)) {
        keys.add(key);
      }
    }
  }
  return Array.from(keys).sort();
}

export function useGeoJson() {
  const queryClient = useQueryClient();

  const { data: geoJson, error: loadError } = useQuery({
    queryKey: GEOJSON_QUERY_KEY,
    queryFn: () => Promise.resolve(null as GeoFeatureCollection | null),
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const uploadMutation = useMutation({
    mutationFn: readFileAsGeoJson,
    onSuccess: (data) => {
      queryClient.setQueryData(GEOJSON_QUERY_KEY, data);
    },
  });

  const clear = () => {
    queryClient.setQueryData(GEOJSON_QUERY_KEY, null);
    uploadMutation.reset();
  };

  /** Joins an external lookup table (e.g. CAP → Comune) into the loaded GeoJSON's properties. */
  const applyNameJoin = (
    geoJoinField: string,
    lookupMap: Map<string, string>,
    targetProperty: string,
  ): { matched: number; total: number } => {
    const current = queryClient.getQueryData<GeoFeatureCollection>(GEOJSON_QUERY_KEY);
    if (!current) return { matched: 0, total: 0 };

    let matched = 0;
    const updated: GeoFeatureCollection = {
      ...current,
      features: current.features.map((feature) => {
        const raw = feature.properties ? (feature.properties as GeoProperties)[geoJoinField] : null;
        const key = normalizeJoinKey(raw == null ? '' : String(raw));
        const name = lookupMap.get(key) ?? null;
        if (name) matched++;
        return {
          ...feature,
          properties: { ...(feature.properties ?? {}), [targetProperty]: name },
        };
      }),
    };
    queryClient.setQueryData(GEOJSON_QUERY_KEY, updated);
    return { matched, total: current.features.length };
  };

  const propertyKeys = geoJson ? extractPropertyKeys(geoJson) : [];

  return {
    geoJson,
    propertyKeys,
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error ?? loadError,
    clear,
    applyNameJoin,
  };
}
