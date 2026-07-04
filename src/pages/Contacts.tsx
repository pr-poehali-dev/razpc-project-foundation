import { PageHeader } from '@/components/shared';
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
      <section className="container-page py-16">
        <EmptyState
          icon="MapPin"
          title="Раздел в разработке"
          description="Скоро здесь появятся контакты и форма связи."
        />
      </section>
    </>
  );
};

export default Contacts;