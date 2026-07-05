import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useContentEditor } from '@/context/ContentContext';
import { useToast } from '@/hooks/use-toast';

const EditorBar = () => {
  const { editMode, canEdit, dirtyCount, saving, saveAll, discardAll, toggleEditMode } =
    useContentEditor();
  const { toast } = useToast();

  if (!canEdit || !editMode) return null;

  const handleSave = async () => {
    try {
      await saveAll();
      toast({ title: 'Сохранено', description: 'Изменения опубликованы на сайте.' });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card/95 px-4 py-2.5 shadow-lg-premium backdrop-blur">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className="flex h-2 w-2 rounded-full bg-primary" />
        Режим редактирования
      </span>

      {dirtyCount > 0 && (
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
          {dirtyCount} изм.
        </span>
      )}

      <div className="mx-1 h-5 w-px bg-border" />

      <Button size="sm" onClick={handleSave} disabled={saving || dirtyCount === 0}>
        <Icon name="Save" size={15} className="mr-1" />
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </Button>

      {dirtyCount > 0 && (
        <Button size="sm" variant="ghost" onClick={discardAll} disabled={saving}>
          Сбросить
        </Button>
      )}

      <Button size="sm" variant="ghost" onClick={toggleEditMode}>
        <Icon name="X" size={15} />
      </Button>
    </div>
  );
};

export default EditorBar;
