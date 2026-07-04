import { useState } from 'react';
import Icon from '@/components/ui/icon';
import PageHeader from '@/components/shared/PageHeader';
import ProductCard from '@/components/shared/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const PC_IMG = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/files/0bceaf37-e17a-472e-a443-4a36f05d9e73.jpg';

const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section className="border-t border-border py-14">
    <div className="mb-8">
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
);

const swatches = [
  { name: 'Background', var: 'bg-background', ring: true },
  { name: 'Card', var: 'bg-card', ring: true },
  { name: 'Secondary', var: 'bg-secondary' },
  { name: 'Muted', var: 'bg-muted' },
  { name: 'Primary', var: 'bg-primary' },
  { name: 'Accent', var: 'bg-accent' },
  { name: 'Success', var: 'bg-success' },
  { name: 'Warning', var: 'bg-warning' },
  { name: 'Destructive', var: 'bg-destructive' },
];

const UiKit = () => {
  const { toast } = useToast();
  const [checked, setChecked] = useState(true);

  return (
    <>
      <PageHeader
        icon="Palette"
        eyebrow="Дизайн-система"
        title="UI Kit RazPC"
        description="Единая библиотека компонентов и стилей. Основа для всех страниц проекта — цвета, типографика, элементы управления и карточки товаров в едином премиальном стиле."
      />

      <div className="container-page pb-20">
        {/* Colors */}
        <Section title="Палитра" description="Базовые поверхности и акцентные цвета проекта.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {swatches.map((s) => (
              <div key={s.name} className="overflow-hidden rounded-xl border border-border/80 bg-card">
                <div className={`h-20 ${s.var} ${s.ring ? 'border-b border-border' : ''}`} />
                <div className="px-3 py-2.5">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.var}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Типографика" description="Oswald для заголовков, IBM Plex Sans для текста.">
          <div className="space-y-4 rounded-xl border border-border/80 bg-card p-8">
            <h1 className="font-heading text-5xl font-bold">Заголовок H1</h1>
            <h2 className="font-heading text-4xl font-semibold">Заголовок H2</h2>
            <h3 className="font-heading text-2xl font-semibold">Заголовок H3</h3>
            <p className="text-lg text-foreground">Крупный абзац — вводный текст для акцентных блоков.</p>
            <p className="text-base text-muted-foreground">Основной текст. Профессиональная сборка игровых и рабочих ПК с гарантией результата и вниманием к деталям.</p>
            <p className="text-sm text-muted-foreground">Мелкий вспомогательный текст и подписи.</p>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Кнопки" description="Размеры, состояния и варианты.">
          <div className="space-y-6 rounded-xl border border-border/80 bg-card p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Основная</Button>
              <Button variant="secondary">Вторичная</Button>
              <Button variant="outline">Контурная</Button>
              <Button variant="ghost">Прозрачная</Button>
              <Button variant="destructive">Опасная</Button>
              <Button variant="link">Ссылка</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Icon name="Plus" size={18} /></Button>
              <Button disabled>Недоступна</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button><Icon name="ShoppingCart" size={16} />В корзину</Button>
              <Button variant="outline"><Icon name="Heart" size={16} />В избранное</Button>
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Бейджи" description="Статусы и метки товаров.">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-card p-8">
            <Badge>По умолчанию</Badge>
            <Badge variant="solid">Хит</Badge>
            <Badge variant="success"><Icon name="Check" size={12} />В наличии</Badge>
            <Badge variant="warning"><Icon name="Clock" size={12} />Под заказ</Badge>
            <Badge variant="destructive">-15%</Badge>
            <Badge variant="secondary">Новинка</Badge>
            <Badge variant="outline">Тег</Badge>
          </div>
        </Section>

        {/* Form controls */}
        <Section title="Поля ввода и управление" description="Инпуты, списки, переключатели и чекбоксы.">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-xl border border-border/80 bg-card p-8">
              <div className="space-y-1.5">
                <Label htmlFor="k-name">Имя</Label>
                <Input id="k-name" placeholder="Введите имя" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="k-select">Категория</Label>
                <Select>
                  <SelectTrigger id="k-select"><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pc">Готовые ПК</SelectItem>
                    <SelectItem value="gpu">Видеокарты</SelectItem>
                    <SelectItem value="cpu">Процессоры</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="k-text">Комментарий</Label>
                <Textarea id="k-text" placeholder="Опишите задачу" />
              </div>
            </div>
            <div className="space-y-6 rounded-xl border border-border/80 bg-card p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Уведомления</p>
                  <p className="text-sm text-muted-foreground">Получать статусы заказа</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Автосборка</p>
                  <p className="text-sm text-muted-foreground">Подбор совместимых деталей</p>
                </div>
                <Switch />
              </div>
              <div className="h-px bg-border" />
              <label className="flex items-center gap-3">
                <Checkbox checked={checked} onCheckedChange={(v) => setChecked(!!v)} />
                <span className="text-sm">Согласен с условиями</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox />
                <span className="text-sm">Только в наличии</span>
              </label>
            </div>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Карточки" description="Базовые контейнеры контента.">
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Гарантия</CardTitle>
                <CardDescription>Официальная гарантия на все работы</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                До 3 лет на комплектующие и сборку.
              </CardContent>
            </Card>
            <Card className="surface-highlight">
              <CardHeader>
                <CardTitle>Сборка</CardTitle>
                <CardDescription>Индивидуальная конфигурация</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Под игры, работу и творчество.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Доставка</CardTitle>
                <CardDescription>По всей России</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Аккуратная упаковка и страховка.
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Product cards */}
        <Section title="Карточка товара" description="Универсальный компонент для каталога — с фото, характеристиками и ценой.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ProductCard
              image={PC_IMG}
              category="Игровой ПК"
              title="RazPC Nova RTX"
              badge={{ label: 'Хит', variant: 'solid' }}
              specs={[
                { icon: 'Cpu', label: 'Ryzen 7 7800X3D' },
                { icon: 'MonitorPlay', label: 'GeForce RTX 4070' },
                { icon: 'MemoryStick', label: '32 ГБ DDR5' },
              ]}
              price="189 900 ₽"
              oldPrice="214 900 ₽"
              actionLabel="В корзину"
            />
            <ProductCard
              image={PC_IMG}
              category="Рабочая станция"
              title="RazPC Studio Pro"
              badge={{ label: 'В наличии', variant: 'success' }}
              specs={[
                { icon: 'Cpu', label: 'Core i9 14900K' },
                { icon: 'MonitorPlay', label: 'RTX 4080 Super' },
                { icon: 'HardDrive', label: '2 ТБ NVMe' },
              ]}
              price="284 900 ₽"
              actionLabel="В корзину"
            />
            <ProductCard
              category="Без изображения"
              title="Пустое состояние карточки"
              specs={[{ icon: 'Info', label: 'Данные появятся позже' }]}
              actionLabel="Подробнее"
            />
          </div>
        </Section>

        {/* Table */}
        <Section title="Таблицы" description="Сравнение и спецификации.">
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Модель</TableHead>
                  <TableHead>Процессор</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ['Nova RTX', 'Ryzen 7 7800X3D', 'success', 'В наличии', '189 900 ₽'],
                  ['Studio Pro', 'Core i9 14900K', 'warning', 'Под заказ', '284 900 ₽'],
                  ['Office Mini', 'Core i5 13400', 'success', 'В наличии', '54 900 ₽'],
                ].map((r) => (
                  <TableRow key={r[0]}>
                    <TableCell className="font-medium">{r[0]}</TableCell>
                    <TableCell className="text-muted-foreground">{r[1]}</TableCell>
                    <TableCell>
                      <Badge variant={r[2] as 'success' | 'warning'}>{r[3]}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{r[4]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        {/* Navigation: breadcrumbs + pagination */}
        <Section title="Навигация" description="Хлебные крошки и пагинация.">
          <div className="space-y-8 rounded-xl border border-border/80 bg-card p-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">Главная</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/catalog">Каталог</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Игровые ПК</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Section>

        {/* Overlays */}
        <Section title="Модальные окна и уведомления" description="Диалоги и всплывающие сообщения.">
          <div className="flex flex-wrap gap-3 rounded-xl border border-border/80 bg-card p-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline"><Icon name="SquareArrowOutUpRight" size={16} />Открыть модалку</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Оформление заявки</DialogTitle>
                  <DialogDescription>
                    Оставьте контакты — инженер свяжется с вами в течение рабочего дня.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Input placeholder="Имя" />
                  <Input placeholder="Телефон" />
                </div>
                <DialogFooter>
                  <Button>Отправить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => toast({ title: 'Заявка отправлена', description: 'Мы свяжемся с вами в ближайшее время.' })}>
              <Icon name="Bell" size={16} />Показать уведомление
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast({ title: 'Товар в наличии', description: 'RazPC Nova RTX готов к отгрузке.' })}
            >
              Успех
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
};

export default UiKit;
