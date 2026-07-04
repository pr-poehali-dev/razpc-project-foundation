import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/ui';

const Works = () => {
  return (
    <>
      <PageHeader
        icon="Wrench"
        eyebrow="Портфолио"
        title="Наши работы"
        description="Примеры выполненных проектов: сборки ПК, ремонты и модернизации. Здесь появится галерея работ с описанием и фотографиями."
      />
      <section className="brand-smoke py-16">
        <div className="container-page">
          <EmptyState
            icon="Wrench"
            title="Раздел в разработке"
            description="Скоро здесь будет галерея выполненных работ."
          />
        </div>
      </section>
    </>
  );
};

export default Works;