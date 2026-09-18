import { useState, type RefObject } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { useGeoJson } from '../hooks/useGeoJson';
import { exportPdf } from '../utils/export';
import type { MapCanvasHandle } from './MapCanvas';

interface ControlPanelProps {
  mapCanvasRef: RefObject<MapCanvasHandle | null>;
}

export function ControlPanel({ mapCanvasRef }: ControlPanelProps) {
  const { geoJson } = useGeoJson();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    const svg = mapCanvasRef.current?.getSvgElement();
    if (!svg) return;
    // The chosen orientation lives on the SVG's own width/height attributes.
    const widthMm = Number(svg.getAttribute('width'));
    const heightMm = Number(svg.getAttribute('height'));
    setIsExportingPdf(true);
    try {
      await exportPdf(svg, widthMm, heightMm, 'mappa.pdf');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <button
      onClick={handleExportPdf}
      disabled={!geoJson || isExportingPdf}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {isExportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      Crea A3
    </button>
  );
}
