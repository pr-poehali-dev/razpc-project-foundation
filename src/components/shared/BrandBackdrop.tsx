import { cn } from '@/lib/utils';

const SMOKE_URL =
  'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/694206c9-2c16-45ed-9566-61128ac5f94f.jpg';

export interface BrandBackdropProps {
  /** Интенсивность дыма (0–1) */
  smokeOpacity?: number;
  /** Показывать жёлтые дуги */
  arcs?: boolean;
  className?: string;
}

const BrandBackdrop = ({ smokeOpacity = 0.35, arcs = true, className }: BrandBackdropProps) => {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* Слой дыма */}
      <div
        className="absolute inset-0 bg-cover bg-center mix-blend-screen"
        style={{ backgroundImage: `url(${SMOKE_URL})`, opacity: smokeOpacity }}
      />

      {/* Фирменные жёлтые дуги */}
      {arcs && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <linearGradient id="brandArcA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(48 96% 53%)" stopOpacity="0" />
              <stop offset="45%" stopColor="hsl(48 96% 53%)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(48 96% 53%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="brandArcB" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(48 96% 53%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(48 96% 53%)" stopOpacity="0.65" />
              <stop offset="100%" stopColor="hsl(48 96% 53%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Левая большая дуга */}
          <path
            d="M -80 -50 Q 240 200 90 640"
            stroke="url(#brandArcA)"
            strokeWidth="4"
            fill="none"
          />
          {/* Правая нижняя дуга */}
          <path
            d="M 1120 260 Q 820 520 940 700"
            stroke="url(#brandArcB)"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      )}

      {/* Мягкое фирменное свечение */}
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-primary/[0.08] blur-[100px]" />
    </div>
  );
};

export default BrandBackdrop;
