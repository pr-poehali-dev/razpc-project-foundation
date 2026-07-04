import { PageHeader } from '@/components/shared';
import { EmptyState } from '@/components/ui';

const Configurator = () => {
  return (
    <>
      <PageHeader
        icon="Cpu"
        eyebrow="Конфигуратор"
        title="Конфигуратор ПК"
        description="Соберите компьютер под свои задачи. Здесь появится пошаговый подбор комплектующих с проверкой совместимости и расчётом стоимости."
      />
      <section className="container-page py-16">
        <EmptyState
          icon="Cpu"
          title="Раздел в разработке"
          description="Скоро здесь будет интерактивный конфигуратор."
        />
      </section>
    </>
  );
};

export default Configurator;