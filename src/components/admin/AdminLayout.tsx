import { NavLink, Outlet, Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { roleLabels, type UserRole } from '@/api/auth';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: UserRole[];
  end?: boolean;
}

const adminNav: NavItem[] = [
  { label: 'Обзор', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'Заказы', path: '/admin/orders', icon: 'ShoppingCart', roles: ['admin', 'manager'] },
  { label: 'Заявки', path: '/admin/leads', icon: 'Inbox', roles: ['admin', 'manager'] },
  { label: 'Клиенты', path: '/admin/customers', icon: 'Users2', roles: ['admin', 'manager'] },
  { label: 'Склад', path: '/admin/warehouse', icon: 'Warehouse', roles: ['admin', 'manager'], end: true },
  { label: 'Модели', path: '/admin/warehouse/items', icon: 'Package', roles: ['admin', 'manager'] },
  { label: 'Экземпляры', path: '/admin/warehouse/units', icon: 'Boxes', roles: ['admin', 'manager'] },
  { label: 'Партии', path: '/admin/warehouse/lots', icon: 'Container', roles: ['admin', 'manager'] },
  { label: 'Компьютеры', path: '/admin/warehouse/machines', icon: 'Cpu', roles: ['admin', 'manager'] },
  { label: 'Финансы', path: '/admin/finance', icon: 'Wallet', roles: ['admin', 'manager'] },
  { label: 'Долги', path: '/admin/debts', icon: 'HandCoins', roles: ['admin', 'manager'] },
  { label: 'Аналитика', path: '/admin/analytics', icon: 'BarChart3', roles: ['admin', 'manager'] },
  { label: 'Каталог', path: '/admin/catalog', icon: 'LayoutGrid', roles: ['admin', 'builder'] },
  { label: 'Пользователи', path: '/admin/users', icon: 'Users', roles: ['admin'] },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const visibleNav = adminNav.filter(
    (i) => !i.roles || (user && i.roles.includes(user.role)),
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <img
            src="https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/bucket/c72fd3c0-7a01-4c2c-936a-c2c8a39fcd85.jpg"
            alt="RazPC"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div className="leading-tight">
            <span className="block font-heading text-sm font-bold">RazPC</span>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
              Админ-панель
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 rounded-lg bg-secondary/60 px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-primary">{user ? roleLabels[user.role] : ''}</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Icon name="ArrowLeft" size={16} />
            На сайт
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          >
            <Icon name="LogOut" size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <span className="font-heading font-bold">Админ-панель</span>
          <div className="flex gap-1">
            {visibleNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.end}
                className={({ isActive }) =>
                  cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground',
                  )
                }
              >
                <Icon name={item.icon} size={18} />
              </NavLink>
            ))}
          </div>
        </div>

        <main className="flex-1 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;