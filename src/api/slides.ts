import { getToken } from './auth';

const SLIDES_URL = 'https://functions.poehali.dev/9109a341-ea55-465b-b4b0-7503dfba0084';

export interface SlideTextStyle {
  size?: string;      // tailwind: text-xl, text-4xl ...
  font?: string;      // '' | font-heading
  weight?: string;    // font-normal | font-medium | font-bold
  align?: string;     // text-left | text-center | text-right
  color?: string;     // css color / var
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image';
  /** позиция в % от ширины/высоты слайда (левый-верхний угол) */
  x: number;
  y: number;
  /** ширина в % от ширины слайда */
  w: number;
  /** для текста: содержимое; для image: url */
  value: string;
  style?: SlideTextStyle;
}

export interface Slide {
  id: string;
  /** фон: цвет или '' */
  bgColor?: string;
  /** фон: изображение url или '' */
  bgImage?: string;
  elements: SlideElement[];
}

export async function fetchSlides(buildId: number): Promise<Slide[]> {
  const res = await fetch(`${SLIDES_URL}?build_id=${buildId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.slides || []) as Slide[];
}

export async function saveSlides(buildId: number, slides: Slide[]): Promise<void> {
  const res = await fetch(SLIDES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() || '' },
    body: JSON.stringify({ build_id: buildId, slides }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось сохранить слайды');
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}
