import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  Spinner, EmptyState, Badge,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import {
  apiListUsers, apiSetRole, roleLabels,
  type ManagedUser, type UserRole,
} from '@/api/auth';

const roleOptions: UserRole[] = ['admin', 'manager', 'builder', 'moderator', 'forum', 'member'];

const roleBadge: Record<UserRole, 'solid' | 'default' | 'secondary' | 'outline'> = {
  admin: 'solid',
  manager: 'default',
  builder: 'default',
  moderator: 'default',
  forum: 'secondary',
  member: 'outline',
};

const AdminUsers = () => {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    apiListUsers()
      .then(setUsers)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeRole = async (u: ManagedUser, role: UserRole) => {
    if (role === u.role) return;
    setSaving(u.id);
    try {
      await apiSetRole(u.id, role);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role } : x)));
      toast({ title: 'Роль обновлена', description: `${u.name} → ${roleLabels[role]}` });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Пользователи</h1>
      <p className="mt-2 text-muted-foreground">
        Управление ролями и правами доступа. Всего: {users.length}
      </p>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            icon="TriangleAlert"
            title="Не удалось загрузить"
            description="Проверьте доступ и попробуйте снова."
          />
        ) : users.length === 0 ? (
          <EmptyState icon="Users" title="Пользователей нет" />
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                    <Icon name="User" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      {u.name}
                      {me?.id === u.id && <Badge variant="outline">Вы</Badge>}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={roleBadge[u.role]}>{roleLabels[u.role]}</Badge>
                  <Select
                    value={u.role}
                    onValueChange={(v) => changeRole(u, v as UserRole)}
                    disabled={saving === u.id}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r} value={r}>
                          {roleLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
