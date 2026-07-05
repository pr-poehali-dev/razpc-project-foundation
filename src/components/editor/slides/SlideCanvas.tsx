import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { Slide, SlideElement } from '@/api/slides';
import { styleToClass, ANIM_CLASS } from './slideConstants';

interface SlideCanvasProps {
  slide: Slide;
  editable: boolean;
  /** проигрывать анимации появления (режим просмотра) */
  animate?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onChange?: (slide: Slide) => void;
}

interface Guide {
  axis: 'x' | 'y';
  pos: number; // в %
}

const SNAP = 1.2; // порог прилипания в %

const SlideCanvas = ({
  slide,
  editable,
  animate,
  selectedId,
  onSelect,
  onChange,
}: SlideCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; startX: number; startY: number; elX: number; elY: number; wPct: number } | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);

  const bgStyle: React.CSSProperties = {
    backgroundColor: slide.bgColor || 'hsl(var(--card))',
    ...(slide.bgImage
      ? { backgroundImage: `url(${slide.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {}),
  };

  const updateElement = (id: string, patch: Partial<SlideElement>) => {
    if (!onChange) return;
    onChange({
      ...slide,
      elements: slide.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    });
  };

  // Целевые точки прилипания для левого края элемента (x) и верхнего (y)
  const buildTargets = (dragId: string, wPct: number) => {
    const xTargets: number[] = [
      50 - wPct / 2, // центр слайда (наш центр к центру)
      5,             // левый отступ
      95 - wPct,     // правый отступ
    ];
    const yTargets: number[] = [50, 5, 90];

    slide.elements.forEach((el) => {
      if (el.id === dragId) return;
      xTargets.push(el.x);                     // левый край к левому
      xTargets.push(el.x + el.w / 2 - wPct / 2); // центр к центру
      xTargets.push(el.x + el.w - wPct);       // правый край к правому
      yTargets.push(el.y);
    });
    return { xTargets, yTargets };
  };

  const onPointerDown = (e: React.PointerEvent, el: SlideElement) => {
    if (!editable) return;
    e.stopPropagation();
    onSelect?.(el.id);
    dragState.current = {
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      elX: el.x,
      elY: el.y,
      wPct: el.w,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const ds = dragState.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!ds || !rect) return;
    const dxPct = ((e.clientX - ds.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - ds.startY) / rect.height) * 100;
    let nx = Math.min(98, Math.max(0, ds.elX + dxPct));
    let ny = Math.min(98, Math.max(0, ds.elY + dyPct));

    const { xTargets, yTargets } = buildTargets(ds.id, ds.wPct);
    const active: Guide[] = [];

    let bestX: number | null = null;
    for (const t of xTargets) {
      if (Math.abs(nx - t) < SNAP && (bestX === null || Math.abs(nx - t) < Math.abs(nx - bestX))) {
        bestX = t;
      }
    }
    if (bestX !== null) {
      nx = bestX;
      active.push({ axis: 'x', pos: nx + ds.wPct / 2 });
    }

    let bestY: number | null = null;
    for (const t of yTargets) {
      if (Math.abs(ny - t) < SNAP && (bestY === null || Math.abs(ny - t) < Math.abs(ny - bestY))) {
        bestY = t;
      }
    }
    if (bestY !== null) {
      ny = bestY;
      active.push({ axis: 'y', pos: ny });
    }

    setGuides(active);
    updateElement(ds.id, { x: nx, y: ny });
  };

  const onPointerUp = () => {
    dragState.current = null;
    setGuides([]);
  };

  return (
    <div
      ref={canvasRef}
      className="relative h-full w-full overflow-hidden"
      style={bgStyle}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => editable && onSelect?.(null)}
    >
      {slide.bgImage && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
      )}

      {/* Фоновая сетка-колонки (только в редакторе) */}
      {editable && (
        <div className="pointer-events-none absolute inset-0 opacity-[0.1]">
          <div className="mx-auto flex h-full w-[90%] justify-between">
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} className="h-full w-px bg-primary" />
            ))}
          </div>
        </div>
      )}

      {/* Активные направляющие при перетаскивании */}
      {editable &&
        guides.map((g, i) =>
          g.axis === 'x' ? (
            <div
              key={i}
              className="pointer-events-none absolute top-0 z-30 h-full w-0.5 bg-primary"
              style={{ left: `${g.pos}%` }}
            />
          ) : (
            <div
              key={i}
              className="pointer-events-none absolute left-0 z-30 h-0.5 w-full bg-primary"
              style={{ top: `${g.pos}%` }}
            />
          ),
        )}

      {slide.elements.map((el) => {
        const isSelected = editable && selectedId === el.id;
        const anim = el.anim;
        const playAnim = animate && anim && anim.type !== 'none';
        const animClass = playAnim ? cn('slide-anim-run', ANIM_CLASS[anim!.type]) : '';
        const animStyle: React.CSSProperties = playAnim
          ? { animationDelay: `${anim!.delay}s`, animationDuration: `${anim!.duration}s` }
          : {};

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
              animClass,
            )}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.w}%`,
              touchAction: 'none',
              ...animStyle,
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
