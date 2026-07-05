import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, BrandBackdrop } from '@/components/shared';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { configSlots, type ComponentOption } from '@/config/configurator';

const formatPrice = (v: number) => Math.round(v || 0).toLocaleString('ru-RU') + ' ₽';

const Configurator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, ComponentOption>>({});

  const requiredSlots = configSlots.filter((s) => s.required);
  const filledRequired = requiredSlots.filter((s) => selected[s.type]).length;
  const isComplete = filledRequired === requiredSlots.length;
  const progress = Math.round((filledRequired / requiredSlots.length) * 100);

  const total = useMemo(
    () => Object.values(selected).reduce((s, o) => s + o.price, 0),
    [selected],
  );

  const pick = (type: string, option: ComponentOption) => {
    setSelected((prev) => {
      if (prev[type]?.id === option.id) {
        const next = { ...prev };
        delete next[type];
        return next;
      }
      return { ...prev, [type]: option };
    });
  };

  const addToCart = () => {
    if (!isComplete) return;
    const components = configSlots
      .filter((s) => selected[s.type])
      .map((s) => ({ type: s.type, name: selected[s.type].name }));
    addItem({
      kind: 'config',
      name: 'Индивидуальная сборка',
      description: `${components.length} комплектующих`,
      price: total,
      components,
    });
    toast({ title: 'Сборка добавлена в корзину', description: `На сумму ${formatPrice(total)}` });
    navigate('/cart');
  };

  return (
    <>
      <PageHeader
        icon="Cpu"
        eyebrow="Конфигуратор"
        title="Соберите свой компьютер"
        description="Выберите комплектующие по своим задачам и бюджету. Мы профессионально соберём и протестируем готовый компьютер."
      />
      <section className="relative overflow-hidden py-12">
        <BrandBackdrop smokeOpacity={0.25} />
        <div className="container-page relative grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Слоты */}
          <div className="space-y-5">
            {configSlots.map((slot) => {
              const chosen = selected[slot.type];
              return (
                <div key={slot.type} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm-premium">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                      chosen ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary',
                    )}>
                      <Icon name={chosen ? 'Check' : slot.icon} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold">{slot.title}</h3>
                        {!slot.required && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                            Опционально
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{slot.hint}</p>
                    </div>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {slot.options.map((opt) => {
                      const active = chosen?.id === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => pick(slot.type, opt)}
                          className={cn(
                            'flex items-start justify-between gap-2 rounded-xl border p-3 text-left transition-all',
                            active
                              ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                              : 'border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/60',
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{opt.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{opt.spec}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end">
                            <span className="text-sm font-semibold">{formatPrice(opt.price)}</span>
                            {active && <Icon name="CircleCheck" size={16} className="mt-1 text-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Итог сборки */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm-premium">
              <h2 className="font-heading text-lg font-semibold">Ваша конфигурация</h2>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{filledRequired}/{requiredSlots.length}</span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {configSlots.map((slot) => {
                  const chosen = selected[slot.type];
                  return (
                    <div key={slot.type} className="flex items-start justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Icon name={slot.icon} size={13} className="shrink-0" />
                        {slot.title}
                      </span>
                      {chosen ? (
                        <span className="max-w-[55%] truncate text-right font-medium">{chosen.name}</span>
                      ) : (
                        <span className="text-right text-xs text-muted-foreground/60">
                          {slot.required ? 'не выбрано' : '—'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">Стоимость</span>
                <span className="font-heading text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>

              <Button size="lg" className="mt-5 w-full" disabled={!isComplete} onClick={addToCart}>
                <Icon name="ShoppingCart" size={17} className="mr-1.5" />
                Добавить сборку в корзину
              </Button>

              {!isComplete ? (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon name="Info" size={13} className="shrink-0 text-primary" />
                  Выберите обязательные комплектующие, чтобы продолжить
                </p>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-primary">
                  <Icon name="CircleCheck" size={13} className="shrink-0" />
                  Конфигурация собрана и совместима — можно оформлять
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Configurator;
