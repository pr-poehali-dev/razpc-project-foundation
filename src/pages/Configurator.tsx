import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, BrandBackdrop } from '@/components/shared';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { useConfig } from '@/context/ConfigContext';
import {
  slots, type AnyPart, type SlotDef, type CpuPart, type MotherboardPart,
  type GpuPart, type RamPart, type StoragePart, type PsuPart, type CoolerPart, type CasePart,
} from '@/config/pcParts';
import {
  type BuildState, partsCost, assemblyCost, isBuildComplete, isBuildCompatible,
} from '@/lib/pcCompat';
import ProgressSidebar from '@/components/configurator/ProgressSidebar';
import SlotBlock, { type SlotEntry } from '@/components/configurator/SlotBlock';
import BuildSummary from '@/components/configurator/BuildSummary';
import PartPickerDialog from '@/components/configurator/PartPickerDialog';

const Configurator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { build, setBuild, reset } = useConfig();
  const [pickerSlot, setPickerSlot] = useState<SlotDef | null>(null);

  const filled: Record<string, boolean> = {
    cpu: !!build.cpu, motherboard: !!build.motherboard, gpu: !!build.gpu,
    ram: !!build.ram, storage: build.storage.length > 0, psu: !!build.psu,
    cooler: !!build.cooler, case: !!build.case, fan: build.fan.length > 0,
  };

  // Следующий незаполненный обязательный слот — подсвечиваем
  const nextSlot = useMemo(() => {
    const s = slots.find((sl) => sl.required && !filled[sl.category]);
    return s?.category ?? null;
  }, [filled]);

  const entriesFor = (slot: SlotDef): SlotEntry[] => {
    switch (slot.category) {
      case 'cpu': return build.cpu ? [{ part: build.cpu }] : [];
      case 'motherboard': return build.motherboard ? [{ part: build.motherboard }] : [];
      case 'gpu': return build.gpu ? [{ part: build.gpu }] : [];
      case 'ram': return build.ram ? [{ part: build.ram }] : [];
      case 'psu': return build.psu ? [{ part: build.psu }] : [];
      case 'cooler': return build.cooler ? [{ part: build.cooler }] : [];
      case 'case': return build.case ? [{ part: build.case }] : [];
      case 'storage': return build.storage.map((p) => ({ part: p }));
      case 'fan': return build.fan.map((f) => ({ part: f.part, qty: f.qty }));
      default: return [];
    }
  };

  const setPart = (part: AnyPart) => {
    setBuild((prev) => {
      const next: BuildState = { ...prev, storage: [...prev.storage], fan: [...prev.fan] };
      switch (part.category) {
        case 'cpu': next.cpu = part as CpuPart; break;
        case 'motherboard': next.motherboard = part as MotherboardPart; break;
        case 'gpu': next.gpu = part as GpuPart; break;
        case 'ram': next.ram = part as RamPart; break;
        case 'psu': next.psu = part as PsuPart; break;
        case 'cooler': next.cooler = part as CoolerPart; break;
        case 'case': next.case = part as CasePart; break;
        case 'storage': next.storage = [...prev.storage, part as StoragePart]; break;
        case 'fan': {
          const existing = prev.fan.find((f) => f.part.id === part.id);
          next.fan = existing
            ? prev.fan.map((f) => (f.part.id === part.id ? { ...f, qty: f.qty + 1 } : f))
            : [...prev.fan, { part, qty: 1 }];
          break;
        }
      }
      return next;
    });
  };

  const removePart = (part: AnyPart) => {
    setBuild((prev) => {
      const next: BuildState = { ...prev, storage: [...prev.storage], fan: [...prev.fan] };
      switch (part.category) {
        case 'cpu': next.cpu = undefined; break;
        case 'motherboard': next.motherboard = undefined; break;
        case 'gpu': next.gpu = undefined; break;
        case 'ram': next.ram = undefined; break;
        case 'psu': next.psu = undefined; break;
        case 'cooler': next.cooler = undefined; break;
        case 'case': next.case = undefined; break;
        case 'storage': next.storage = prev.storage.filter((s) => s.id !== part.id); break;
        case 'fan': next.fan = prev.fan.filter((f) => f.part.id !== part.id); break;
      }
      return next;
    });
  };

  const setFanQty = (part: AnyPart, qty: number) => {
    if (qty < 1) return;
    setBuild((prev) => ({ ...prev, fan: prev.fan.map((f) => (f.part.id === part.id ? { ...f, qty } : f)) }));
  };

  const navigateTo = (category: string) => {
    document.getElementById(`slot-${category}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const addToCart = () => {
    if (!isBuildComplete(build) || !isBuildCompatible(build)) return;
    const parts = partsCost(build);
    const total = parts + assemblyCost(parts);
    const components: { type: string; name: string }[] = [];
    slots.forEach((slot) => {
      entriesFor(slot).forEach((e) => {
        components.push({ type: slot.title, name: `${e.part.brand} ${e.part.name}${e.qty && e.qty > 1 ? ` ×${e.qty}` : ''}` });
      });
    });
    addItem({
      kind: 'config',
      name: 'Индивидуальная сборка',
      description: `${components.length} комплектующих · профессиональная сборка`,
      price: total,
      components,
      weight_g: 9000, length_mm: 500, width_mm: 250, height_mm: 500,
    });
    toast({ title: 'Сборка добавлена в корзину', description: `Готовый ПК на сумму ${total.toLocaleString('ru-RU')} ₽` });
    reset();
    navigate('/cart');
  };

  return (
    <>
      <PageHeader
        icon="Cpu"
        eyebrow="Конфигуратор"
        title="Соберите свой компьютер"
        description="Выбирайте комплектующие шаг за шагом — мы автоматически проверяем совместимость, считаем мощность, срок и стоимость. Готовый ПК собирается на ваших глазах."
      />
      <section className="relative overflow-hidden py-10 pb-24 lg:pb-10">
        <BrandBackdrop smokeOpacity={0.2} />
        <div className="container-page relative grid gap-6 lg:grid-cols-[230px_1fr_360px]">
          {/* Левая колонка — прогресс */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <ProgressSidebar slots={slots} filled={filled} activeCategory={nextSlot} onNavigate={navigateTo} />
            </div>
          </aside>

          {/* Центральная колонка — слоты */}
          <div className="space-y-4">
            {slots.map((slot) => (
              <SlotBlock
                key={slot.category}
                slot={slot}
                entries={entriesFor(slot)}
                highlight={nextSlot === slot.category}
                onOpen={() => setPickerSlot(slot)}
                onReplace={() => setPickerSlot(slot)}
                onRemove={removePart}
                onQty={slot.category === 'fan' ? setFanQty : undefined}
              />
            ))}
          </div>

          {/* Правая колонка — итоговая сборка */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <BuildSummary build={build} onAddToCart={addToCart} />
            </div>
          </aside>
        </div>
      </section>

      <PartPickerDialog
        open={!!pickerSlot}
        slot={pickerSlot}
        build={build}
        onClose={() => setPickerSlot(null)}
        onPick={(part) => {
          setPart(part);
          // Автопереход к следующему незаполненному обязательному слоту
          const pickedIndex = slots.findIndex((sl) => sl.category === part.category);
          const nextFilled = { ...filled, [part.category]: true };
          const after = slots.find((sl, i) => i > pickedIndex && sl.required && !nextFilled[sl.category])
            ?? slots.find((sl) => sl.required && !nextFilled[sl.category]);
          if (after) {
            setTimeout(() => {
              document.getElementById(`slot-${after.category}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
          }
        }}
      />

      {/* Мобильная плавающая кнопка */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <button
          onClick={addToCart}
          disabled={!isBuildComplete(build) || !isBuildCompatible(build)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Icon name="ShoppingCart" size={17} />
          {(() => { const p = partsCost(build); return p ? `Добавить · ${(p + assemblyCost(p)).toLocaleString('ru-RU')} ₽` : 'Соберите компьютер'; })()}
        </button>
      </div>
    </>
  );
};

export default Configurator;