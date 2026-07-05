import { Link } from 'react-router-dom';
import { PageHeader, BrandBackdrop } from '@/components/shared';
import { Button, Icon, Badge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { roleLabels } from '@/api/auth';

const Account = () => {
  const { user, logout, isStaff } = useAuth();

  return (
    <>
      <PageHeader
        icon="User"
        eyebrow="Профиль"
        title="Личный кабинет"
        description="Управление личными данными, заказами и обращениями."
      />
      <section className="relative overflow-hidden py-16">
        <BrandBackdrop smokeOpacity={0.25} />
        <div className="container-page relative">
          <div className="mx-auto max-w-2xl">
            {/* Профиль */}
            <div className="rounded-xl border border-border/80 bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon name="User" size={30} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-bold">{user?.name}</h2>
                    <Badge variant={user?.role === 'member' ? 'outline' : 'solid'}>
                      {user ? roleLabels[user.role] : ''}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              {isStaff && (
                <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="ShieldCheck" size={20} className="mt-0.5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Вам доступна панель управления</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Управляйте сайтом, каталогом и заявками.
                      </p>
                    </div>
                  </div>
                  <Button asChild className="mt-4">
                    <Link to="/admin">
                      <Icon name="LayoutDashboard" size={16} className="mr-1" />
                      Открыть админ-панель
                    </Link>
                  </Button>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" onClick={logout}>
                  <Icon name="LogOut" size={16} className="mr-1" />
                  Выйти
                </Button>
              </div>
            </div>

            {/* Заглушка истории */}
            <div className="mt-6 rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-muted-foreground">
              История заказов и обращений появится здесь.
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Account;
