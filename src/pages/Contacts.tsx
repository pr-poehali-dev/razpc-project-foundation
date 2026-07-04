import { PageHeader, BrandBackdrop } from '@/components/shared';
import { EmptyState } from '@/components/ui';

const Contacts = () => {
  return (
    <>
      <PageHeader
        icon="MapPin"
        eyebrow="Контакты"
        title="Контакты"
        description="Свяжитесь с нами удобным способом. Здесь появятся адрес на карте, телефоны, режим работы и форма обратной связи."
      />
      <section className="relative overflow-hidden py-16">
        <BrandBackdrop smokeOpacity={0.3} />
        <div className="container-page">
          <EmptyState
            icon="MapPin"
            title="Раздел в разработке"
            description="Скоро здесь появятся контакты и форма связи."
          />
        </div>
      </section>
    </>
  );
};

export default Contacts;