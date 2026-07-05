import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, BrandBackdrop, BuildCard } from '@/components/shared';
import { EmptyState, Spinner, Button, Icon, useToast } from '@/components/ui';
import { useContentEditor } from '@/context/ContentContext';
import { fetchBuilds, createBuild, type BuildListItem } from '@/api/catalog';

const Catalog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { editMode, canEdit } = useContentEditor();
  const [builds, setBuilds] = useState<BuildListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tier, setTier] = useState<string>('all');
  const [creating, setCreating] = useState(false);

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

  const showArchived = editMode && canEdit;

  useEffect(() => {
    setLoading(true);
    fetchBuilds(showArchived)
      .then(setBuilds)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [showArchived]);

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
          {editMode && canEdit && (
            <div className="mb-8 flex justify-end">
              <Button onClick={handleCreate} disabled={creating}>
                <Icon name={creating ? 'Loader' : 'Plus'} size={16} className={`mr-1.5 ${creating ? 'animate-spin' : ''}`} />
                {creating ? 'Создаём…' : 'Добавить конфигурацию'}
              </Button>
            </div>
          )}
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
                  <BuildCard
                    key={b.id}
                    build={b}
                    className={b.is_archived ? 'opacity-60' : undefined}
                    onUpdated={(patch) =>
                      setBuilds((prev) =>
                        prev.map((x) => (x.id === b.id ? { ...x, ...patch } : x)),
                      )
                    }
                    onDeleted={() =>
                      setBuilds((prev) => prev.filter((x) => x.id !== b.id))
                    }
                  />
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