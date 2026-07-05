import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { siteInfo } from '@/config/navigation';
import { useToast } from '@/hooks/use-toast';
import { apiForgotPassword, apiResetPassword } from '@/api/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiForgotPassword(email);
      toast({
        title: 'Код отправлен',
        description: 'Если аккаунт с таким email существует, письмо с кодом уже в пути.',
      });
      setStep('reset');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiResetPassword(email, code.trim(), password);
      toast({ title: 'Пароль изменён', description: 'Теперь войдите с новым паролем.' });
      navigate('/login', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0 grid-tech opacity-30" />
      <div className="container-page relative">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 animate-scale-in">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
              <Icon name={step === 'request' ? 'KeyRound' : 'ShieldCheck'} size={24} className="text-primary-foreground" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Восстановление доступа</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === 'request'
                ? `Введите email от аккаунта ${siteInfo.name} — вышлем код`
                : 'Введите код из письма и новый пароль'}
            </p>
          </div>

          {step === 'request' ? (
            <form className="space-y-4" onSubmit={requestCode}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <Icon name="CircleAlert" size={15} /> {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Отправляем…' : 'Получить код'}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={resetPassword}>
              <div className="space-y-1.5">
                <Label htmlFor="code">Код из письма</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.4em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Новый пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <Icon name="CircleAlert" size={15} /> {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Сохраняем…' : 'Сменить пароль'}
              </Button>
              <button
                type="button"
                onClick={() => { setStep('request'); setError(''); }}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Отправить код ещё раз
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Вспомнили пароль?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
