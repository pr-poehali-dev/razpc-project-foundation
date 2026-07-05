import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useContentEditor } from '@/context/ContentContext';

type ButtonProps = React.ComponentProps<typeof Button>;

interface EditableButtonProps extends Omit<ButtonProps, 'children' | 'asChild' | 'onClick'> {
  /** Базовый ключ, напр. "home.hero.btn1". Хранит .text и .href */
  id: string;
  /** Текст по умолчанию */
  text: string;
  /** Ссылка по умолчанию */
  href: string;
  /** Иконка слева */
  icon?: string;
  /** Иконка справа */
  iconRight?: string;
}

const EditableButton = ({
  id,
  text,
  href,
  icon,
  iconRight,
  ...btnProps
}: EditableButtonProps) => {
  const { editMode, canEdit, getText, setDraft } = useContentEditor();
  const [open, setOpen] = useState(false);

  const currentText = getText(`${id}.text`, text);
  const currentHref = getText(`${id}.href`, href);

  const inner = (
    <>
      {icon && <Icon name={icon} size={18} className="mr-1.5" />}
      {currentText}
      {iconRight && <Icon name={iconRight} size={18} className="ml-1.5" />}
    </>
  );

  // Обычный режим — рабочая кнопка-ссылка
  if (!editMode || !canEdit) {
    return (
      <Button asChild {...btnProps}>
        <Link to={currentHref}>{inner}</Link>
      </Button>
    );
  }

  // Режим редактирования — клик открывает настройку, перехода нет
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          {...btnProps}
          type="button"
          className={`relative outline outline-2 outline-dashed outline-primary/50 ${btnProps.className ?? ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {inner}
          <span className="ml-1.5 inline-flex items-center rounded bg-black/20 px-1 py-0.5 text-[10px]">
            <Icon name="Pencil" size={10} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-3" align="start">
        <div className="space-y-1.5">
          <Label className="text-xs">Текст кнопки</Label>
          <Input
            value={currentText}
            onChange={(e) => setDraft(`${id}.text`, e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Ссылка (куда ведёт)</Label>
          <Input
            value={currentHref}
            onChange={(e) => setDraft(`${id}.href`, e.target.value)}
            placeholder="/catalog"
          />
          <p className="text-[11px] text-muted-foreground">
            Внутренняя: /catalog. Внешняя: https://…
          </p>
        </div>
        <Button size="sm" className="w-full" onClick={() => setOpen(false)}>
          <Icon name="Check" size={14} className="mr-1" />
          Готово
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default EditableButton;
