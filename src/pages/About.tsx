import PageHeader from '@/components/shared/PageHeader';

const About = () => {
  return (
    <>
      <PageHeader
        icon="Building2"
        eyebrow="О компании"
        title="О мастерской"
        description="Кто мы, наша команда, ценности и подход к работе. Здесь появится история мастерской, сертификаты и рассказ о специалистах."
      />
      <section className="container-page py-16">
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          Раздел в разработке — скоро здесь будет подробная информация о мастерской.
        </div>
      </section>
    </>
  );
};

export default About;
