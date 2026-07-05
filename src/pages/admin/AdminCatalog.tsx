import { EmptyState } from '@/components/ui';

const AdminCatalog = () => {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Каталог</h1>
      <p className="mt-2 text-muted-foreground">
        Управление сборками и комплектующими.
      </p>
      <div className="mt-8">
        <EmptyState
          icon="LayoutGrid"
          title="Скоро здесь"
          description="Редактирование, добавление и удаление сборок — на следующем этапе."
        />
      </div>
    </div>
  );
};

export default AdminCatalog;
