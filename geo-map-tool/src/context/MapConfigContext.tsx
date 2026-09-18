import { createContext, useContext, useState, type ReactNode } from 'react';

interface MapConfigValue {
  capField: string | null;
  setCapField: (field: string | null) => void;
  title: string;
  setTitle: (title: string) => void;
}

const MapConfigContext = createContext<MapConfigValue | null>(null);

export function MapConfigProvider({ children }: { children: ReactNode }) {
  const [capField, setCapField] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  return (
    <MapConfigContext.Provider value={{ capField, setCapField, title, setTitle }}>
      {children}
    </MapConfigContext.Provider>
  );
}

export function useMapConfig() {
  const ctx = useContext(MapConfigContext);
  if (!ctx) throw new Error('useMapConfig must be used within MapConfigProvider');
  return ctx;
}
