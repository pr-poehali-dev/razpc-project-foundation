import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { BrandBackdrop } from '@/components/shared';
import Editable from '@/components/editor/Editable';
import EditableButton from '@/components/editor/EditableButton';
import EditableImage from '@/components/editor/EditableImage';
import { siteInfo } from '@/config/navigation';

const stats = [
  { value: '12+', label: 'лет на рынке' },
  { value: '8 000+', label: 'выполненных заказов' },
  { value: '48 ч', label: 'средний срок ремонта' },
  { value: '4.9', label: 'рейтинг клиентов' },
];

const services = [
  { icon: 'Wrench', title: 'Ремонт техники', text: 'Диагностика и ремонт ПК, ноутбуков и периферии любой сложности.' },
  { icon: 'Cpu', title: 'Сборка ПК', text: 'Соберём компьютер под ваши задачи — от офиса до тяжёлых нагрузок.' },
  { icon: 'LayoutGrid', title: 'Комплектующие', text: 'Оригинальные комплектующие с гарантией и профессиональным подбором.' },
  { icon: 'ShieldCheck', title: 'Обслуживание бизнеса', text: 'Аутсорсинг и сопровождение IT-инфраструктуры организаций.' },
];

const advantages = [
  { icon: 'BadgeCheck', title: 'Официальная гарантия', text: 'На все работы и комплектующие предоставляем документальную гарантию.' },
  { icon: 'Clock', title: 'Точные сроки', text: 'Соблюдаем оговорённые сроки — фиксируем их в договоре.' },
  { icon: 'Users', title: 'Опытные инженеры', text: 'Сертифицированные специалисты с многолетним стажем.' },
];

const Index = () => {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Фон — фото ПК Geometric Future (редактируемое) */}
        <EditableImage
          id="home.hero.bg"
          src="https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/bucket/4da08b97-be36-426f-b605-f6c306b002aa.jpeg"
          asBackground
          className="absolute inset-0"
        />
        {/* Затемнение для читаемости */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/60" />

        <div className="container-page relative py-24 md:py-36">
          <div className="max-w-2xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              <Editable
                id="home.hero.badge"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Компьютерная мастерская нового уровня
              </Editable>
            </div>
            <h1 className="font-heading text-5xl font-bold leading-[1.05] md:text-6xl xl:text-7xl">
              <Editable id="home.hero.title" as="span">Надёжные решения для вашей техники</Editable>
            </h1>
            <Editable
              id="home.hero.subtitle"
              as="p"
              multiline
              className="mt-6 block max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
              RazPC — ремонт, сборка и обслуживание компьютеров с гарантией результата. Работаем для частных клиентов и бизнеса.
            </Editable>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <EditableButton
                id="home.hero.btn1"
                text="Смотреть каталог"
                href="/catalog"
                icon="LayoutGrid"
                size="lg"
                className="w-full sm:w-auto"
              />
              <EditableButton
                id="home.hero.btn2"
                text="Собрать ПК"
                href="/configurator"
                icon="Cpu"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="mt-20 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center lg:text-left">
                <Editable id={`home.stats.${i}.value`} as="div" className="font-heading text-3xl font-bold text-primary md:text-4xl">
                  {s.value}
                </Editable>
                <Editable id={`home.stats.${i}.label`} as="div" className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </Editable>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="relative overflow-hidden py-20">
        <BrandBackdrop smokeOpacity={0.3} />
        <div className="container-page relative">
        <div className="mx-auto max-w-2xl text-center">
          <Editable id="home.services.title" as="h2" className="font-heading text-3xl font-bold md:text-4xl">
            Наши услуги
          </Editable>
          <Editable id="home.services.subtitle" as="p" className="mt-3 block text-muted-foreground">
            Полный спектр услуг по ремонту, сборке и обслуживанию компьютерной техники.
          </Editable>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div
              key={i}
              className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon name={s.icon} size={24} />
              </div>
              <Editable id={`home.services.${i}.title`} as="h3" className="font-heading text-lg font-semibold">
                {s.title}
              </Editable>
              <Editable id={`home.services.${i}.text`} as="p" multiline className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </Editable>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="border-y border-border bg-card">
        <div className="container-page py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Editable id="home.adv.title" as="h2" className="font-heading text-3xl font-bold md:text-4xl">
                Почему выбирают {siteInfo.name}
              </Editable>
              <Editable id="home.adv.subtitle" as="p" multiline className="mt-4 block text-muted-foreground">
                Мы строим отношения с клиентами на доверии и результате. Каждый заказ — это ответственность, которую мы берём на себя от диагностики до передачи техники.
              </Editable>
              <div className="mt-8 space-y-6">
                {advantages.map((a, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon name={a.icon} size={22} />
                    </div>
                    <div>
                      <Editable id={`home.adv.${i}.title`} as="h3" className="font-heading text-base font-semibold">
                        {a.title}
                      </Editable>
                      <Editable id={`home.adv.${i}.text`} as="p" multiline className="mt-1 block text-sm text-muted-foreground">
                        {a.text}
                      </Editable>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background p-8">
              <Icon name="MessageSquare" size={32} className="text-primary" />
              <Editable id="home.consult.title" as="h3" className="mt-5 block font-heading text-2xl font-bold">
                Нужна консультация?
              </Editable>
              <Editable id="home.consult.text" as="p" multiline className="mt-3 block text-muted-foreground">
                Опишите проблему — наши инженеры бесплатно проконсультируют и предложат решение.
              </Editable>
              <EditableButton
                id="home.consult.btn"
                text="Связаться с нами"
                href="/contacts"
                icon="Phone"
                size="lg"
                className="mt-6 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary to-card p-10 text-center md:p-16">
          <BrandBackdrop smokeOpacity={0.35} />
          <div className="relative">
            <Editable id="home.cta.title" as="h2" className="font-heading text-3xl font-bold md:text-4xl">
              Готовы доверить нам свою технику?
            </Editable>
            <Editable id="home.cta.text" as="p" multiline className="mx-auto mt-4 block max-w-xl text-muted-foreground">
              Оставьте заявку — рассчитаем стоимость и сроки в течение рабочего дня.
            </Editable>
            <EditableButton
              id="home.cta.btn"
              text="Оставить заявку"
              href="/contacts"
              iconRight="ArrowRight"
              size="lg"
              className="mt-8"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;