import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/ui';

const Reviews = () => {
  return (
    <>
      <PageHeader
        icon="Star"
        eyebrow="Отзывы"
        title="Отзывы клиентов"
        description="Мнения наших клиентов о качестве работы и сервисе. Здесь появятся отзывы с оценками и возможностью оставить свой."
      />
      <section className="brand-smoke py-16">
        <div className="container-page">
          <EmptyState
            icon="Star"
            title="Раздел в разработке"
            description="Скоро здесь появятся отзывы клиентов."
          />
        </div>
      </section>
    </>
  );
};

export default Reviews;