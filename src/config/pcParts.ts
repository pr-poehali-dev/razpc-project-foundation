export type Condition = 'new' | 'used';

export interface BasePart {
  id: string;
  category: PartCategory;
  brand: string;
  name: string;
  price: number;
  image?: string;
  warrantyMonths: number;
  condition: Condition;
  /** Срок поставки в днях; 0 = в наличии */
  leadDays: number;
  shortSpecs: string[];
}

export type PartCategory =
  | 'cpu' | 'motherboard' | 'gpu' | 'ram'
  | 'storage' | 'psu' | 'cooler' | 'case' | 'fan';

export interface CpuPart extends BasePart {
  category: 'cpu';
  socket: string;
  cores: number;
  threads: number;
  baseClock: number;
  boostClock: number;
  cacheMb: number;
  tdp: number;
  memoryType: 'DDR4' | 'DDR5';
  igpu: boolean;
  perfCpu: number;
}

export interface MotherboardPart extends BasePart {
  category: 'motherboard';
  socket: string;
  chipset: string;
  formFactor: 'ATX' | 'mATX' | 'Mini-ITX';
  memoryType: 'DDR4' | 'DDR5';
  maxMemClock: number;
  ramSlots: number;
  m2Slots: number;
  sataPorts: number;
  wifi: boolean;
}

export interface GpuPart extends BasePart {
  category: 'gpu';
  vramGb: number;
  memoryType: string;
  lengthMm: number;
  tdp: number;
  rayTracing: boolean;
  perfGpu: number;
  recommendedPsu: number;
}

export interface RamPart extends BasePart {
  category: 'ram';
  memoryType: 'DDR4' | 'DDR5';
  capacityGb: number;
  modules: number;
  clock: number;
}

export interface StoragePart extends BasePart {
  category: 'storage';
  driveType: 'SSD M.2' | 'SSD SATA' | 'HDD';
  interface: 'M.2 NVMe' | 'SATA';
  capacityGb: number;
}

export interface PsuPart extends BasePart {
  category: 'psu';
  watts: number;
  certification: string;
  formFactor: string;
}

export interface CoolerPart extends BasePart {
  category: 'cooler';
  coolerType: 'air' | 'liquid';
  heightMm: number;
  radiatorMm: number;
  tdpRating: number;
  sockets: string[];
}

