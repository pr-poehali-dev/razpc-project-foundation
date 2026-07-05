import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { Slide } from '@/api/slides';
import SlideCanvas from './SlideCanvas';

interface SlidePlayerProps {
  slides: Slide[];
  startIndex?: number;
  onClose: () => void;
}

const SlidePlayer = ({ slides, startIndex = 0, onClose }: SlidePlayerProps) => {
  const [index, setIndex] = useState(startIndex);
  const [animKey, setAnimKey] = useState(0);
  const lockRef = useRef(false);

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => {
        const next = Math.min(slides.length - 1, Math.max(0, i + dir));
        if (next !== i) setAnimKey((k) => k + 1);
        return next;
      });
    },
    [slides.length],
  );

  // Клавиатура
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') go(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  // Скролл-листание с защитой от частых срабатываний
  const onWheel = (e: React.WheelEvent) => {
    if (lockRef.current) return;
    if (Math.abs(e.deltaY) < 20) return;
    lockRef.current = true;
    go(e.deltaY > 0 ? 1 : -1);
    setTimeout(() => (lockRef.current = false), 700);
  };

  // Блокируем прокрутку страницы под плеером
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const slide = slides[index];

  return (
    <div className="fixed inset-0 z-[200] bg-background" onWheel={onWheel}>
      {/* Слайд на весь экран */}
      <div className="absolute inset-0" key={animKey}>
        {slide && <SlideCanvas slide={slide} editable={false} animate />}
      </div>

      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition hover:bg-background"
      >
        <Icon name="X" size={20} />
      </button>

      {/* Счётчик */}
      <div className="absolute left-5 top-5 z-20 rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium backdrop-blur">
        {index + 1} / {slides.length}
      </div>

      {/* Стрелки */}
      <button
        disabled={index === 0}
        onClick={() => go(-1)}
        className="absolute left-5 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition hover:bg-background disabled:opacity-0"
      >
        <Icon name="ChevronLeft" size={24} />
      </button>
      <button
        disabled={index === slides.length - 1}
        onClick={() => go(1)}
        className="absolute right-5 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur transition hover:bg-background disabled:opacity-0"
      >
        <Icon name="ChevronRight" size={24} />
      </button>

      {/* Индикаторы */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              setIndex(i);
              setAnimKey((k) => k + 1);
            }}
            className={cn(
              'h-2 rounded-full transition-all',
              i === index ? 'w-9 bg-primary' : 'w-5 bg-foreground/25 hover:bg-foreground/50',
            )}
          />
        ))}
      </div>

      {/* Подсказка */}
      <div className="absolute bottom-6 right-6 z-20 hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <Icon name="MousePointerClick" size={13} />
        Стрелки / скролл / пробел — листать, Esc — выход
      </div>
    </div>
  );
};

export default SlidePlayer;
