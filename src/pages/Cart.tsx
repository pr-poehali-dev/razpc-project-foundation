import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { BrandBackdrop, LeadForm } from '@/components/shared';
import { useCart } from '@/context/CartContext';

const formatPrice = (v: number) => Math.round(v || 0).toLocaleString('ru-RU') + ' ₽';

const Cart = () => {
  const { items, total, count, removeItem, setQty, clear } = useCart();
  const [checkout, setCheckout] = useState(false);

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
              Выберите готовую сборку в каталоге или соберите свою конфигурацию — мы поможем собрать идеальный компьютер под ваши задачи.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to="/catalog"><Icon name="LayoutGrid" size={16} className="mr-1.5" /> В каталог</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/configurator"><Icon name="Cpu" size={16} className="mr-1.5" /> Собрать ПК</Link>
              </Button>
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
            <p className="mt-1 text-muted-foreground">{count} {count === 1 ? 'позиция' : 'позиции'} готовы к оформлению</p>
          </div>
          <button onClick={clear} className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive">
            <Icon name="Trash2" size={15} /> Очистить
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Позиции */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm-premium transition-colors hover:border-primary/30">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                      <Icon name={item.kind === 'config' ? 'Cpu' : 'Package'} size={30} />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {item.kind === 'config' && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Сборка
                          </span>
                        )}
                        <h3 className="truncate font-heading text-base font-semibold">{item.name}</h3>
                      </div>
                      {item.description && <p className="mt-0.5 truncate text-sm text-muted-foreground">{item.description}</p>}

                      {item.components && item.components.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          {item.components.map((c, i) => (
                            <li key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Icon name="Check" size={12} className="text-primary" />
                              {c.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Удалить"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div className="flex items-center rounded-lg border border-border">
                      <button
                        onClick={() => setQty(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
                        aria-label="Меньше"
                      >
                        <Icon name="Minus" size={14} />
                      </button>
                      <span className="w-9 text-center text-sm font-medium">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-secondary"
                        aria-label="Больше"
                      >
                        <Icon name="Plus" size={14} />
                      </button>
                    </div>
                    <span className="font-heading text-lg font-bold">{formatPrice(item.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/catalog"><Icon name="ArrowLeft" size={16} className="mr-1.5" /> Продолжить покупки</Link>
            </Button>
          </div>

          {/* Итог */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm-premium">
              <h2 className="font-heading text-lg font-semibold">Итого</h2>
              <div className="mt-4 space-y-2.5 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="truncate text-muted-foreground">{item.name} <span className="text-muted-foreground/70">×{item.qty}</span></span>
                    <span className="shrink-0 font-medium">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">К оплате</span>
                <span className="font-heading text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>

              <Button size="lg" className="mt-5 w-full" onClick={() => setCheckout(true)}>
                <Icon name="Send" size={17} className="mr-1.5" /> Оформить заявку
              </Button>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p className="flex items-start gap-2"><Icon name="ShieldCheck" size={14} className="mt-0.5 shrink-0 text-primary" /> Гарантия на все сборки и работы</p>
                <p className="flex items-start gap-2"><Icon name="Headphones" size={14} className="mt-0.5 shrink-0 text-primary" /> Менеджер подтвердит заказ и ответит на вопросы</p>
                <p className="flex items-start gap-2"><Icon name="Wrench" size={14} className="mt-0.5 shrink-0 text-primary" /> Профессиональная сборка и тестирование</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LeadForm
        open={checkout}
        onClose={() => setCheckout(false)}
        title="Оформление заявки"
        description="Оставьте контакты — менеджер свяжется с вами для подтверждения заказа."
        source="site_cart"
        cartLines={items.map((i) => ({ name: i.name, qty: i.qty, price: i.price }))}
        cartTotal={total}
        onSuccess={clear}
        successText="Спасибо! Мы получили ваш заказ и свяжемся с вами для подтверждения деталей."
      />
    </section>
  );
};

export default Cart;
