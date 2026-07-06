import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Spinner } from '@/components/ui';
import { useCity } from '@/context/CityContext';
import { calcDelivery, formatPrice, plural, type DeliveryItem, type DeliveryOption } from '@/api/shop';

interface Props {
  items: DeliveryItem[];
  extraDays?: number; // srok postavki/sborki dobavlyaetsya k srokam dostavki
  compact?: boolean;
}

const daysLabel = (min: number, max: number, extra: number) => {
  const a = min + extra;
  const b = max + extra;
  const d = a === b ? `${a}` : `${a}–${b}`;
  return `${d} ${plural(b, 'день', 'дня', 'дней')}`;
};

const DeliveryBlock = ({ items, extraDays = 0, compact }: Props) => {
  const { city, openPicker } = useCity();
  const [options, setOptions] = useState<DeliveryOption[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city || items.length === 0) { setOptions(null); return; }
    setLoading(true);
    calcDelivery(city.id, items)
      .then((r) => setOptions(r.options))
      .catch(() => setOptions(null))
      .finally(() => setLoading(false));
  }, [city, items]);

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Icon name="Truck" size={15} className="text-primary" /> Доставка в
          <button onClick={openPicker} className="text-primary hover:underline">
            {city?.name || 'ваш город'}
          </button>
        </span>
      </div>

      {!city ? (
        <button onClick={openPicker} className="text-sm text-primary hover:underline">Выберите город для расчёта</button>
      ) : loading ? (
        <div className="flex justify-center py-3"><Spinner size="sm" /></div>
      ) : options ? (
        <div className={compact ? 'space-y-2' : 'space-y-2.5'}>
          {options.map((o) => (
            <div key={o.code} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Icon name={o.icon} size={15} className="text-primary" fallback="Truck" /> {o.name}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-muted-foreground">{daysLabel(o.days.min, o.days.max, extraDays)}</span>
                <span className="font-semibold">{formatPrice(o.price)}</span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Не удалось рассчитать доставку</p>
      )}
    </div>
  );
};

export default DeliveryBlock;
