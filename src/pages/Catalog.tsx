import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/ui';

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
        <EmptyState
          icon="LayoutGrid"
          title="Раздел в разработке"
          description="Скоро здесь будет система отображения товаров с фильтрами по категориям, цене и характеристикам."
        />
      </section>
    </>
  );
};

export default Catalog;