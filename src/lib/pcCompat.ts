import {
  type AnyPart, type PartCategory,
  type CpuPart, type MotherboardPart, type GpuPart, type RamPart,
  type StoragePart, type PsuPart, type CoolerPart, type CasePart,
} from '@/config/pcParts';

/** Текущая сборка: single-слоты — один part, multiple-слоты — массив */
export interface BuildState {
  cpu?: CpuPart;
  motherboard?: MotherboardPart;
  gpu?: GpuPart;
  ram?: RamPart;
  storage: StoragePart[];
  psu?: PsuPart;
  cooler?: CoolerPart;
  case?: CasePart;
  fan: { part: AnyPart; qty: number }[];
}

export const emptyBuild: BuildState = { storage: [], fan: [] };

export interface CompatResult {
  ok: boolean;
  reasons: string[];
}

/** Проверяет, совместима ли деталь с текущей сборкой (без учёта самой этой категории). */
export function checkCompat(part: AnyPart, build: BuildState): CompatResult {
  const reasons: string[] = [];
  const { cpu, motherboard, gpu, ram, psu, cooler, case: pcCase, storage } = build;

  switch (part.category) {
    case 'cpu': {
      const p = part as CpuPart;
      if (motherboard && motherboard.socket !== p.socket) reasons.push(`Несовместимый сокет: плата ${motherboard.socket}, процессор ${p.socket}`);
      if (motherboard && motherboard.memoryType !== p.memoryType) reasons.push(`Плата поддерживает ${motherboard.memoryType}, процессор — ${p.memoryType}`);
      if (cooler && !cooler.sockets.includes(p.socket)) reasons.push(`Кулер не поддерживает сокет ${p.socket}`);
      if (cooler && cooler.tdpRating < p.tdp) reasons.push(`Кулера недостаточно: ${cooler.tdpRating} Вт < TDP ${p.tdp} Вт`);
      break;
    }
    case 'motherboard': {
      const p = part as MotherboardPart;
      if (cpu && cpu.socket !== p.socket) reasons.push(`Несовместимый сокет: процессор ${cpu.socket}, плата ${p.socket}`);
      if (cpu && cpu.memoryType !== p.memoryType) reasons.push(`Процессор использует ${cpu.memoryType}, плата — ${p.memoryType}`);
      if (ram && ram.memoryType !== p.memoryType) reasons.push(`Память ${ram.memoryType} несовместима с платой ${p.memoryType}`);
      if (pcCase && !pcCase.supportedFormFactors.includes(p.formFactor)) reasons.push(`Корпус не поддерживает форм-фактор ${p.formFactor}`);
      if (storage.filter((s) => s.interface === 'M.2 NVMe').length > p.m2Slots) reasons.push(`Недостаточно слотов M.2 (${p.m2Slots})`);
      if (storage.filter((s) => s.interface === 'SATA').length > p.sataPorts) reasons.push(`Недостаточно портов SATA (${p.sataPorts})`);
      break;
    }
    case 'gpu': {
      const p = part as GpuPart;
      if (pcCase && p.lengthMm > pcCase.maxGpuLengthMm) reasons.push(`Видеокарта длиннее, чем допускает корпус (${p.lengthMm} мм > ${pcCase.maxGpuLengthMm} мм)`);
      if (psu && psu.watts < p.recommendedPsu) reasons.push(`Блока питания недостаточно: рекомендуется от ${p.recommendedPsu} Вт`);
      break;
    }
    case 'ram': {
      const p = part as RamPart;
      if (motherboard && motherboard.memoryType !== p.memoryType) reasons.push(`Память ${p.memoryType} несовместима с платой ${motherboard.memoryType}`);
      if (cpu && cpu.memoryType !== p.memoryType) reasons.push(`Процессор использует ${cpu.memoryType}, память — ${p.memoryType}`);
      if (motherboard && p.modules > motherboard.ramSlots) reasons.push(`На плате всего ${motherboard.ramSlots} слота памяти`);
      break;
    }
    case 'storage': {
      const p = part as StoragePart;
      if (motherboard) {
        const usedM2 = storage.filter((s) => s.interface === 'M.2 NVMe').length;
        const usedSata = storage.filter((s) => s.interface === 'SATA').length;
        if (p.interface === 'M.2 NVMe' && usedM2 >= motherboard.m2Slots) reasons.push(`Все слоты M.2 заняты (${motherboard.m2Slots})`);
        if (p.interface === 'SATA' && usedSata >= motherboard.sataPorts) reasons.push(`Все порты SATA заняты (${motherboard.sataPorts})`);
      }
      break;
    }
    case 'psu': {
      const p = part as PsuPart;
      const draw = estimatePower(build);
      if (draw.recommended > p.watts) reasons.push(`Недостаточная мощность: нужно от ${draw.recommended} Вт, у блока ${p.watts} Вт`);
      break;
    }
    case 'cooler': {
      const p = part as CoolerPart;
      if (cpu && !p.sockets.includes(cpu.socket)) reasons.push(`Кулер не поддерживает сокет ${cpu.socket}`);
      if (cpu && p.tdpRating < cpu.tdp) reasons.push(`Кулера недостаточно для TDP ${cpu.tdp} Вт`);
      if (p.coolerType === 'air' && pcCase && p.heightMm > pcCase.maxCoolerHeightMm) reasons.push(`Кулер выше, чем допускает корпус (${p.heightMm} мм > ${pcCase.maxCoolerHeightMm} мм)`);
      if (p.coolerType === 'liquid' && pcCase && p.radiatorMm > pcCase.radiatorSupport) reasons.push(`Корпус не поддерживает радиатор ${p.radiatorMm} мм`);
      break;
    }
    case 'case': {
      const p = part as CasePart;
      if (motherboard && !p.supportedFormFactors.includes(motherboard.formFactor)) reasons.push(`Корпус не поддерживает форм-фактор платы ${motherboard.formFactor}`);
      if (gpu && gpu.lengthMm > p.maxGpuLengthMm) reasons.push(`Видеокарта не поместится (${gpu.lengthMm} мм > ${p.maxGpuLengthMm} мм)`);
      if (cooler?.coolerType === 'air' && cooler.heightMm > p.maxCoolerHeightMm) reasons.push(`Кулер выше допустимого (${cooler.heightMm} мм)`);
      if (cooler?.coolerType === 'liquid' && cooler.radiatorMm > p.radiatorSupport) reasons.push(`Радиатор СЖО не помещается (${cooler.radiatorMm} мм)`);
      break;
    }
    case 'fan':
      break;
  }

  return { ok: reasons.length === 0, reasons };
}

