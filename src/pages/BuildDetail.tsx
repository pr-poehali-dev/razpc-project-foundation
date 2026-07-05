import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BrandBackdrop, LeadForm } from '@/components/shared';
import SlideEditor from '@/components/editor/slides/SlideEditor';
import {
  Spinner, EmptyState, Button, Badge, Icon,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator, useToast,
} from '@/components/ui';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useContentEditor } from '@/context/ContentContext';
import BuildEditDialog from '@/components/editor/BuildEditDialog';
import { fetchBuild, deleteBuild, archiveBuild, formatPrice, type BuildDetail as BuildDetailType, type BuildListItem } from '@/api/catalog';

const BuildDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { editMode, canEdit } = useContentEditor();
  const [build, setBuild] = useState<BuildDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchBuild(slug)
      .then(setBuild)
      .catch((e) => {
        if (e.message === 'not_found') setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !build) {
    return (
      <div className="container-page py-24">
        <EmptyState
          icon="PackageX"
          title="Сборка не найдена"
          description="Возможно, эта конфигурация была снята с производства."
          action={
            <Button asChild>
              <Link to="/catalog">
                <Icon name="ArrowLeft" size={16} className="mr-1" />
                В каталог
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const inStock = build.status === 'in_stock';
  const showTools = editMode && canEdit;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBuild(build.id);
      toast({ title: 'Удалено', description: `«${build.name}» удалён из каталога.` });
      navigate('/catalog');
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    const next = !build.is_archived;
    try {
      await archiveBuild(build.id, next);
      toast({
        title: next ? 'В архиве' : 'Возвращено',
        description: next
          ? `«${build.name}» скрыт из каталога.`
          : `«${build.name}» снова виден в каталоге.`,
      });
      setBuild((prev) => (prev ? { ...prev, is_archived: next } : prev));
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setArchiving(false);
    }
  };

  // Ob'ekt dlya dialoga redaktirovaniya
  const buildForDialog: BuildListItem = {
    ...build,
    is_featured: false,
    highlights: [],
  };

  return (
    <>
      {showTools && (
        <>
          <div className="sticky top-16 z-30 border-b border-primary/30 bg-primary/10 backdrop-blur">
            <div className="container-page flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon name="Pencil" size={15} />
                Редактирование товара
                {build.is_archived && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    В архиве
                  </span>
                )}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setEditOpen(true)}>
                  <Icon name="Pencil" size={14} className="mr-1.5" />
                  Изменить
                </Button>
                <Button size="sm" variant="secondary" onClick={handleArchive} disabled={archiving}>
                  <Icon name={build.is_archived ? 'ArchiveRestore' : 'Archive'} size={14} className="mr-1.5" />
                  {build.is_archived ? 'Вернуть из архива' : 'В архив'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>
                  <Icon name="Trash2" size={14} className="mr-1.5" />
                  Удалить
                </Button>
              </div>
            </div>
          </div>
          <BuildEditDialog
            build={buildForDialog}
            open={editOpen}
            onOpenChange={setEditOpen}
            onSaved={(patch) => setBuild((prev) => (prev ? { ...prev, ...patch } : prev))}
          />
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
                <AlertDialogDescription>
                  «{build.name}» будет удалён из каталога без возможности восстановления.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={deleting}
                >
                  {deleting ? 'Удаляем…' : 'Удалить'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* Верхний блок */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <BrandBackdrop smokeOpacity={0.3} />
        <div className="container-page relative py-8 md:py-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/catalog">Каталог</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{build.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Фото */}
            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]" />
              <div
                className={`group relative overflow-hidden rounded-2xl border border-border bg-secondary/20 ${showTools ? 'cursor-pointer outline outline-2 outline-dashed outline-primary/40' : ''}`}
                onClick={() => showTools && setEditOpen(true)}
              >
                {build.image_url ? (
                  <img src={build.image_url} alt={build.name} className="w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground/40">
                    <Icon name="ImageOff" size={48} />
                  </div>
                )}
                {showTools && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Icon name="Upload" size={26} />
                    <span className="text-sm font-medium">Изменить фото</span>
                  </div>
                )}
              </div>
            </div>

            {/* Инфо */}
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {build.tier && <Badge variant="solid">{build.tier}</Badge>}
                {build.performance_badge && (
                  <Badge variant="default">
                    <Icon name="Gauge" size={13} />
                    {build.performance_badge}
                  </Badge>
                )}
              </div>

              <h1 className="font-heading text-4xl font-bold md:text-5xl">{build.name}</h1>
              {build.tagline && (
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{build.tagline}</p>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                {build.old_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(build.old_price)}
                  </span>
                )}
                <span className="font-heading text-4xl font-bold text-foreground">
                  {formatPrice(build.price)}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="flex items-center gap-2">
                  <Icon
                    name={inStock ? 'CircleCheck' : 'Clock'}
                    size={17}
                    className={inStock ? 'text-success' : 'text-warning'}
                  />
                  <span className="font-medium">{inStock ? 'В наличии' : 'Под заказ'}</span>
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="ShieldCheck" size={17} className="text-primary" />
                  Гарантия {build.warranty}
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => setLeadOpen(true)}
                >
                  <Icon name="ShoppingCart" size={18} className="mr-1" />
                  Заказать
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/contacts">
                    <Icon name="MessageSquare" size={18} className="mr-1" />
                    Консультация
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Презентация — конструктор слайдов */}
      <section className="relative overflow-hidden py-16">
        <BrandBackdrop smokeOpacity={0.2} arcs={false} />
        <div className="container-page relative">
          <div className="mb-8 flex items-center gap-3">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Презентация</h2>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
              {build.components.length} компонентов
            </span>
          </div>

          <SlideEditor buildId={build.id} />

          <div className="mt-12 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/catalog">
                <Icon name="ArrowLeft" size={16} className="mr-1" />
                Все сборки
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <LeadForm
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        title="Заказать сборку"
        description="Оставьте телефон — менеджер свяжется с вами по этой конфигурации."
        source="site_buy"
        buildId={build.id}
        buildName={build.name}
      />
    </>
  );
};

export default BuildDetail;