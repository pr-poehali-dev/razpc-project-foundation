import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { roleLabels } from '@/api/auth';

const cards = [
  { title: 'Каталог', desc: 'Сборки и комплектующие', icon: 'LayoutGrid', path: '/admin/catalog', roles: ['admin', 'builder'] },
  { title: 'Заявки', desc: 'Заказы и обращения с сайта', icon: 'Inbox', path: '/admin/orders', roles: ['admin', 'manager'] },
  { title: 'Пользователи', desc: 'Роли и права доступа', icon: 'Users', path: '/admin/users', roles: ['admin'] },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  const visible = cards.filter((c) => user && c.roles.includes(user.role));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Панель управления</h1>
      <p className="mt-2 text-muted-foreground">
        Добро пожаловать, {user?.name}. Ваша роль — {user ? roleLabels[user.role] : ''}.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className="group rounded-xl border border-border/80 bg-card p-6 shadow-sm-premium transition-all hover:border-primary/40 hover:shadow-md-premium"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon name={c.icon} size={24} />
            </div>
            <h3 className="font-heading text-lg font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Перейти
              <Icon name="ArrowRight" size={15} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
