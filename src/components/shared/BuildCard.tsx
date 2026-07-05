import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useContentEditor } from '@/context/ContentContext';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import BuildEditDialog from '@/components/editor/BuildEditDialog';
import { type BuildListItem, formatPrice, deleteBuild, archiveBuild } from '@/api/catalog';

const typeIcon: Record<string, string> = {
  CPU: 'Cpu',
  GPU: 'MonitorPlay',
  RAM: 'MemoryStick',
  SSD: 'HardDrive',
  MOTHERBOARD: 'CircuitBoard',
  PSU: 'Plug',
  CASE: 'Box',
};

export interface BuildCardProps {
  build: BuildListItem;
  className?: string;
  onUpdated?: (patch: Partial<BuildListItem>) => void;
  onDeleted?: () => void;
}

const BuildCard = ({ build, className, onUpdated, onDeleted }: BuildCardProps) => {
  const { editMode, canEdit } = useContentEditor();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const showTools = editMode && canEdit;

  const handleAddToCart = () => {
    addItem({
      kind: 'build',
      buildId: build.id,
      slug: build.slug,
      name: build.name,
      description: build.tagline || undefined,
      image_url: build.image_url,
      price: build.price,
    });
    toast({ title: 'Компьютер добавлен в корзину', description: build.name });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBuild(build.id);
      toast({ title: 'Удалено', description: `«${build.name}» удалён из каталога.` });
      setConfirmOpen(false);
      onDeleted?.();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
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
      onUpdated?.({ is_archived: next });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setArchiving(false);
    }
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm-premium transition-all duration-300 hover:border-primary/40 hover:shadow-lg-premium',
        showTools && 'outline outline-2 outline-dashed outline-primary/40',
        className,
      )}
    >
      {showTools && (
        <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-1.5">
          <Button size="sm" onClick={() => setEditOpen(true)}>
            <Icon name="Pencil" size={14} className="mr-1" />
            Изменить
          </Button>
          <Button size="sm" variant="secondary" onClick={handleArchive} disabled={archiving}>
            <Icon name={build.is_archived ? 'ArchiveRestore' : 'Archive'} size={14} className="mr-1" />
            {build.is_archived ? 'Вернуть' : 'В архив'}
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      )}

      {showTools && build.is_archived && (
        <div className="absolute left-3 top-3 z-10 rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
          В архиве
        </div>
      )}

      {showTools && (
        <>
          <BuildEditDialog
            build={build}
            open={editOpen}
            onOpenChange={setEditOpen}
            onSaved={(patch) => onUpdated?.(patch)}
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
      {/* Постер */}
      <Link to={`/catalog/${build.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-secondary/30">
        {build.image_url ? (
          <img
            src={build.image_url}
            alt={build.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <Icon name="ImageOff" size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        {/* Теги производительности */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {build.tier && <Badge variant="solid">{build.tier}</Badge>}
          {build.status === 'on_order' && <Badge variant="warning">Под заказ</Badge>}
        </div>
      </Link>

      {/* Инфо */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-2xl font-bold text-foreground">{build.name}</h3>
        {build.tagline && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{build.tagline}</p>
        )}

        {build.performance_badge && (
          <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Icon name="Gauge" size={13} />
            {build.performance_badge}
          </div>
        )}

        {/* Ключевые характеристики (3-4) */}
        <ul className="mt-5 space-y-2.5">
          {build.highlights.map((c) => (
            <li key={c.type} className="flex items-center gap-2.5 text-sm">
              <Icon name={typeIcon[c.type] ?? 'Cpu'} size={16} className="shrink-0 text-primary" />
              <span className="truncate font-medium text-foreground/90">{c.name}</span>
            </li>
          ))}
        </ul>

        {/* Цена + CTA */}
        <div className="mt-auto flex items-end justify-between pt-6">
          <div className="flex flex-col">
            {build.old_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(build.old_price)}
              </span>
            )}
            <span className="font-heading text-2xl font-bold text-foreground">
              {formatPrice(build.price)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to={`/catalog/${build.slug}`}>Подробнее</Link>
            </Button>
            <Button onClick={handleAddToCart}>
              <Icon name="ShoppingCart" size={16} className="mr-1.5" />
              В корзину
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BuildCard;