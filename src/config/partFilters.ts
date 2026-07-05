import { type AnyPart, type PartCategory } from '@/config/pcParts';

export interface FilterDef {
  key: string;
  label: string;
  /** Извлекает значение фильтра из детали (строка для чипов). */
  get: (p: AnyPart) => string | null;
}

const R = (p: AnyPart) => p as unknown as Record<string, unknown>;
const s = (v: unknown) => (v == null ? null : String(v));

export const filterDefs: Record<PartCategory, FilterDef[]> = {
  cpu: [
    { key: 'brand', label: 'Производитель', get: (p) => s(R(p).brand) },
    { key: 'socket', label: 'Сокет', get: (p) => s(R(p).socket) },
    { key: 'memoryType', label: 'Память', get: (p) => s(R(p).memoryType) },
    { key: 'cores', label: 'Ядра', get: (p) => s(R(p).cores) },
  ],
  motherboard: [
    { key: 'socket', label: 'Сокет', get: (p) => s(R(p).socket) },
    { key: 'chipset', label: 'Чипсет', get: (p) => s(R(p).chipset) },
    { key: 'formFactor', label: 'Форм-фактор', get: (p) => s(R(p).formFactor) },
    { key: 'memoryType', label: 'Память', get: (p) => s(R(p).memoryType) },
    { key: 'wifi', label: 'Wi-Fi', get: (p) => (R(p).wifi ? 'Есть' : 'Нет') },
  ],
  gpu: [
    { key: 'brand', label: 'Производитель', get: (p) => s(R(p).brand) },
    { key: 'vramGb', label: 'Видеопамять', get: (p) => `${R(p).vramGb} GB` },
    { key: 'memoryType', label: 'Тип памяти', get: (p) => s(R(p).memoryType) },
    { key: 'rayTracing', label: 'Ray Tracing', get: (p) => (R(p).rayTracing ? 'Есть' : 'Нет') },
  ],
  ram: [
    { key: 'memoryType', label: 'Тип', get: (p) => s(R(p).memoryType) },
    { key: 'capacityGb', label: 'Объём', get: (p) => `${R(p).capacityGb} GB` },
    { key: 'clock', label: 'Частота', get: (p) => `${R(p).clock} МГц` },
  ],
  storage: [
    { key: 'driveType', label: 'Тип', get: (p) => s(R(p).driveType) },
    { key: 'interface', label: 'Интерфейс', get: (p) => s(R(p).interface) },
    { key: 'capacityGb', label: 'Объём', get: (p) => `${(R(p).capacityGb as number) / 1000} ТБ` },
  ],
  psu: [
    { key: 'brand', label: 'Производитель', get: (p) => s(R(p).brand) },
    { key: 'watts', label: 'Мощность', get: (p) => `${R(p).watts} Вт` },
    { key: 'certification', label: 'Сертификат', get: (p) => s(R(p).certification) },
  ],
  cooler: [
    { key: 'coolerType', label: 'Тип', get: (p) => (R(p).coolerType === 'liquid' ? 'СЖО' : 'Воздушный') },
    { key: 'brand', label: 'Производитель', get: (p) => s(R(p).brand) },
  ],
  case: [
    { key: 'brand', label: 'Производитель', get: (p) => s(R(p).brand) },
    { key: 'supportedFormFactors', label: 'Форм-фактор', get: (p) => ((R(p).supportedFormFactors as string[]) || []).join(', ') },
  ],
  fan: [
    { key: 'sizeMm', label: 'Размер', get: (p) => `${R(p).sizeMm} мм` },
    { key: 'brand', label: 'Производитель', get: (p) => s(R(p).brand) },
  ],
};