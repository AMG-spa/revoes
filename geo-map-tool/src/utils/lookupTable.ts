import { readSheet } from 'read-excel-file/browser';
import { toTitleCase } from './text';

export interface LookupTable {
  headers: string[];
  rows: string[][];
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',' || char === ';') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

export async function parseLookupFile(file: File): Promise<LookupTable> {
  const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv';

  let data: string[][];
  if (isCsv) {
    data = parseCsv(await file.text());
  } else {
    const sheetRows = await readSheet(file);
    data = sheetRows.map((row) =>
      row.map((cell) => {
        if (cell == null) return '';
        if (cell instanceof Date) return cell.toISOString().slice(0, 10);
        return String(cell).trim();
      }),
    );
  }

  if (data.length === 0) return { headers: [], rows: [] };
  const [headerRow, ...rest] = data;
  return { headers: headerRow.map((h) => h.trim()), rows: rest };
}

/** Postal/INE codes are frequently stored as numbers, losing any leading zero — restore it. */
export function normalizeJoinKey(value: string): string {
  const trimmed = value.trim();
  return /^\d{1,5}$/.test(trimmed) ? trimmed.padStart(5, '0') : trimmed;
}

export function buildLookupMap(table: LookupTable, keyColIndex: number, nameColIndex: number): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of table.rows) {
    const key = normalizeJoinKey(row[keyColIndex] ?? '');
    const name = (row[nameColIndex] ?? '').trim();
    // Source tables are typically ALL CAPS — normalize to "Puente de la Reina" style.
    if (key && name) map.set(key, toTitleCase(name));
  }
  return map;
}
