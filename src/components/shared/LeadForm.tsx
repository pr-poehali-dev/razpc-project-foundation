import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { submitLead } from '@/api/crm';

interface CartLine {
  name: string;
  qty: number;
  price: number;
}

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  source?: string;
  buildId?: number;
  buildName?: string;
  /** Позиции корзины — покажутся сводкой и уйдут в комментарий заявки */
  cartLines?: CartLine[];
  cartTotal?: number;
  /** Начальный текст комментария (напр. состав конфигурации) */
  presetMessage?: string;
  /** Вызовется после успешной отправки (напр. очистить корзину) */
  onSuccess?: () => void;
  /** Текст подтверждения */
  successText?: string;
}

const formatPrice = (v: number) => Math.round(v || 0).toLocaleString('ru-RU') + ' ₽';

const LeadForm = ({
  open, onClose,
  title = 'Оставьте заявку',
  description = 'Мы свяжемся с вами в ближайшее время.',
  source = 'site_contact',
  buildId,
  buildName,
  cartLines,
  cartTotal,
  presetMessage,
  onSuccess,
  successText = 'Мы получили вашу заявку и свяжемся с вами в ближайшее время.',
}: LeadFormProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setDone(false);
      setError('');
      setMessage(presetMessage || '');
    }
  }, [open, presetMessage]);

  const reset = () => {
    setName(''); setPhone(''); setEmail(''); setMessage(''); setAgree(false);
  };

  const submit = async () => {
    setError('');
    if (!phone.trim()) { setError('Укажите телефон, чтобы мы могли связаться'); return; }
    if (!agree) { setError('Необходимо согласие на обработку персональных данных'); return; }
    setSending(true);
    try {
      let finalMessage = message.trim();
      if (cartLines && cartLines.length) {
        const list = cartLines.map((l) => `• ${l.name} ×${l.qty} — ${formatPrice(l.price * l.qty)}`).join('\n');
        const totalStr = cartTotal != null ? `\nИтого: ${formatPrice(cartTotal)}` : '';
        finalMessage = `${finalMessage ? finalMessage + '\n\n' : ''}Состав заказа:\n${list}${totalStr}`;
      }
      await submitLead({ name, phone, email, message: finalMessage, source, build_id: buildId, build_name: buildName });
      reset();
      setDone(true);
      onSuccess?.();
    } catch (e) {
      setError((e as Error).message || 'Не удалось отправить заявку');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="flex flex-col items-center py-4 text-center animate-scale-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <Icon name="CheckCheck" size={32} className="text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold">Заявка отправлена!</h3>
            <p className="mt-2 text-sm text-muted-foreground">{successText}</p>
            <Button className="mt-6 w-full" onClick={onClose}>
              <Icon name="Check" size={16} className="mr-1.5" /> Понятно
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            {buildName && (
              <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
                <Icon name="Package" size={14} className="mr-1.5 inline text-primary" />
                {buildName}
              </div>
            )}

            {cartLines && cartLines.length > 0 && (
              <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Icon name="ShoppingCart" size={13} className="text-primary" /> Ваш заказ
                </p>
                <ul className="space-y-1">
                  {cartLines.map((l, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">{l.name} <span className="text-muted-foreground">×{l.qty}</span></span>
                      <span className="shrink-0 font-medium">{formatPrice(l.price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                {cartTotal != null && (
                  <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                    <span>Итого</span><span className="text-primary">{formatPrice(cartTotal)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Ваше имя</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Телефон *</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 900 000-00-00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com (необязательно)" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Комментарий</Label>
                <Textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Что вас интересует?" />
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 pt-1">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Я соглашаюсь с{' '}
                  <Link to="/legal/consent" target="_blank" className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                    обработкой персональных данных
                  </Link>
                </span>
              </label>

              {error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <Icon name="CircleAlert" size={14} /> {error}
                </p>
              )}

              <Button onClick={submit} disabled={sending} className="w-full">
                <Icon name={sending ? 'Loader' : 'Send'} size={15} className={sending ? 'mr-1.5 animate-spin' : 'mr-1.5'} />
                {sending ? 'Отправляем…' : 'Отправить заявку'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadForm;
