import { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { EmptyState, Spinner } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  fetchCustomers, fetchCustomer,
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatMoney,
  type Customer, type CustomerDetail,
} from '@/api/crm';

const AdminCustomers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<CustomerDetail | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchCustomers(search || undefined)
      .then((d) => setCustomers(d.customers))
      .catch((e) => toast({ title: 'Ошибка', description: e.message, variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [search, toast]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const open = async (id: number) => {
    try {
      setDetail(await fetchCustomer(id));
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Клиенты</h1>
      <p className="mt-1 text-muted-foreground">
        База клиентов и история покупок. Поиск по имени, телефону или email — для гарантий и повторных продаж.
      </p>

      <div className="relative mt-6 max-w-md">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Поиск клиента…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : customers.length === 0 ? (
          <EmptyState icon="Users2" title="Клиентов нет"
            description="Клиенты появляются автоматически при создании заказов." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Клиент</th>
                  <th className="hidden px-4 py-3 md:table-cell">Контакты</th>
                  <th className="px-4 py-3 text-center">Заказов</th>
                  <th className="px-4 py-3 text-right">Потрачено</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} onClick={() => open(c.id)}
                    className="cursor-pointer border-t border-border transition hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name}</div>
                      {c.city && <div className="text-xs text-muted-foreground">{c.city}</div>}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      <div>{c.phone}</div>
                      <div className="text-xs">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center">{c.orders_count}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatMoney(c.total_spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Карточка клиента */}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          {detail && (
            <>
              <DialogHeader><DialogTitle>{detail.name}</DialogTitle></DialogHeader>
              <div className="space-y-1 rounded-xl border border-border bg-secondary/40 p-3 text-sm">
                {detail.phone && <p><Icon name="Phone" size={13} className="mr-1.5 inline" />{detail.phone}</p>}
                {detail.email && <p><Icon name="Mail" size={13} className="mr-1.5 inline" />{detail.email}</p>}
                {detail.telegram && <p><Icon name="Send" size={13} className="mr-1.5 inline" />{detail.telegram}</p>}
                {detail.city && <p><Icon name="MapPin" size={13} className="mr-1.5 inline" />{detail.city}</p>}
                {detail.notes && <p className="pt-1 text-muted-foreground">{detail.notes}</p>}
              </div>

              <div className="flex gap-3 text-sm">
                <div className="flex-1 rounded-xl border border-border p-3 text-center">
                  <div className="text-2xl font-bold">{detail.orders_count}</div>
                  <div className="text-xs text-muted-foreground">заказов</div>
                </div>
                <div className="flex-1 rounded-xl border border-border p-3 text-center">
                  <div className="text-2xl font-bold text-primary">{formatMoney(detail.total_spent)}</div>
                  <div className="text-xs text-muted-foreground">потрачено</div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">История заказов</p>
                {detail.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Заказов пока нет.</p>
                ) : (
                  <div className="space-y-2">
                    {detail.orders.map((o) => (
                      <div key={o.id} className="rounded-lg border border-border p-2.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs">{o.order_number}</span>
                          <span className={cn('rounded-full border px-2 py-0.5 text-xs', ORDER_STATUS_COLORS[o.status])}>
                            {ORDER_STATUS_LABELS[o.status]}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{o.title || '—'}</span>
                          <span>{formatMoney(o.total_amount)}</span>
                        </div>
                        {o.warranty_until && (
                          <div className="mt-1 text-xs text-emerald-400">
                            <Icon name="ShieldCheck" size={12} className="mr-1 inline" />
                            Гарантия до {o.warranty_until}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
