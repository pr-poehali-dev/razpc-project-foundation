import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { BrandBackdrop, LeadForm } from '@/components/shared';
import { useCart } from '@/context/CartContext';
import { useCity } from '@/context/CityContext';
import {
  calcDelivery, fetchPvz, formatPrice as fmt,
  type DeliveryOption, type PickupPoint, type DeliveryItem,
} from '@/api/shop';

const formatPrice = fmt;

const Cart = () => {
  const { items, total, count, removeItem, setQty, clear } = useCart();
  const { city, openPicker } = useCity();
  const [checkout, setCheckout] = useState(false);

  const [options, setOptions] = useState<DeliveryOption[] | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [method, setMethod] = useState<string>('');
  const [pvzList, setPvzList] = useState<PickupPoint[]>([]);
  const [pvzId, setPvzId] = useState<number | null>(null);
  const [address, setAddress] = useState('');

  const deliveryItems: DeliveryItem[] = useMemo(
    () => items.map((i) => ({
      weight_g: i.weight_g || 3000, length_mm: i.length_mm || 300,
      width_mm: i.width_mm || 200, height_mm: i.height_mm || 100, qty: i.qty,
    })),
    [items],
  );

  useEffect(() => {
    if (!city || items.length === 0) { setOptions(null); return; }
    setLoadingDelivery(true);
    calcDelivery(city.id, deliveryItems)
      .then((r) => { setOptions(r.options); setMethod((m) => m || r.options[0]?.code || ''); })
      .catch(() => setOptions(null))
      .finally(() => setLoadingDelivery(false));
  }, [city, deliveryItems, items.length]);

  useEffect(() => {
    if (method === 'pvz' && city) {
      fetchPvz(city.id).then(setPvzList).catch(() => setPvzList([]));
    }
  }, [method, city]);

  const selectedOption = options?.find((o) => o.code === method) || null;
  const deliveryCost = selectedOption?.price || 0;
  const grandTotal = total + deliveryCost;

  const buildCheckoutMessage = () => {
    const parts: string[] = [];
    if (city) parts.push(`Город: ${city.name}`);
    if (selectedOption) {
      parts.push(`Доставка: ${selectedOption.name} — ${formatPrice(selectedOption.price)}`);
      if (method === 'pvz' && pvzId) {
        const p = pvzList.find((x) => x.id === pvzId);
        if (p) parts.push(`ПВЗ: ${p.address}`);
      }
      if (method === 'courier' && address) parts.push(`Адрес: ${address}`);
    }
    parts.push(`Товары: ${formatPrice(total)}`);
    parts.push(`Итого с доставкой: ${formatPrice(grandTotal)}`);
    return parts.join('\n');
  };

  if (items.length === 0) {
    return (
      <section className="relative overflow-hidden py-20">
        <BrandBackdrop smokeOpacity={0.3} />
        <div className="container-page relative">
          <div className="mx-auto max-w-md rounded-2xl border border-border/80 bg-card p-10 text-center shadow-sm-premium">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Icon name="ShoppingCart" size={30} className="text-muted-foreground" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Корзина пуста</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Выберите готовый ПК, комплектующие или соберите свою конфигурацию — мы поможем собрать идеальный компьютер.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild><Link to="/catalog"><Icon name="LayoutGrid" size={16} className="mr-1.5" /> В каталог</Link></Button>
              <Button asChild variant="outline"><Link to="/configurator"><Icon name="Cpu" size={16} className="mr-1.5" /> Собрать ПК</Link></Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-10 md:py-14">
      <BrandBackdrop smokeOpacity={0.25} />
      <div className="container-page relative">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold md:text-4xl">Ваш заказ</h1>
            <p className="mt-1 text-muted-foreground">{count} {count === 1 ? 'позиция' : 'позиции'} в корзине</p>
          </div>
          <button onClick={clear} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive">
            <Icon name="Trash2" size={15} /> Очистить
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Позиции + доставка */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm-premium transition-colors hover:border-primary/30">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                      <Icon name={item.kind === 'config' ? 'Cpu' : item.kind === 'build' ? 'Package' : 'Box'} size={30} />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {item.kind === 'config' && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Сборка</span>}
                        {item.kind === 'build' && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Готовый ПК</span>}
                        <h3 className="truncate font-heading text-base font-semibold">{item.name}</h3>
                      </div>
                      {item.description && <p className="mt-0.5 truncate text-sm text-muted-foreground">{item.description}</p>}
                      {item.components && item.components.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          {item.components.map((c, i) => (
                            <li key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Icon name="Check" size={12} className="text-primary" />{c.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.id)} aria-label="Удалить"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div className="flex items-center rounded-lg border border-border">
                      <button onClick={() => setQty(item.id, item.qty - 1)} disabled={item.qty <= 1} aria-label="Меньше"
                        className="flex h-8 w-8 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40">
                        <Icon name="Minus" size={14} />
                      </button>
                      <span className="w-9 text-center text-sm font-medium">{item.qty}</span>
                      <button onClick={() => setQty(item.id, item.qty + 1)} aria-label="Больше"
                        className="flex h-8 w-8 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-secondary">
                        <Icon name="Plus" size={14} />
                      </button>
                    </div>
                    <span className="font-heading text-lg font-bold">{formatPrice(item.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Способ доставки */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm-premium">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                  <Icon name="Truck" size={18} className="text-primary" /> Доставка
                </h2>
                <button onClick={openPicker} className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <Icon name="MapPin" size={14} /> {city?.name || 'Выбрать город'}
                </button>
              </div>

              {!city ? (
                <button onClick={openPicker} className="text-sm text-primary hover:underline">Выберите город для расчёта доставки</button>
              ) : loadingDelivery ? (
                <div className="flex justify-center py-4"><Spinner size="sm" /></div>
              ) : options ? (
                <div className="space-y-2">
                  {options.map((o) => (
                    <label key={o.code}
                      className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors',
                        method === o.code ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
                      <input type="radio" name="delivery" checked={method === o.code} onChange={() => setMethod(o.code)} className="accent-primary" />
                      <Icon name={o.icon} size={18} className="text-primary" fallback="Truck" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{o.name}</p>
                        <p className="text-xs text-muted-foreground">{o.days.min}–{o.days.max} дн.</p>
                      </div>
                      <span className="font-semibold">{formatPrice(o.price)}</span>
                    </label>
                  ))}

                  {method === 'pvz' && (
                    <div className="mt-2 max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2">
                      {pvzList.length === 0 ? (
                        <p className="py-3 text-center text-sm text-muted-foreground">Загрузка пунктов выдачи…</p>
                      ) : pvzList.map((p) => (
                        <button key={p.id} onClick={() => setPvzId(p.id)}
                          className={cn('flex w-full items-start gap-2 rounded-lg p-2 text-left text-sm transition-colors',
                            pvzId === p.id ? 'bg-primary/10' : 'hover:bg-secondary')}>
                          <Icon name={pvzId === p.id ? 'CircleCheck' : 'MapPin'} size={15} className={cn('mt-0.5 shrink-0', pvzId === p.id ? 'text-primary' : 'text-muted-foreground')} />
                          <span>
                            <span className="block font-medium">{p.address}</span>
                            {p.work_hours && <span className="text-xs text-muted-foreground">{p.work_hours}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {method === 'courier' && (
                    <div className="mt-2">
                      <Input placeholder="Улица, дом, квартира" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Не удалось рассчитать доставку</p>
              )}
            </div>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/catalog"><Icon name="ArrowLeft" size={16} className="mr-1.5" /> Продолжить покупки</Link>
            </Button>
          </div>

          {/* Итог */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm-premium">
              <h2 className="font-heading text-lg font-semibold">Итого</h2>
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товары ({count})</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  <span className="font-medium">{city && selectedOption ? formatPrice(deliveryCost) : '—'}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">К оплате</span>
                <span className="font-heading text-2xl font-bold text-primary">{formatPrice(grandTotal)}</span>
              </div>

              <Button size="lg" className="mt-5 w-full" onClick={() => setCheckout(true)}>
                <Icon name="Send" size={17} className="mr-1.5" /> Оформить заказ
              </Button>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p className="flex items-start gap-2"><Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0 text-primary" /> Гарантия на все товары и сборки</p>
                <p className="flex items-start gap-2"><Icon name="Headphones" size={14} className="mt-0.5 shrink-0 text-primary" /> Менеджер подтвердит заказ</p>
                <p className="flex items-start gap-2"><Icon name="Package" size={14} className="mt-0.5 shrink-0 text-primary" /> Проверка перед отправкой</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LeadForm
        open={checkout}
        onClose={() => setCheckout(false)}
        title="Оформление заказа"
        description="Оставьте контакты — менеджер свяжется с вами для подтверждения заказа и оплаты."
        source="site_cart"
        cartLines={items.map((i) => ({ name: i.name, qty: i.qty, price: i.price }))}
        cartTotal={grandTotal}
        presetMessage={buildCheckoutMessage()}
        onSuccess={clear}
        successText="Спасибо! Мы получили ваш заказ и свяжемся с вами для подтверждения деталей."
      />
    </section>
  );
};

export default Cart;
