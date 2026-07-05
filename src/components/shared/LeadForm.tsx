import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { submitLead } from '@/api/crm';

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  source?: string;
  buildId?: number;
  buildName?: string;
}

const LeadForm = ({
  open, onClose,
  title = 'Оставьте заявку',
  description = 'Мы свяжемся с вами в ближайшее время.',
  source = 'site_contact',
  buildId,
  buildName,
}: LeadFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!phone.trim()) {
      toast({ title: 'Укажите телефон', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      await submitLead({ name, phone, message, source, build_id: buildId, build_name: buildName });
      toast({ title: 'Заявка отправлена!', description: 'Скоро свяжемся с вами.' });
      setName(''); setPhone(''); setMessage('');
      onClose();
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
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
            <Label className="text-xs">Комментарий</Label>
            <Textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Что вас интересует?" />
          </div>
          <Button onClick={submit} disabled={sending} className="w-full">
            <Icon name={sending ? 'Loader' : 'Send'} size={15} className={sending ? 'mr-1.5 animate-spin' : 'mr-1.5'} />
            Отправить заявку
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadForm;
