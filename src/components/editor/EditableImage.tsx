import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useContentEditor } from '@/context/ContentContext';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/api/upload';

interface EditableImageProps {
  /** Ключ картинки, напр. "home.hero.bg" */
  id: string;
  /** URL по умолчанию */
  src: string;
  alt?: string;
  className?: string;
  /** Если true — картинка идёт фоном (background-image) */
  asBackground?: boolean;
  children?: React.ReactNode;
}

const EditableImage = ({
  id,
  src,
  alt = '',
  className,
  asBackground,
  children,
}: EditableImageProps) => {
  const { editMode, canEdit, getText, setDraft } = useContentEditor();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const current = getText(id, src);
  const showTools = editMode && canEdit;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setDraft(id, url);
      toast({ title: 'Фото загружено', description: 'Не забудьте нажать «Сохранить».' });
    } catch (err) {
      toast({ title: 'Ошибка', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const overlay = showTools && (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100"
      >
        <Icon name={uploading ? 'Loader' : 'Upload'} size={26} className={uploading ? 'animate-spin' : ''} />
        <span className="text-sm font-medium">
          {uploading ? 'Загрузка…' : 'Загрузить фото'}
        </span>
      </button>
    </>
  );

  if (asBackground) {
    return (
      <div
        className={cn('relative bg-cover bg-center bg-no-repeat', showTools && 'outline outline-2 outline-dashed outline-primary/50', className)}
        style={{ backgroundImage: `url(${current})` }}
      >
        {overlay}
        {children}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', showTools && 'outline outline-2 outline-dashed outline-primary/50')}>
      {current ? (
        <img src={current} alt={alt} className={className} loading="lazy" />
      ) : (
        <div className={cn('flex items-center justify-center bg-secondary/30 text-muted-foreground/40', className)}>
          <Icon name="ImageOff" size={40} />
        </div>
      )}
      {overlay}
    </div>
  );
};

export default EditableImage;
