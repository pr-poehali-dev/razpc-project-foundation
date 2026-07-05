import { useState } from 'react';
import { PageHeader, BrandBackdrop, LeadForm } from '@/components/shared';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { siteInfo } from '@/config/navigation';

const Contacts = () => {
  const [leadOpen, setLeadOpen] = useState(false);

  const contacts = [
    { icon: 'Phone', label: 'Телефон', value: siteInfo.phone },
    { icon: 'Mail', label: 'Email', value: siteInfo.email },
    { icon: 'MapPin', label: 'Адрес', value: siteInfo.address },
    { icon: 'Clock', label: 'Режим работы', value: siteInfo.workHours },
  ];

  return (
    <>
      <PageHeader
        icon="MapPin"
        eyebrow="Контакты"
        title="Свяжитесь с нами"
        description="Ответим на вопросы, поможем с выбором и проконсультируем по сборке компьютера под ваши задачи."
      />
      <section className="relative overflow-hidden py-14">
        <BrandBackdrop smokeOpacity={0.3} />
        <div className="container-page relative grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            {contacts.map((c) => (
              <div key={c.label} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm-premium">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon name={c.icon} size={20} />
                </div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <p className="mt-1 font-medium">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-sm-premium">
            <h2 className="font-heading text-2xl font-bold">Нужна консультация?</h2>
            <p className="mt-2 text-muted-foreground">
              Оставьте заявку — менеджер свяжется с вами, поможет подобрать конфигурацию и ответит на все вопросы. Это бесплатно и ни к чему не обязывает.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {['Подбор комплектующих под задачи и бюджет', 'Профессиональная сборка и тестирование', 'Гарантия на все работы'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="CircleCheck" size={16} className="shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={() => setLeadOpen(true)}>
              <Icon name="MessageSquare" size={18} className="mr-1.5" />
              Получить консультацию
            </Button>
          </div>
        </div>
      </section>

      <LeadForm
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        title="Получить консультацию"
        description="Оставьте контакты — мы свяжемся с вами в ближайшее время."
        source="site_contact"
      />
    </>
  );
};

export default Contacts;
