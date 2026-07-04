import PageHeader from '@/components/shared/PageHeader';

const Reviews = () => {
  return (
    <>
      <PageHeader
        icon="Star"
        eyebrow="Отзывы"
        title="Отзывы клиентов"
        description="Мнения наших клиентов о качестве работы и сервисе. Здесь появятся отзывы с оценками и возможностью оставить свой."
      />
      <section className="container-page py-16">
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          Раздел в разработке — скоро здесь появятся отзывы клиентов.
        </div>
      </section>
    </>
  );
};

export default Reviews;
