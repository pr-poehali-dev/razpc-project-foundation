import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/ui';

const Blog = () => {
  return (
    <>
      <PageHeader
        icon="Newspaper"
        eyebrow="Блог"
        title="Блог мастерской"
        description="Статьи, гайды и новости из мира компьютерной техники. Здесь появится лента публикаций с категориями и поиском."
      />
      <section className="brand-smoke py-16">
        <div className="container-page">
          <EmptyState
            icon="Newspaper"
            title="Раздел в разработке"
            description="Скоро здесь появятся полезные статьи."
          />
        </div>
      </section>
    </>
  );
};

export default Blog;