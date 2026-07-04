import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { siteInfo } from '@/config/navigation';

const Register = () => {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0 grid-tech opacity-30" />
      <div className="container-page relative">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-8 animate-scale-in">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
              <Icon name="UserPlus" size={24} className="text-primary-foreground" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Регистрация</h1>
            <p className="mt-1 text-sm text-muted-foreground">Создайте аккаунт в {siteInfo.name}</p>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" type="text" placeholder="Ваше имя" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">Создать аккаунт</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
