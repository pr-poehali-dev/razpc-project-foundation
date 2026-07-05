import { EmptyState } from '@/components/ui';

const AdminOrders = () => {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Заявки</h1>
      <p className="mt-2 text-muted-foreground">
        Заказы и обращения с сайта.
      </p>
      <div className="mt-8">
        <EmptyState
          icon="Inbox"
          title="Скоро здесь"
          description="Приём и обработка заявок с сайта — на следующем этапе."
        />
      </div>
    </div>
  );
};

export default AdminOrders;
