import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  type AnyPart, type PartCategory,
} from '@/config/pcParts';
import { type BuildState, emptyBuild } from '@/lib/pcCompat';
import { type Product } from '@/api/shop';

interface ConfigContextValue {
  build: BuildState;
  setBuild: (b: BuildState | ((prev: BuildState) => BuildState)) => void;
  addPart: (part: AnyPart) => void;
  hasActive: boolean;
  reset: () => void;
}

const ConfigCtx = createContext<ConfigContextValue | null>(null);
const STORAGE_KEY = 'razpc_config_v1';

function load(): BuildState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyBuild, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return emptyBuild;
}

/** Konvertiruet tovar iz kataloga (DB) v AnyPart dlya konfiguratora, ispolzuya compat-polya. */
export function productToPart(product: Product): AnyPart | null {
  const slot = product.config_slot as PartCategory | null;
  if (!slot) return null;
  const c = product.compat || {};
  const base = {
    id: product.slug,
    brand: product.brand,
    name: product.name,
    price: product.price,
    image: product.image_url || undefined,
    warrantyMonths: product.warranty_months,
    condition: product.condition,
    leadDays: product.lead_days,
    shortSpecs: product.short_specs || [],
  };
  return { ...base, category: slot, ...c } as unknown as AnyPart;
}

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [build, setBuildState] = useState<BuildState>(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(build)); } catch { /* ignore */ }
  }, [build]);

  const setBuild = useCallback<ConfigContextValue['setBuild']>((b) => {
    setBuildState((prev) => (typeof b === 'function' ? (b as (p: BuildState) => BuildState)(prev) : b));
  }, []);

  const addPart = useCallback((part: AnyPart) => {
    setBuildState((prev) => {
      const next: BuildState = { ...prev, storage: [...prev.storage], fan: [...prev.fan] };
      switch (part.category) {
        case 'cpu': next.cpu = part as never; break;
        case 'motherboard': next.motherboard = part as never; break;
        case 'gpu': next.gpu = part as never; break;
        case 'ram': next.ram = part as never; break;
        case 'psu': next.psu = part as never; break;
        case 'cooler': next.cooler = part as never; break;
        case 'case': next.case = part as never; break;
        case 'storage':
          if (!prev.storage.some((s) => s.id === part.id)) next.storage = [...prev.storage, part as never];
          break;
        case 'fan': {
          const ex = prev.fan.find((f) => f.part.id === part.id);
          next.fan = ex
            ? prev.fan.map((f) => (f.part.id === part.id ? { ...f, qty: f.qty + 1 } : f))
            : [...prev.fan, { part, qty: 1 }];
          break;
        }
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => setBuildState(emptyBuild), []);

  const hasActive = !!(build.cpu || build.motherboard || build.gpu || build.ram
    || build.storage.length || build.psu || build.cooler || build.case || build.fan.length);

  return (
    <ConfigCtx.Provider value={{ build, setBuild, addPart, hasActive, reset }}>
      {children}
    </ConfigCtx.Provider>
  );
};

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigCtx);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
