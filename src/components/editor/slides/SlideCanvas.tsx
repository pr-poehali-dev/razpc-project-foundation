import { useRef } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { Slide, SlideElement } from '@/api/slides';
import { styleToClass } from './slideConstants';

interface SlideCanvasProps {
  slide: Slide;
  editable: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (slide: Slide) => void;
}

const SlideCanvas = ({ slide, editable, selectedId, onSelect, onChange }: SlideCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);

  const bgStyle: React.CSSProperties = {
    backgroundColor: slide.bgColor || 'hsl(var(--card))',
    ...(slide.bgImage
      ? { backgroundImage: `url(${slide.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {}),
  };

  const updateElement = (id: string, patch: Partial<SlideElement>) => {
    onChange({
      ...slide,
      elements: slide.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    });
  };

  const onPointerDown = (e: React.PointerEvent, el: SlideElement) => {
    if (!editable) return;
    e.stopPropagation();
    onSelect(el.id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragState.current = {
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      elX: el.x,
      elY: el.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const ds = dragState.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!ds || !rect) return;
    const dxPct = ((e.clientX - ds.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - ds.startY) / rect.height) * 100;
    const nx = Math.min(98, Math.max(0, ds.elX + dxPct));
    const ny = Math.min(98, Math.max(0, ds.elY + dyPct));
    updateElement(ds.id, { x: nx, y: ny });
  };

  const onPointerUp = () => {
    dragState.current = null;
  };

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-hidden"
      style={bgStyle}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => editable && onSelect(null)}
    >
      {/* Затемнение поверх фонового фото для читаемости */}
      {slide.bgImage && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
      )}

      {slide.elements.map((el) => {
        const isSelected = editable && selectedId === el.id;
        return (
          <div
            key={el.id}
            onPointerDown={(e) => onPointerDown(e, el)}
            onClick={(e) => editable && e.stopPropagation()}
            className={cn(
              'absolute',
              editable && 'cursor-move rounded-md transition-shadow',
              isSelected && 'outline outline-2 outline-primary',
              editable && !isSelected && 'hover:outline hover:outline-1 hover:outline-primary/50',
            )}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.w}%`,
              touchAction: 'none',
            }}
          >
            {el.type === 'text' ? (
              <div
                className={cn('whitespace-pre-wrap break-words leading-tight', styleToClass(el.style))}
                style={{ color: el.style?.color || 'hsl(var(--foreground))' }}
              >
                {el.value || 'Текст'}
              </div>
            ) : el.value ? (
              <img src={el.value} alt="" className="pointer-events-none w-full rounded-lg object-contain" />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 text-muted-foreground/50">
                <Icon name="ImageOff" size={32} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SlideCanvas;
