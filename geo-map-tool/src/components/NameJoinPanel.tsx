import { useState, type DragEvent } from 'react';
import { Link2 } from 'lucide-react';
import { useGeoJson } from '../hooks/useGeoJson';
import { useMapConfig } from '../context/MapConfigContext';
import { parseLookupFile, buildLookupMap } from '../utils/lookupTable';
import { NAME_JOIN_PROPERTY } from '../types/geo';

function guessColumn(headers: string[], patterns: RegExp[], fallbackIndex: number): string {
  for (const pattern of patterns) {
    const found = headers.find((h) => pattern.test(h));
    if (found) return found;
  }
  return headers[fallbackIndex] ?? '';
}

export function NameJoinPanel() {
  const { geoJson, applyNameJoin } = useGeoJson();
  const { capField } = useMapConfig();

  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ matched: number; total: number } | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || !geoJson) return;
    if (!capField) {
      setError('Seleziona prima il campo CAP nel GeoJSON qui sopra.');
      return;
    }
    setIsParsing(true);
    setError(null);
    setResult(null);
    try {
      const table = await parseLookupFile(file);
      if (table.headers.length === 0) throw new Error('Nessuna colonna trovata nel file.');

      const keyCol = guessColumn(table.headers, [/cap/i, /postal/i, /ine/i, /cod/i], 0);
      const nameCol = guessColumn(table.headers, [/comune/i, /nombre/i, /^name$/i, /municipio/i], 1);
      const keyIdx = table.headers.indexOf(keyCol);
      const nameIdx = table.headers.indexOf(nameCol);
      const map = buildLookupMap(table, keyIdx, nameIdx);

      const res = applyNameJoin(capField, map, NAME_JOIN_PROPERTY);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'File non leggibile.');
    } finally {
      setIsParsing(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          isDragging ? 'border-zinc-900 bg-zinc-100' : 'border-zinc-300 bg-white hover:border-zinc-400'
        }`}
      >
        <Link2 className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
        <span className="text-xs font-medium text-zinc-600">
          {result ? 'Sostituisci tabella nomi' : 'Trascina qui l’Excel dei nomi o clicca (CSV/XLSX)'}
        </span>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </label>

      {isParsing && <p className="text-xs text-zinc-500">Lettura e abbinamento in corso…</p>}
      {error && <p className="text-xs text-red-600">Errore: {error}</p>}
      {result && (
        <p className={`text-xs ${result.matched === result.total ? 'text-emerald-600' : 'text-amber-600'}`}>
          {result.matched} / {result.total} comuni abbinati
        </p>
      )}
    </div>
  );
}
