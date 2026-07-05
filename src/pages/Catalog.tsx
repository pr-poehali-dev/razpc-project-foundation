import { useEffect, useMemo, useState } from 'react';
import { PageHeader, BrandBackdrop, BuildCard } from '@/components/shared';
import { EmptyState, Spinner, Button } from '@/components/ui';
import { fetchBuilds, type BuildListItem } from '@/api/catalog';

const Catalog = () => {
  const [builds, setBuilds] = useState<BuildListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tier, setTier] = useState<string>('all');

  useEffect(() => {
    fetchBuilds()
      .then(setBuilds)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const tiers = useMemo(() => {
    const set = new Set<string>();
    builds.forEach((b) => b.tier && set.add(b.tier));
    return ['all', ...Array.from(set)];
  }, [builds]);

  const filtered = useMemo(
    () => (tier === 'all' ? builds : builds.filter((b) => b.tier === tier)),
    [builds, tier],
  );

  return (
    <>
      <PageHeader
        icon="LayoutGrid"
        eyebrow="Каталог сборок"
        title="Готовые сборки RazPC"
        description="Премиальные компьютеры, собранные и протестированные нашими инженерами. Выберите готовое решение под свои задачи — от Full HD до 4K."
      />
      <section className="relative overflow-hidden py-16">
        <BrandBackdrop smokeOpacity={0.25} />
        <div className="container-page relative">
          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <EmptyState
              icon="TriangleAlert"
              title="Не удалось загрузить каталог"
              description="Попробуйте обновить страницу чуть позже."
            />
          ) : builds.length === 0 ? (
            <EmptyState
              icon="PackageOpen"
              title="Сборок пока нет"
              description="Скоро здесь появятся готовые конфигурации."
            />
          ) : (
            <>
              {/* Фильтр по классу производительности */}
              <div className="mb-8 flex flex-wrap gap-2">
                {tiers.map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={tier === t ? 'default' : 'outline'}
                    onClick={() => setTier(t)}
                  >
                    {t === 'all' ? 'Все сборки' : t}
                  </Button>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((b) => (
                  <BuildCard key={b.id} build={b} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Catalog;
