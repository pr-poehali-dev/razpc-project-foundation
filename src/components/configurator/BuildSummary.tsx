import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type BuildState, partsCost, assemblyCost, estimatePower, buildDuration,
  buildWarranty, performanceScores, buildRatings, isBuildComplete, isBuildCompatible,
  formatPrice, formatWarranty, formatDays,
} from '@/lib/pcCompat';

interface Props {
  build: BuildState;
  onAddToCart: () => void;
}

const Bar = ({ label, value, icon }: { label: string; value: number; icon?: string }) => {
  const color = value >= 75 ? 'bg-emerald-500' : value >= 45 ? 'bg-primary' : 'bg-amber-500';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {icon && <Icon name={icon} size={12} />}{label}
        </span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const INCLUDED = [
  'Профессиональная сборка', 'Кабель-менеджмент', 'Настройка BIOS',
  'Стресс-тестирование', 'Проверка стабильности', 'Контроль качества',
];

const BuildSummary = ({ build, onAddToCart }: Props) => {
  const parts = partsCost(build);
  const assembly = assemblyCost(parts);
  const totalNoAssembly = parts;
  const totalWithAssembly = parts + assembly;
  const power = estimatePower(build);
  const psuOk = !build.psu || build.psu.watts >= power.recommended;
  const duration = buildDuration(build);
  const warranty = buildWarranty(build);
  const perf = performanceScores(build);
  const ratings = buildRatings(build);
  const complete = isBuildComplete(build);
  const compatible = isBuildCompatible(build);
  const canAdd = complete && compatible;

  const hasAny = parts > 0;

  return (
    <div className="space-y-4">
      {/* Стоимость — главный акцент */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md-premium">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Комплектующие</span>
            <span className="font-medium">{formatPrice(parts)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              Профессиональная сборка
              <span className="rounded bg-secondary px-1.5 text-[10px]">7%</span>
            </span>
            <span className="font-medium">{formatPrice(assembly)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Без сборки</p>
            <p className="mt-1 font-heading text-xl font-bold text-muted-foreground">{formatPrice(totalNoAssembly)}</p>
          </div>
          <div className="bg-primary/5 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-primary">Готовый ПК</p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">{formatPrice(totalWithAssembly)}</p>
          </div>
        </div>

        <div className="p-4">
          <Button className="w-full" size="lg" disabled={!canAdd} onClick={onAddToCart}>
            <Icon name="ShoppingCart" size={17} className="mr-1.5" />
            Добавить в корзину
          </Button>
          {!complete ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name="Info" size={13} className="shrink-0 text-primary" />
              Выберите обязательные комплектующие
            </p>
          ) : !compatible ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-destructive">
              <Icon name="TriangleAlert" size={13} className="shrink-0" />
              Есть несовместимые комплектующие
            </p>
          ) : (
            <p className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400">
              <Icon name="CircleCheck" size={13} className="shrink-0" />
              Сборка готова и полностью совместима
            </p>
          )}
        </div>
      </div>

      {/* Ключевые показатели */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-3 text-center">
          <Icon name="CalendarClock" size={16} className="mx-auto text-primary" />
          <p className="mt-1 text-[10px] uppercase text-muted-foreground">Срок</p>
          <p className="text-sm font-semibold">{hasAny ? formatDays(duration) : '—'}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-3 text-center">
          <Icon name="ShieldCheck" size={16} className="mx-auto text-primary" />
          <p className="mt-1 text-[10px] uppercase text-muted-foreground">Гарантия</p>
          <p className="text-sm font-semibold">{hasAny ? formatWarranty(warranty) : '—'}</p>
        </div>
        <div className={cn('rounded-xl border bg-card p-3 text-center', psuOk ? 'border-border/80' : 'border-destructive/50')}>
          <Icon name="Zap" size={16} className={cn('mx-auto', psuOk ? 'text-primary' : 'text-destructive')} />
          <p className="mt-1 text-[10px] uppercase text-muted-foreground">Питание</p>
          <p className="text-sm font-semibold">{power.draw} Вт</p>
        </div>
      </div>

      {/* Предупреждение по питанию */}
      {!psuOk && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          <Icon name="TriangleAlert" size={14} className="mt-0.5 shrink-0" />
          Недостаточная мощность БП. Рекомендуется от {power.recommended} Вт для стабильной работы.
        </div>
      )}

      {/* Энергопотребление */}
      {hasAny && (
        <div className="rounded-xl border border-border/80 bg-card p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Текущее потребление</span>
            <span className="font-medium">{power.draw} Вт</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-muted-foreground">Рекомендуемый БП</span>
            <span className="font-medium">от {power.recommended} Вт</span>
          </div>
        </div>
      )}

      {/* Что входит в стоимость сборки */}
      <div className="rounded-xl border border-border/80 bg-card p-4">
        <h4 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold">
          <Icon name="Wrench" size={15} className="text-primary" /> Что входит в сборку
        </h4>
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {INCLUDED.map((t) => (
            <li key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon name="Check" size={12} className="shrink-0 text-primary" /> {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Производительность */}
      {(build.cpu || build.gpu) && (
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Icon name="Gauge" size={15} className="text-primary" /> Производительность
          </h4>
          <div className="space-y-2.5">
            <Bar label="Игры" value={perf.gaming} icon="Gamepad2" />
            <Bar label="Рабочая станция" value={perf.workstation} icon="Briefcase" />
            <Bar label="Стриминг" value={perf.streaming} icon="Radio" />
            <Bar label="Монтаж" value={perf.editing} icon="Clapperboard" />
            <Bar label="3D-графика" value={perf.render3d} icon="Boxes" />
            <Bar label="ИИ-задачи" value={perf.ai} icon="BrainCircuit" />
          </div>
        </div>
      )}

      {/* Итоговая оценка сборки */}
      {complete && (
        <div className="rounded-xl border border-border/80 bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold">
              <Icon name="Award" size={15} className="text-primary" /> Оценка RazPC
            </h4>
            <span className="font-heading text-xl font-bold text-primary">{ratings.overall}</span>
          </div>
          <div className="space-y-2.5">
            <Bar label="Совместимость" value={ratings.compatibility} />
            <Bar label="Баланс компонентов" value={ratings.balance} />
            <Bar label="Потенциал апгрейда" value={ratings.upgrade} />
            <Bar label="Эффективность охлаждения" value={ratings.cooling} />
            <Bar label="Энергоэффективность" value={ratings.efficiency} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildSummary;