/** Энергопотребление и рекомендуемая мощность БП. */
export function estimatePower(build: BuildState): { draw: number; recommended: number } {
  let draw = 40; // база: плата, накопители, вентиляторы
  if (build.cpu) draw += build.cpu.tdp;
  if (build.gpu) draw += build.gpu.tdp;
  if (build.ram) draw += 10;
  draw += build.storage.length * 8;
  draw += build.fan.reduce((s, f) => s + f.qty * 2, 0);
  const recommended = Math.ceil((draw * 1.4) / 50) * 50;
  return { draw, recommended };
}

/** Срок сборки: макс. срок поставки + 2 дня на сборку. */
export function buildDuration(build: BuildState): number {
  const parts = collectParts(build);
  const maxLead = parts.reduce((m, p) => Math.max(m, p.leadDays), 0);
  return maxLead + 2;
}

/** Гарантия = минимальная гарантия среди комплектующих. */
export function buildWarranty(build: BuildState): number {
  const parts = collectParts(build);
  if (!parts.length) return 0;
  return parts.reduce((m, p) => Math.min(m, p.warrantyMonths), Infinity);
}

export function collectParts(build: BuildState): AnyPart[] {
  const list: AnyPart[] = [];
  (['cpu', 'motherboard', 'gpu', 'ram', 'psu', 'cooler', 'case'] as const).forEach((k) => {
    const p = build[k];
    if (p) list.push(p);
  });
  build.storage.forEach((s) => list.push(s));
  build.fan.forEach((f) => list.push(f.part));
  return list;
}

export function partsCost(build: BuildState): number {
  let sum = 0;
  (['cpu', 'motherboard', 'gpu', 'ram', 'psu', 'cooler', 'case'] as const).forEach((k) => {
    const p = build[k];
    if (p) sum += p.price;
  });
  build.storage.forEach((s) => { sum += s.price; });
  build.fan.forEach((f) => { sum += f.part.price * f.qty; });
  return sum;
}

export const ASSEMBLY_RATE = 0.07;
export function assemblyCost(parts: number): number {
  return Math.round(parts * ASSEMBLY_RATE);
}

/** Обязательные категории заполнены? */
export function isBuildComplete(build: BuildState): boolean {
  return !!(build.cpu && build.motherboard && build.gpu && build.ram
    && build.storage.length > 0 && build.psu && build.cooler && build.case);
}

/** Все выбранные детали совместимы между собой? */
export function isBuildCompatible(build: BuildState): boolean {
  const parts = collectParts(build);
  for (const p of parts) {
    // Собираем сборку без самой детали её категории
    const without = removeFromBuild(build, p);
    if (!checkCompat(p, without).ok) return false;
  }
  return true;
}

