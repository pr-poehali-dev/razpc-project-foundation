import PageHeader from '@/components/shared/PageHeader';

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
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          Раздел в разработке — скоро здесь появятся контакты и форма связи.
        </div>
      </section>
    </>
  );
};

export default Contacts;
