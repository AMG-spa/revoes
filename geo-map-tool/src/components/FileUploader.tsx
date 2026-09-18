import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, FileJson, X } from 'lucide-react';
import { useGeoJson } from '../hooks/useGeoJson';
import { useMapConfig } from '../context/MapConfigContext';

const CAP_GUESSES = ['cod_postal', 'codigo_postal', 'cap', 'zip', 'postcode', 'postal'];

function guessField(keys: string[], guesses: string[]): string | null {
  for (const guess of guesses) {
    const found = keys.find((k) => k.toLowerCase().includes(guess));
    if (found) return found;
  }
  return null;
}

/** "geo_HUESCA.geojson" → "HUESCA" — big uppercase header, reference-style. */
function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.(geo)?json$/i, '')
    .replace(/^geo[_-]/i, '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toUpperCase();
}

export function FileUploader() {
  const { geoJson, propertyKeys, uploadFile, isUploading, uploadError, clear } = useGeoJson();
  const { capField, setCapField, setTitle } = useMapConfig();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      uploadFile(file, {
        onSuccess: (data) => {
          const keys = new Set<string>();
          for (const f of data.features) {
            if (f.properties) Object.keys(f.properties).forEach((k) => keys.add(k));
          }
          setCapField(guessField(Array.from(keys), CAP_GUESSES));
          setTitle(titleFromFilename(file.name));
        },
      });
    },
    [uploadFile, setCapField, setTitle],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      {!geoJson ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging ? 'border-zinc-900 bg-zinc-100' : 'border-zinc-300 bg-white hover:border-zinc-400'
          }`}
        >
          <UploadCloud className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
          <p className="text-sm font-medium text-zinc-700">
            Trascina qui un file GeoJSON o clicca per selezionarlo
          </p>
          <p className="text-xs text-zinc-400">.geojson / .json</p>
          <input
            ref={inputRef}
            type="file"
            accept=".geojson,.json,application/geo+json,application/json"
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3">
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <FileJson className="h-4 w-4 text-zinc-500" />
            <span>{geoJson.features.length} feature caricate</span>
          </div>
          <button
            onClick={clear}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            title="Rimuovi file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isUploading && <p className="text-xs text-zinc-500">Caricamento in corso…</p>}
      {uploadError && (
        <p className="text-xs text-red-600">
          Errore: {uploadError instanceof Error ? uploadError.message : 'file non valido'}
        </p>
      )}

      {geoJson && propertyKeys.length > 0 && (
        <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
          Campo CAP
          <select
            className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-800"
            value={capField ?? ''}
            onChange={(e) => setCapField(e.target.value || null)}
          >
            <option value="">—</option>
            {propertyKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
