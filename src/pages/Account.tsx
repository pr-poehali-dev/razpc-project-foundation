import PageHeader from '@/components/shared/PageHeader';

const Account = () => {
  return (
    <>
      <PageHeader
        icon="User"
        eyebrow="Профиль"
        title="Личный кабинет"
        description="Управление заказами, заявками и личными данными. Здесь появится панель клиента с историей обращений и статусами."
      />
      <section className="container-page py-16">
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          Раздел в разработке — скоро здесь будет личный кабинет клиента.
        </div>
      </section>
    </>
  );
};

export default Account;
