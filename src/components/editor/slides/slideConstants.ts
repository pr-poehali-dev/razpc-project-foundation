import type { Slide, SlideTextStyle } from '@/api/slides';
import { makeId } from '@/api/slides';

export const FONT_SIZES = [
  { label: 'XS', value: 'text-xs' },
  { label: 'S', value: 'text-base' },
  { label: 'M', value: 'text-2xl' },
  { label: 'L', value: 'text-4xl' },
  { label: 'XL', value: 'text-5xl' },
  { label: '2XL', value: 'text-6xl' },
  { label: '3XL', value: 'text-7xl' },
];

export const FONTS = [
  { label: 'Основной', value: '' },
  { label: 'Заголовочный', value: 'font-heading' },
];

export const WEIGHTS = [
  { label: 'Обычный', value: 'font-normal' },
  { label: 'Средний', value: 'font-medium' },
  { label: 'Жирный', value: 'font-bold' },
];

export const ALIGNS = [
  { icon: 'AlignLeft', value: 'text-left' },
  { icon: 'AlignCenter', value: 'text-center' },
  { icon: 'AlignRight', value: 'text-right' },
];

export const COLORS = [
  { label: 'Белый', value: 'hsl(var(--foreground))' },
  { label: 'Жёлтый', value: 'hsl(var(--primary))' },
  { label: 'Серый', value: 'hsl(var(--muted-foreground))' },
  { label: 'Тёмный', value: 'hsl(var(--background))' },
  { label: 'Успех', value: 'hsl(var(--success))' },
  { label: 'Ошибка', value: 'hsl(var(--destructive))' },
];

export const DEFAULT_TEXT_STYLE: SlideTextStyle = {
  size: 'text-4xl',
  font: 'font-heading',
  weight: 'font-bold',
  align: 'text-left',
  color: 'hsl(var(--foreground))',
};

export function styleToClass(s?: SlideTextStyle): string {
  if (!s) return '';
  return [s.size, s.font, s.weight, s.align].filter(Boolean).join(' ');
}

export function emptySlide(): Slide {
  return {
    id: makeId(),
    bgColor: 'hsl(var(--card))',
    bgImage: '',
    elements: [
      {
        id: makeId(),
        type: 'text',
        x: 8,
        y: 40,
        w: 60,
        value: 'Новый заголовок',
        style: { ...DEFAULT_TEXT_STYLE },
      },
    ],
  };
}
