import { useRef } from 'react';
import { MapPinned } from 'lucide-react';
import { MapConfigProvider } from './context/MapConfigContext';
import { FileUploader } from './components/FileUploader';
import { NameJoinPanel } from './components/NameJoinPanel';
import { ControlPanel } from './components/ControlPanel';
import { MapCanvas, type MapCanvasHandle } from './components/MapCanvas';
import { useGeoJson } from './hooks/useGeoJson';

function App() {
  const mapCanvasRef = useRef<MapCanvasHandle>(null);
  const { geoJson } = useGeoJson();

  return (
    <MapConfigProvider>
      <div className="flex min-h-screen w-screen items-center justify-center bg-zinc-100 p-6">
        <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-zinc-700" />
            <h1 className="text-sm font-semibold tracking-tight text-zinc-800">GeoJSON Map Printer</h1>
          </div>

          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">1 · File GeoJSON</h2>
            <FileUploader />
          </section>

          <section className={geoJson ? '' : 'pointer-events-none opacity-40'}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">2 · Excel nomi comuni</h2>
            <NameJoinPanel />
          </section>

          <ControlPanel mapCanvasRef={mapCanvasRef} />
        </div>

        {/* Off-screen A3 sheet, serialized on export. */}
        <MapCanvas ref={mapCanvasRef} />
      </div>
    </MapConfigProvider>
  );
}

export default App;
