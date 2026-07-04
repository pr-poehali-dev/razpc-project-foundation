import PageHeader from '@/components/shared/PageHeader';

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
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          Раздел в разработке — скоро здесь будет интерактивный конфигуратор.
        </div>
      </section>
    </>
  );
};

export default Configurator;