export interface CasePart extends BasePart {
  category: 'case';
  supportedFormFactors: ('ATX' | 'mATX' | 'Mini-ITX')[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  radiatorSupport: number;
  fanSlots: number;
}

export interface FanPart extends BasePart {
  category: 'fan';
  sizeMm: number;
}

export type AnyPart =
  | CpuPart | MotherboardPart | GpuPart | RamPart
  | StoragePart | PsuPart | CoolerPart | CasePart | FanPart;

export interface SlotDef {
  category: PartCategory;
  title: string;
  icon: string;
  required: boolean;
  multiple: boolean;
  hint: string;
}

export const slots: SlotDef[] = [
  { category: 'cpu', title: 'Процессор', icon: 'Cpu', required: true, multiple: false, hint: 'Определяет общую производительность' },
  { category: 'motherboard', title: 'Материнская плата', icon: 'CircuitBoard', required: true, multiple: false, hint: 'Объединяет все комплектующие' },
  { category: 'gpu', title: 'Видеокарта', icon: 'MonitorPlay', required: true, multiple: false, hint: 'Графика в играх и работе' },
  { category: 'ram', title: 'Оперативная память', icon: 'MemoryStick', required: true, multiple: false, hint: 'Скорость и многозадачность' },
  { category: 'storage', title: 'Накопители', icon: 'HardDrive', required: true, multiple: true, hint: 'Можно добавить несколько дисков' },
  { category: 'psu', title: 'Блок питания', icon: 'Plug', required: true, multiple: false, hint: 'Надёжное питание системы' },
  { category: 'cooler', title: 'Охлаждение процессора', icon: 'Snowflake', required: true, multiple: false, hint: 'Держит температуру CPU под контролем' },
  { category: 'case', title: 'Корпус', icon: 'Box', required: true, multiple: false, hint: 'Форм-фактор, охлаждение, вид' },
  { category: 'fan', title: 'Вентиляторы', icon: 'Fan', required: false, multiple: true, hint: 'Корпусные вентиляторы, любое количество' },
];

const img = (seed: string) => `https://source.unsplash.com/160x160/?${seed}`;

// ============================ CPU ============================
export const cpus: CpuPart[] = [
  { id: 'cpu-i3-12100f', category: 'cpu', brand: 'Intel', name: 'Core i3-12100F', price: 8500, warrantyMonths: 36, condition: 'new', leadDays: 0, socket: 'LGA1700', cores: 4, threads: 8, baseClock: 3.3, boostClock: 4.3, cacheMb: 12, tdp: 89, memoryType: 'DDR5', igpu: false, perfCpu: 45, shortSpecs: ['4 ядра / 8 потоков', 'до 4.3 ГГц', 'LGA1700'] },
  { id: 'cpu-i5-13400f', category: 'cpu', brand: 'Intel', name: 'Core i5-13400F', price: 17500, warrantyMonths: 36, condition: 'new', leadDays: 2, socket: 'LGA1700', cores: 10, threads: 16, baseClock: 2.5, boostClock: 4.6, cacheMb: 20, tdp: 148, memoryType: 'DDR5', igpu: false, perfCpu: 68, shortSpecs: ['10 ядер / 16 потоков', 'до 4.6 ГГц', 'LGA1700'] },
  { id: 'cpu-i7-13700f', category: 'cpu', brand: 'Intel', name: 'Core i7-13700F', price: 33000, warrantyMonths: 36, condition: 'new', leadDays: 3, socket: 'LGA1700', cores: 16, threads: 24, baseClock: 2.1, boostClock: 5.2, cacheMb: 30, tdp: 219, memoryType: 'DDR5', igpu: false, perfCpu: 88, shortSpecs: ['16 ядер / 24 потока', 'до 5.2 ГГц', 'LGA1700'] },
  { id: 'cpu-r5-5600', category: 'cpu', brand: 'AMD', name: 'Ryzen 5 5600', price: 9500, warrantyMonths: 36, condition: 'new', leadDays: 0, socket: 'AM4', cores: 6, threads: 12, baseClock: 3.5, boostClock: 4.4, cacheMb: 35, tdp: 65, memoryType: 'DDR4', igpu: false, perfCpu: 58, shortSpecs: ['6 ядер / 12 потоков', 'до 4.4 ГГц', 'AM4'] },
  { id: 'cpu-r5-7600', category: 'cpu', brand: 'AMD', name: 'Ryzen 5 7600', price: 19500, warrantyMonths: 36, condition: 'new', leadDays: 4, socket: 'AM5', cores: 6, threads: 12, baseClock: 3.8, boostClock: 5.1, cacheMb: 38, tdp: 105, memoryType: 'DDR5', igpu: true, perfCpu: 72, shortSpecs: ['6 ядер / 12 потоков', 'до 5.1 ГГц', 'AM5'] },
  { id: 'cpu-r7-7800x3d', category: 'cpu', brand: 'AMD', name: 'Ryzen 7 7800X3D', price: 42000, warrantyMonths: 36, condition: 'new', leadDays: 7, socket: 'AM5', cores: 8, threads: 16, baseClock: 4.2, boostClock: 5.0, cacheMb: 104, tdp: 120, memoryType: 'DDR5', igpu: true, perfCpu: 96, shortSpecs: ['8 ядер / 16 потоков', '3D V-Cache', 'AM5'] },
];

// ======================= MOTHERBOARD ========================
export const motherboards: MotherboardPart[] = [
  { id: 'mb-h610m', category: 'motherboard', brand: 'ASUS', name: 'PRIME H610M-K', price: 9000, warrantyMonths: 36, condition: 'new', leadDays: 0, socket: 'LGA1700', chipset: 'H610', formFactor: 'mATX', memoryType: 'DDR5', maxMemClock: 4800, ramSlots: 2, m2Slots: 1, sataPorts: 4, wifi: false, shortSpecs: ['LGA1700', 'mATX', 'DDR5'] },
  { id: 'mb-b760', category: 'motherboard', brand: 'MSI', name: 'B760 GAMING PLUS WIFI', price: 15500, warrantyMonths: 36, condition: 'new', leadDays: 2, socket: 'LGA1700', chipset: 'B760', formFactor: 'ATX', memoryType: 'DDR5', maxMemClock: 7200, ramSlots: 4, m2Slots: 2, sataPorts: 6, wifi: true, shortSpecs: ['LGA1700', 'ATX', 'DDR5', 'Wi-Fi'] },
  { id: 'mb-b550', category: 'motherboard', brand: 'Gigabyte', name: 'B550 AORUS ELITE', price: 12000, warrantyMonths: 36, condition: 'new', leadDays: 0, socket: 'AM4', chipset: 'B550', formFactor: 'ATX', memoryType: 'DDR4', maxMemClock: 4400, ramSlots: 4, m2Slots: 2, sataPorts: 6, wifi: false, shortSpecs: ['AM4', 'ATX', 'DDR4'] },
  { id: 'mb-b650', category: 'motherboard', brand: 'Gigabyte', name: 'B650 AORUS ELITE AX', price: 18500, warrantyMonths: 36, condition: 'new', leadDays: 4, socket: 'AM5', chipset: 'B650', formFactor: 'ATX', memoryType: 'DDR5', maxMemClock: 6600, ramSlots: 4, m2Slots: 3, sataPorts: 4, wifi: true, shortSpecs: ['AM5', 'ATX', 'DDR5', 'Wi-Fi'] },
  { id: 'mb-x670e', category: 'motherboard', brand: 'ASUS', name: 'ROG STRIX X670E-A', price: 34000, warrantyMonths: 36, condition: 'new', leadDays: 5, socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memoryType: 'DDR5', maxMemClock: 6800, ramSlots: 4, m2Slots: 4, sataPorts: 6, wifi: true, shortSpecs: ['AM5', 'ATX', 'DDR5', '4×M.2'] },
];

// ============================ GPU ===========================
export const gpus: GpuPart[] = [
  { id: 'gpu-rtx4060', category: 'gpu', brand: 'NVIDIA', name: 'GeForce RTX 4060', price: 32000, warrantyMonths: 36, condition: 'new', leadDays: 0, vramGb: 8, memoryType: 'GDDR6', lengthMm: 245, tdp: 115, rayTracing: true, perfGpu: 55, recommendedPsu: 550, shortSpecs: ['8 GB GDDR6', 'Full HD', 'RT'] },
  { id: 'gpu-rtx4060ti', category: 'gpu', brand: 'NVIDIA', name: 'GeForce RTX 4060 Ti', price: 45000, warrantyMonths: 36, condition: 'new', leadDays: 3, vramGb: 16, memoryType: 'GDDR6', lengthMm: 280, tdp: 165, rayTracing: true, perfGpu: 68, recommendedPsu: 600, shortSpecs: ['16 GB GDDR6', '1440p', 'RT'] },
  { id: 'gpu-rtx4070s', category: 'gpu', brand: 'NVIDIA', name: 'GeForce RTX 4070 Super', price: 68000, warrantyMonths: 36, condition: 'new', leadDays: 7, vramGb: 12, memoryType: 'GDDR6X', lengthMm: 305, tdp: 220, rayTracing: true, perfGpu: 82, recommendedPsu: 700, shortSpecs: ['12 GB GDDR6X', '2K/4K', 'RT'] },
  { id: 'gpu-rtx4080s', category: 'gpu', brand: 'NVIDIA', name: 'GeForce RTX 4080 Super', price: 105000, warrantyMonths: 36, condition: 'new', leadDays: 10, vramGb: 16, memoryType: 'GDDR6X', lengthMm: 336, tdp: 320, rayTracing: true, perfGpu: 95, recommendedPsu: 850, shortSpecs: ['16 GB GDDR6X', '4K', 'RT'] },
  { id: 'gpu-rx7600', category: 'gpu', brand: 'AMD', name: 'Radeon RX 7600', price: 29000, warrantyMonths: 36, condition: 'new', leadDays: 2, vramGb: 8, memoryType: 'GDDR6', lengthMm: 270, tdp: 165, rayTracing: true, perfGpu: 52, recommendedPsu: 550, shortSpecs: ['8 GB GDDR6', 'Full HD', 'RT'] },
];

// ============================ RAM ===========================
export const rams: RamPart[] = [
  { id: 'ram-ddr4-16', category: 'ram', brand: 'Kingston', name: 'FURY Beast 16 GB', price: 3800, warrantyMonths: 60, condition: 'new', leadDays: 0, memoryType: 'DDR4', capacityGb: 16, modules: 2, clock: 3200, shortSpecs: ['2×8 GB', 'DDR4-3200'] },
  { id: 'ram-ddr4-32', category: 'ram', brand: 'Kingston', name: 'FURY Beast 32 GB', price: 7200, warrantyMonths: 60, condition: 'new', leadDays: 0, memoryType: 'DDR4', capacityGb: 32, modules: 2, clock: 3600, shortSpecs: ['2×16 GB', 'DDR4-3600'] },
  { id: 'ram-ddr5-16', category: 'ram', brand: 'Kingston', name: 'FURY Beast 16 GB', price: 5500, warrantyMonths: 60, condition: 'new', leadDays: 0, memoryType: 'DDR5', capacityGb: 16, modules: 2, clock: 5200, shortSpecs: ['2×8 GB', 'DDR5-5200'] },
  { id: 'ram-ddr5-32', category: 'ram', brand: 'Kingston', name: 'FURY Beast 32 GB', price: 10500, warrantyMonths: 60, condition: 'new', leadDays: 2, memoryType: 'DDR5', capacityGb: 32, modules: 2, clock: 6000, shortSpecs: ['2×16 GB', 'DDR5-6000'] },
  { id: 'ram-ddr5-64', category: 'ram', brand: 'Corsair', name: 'Vengeance 64 GB', price: 21000, warrantyMonths: 60, condition: 'new', leadDays: 3, memoryType: 'DDR5', capacityGb: 64, modules: 2, clock: 6000, shortSpecs: ['2×32 GB', 'DDR5-6000'] },
];

// ========================= STORAGE ==========================
export const storages: StoragePart[] = [
  { id: 'st-980-1t', category: 'storage', brand: 'Samsung', name: '980 1 TB', price: 7500, warrantyMonths: 60, condition: 'new', leadDays: 0, driveType: 'SSD M.2', interface: 'M.2 NVMe', capacityGb: 1000, shortSpecs: ['NVMe M.2', '1 ТБ', 'до 3500 МБ/с'] },
  { id: 'st-990-1t', category: 'storage', brand: 'Samsung', name: '990 Pro 1 TB', price: 11000, warrantyMonths: 60, condition: 'new', leadDays: 0, driveType: 'SSD M.2', interface: 'M.2 NVMe', capacityGb: 1000, shortSpecs: ['NVMe M.2', '1 ТБ', 'до 7450 МБ/с'] },
  { id: 'st-990-2t', category: 'storage', brand: 'Samsung', name: '990 Pro 2 TB', price: 19000, warrantyMonths: 60, condition: 'new', leadDays: 2, driveType: 'SSD M.2', interface: 'M.2 NVMe', capacityGb: 2000, shortSpecs: ['NVMe M.2', '2 ТБ', 'до 7450 МБ/с'] },
  { id: 'st-870-1t', category: 'storage', brand: 'Samsung', name: '870 EVO 1 TB', price: 8000, warrantyMonths: 60, condition: 'new', leadDays: 0, driveType: 'SSD SATA', interface: 'SATA', capacityGb: 1000, shortSpecs: ['SATA SSD', '1 ТБ', 'до 560 МБ/с'] },
  { id: 'st-hdd-2t', category: 'storage', brand: 'Seagate', name: 'BarraCuda 2 TB', price: 5500, warrantyMonths: 24, condition: 'new', leadDays: 0, driveType: 'HDD', interface: 'SATA', capacityGb: 2000, shortSpecs: ['HDD 7200', '2 ТБ', 'SATA'] },
  { id: 'st-hdd-4t', category: 'storage', brand: 'Seagate', name: 'BarraCuda 4 TB', price: 8500, warrantyMonths: 24, condition: 'new', leadDays: 3, driveType: 'HDD', interface: 'SATA', capacityGb: 4000, shortSpecs: ['HDD 5400', '4 ТБ', 'SATA'] },
];

// ============================ PSU ===========================
export const psus: PsuPart[] = [
  { id: 'psu-550', category: 'psu', brand: 'DeepCool', name: 'PK550D', price: 4500, warrantyMonths: 36, condition: 'new', leadDays: 0, watts: 550, certification: '80+ Bronze', formFactor: 'ATX', shortSpecs: ['550 Вт', '80+ Bronze'] },
  { id: 'psu-650', category: 'psu', brand: 'DeepCool', name: 'PK650D', price: 5500, warrantyMonths: 36, condition: 'new', leadDays: 0, watts: 650, certification: '80+ Bronze', formFactor: 'ATX', shortSpecs: ['650 Вт', '80+ Bronze'] },
  { id: 'psu-750', category: 'psu', brand: 'be quiet!', name: 'Pure Power 12 750W', price: 9500, warrantyMonths: 60, condition: 'new', leadDays: 2, watts: 750, certification: '80+ Gold', formFactor: 'ATX', shortSpecs: ['750 Вт', '80+ Gold'] },
  { id: 'psu-850', category: 'psu', brand: 'Corsair', name: 'RM850e', price: 13000, warrantyMonths: 84, condition: 'new', leadDays: 3, watts: 850, certification: '80+ Gold', formFactor: 'ATX', shortSpecs: ['850 Вт', '80+ Gold', 'модульный'] },
  { id: 'psu-1000', category: 'psu', brand: 'Corsair', name: 'RM1000e', price: 17500, warrantyMonths: 84, condition: 'new', leadDays: 5, watts: 1000, certification: '80+ Gold', formFactor: 'ATX', shortSpecs: ['1000 Вт', '80+ Gold', 'модульный'] },
];

// ========================== COOLER ==========================
export const coolers: CoolerPart[] = [
  { id: 'cool-ak400', category: 'cooler', brand: 'DeepCool', name: 'AK400', price: 3000, warrantyMonths: 36, condition: 'new', leadDays: 0, coolerType: 'air', heightMm: 155, radiatorMm: 0, tdpRating: 150, sockets: ['LGA1700', 'AM4', 'AM5'], shortSpecs: ['Башенный', '150 Вт TDP', '155 мм'] },
  { id: 'cool-ak620', category: 'cooler', brand: 'DeepCool', name: 'AK620', price: 6000, warrantyMonths: 36, condition: 'new', leadDays: 2, coolerType: 'air', heightMm: 160, radiatorMm: 0, tdpRating: 260, sockets: ['LGA1700', 'AM4', 'AM5'], shortSpecs: ['2 башни', '260 Вт TDP', '160 мм'] },
  { id: 'cool-darkrock', category: 'cooler', brand: 'be quiet!', name: 'Dark Rock 4', price: 7500, warrantyMonths: 36, condition: 'new', leadDays: 3, coolerType: 'air', heightMm: 159, radiatorMm: 0, tdpRating: 200, sockets: ['LGA1700', 'AM4', 'AM5'], shortSpecs: ['Тихий', '200 Вт TDP', '159 мм'] },
  { id: 'cool-lf240', category: 'cooler', brand: 'Arctic', name: 'Liquid Freezer III 240', price: 9000, warrantyMonths: 72, condition: 'new', leadDays: 4, coolerType: 'liquid', heightMm: 0, radiatorMm: 240, tdpRating: 280, sockets: ['LGA1700', 'AM4', 'AM5'], shortSpecs: ['СЖО 240 мм', '280 Вт TDP'] },
  { id: 'cool-lf360', category: 'cooler', brand: 'Arctic', name: 'Liquid Freezer III 360', price: 12000, warrantyMonths: 72, condition: 'new', leadDays: 5, coolerType: 'liquid', heightMm: 0, radiatorMm: 360, tdpRating: 350, sockets: ['LGA1700', 'AM4', 'AM5'], shortSpecs: ['СЖО 360 мм', '350 Вт TDP'] },
];

// =========================== CASE ===========================
export const cases: CasePart[] = [
  { id: 'case-cc560', category: 'case', brand: 'DeepCool', name: 'CC560', price: 5000, warrantyMonths: 24, condition: 'new', leadDays: 0, supportedFormFactors: ['ATX', 'mATX', 'Mini-ITX'], maxGpuLengthMm: 370, maxCoolerHeightMm: 165, radiatorSupport: 280, fanSlots: 6, shortSpecs: ['ATX', 'до 370 мм GPU', '4 вентилятора'] },
  { id: 'case-lancool', category: 'case', brand: 'Lian Li', name: 'Lancool 216', price: 9000, warrantyMonths: 24, condition: 'new', leadDays: 2, supportedFormFactors: ['ATX', 'mATX', 'Mini-ITX'], maxGpuLengthMm: 392, maxCoolerHeightMm: 180, radiatorSupport: 360, fanSlots: 7, shortSpecs: ['ATX', 'до 392 мм GPU', 'сетчатый'] },
  { id: 'case-h7flow', category: 'case', brand: 'NZXT', name: 'H7 Flow', price: 13500, warrantyMonths: 24, condition: 'new', leadDays: 3, supportedFormFactors: ['ATX', 'mATX', 'Mini-ITX'], maxGpuLengthMm: 400, maxCoolerHeightMm: 185, radiatorSupport: 360, fanSlots: 7, shortSpecs: ['ATX', 'до 400 мм GPU', 'премиум'] },
  { id: 'case-nr200', category: 'case', brand: 'Cooler Master', name: 'NR200P', price: 8500, warrantyMonths: 24, condition: 'new', leadDays: 4, supportedFormFactors: ['Mini-ITX'], maxGpuLengthMm: 330, maxCoolerHeightMm: 155, radiatorSupport: 280, fanSlots: 4, shortSpecs: ['Mini-ITX', 'компактный', 'до 330 мм GPU'] },
];

// =========================== FAN ============================
export const fans: FanPart[] = [
  { id: 'fan-ak120', category: 'fan', brand: 'Arctic', name: 'P12 120 мм', price: 700, warrantyMonths: 72, condition: 'new', leadDays: 0, sizeMm: 120, shortSpecs: ['120 мм', 'тихий'] },
  { id: 'fan-argb', category: 'fan', brand: 'DeepCool', name: 'FC120 ARGB', price: 1100, warrantyMonths: 24, condition: 'new', leadDays: 0, sizeMm: 120, shortSpecs: ['120 мм', 'ARGB'] },
  { id: 'fan-140', category: 'fan', brand: 'be quiet!', name: 'Pure Wings 3 140 мм', price: 1300, warrantyMonths: 36, condition: 'new', leadDays: 2, sizeMm: 140, shortSpecs: ['140 мм', 'тихий'] },
];

export const partsByCategory: Record<PartCategory, AnyPart[]> = {
  cpu: cpus,
  motherboard: motherboards,
  gpu: gpus,
  ram: rams,
  storage: storages,
  psu: psus,
  cooler: coolers,
  case: cases,
  fan: fans,
};

export function findPart(id: string): AnyPart | undefined {
  for (const list of Object.values(partsByCategory)) {
    const p = list.find((x) => x.id === id);
    if (p) return p;
  }
  return undefined;
}
