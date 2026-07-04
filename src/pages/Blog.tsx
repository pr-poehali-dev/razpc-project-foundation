import PageHeader from '@/components/shared/PageHeader';

const Blog = () => {
  return (
    <>
      <PageHeader
        icon="Newspaper"
        eyebrow="Блог"
        title="Блог мастерской"
        description="Статьи, гайды и новости из мира компьютерной техники. Здесь появится лента публикаций с категориями и поиском."
      />
      <section className="container-page py-16">
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          Раздел в разработке — скоро здесь появятся полезные статьи.
        </div>
      </section>
    </>
  );
};

export default Blog;
