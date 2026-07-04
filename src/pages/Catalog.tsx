import PageHeader from '@/components/shared/PageHeader';

const Catalog = () => {
  return (
    <>
      <PageHeader
        icon="LayoutGrid"
        eyebrow="Каталог"
        title="Каталог товаров и услуг"
        description="Комплектующие, готовые сборки и услуги мастерской. Здесь появится каталог с фильтрацией по категориям, цене и характеристикам."
      />
      <section className="container-page py-16">
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          Раздел в разработке — скоро здесь будет система отображения товаров с фильтрами.
        </div>
      </section>
    </>
  );
};

export default Catalog;
