import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/ui';

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
        <EmptyState
          icon="Building2"
          title="Раздел в разработке"
          description="Скоро здесь будет подробная информация о мастерской."
        />
      </section>
    </>
  );
};

export default About;