import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader, BrandBackdrop, BuildCard } from '@/components/shared';
import { EmptyState, Spinner, Button, Icon, useToast } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useContentEditor } from '@/context/ContentContext';
import { fetchBuilds, createBuild, type BuildListItem } from '@/api/catalog';
import { fetchCategories, fetchProducts, type Category, type Product } from '@/api/shop';
import ProductCard from '@/components/shop/ProductCard';
import ProductFilters from '@/components/shop/ProductFilters';

type Section = 'builds' | 'parts';

const Catalog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { editMode, canEdit } = useContentEditor();
  const [searchParams, setSearchParams] = useSearchParams();

  const [section, setSection] = useState<Section>(
    searchParams.get('section') === 'parts' ? 'parts' : 'builds',
  );

  // ---- Готовые ПК ----
  const [builds, setBuilds] = useState<BuildListItem[]>([]);
  const [buildsLoading, setBuildsLoading] = useState(true);
  const [tier, setTier] = useState('all');
  const [creating, setCreating] = useState(false);
  const showArchived = editMode && canEdit;

  // ---- Комплектующие ----
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string>(searchParams.get('category') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState('popular');

  useEffect(() => {
    fetchBuilds(showArchived).then(setBuilds).catch(() => undefined).finally(() => setBuildsLoading(false));
  }, [showArchived]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (section !== 'parts') return;
    setPartsLoading(true);
    fetchProducts({ category: activeCat || undefined, sort, ...filters })
      .then(setProducts)
      .catch(() => undefined)
      .finally(() => setPartsLoading(false));
  }, [section, activeCat, sort, filters]);

  const switchSection = (s: Section) => {
    setSection(s);
    const next = new URLSearchParams(searchParams);
    next.set('section', s);
    setSearchParams(next, { replace: true });
  };

  const selectCategory = (code: string) => {
    setActiveCat(code);
    setFilters({});
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { slug } = await createBuild();
      toast({ title: 'Создано', description: 'Заполните карточку новой конфигурации.' });
      navigate(`/catalog/${slug}`);
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
      setCreating(false);
    }
  };

  const tiers = useMemo(() => {
    const set = new Set<string>();
    builds.forEach((b) => b.tier && set.add(b.tier));
    return ['all', ...Array.from(set)];
  }, [builds]);

  const filteredBuilds = useMemo(
    () => (tier === 'all' ? builds : builds.filter((b) => b.tier === tier)),
    [builds, tier],
  );

  const activeCategory = categories.find((c) => c.code === activeCat);

  return (
    <>
      <PageHeader
        icon="LayoutGrid"
        eyebrow="Каталог"
        title="Готовые ПК и комплектующие"
        description="Профессионально собранные компьютеры RazPC — наш главный продукт. А также полный каталог комплектующих с доставкой по всей России."
      />

      {/* Переключатель разделов */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="container-page flex gap-1 py-2">
          <button
            onClick={() => switchSection('builds')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              section === 'builds' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            <Icon name="Cpu" size={17} /> Готовые ПК
          </button>
          <button
            onClick={() => switchSection('parts')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              section === 'parts' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            <Icon name="Boxes" size={17} /> Комплектующие
          </button>
        </div>
      </div>

      {section === 'builds' ? (
        <section className="relative overflow-hidden py-12">
          <BrandBackdrop smokeOpacity={0.25} />
          <div className="container-page relative">
            {/* Премиальный баннер */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                    <Icon name="Award" size={13} /> Главный продукт RazPC
                  </span>
                  <h2 className="mt-3 font-heading text-2xl font-bold md:text-3xl">Готовые компьютеры под ключ</h2>
                  <p className="mt-2 text-muted-foreground">
                    Собраны и протестированы нашими инженерами. Кабель-менеджмент, настройка BIOS, стресс-тест и гарантия — включены.
                  </p>
                </div>
                <Button size="lg" onClick={() => navigate('/configurator')}>
                  <Icon name="Wrench" size={18} className="mr-1.5" /> Собрать свой ПК
                </Button>
              </div>
            </div>

            {editMode && canEdit && (
              <div className="mb-6 flex justify-end">
                <Button onClick={handleCreate} disabled={creating}>
                  <Icon name={creating ? 'Loader' : 'Plus'} size={16} className={`mr-1.5 ${creating ? 'animate-spin' : ''}`} />
                  {creating ? 'Создаём…' : 'Добавить конфигурацию'}
                </Button>
              </div>
            )}

            {buildsLoading ? (
              <div className="flex justify-center py-24"><Spinner size="lg" /></div>
            ) : builds.length === 0 ? (
              <EmptyState icon="PackageOpen" title="Сборок пока нет" description="Скоро здесь появятся готовые конфигурации." />
            ) : (
              <>
                <div className="mb-8 flex flex-wrap gap-2">
                  {tiers.map((t) => (
                    <Button key={t} size="sm" variant={tier === t ? 'default' : 'outline'} onClick={() => setTier(t)}>
                      {t === 'all' ? 'Все сборки' : t}
                    </Button>
                  ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredBuilds.map((b) => (
                    <BuildCard
                      key={b.id}
                      build={b}
                      className={b.is_archived ? 'opacity-60' : undefined}
                      onUpdated={(patch) => setBuilds((prev) => prev.map((x) => (x.id === b.id ? { ...x, ...patch } : x)))}
                      onDeleted={() => setBuilds((prev) => prev.filter((x) => x.id !== b.id))}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden py-8">
          <BrandBackdrop smokeOpacity={0.15} />
          <div className="container-page relative grid gap-6 lg:grid-cols-[220px_1fr]">
            {/* Категории */}
            <aside className="lg:sticky lg:top-32 lg:self-start">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Категории</p>
              <nav className="space-y-0.5">
                <button
                  onClick={() => selectCategory('')}
                  className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    !activeCat ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-secondary')}
                >
                  <Icon name="LayoutGrid" size={16} /> Все товары
                </button>
                {categories.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => selectCategory(c.code)}
                    className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      activeCat === c.code ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-secondary')}
                  >
                    <Icon name={c.icon} size={16} fallback="Package" />
                    <span className="flex-1 truncate">{c.title}</span>
                    <span className="text-xs text-muted-foreground/60">{c.product_count}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Товары */}
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-xl font-bold">{activeCategory?.title || 'Все комплектующие'}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Сортировка:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
                  >
                    <option value="popular">Популярные</option>
                    <option value="price_asc">Дешевле</option>
                    <option value="price_desc">Дороже</option>
                  </select>
                </div>
              </div>

              {activeCat && products.length > 0 && (
                <ProductFilters products={products} category={activeCat} value={filters} onChange={setFilters} />
              )}

              {partsLoading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : products.length === 0 ? (
                <EmptyState icon="PackageSearch" title="Товары не найдены" description="Попробуйте изменить фильтры или категорию." />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Catalog;