function removeFromBuild(build: BuildState, part: AnyPart): BuildState {
  const clone: BuildState = { ...build, storage: [...build.storage], fan: [...build.fan] };
  switch (part.category) {
    case 'cpu': clone.cpu = undefined; break;
    case 'motherboard': clone.motherboard = undefined; break;
    case 'gpu': clone.gpu = undefined; break;
    case 'ram': clone.ram = undefined; break;
    case 'psu': clone.psu = undefined; break;
    case 'cooler': clone.cooler = undefined; break;
    case 'case': clone.case = undefined; break;
    case 'storage': clone.storage = clone.storage.filter((s) => s.id !== part.id); break;
    default: break;
  }
  return clone;
}

// ==================== Производительность ====================
export interface PerformanceScores {
  gaming: number;
  workstation: number;
  streaming: number;
  editing: number;
  render3d: number;
  ai: number;
}

export function performanceScores(build: BuildState): PerformanceScores {
  const cpu = build.cpu?.perfCpu ?? 0;
  const gpu = build.gpu?.perfGpu ?? 0;
  const ramGb = build.ram?.capacityGb ?? 0;
  const ramScore = Math.min(100, (ramGb / 64) * 100);
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  return {
    gaming: clamp(gpu * 0.7 + cpu * 0.3),
    workstation: clamp(cpu * 0.6 + ramScore * 0.4),
    streaming: clamp(cpu * 0.5 + gpu * 0.3 + ramScore * 0.2),
    editing: clamp(cpu * 0.45 + gpu * 0.25 + ramScore * 0.3),
    render3d: clamp(gpu * 0.55 + cpu * 0.35 + ramScore * 0.1),
    ai: clamp(gpu * 0.6 + ramScore * 0.4),
  };
}

// ==================== Итоговая оценка ====================
export interface BuildRatings {
  compatibility: number;
  balance: number;
  upgrade: number;
  cooling: number;
  efficiency: number;
  overall: number;
}

export function buildRatings(build: BuildState): BuildRatings {
  const complete = isBuildComplete(build);
  const compat = isBuildCompatible(build);
  const compatibility = compat ? (complete ? 100 : 80) : 30;

  // Баланс: насколько близки CPU и GPU по классу
  const cpuP = build.cpu?.perfCpu ?? 0;
  const gpuP = build.gpu?.perfGpu ?? 0;
  const balance = cpuP && gpuP ? Math.max(0, 100 - Math.abs(cpuP - gpuP) * 1.2) : 0;

  // Апгрейд: свободные слоты платы + запас мощности БП
  let upgrade = 40;
  if (build.motherboard) {
    const freeM2 = build.motherboard.m2Slots - build.storage.filter((s) => s.interface === 'M.2 NVMe').length;
    const freeRam = build.motherboard.ramSlots - (build.ram?.modules ?? 0);
    upgrade = Math.min(100, 40 + freeM2 * 12 + freeRam * 10);
  }
  if (build.psu) {
    const { recommended } = estimatePower(build);
    const headroom = build.psu.watts - recommended;
    upgrade = Math.min(100, upgrade + Math.max(0, headroom / 10));
  }

  // Охлаждение: рейтинг кулера vs TDP CPU
  let cooling = 50;
  if (build.cooler && build.cpu) {
    cooling = Math.min(100, (build.cooler.tdpRating / Math.max(1, build.cpu.tdp)) * 60);
    if (build.cooler.coolerType === 'liquid') cooling = Math.min(100, cooling + 10);
    cooling += Math.min(20, build.fan.reduce((s, f) => s + f.qty, 0) * 4);
    cooling = Math.min(100, cooling);
  }

  // Энергоэффективность: сертификат БП + запас
  let efficiency = 50;
  if (build.psu) {
    const certMap: Record<string, number> = { '80+ Bronze': 65, '80+ Gold': 90, '80+ Platinum': 95 };
    efficiency = certMap[build.psu.certification] ?? 60;
  }

  const round = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const r = {
    compatibility: round(compatibility),
    balance: round(balance),
    upgrade: round(upgrade),
    cooling: round(cooling),
    efficiency: round(efficiency),
  };
  const overall = round((r.compatibility + r.balance + r.upgrade + r.cooling + r.efficiency) / 5);
  return { ...r, overall };
}

export function formatPrice(v: number): string {
  return Math.round(v || 0).toLocaleString('ru-RU') + ' ₽';
}

export function formatWarranty(months: number): string {
  if (!months || months === Infinity) return '—';
  if (months % 12 === 0) return `${months / 12} ${plural(months / 12, 'год', 'года', 'лет')}`;
  return `${months} мес.`;
}

export function formatDays(days: number): string {
  return `${days} ${plural(days, 'день', 'дня', 'дней')}`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
