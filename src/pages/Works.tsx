import PageHeader from '@/components/shared/PageHeader';

const Works = () => {
  return (
    <>
      <PageHeader
        icon="Wrench"
        eyebrow="Портфолио"
        title="Наши работы"
        description="Примеры выполненных проектов: сборки ПК, ремонты и модернизации. Здесь появится галерея работ с описанием и фотографиями."
      />
      <section className="container-page py-16">
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          Раздел в разработке — скоро здесь будет галерея выполненных работ.
        </div>
      </section>
    </>
  );
};

export default Works;
