import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { fetchCities, type City } from '@/api/shop';

interface CityContextValue {
  city: City | null;
  setCity: (c: City) => void;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  ready: boolean;
}

const CityCtx = createContext<CityContextValue | null>(null);
const STORAGE_KEY = 'razpc_city_v1';

function loadStored(): City | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as City) : null;
  } catch {
    return null;
  }
}

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCityState] = useState<City | null>(loadStored);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const setCity = useCallback((c: City) => {
    setCityState(c);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* ignore */ }
    setPickerOpen(false);
  }, []);

  // Avtoopredelenie goroda pri pervom vhode
  useEffect(() => {
    if (city) { setReady(true); return; }
    let cancelled = false;
    (async () => {
      let detectedName: string | null = null;
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          detectedName = data.city || null;
        }
      } catch { /* ignore */ }

      try {
        const cities = await fetchCities();
        if (cancelled) return;
        const match = detectedName
          ? cities.find((c) => c.name.toLowerCase() === detectedName!.toLowerCase())
          : null;
        if (match) {
          setCity(match);
        } else {
          setPickerOpen(true);
        }
      } catch { /* ignore */ }
      finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CityCtx.Provider value={{
      city, setCity, pickerOpen, ready,
      openPicker: () => setPickerOpen(true),
      closePicker: () => setPickerOpen(false),
    }}>
      {children}
    </CityCtx.Provider>
  );
};

export function useCity(): CityContextValue {
  const ctx = useContext(CityCtx);
  if (!ctx) throw new Error('useCity must be used within CityProvider');
  return ctx;
}
