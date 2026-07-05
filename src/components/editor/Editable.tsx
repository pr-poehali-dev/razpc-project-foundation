import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useContentEditor } from '@/context/ContentContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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

interface TextStyle {
  size?: string;
  align?: string;
  weight?: string;
  font?: string;
}

const SIZES = [
  { label: 'XS', value: 'text-xs' },
  { label: 'S', value: 'text-sm' },
  { label: 'M', value: 'text-base' },
  { label: 'L', value: 'text-xl' },
  { label: 'XL', value: 'text-3xl' },
  { label: '2XL', value: 'text-5xl' },
];
const ALIGNS = [
  { icon: 'AlignLeft', value: 'text-left' },
  { icon: 'AlignCenter', value: 'text-center' },
  { icon: 'AlignRight', value: 'text-right' },
];
const WEIGHTS = [
  { label: 'Обычный', value: 'font-normal' },
  { label: 'Средний', value: 'font-medium' },
  { label: 'Жирный', value: 'font-bold' },
];
const FONTS = [
  { label: 'Основной', value: '' },
  { label: 'Заголовочный', value: 'font-heading' },
];

function styleToClass(s: TextStyle): string {
  return [s.size, s.align, s.weight, s.font].filter(Boolean).join(' ');
}

const Editable = ({ id, children, as = 'span', className, multiline }: EditableProps) => {
  const { editMode, canEdit, getText, setDraft } = useContentEditor();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [styleOpen, setStyleOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const current = getText(id, children);
  const styleRaw = getText(`${id}.style`, '');
  let style: TextStyle = {};
  try {
    style = styleRaw ? JSON.parse(styleRaw) : {};
  } catch {
    style = {};
  }
  const styleClass = styleToClass(style);
  const Tag = as as React.ElementType;

  const updateStyle = (patch: Partial<TextStyle>) => {
    const next = { ...style, ...patch };
    setDraft(`${id}.style`, JSON.stringify(next));
  };

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

  // Обычный режим — просто текст (с примененным оформлением)
  if (!editMode || !canEdit) {
    return <Tag className={cn(className, styleClass)}>{current}</Tag>;
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

  // Режим редактирования, показ с подсветкой, кнопкой текста и кнопкой оформления
  return (
    <Tag
      className={cn(
        'relative cursor-pointer rounded outline-2 outline-dashed outline-primary/40 transition-colors hover:bg-primary/5 hover:outline-primary',
        className,
        styleClass,
      )}
      title="Нажмите, чтобы изменить текст"
    >
      <span onClick={startEdit}>{current}</span>
      <span className="ml-1 inline-flex items-center gap-0.5 align-middle">
        <span
          onClick={startEdit}
          className="inline-flex translate-y-[-1px] items-center rounded bg-primary/15 px-1 py-0.5 text-[10px] font-medium text-primary"
        >
          <Icon name="Pencil" size={10} />
        </span>
        <Popover open={styleOpen} onOpenChange={setStyleOpen}>
          <PopoverTrigger asChild>
            <span
              onClick={(e) => e.stopPropagation()}
              className="inline-flex translate-y-[-1px] cursor-pointer items-center rounded bg-primary/15 px-1 py-0.5 text-[10px] font-medium text-primary"
              title="Оформление текста"
            >
              <Icon name="Type" size={10} />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-3 text-left" align="start">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Размер</p>
              <div className="flex flex-wrap gap-1">
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateStyle({ size: s.value })}
                    className={cn(
                      'rounded border px-2 py-1 text-xs',
                      style.size === s.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Выравнивание</p>
              <div className="flex gap-1">
                {ALIGNS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => updateStyle({ align: a.value })}
                    className={cn(
                      'inline-flex rounded border p-1.5',
                      style.align === a.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                    )}
                  >
                    <Icon name={a.icon} size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Начертание</p>
              <div className="flex flex-wrap gap-1">
                {WEIGHTS.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => updateStyle({ weight: w.value })}
                    className={cn(
                      'rounded border px-2 py-1 text-xs',
                      style.weight === w.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                    )}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Шрифт</p>
              <div className="flex flex-wrap gap-1">
                {FONTS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => updateStyle({ font: f.value })}
                    className={cn(
                      'rounded border px-2 py-1 text-xs',
                      (style.font ?? '') === f.value ? 'border-primary bg-primary/10 text-primary' : 'border-border',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </span>
    </Tag>
  );
};

export default Editable;
