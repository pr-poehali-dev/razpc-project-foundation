import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner, EmptyState } from '@/components/ui';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { BrandBackdrop } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { useConfig, productToPart } from '@/context/ConfigContext';
import { fetchProduct, formatPrice, formatWarranty, formatLead, type Product } from '@/api/shop';
import ProductCard from '@/components/shop/ProductCard';
import DeliveryBlock from '@/components/shop/DeliveryBlock';

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { addPart, hasActive } = useConfig();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetchProduct(slug)
      .then((d) => { setProduct(d.product); setSimilar(d.similar); setActiveImg(0); })
      .catch((e) => { if (e.message === 'not_found') setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (notFound || !product) {
    return (
      <div className="container-page py-24">
        <EmptyState icon="PackageX" title="Товар не найден" description="Возможно, он больше не продаётся."
          action={<Button onClick={() => navigate('/catalog?section=parts')}><Icon name="ArrowLeft" size={16} className="mr-1" /> В каталог</Button>} />
      </div>
    );
  }

  const gallery = product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : []);
  const canConfigure = !!product.config_slot;

  const addToCart = () => {
    addItem({
      kind: 'part', productId: product.id, slug: product.slug,
      name: `${product.brand} ${product.name}`, description: product.category_title,
      image_url: product.image_url, price: product.price,
      weight_g: product.weight_g, length_mm: product.length_mm, width_mm: product.width_mm, height_mm: product.height_mm,
    });
    toast({ title: 'Добавлено в корзину', description: `${product.brand} ${product.name}` });
  };

  const addToConfig = () => {
    const part = productToPart(product);
    if (!part) return;
    addPart(part);
    toast({ title: 'Добавлено в конфигурацию', description: 'Открываем конфигуратор…' });
    navigate('/configurator');
  };

  const deliveryItems = [{ weight_g: product.weight_g, length_mm: product.length_mm, width_mm: product.width_mm, height_mm: product.height_mm, qty: 1 }];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-card">
        <BrandBackdrop smokeOpacity={0.2} />
        <div className="container-page relative py-6 md:py-10">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/catalog?section=parts">Каталог</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr_320px]">
            {/* Галерея */}
            <div>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary/20">
                {gallery.length > 0 ? (
                  <img src={gallery[activeImg]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <Icon name={product.category_icon} size={72} className="text-muted-foreground/30" fallback="Package" />
                )}
              </div>
              {gallery.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {gallery.map((g, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={cn('h-16 w-16 overflow-hidden rounded-lg border', i === activeImg ? 'border-primary' : 'border-border')}>
                      <img src={g} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Инфо */}
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">{product.brand} · {product.category_title}</p>
              <h1 className="mt-1 font-heading text-2xl font-bold md:text-3xl">{product.name}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                  product.in_stock ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400')}>
                  <Icon name={product.in_stock ? 'Check' : 'Truck'} size={12} /> {formatLead(product.lead_days)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                  {product.condition === 'new' ? 'Новое' : 'Б/У'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                  <Icon name="ShieldCheck" size={12} className="text-primary" /> Гарантия {formatWarranty(product.warranty_months)}
                </span>
              </div>

              {product.short_desc && <p className="mt-4 text-muted-foreground">{product.short_desc}</p>}

              {product.short_specs.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {product.short_specs.map((s) => (
                    <li key={s} className="rounded-lg bg-secondary/50 px-2.5 py-1 text-sm text-muted-foreground">{s}</li>
                  ))}
                </ul>
              )}

              {/* Преимущества */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                {['Официальная гарантия', 'Проверка перед отправкой', 'Доставка по всей России', 'Оплата при получении'].map((a) => (
                  <span key={a} className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon name="CircleCheck" size={14} className="shrink-0 text-primary" /> {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Покупка */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-md-premium">
                {product.old_price && <p className="text-sm text-muted-foreground line-through">{formatPrice(product.old_price)}</p>}
                <p className="font-heading text-3xl font-bold">{formatPrice(product.price)}</p>

                <div className="mt-4 space-y-2">
                  {canConfigure && hasActive ? (
                    <>
                      <Button className="w-full" size="lg" onClick={addToConfig}>
                        <Icon name="Cpu" size={17} className="mr-1.5" /> В текущую конфигурацию
                      </Button>
                      <Button className="w-full" variant="outline" onClick={addToCart}>
                        <Icon name="ShoppingCart" size={16} className="mr-1.5" /> Купить отдельно
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" onClick={addToCart}>
                        <Icon name="ShoppingCart" size={17} className="mr-1.5" /> Купить
                      </Button>
                      {canConfigure && (
                        <Button className="w-full" variant="outline" onClick={addToConfig}>
                          <Icon name="Wrench" size={16} className="mr-1.5" /> Начать сборку с этим
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <DeliveryBlock items={deliveryItems} extraDays={product.lead_days} compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Характеристики */}
      <section className="relative overflow-hidden py-12">
        <BrandBackdrop smokeOpacity={0.12} arcs={false} />
        <div className="container-page relative grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-5 font-heading text-2xl font-bold">Характеристики</h2>
            <div className="space-y-6">
              {Object.entries(product.specs).map(([section, rows]) => (
                <div key={section} className="rounded-xl border border-border/80 bg-card p-5">
                  <h3 className="mb-3 font-heading text-base font-semibold text-primary">{section}</h3>
                  <dl className="divide-y divide-border/60">
                    {Object.entries(rows).map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="text-right font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
              {Object.keys(product.specs).length === 0 && (
                <p className="text-sm text-muted-foreground">Характеристики уточняются.</p>
              )}
            </div>
          </div>

          {/* Гарантия/поставщик */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border/80 bg-card p-5">
              <h3 className="mb-3 flex items-center gap-1.5 font-heading text-base font-semibold">
                <Icon name="ShieldCheck" size={16} className="text-primary" /> Гарантия и доставка
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Гарантия</dt><dd className="font-medium">{formatWarranty(product.warranty_months)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Наличие</dt><dd className="font-medium">{formatLead(product.lead_days)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Состояние</dt><dd className="font-medium">{product.condition === 'new' ? 'Новое' : 'Б/У'}</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* Похожие / аналоги */}
      {similar.length > 0 && (
        <section className="relative overflow-hidden border-t border-border py-12">
          <div className="container-page">
            <h2 className="mb-6 font-heading text-2xl font-bold">Похожие товары</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {similar.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ProductPage;
