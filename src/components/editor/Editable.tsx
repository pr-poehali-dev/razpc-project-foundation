import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useContentEditor } from '@/context/ContentContext';

interface EditableProps {
  /** Уникальный ключ текста, напр. "home.hero.title" */
  id: string;
  /** Текст по умолчанию (если в БД пусто) */
  children: string;
  /** HTML-тег, в который обернуть текст */
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  /** Многострочный редактор (textarea) */
  multiline?: boolean;
}

const Editable = ({ id, children, as = 'span', className, multiline }: EditableProps) => {
  const { editMode, canEdit, getText, setDraft } = useContentEditor();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const current = getText(id, children);
  const Tag = as as React.ElementType;

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setValue(current);
    setEditing(true);
  };

  const commit = () => {
    if (value !== current) setDraft(id, value);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      commit();
    }
    if (e.key === 'Escape') cancel();
  };

  // Обычный режим — просто текст
  if (!editMode || !canEdit) {
    return <Tag className={className}>{current}</Tag>;
  }

  // Режим редактирования, инлайн-инпут
  if (editing) {
    const InputTag = multiline ? 'textarea' : 'input';
    return (
      <span className="relative inline-block w-full">
        <InputTag
          ref={ref as never}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setValue(e.target.value)
          }
          onKeyDown={handleKey}
          rows={multiline ? 4 : undefined}
          className={cn(
            'w-full rounded-md border-2 border-primary bg-background px-2 py-1 text-inherit outline-none',
            className,
          )}
        />
        <span className="mt-1 flex gap-1">
          <button
            onClick={commit}
            className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
          >
            <Icon name="Check" size={12} /> Готово
          </button>
          <button
            onClick={cancel}
            className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
          >
            Отмена
          </button>
        </span>
      </span>
    );
  }

  // Режим редактирования, показ с подсветкой и кнопкой
  return (
    <Tag
      className={cn(
        'relative cursor-pointer rounded outline-2 outline-dashed outline-primary/40 transition-colors hover:bg-primary/5 hover:outline-primary',
        className,
      )}
      onClick={startEdit}
      title="Нажмите, чтобы изменить"
    >
      {current}
      <span className="ml-1 inline-flex translate-y-[-1px] items-center rounded bg-primary/15 px-1 py-0.5 align-middle text-[10px] font-medium text-primary">
        <Icon name="Pencil" size={10} />
      </span>
    </Tag>
  );
};

export default Editable;
