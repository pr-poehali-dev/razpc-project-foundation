import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { mainNav, siteInfo } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useContentEditor } from '@/context/ContentContext';
import { useCart } from '@/context/CartContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { user, isStaff } = useAuth();
  const { canEdit, editMode, toggleEditMode } = useContentEditor();
  const { count } = useCart();

  const CartButton = ({ mobile }: { mobile?: boolean }) => (
    <Link
      to="/cart"
      onClick={() => mobile && setOpen(false)}
      className={mobile
        ? 'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
        : 'relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'}
      aria-label="Корзина"
    >
      <Icon name="ShoppingCart" size={mobile ? 18 : 20} />
      {mobile && 'Корзина'}
      {count > 0 && (
        <span className={mobile
          ? 'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground'
          : 'absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground'}>
          {count}
        </span>
      )}
    </Link>
  );

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/bucket/6399f6b1-744f-495d-8c3a-9de50d7b98dd.PNG"
            alt="RazPC"
            className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
            style={{ filter: 'invert(1) hue-rotate(180deg)' }}
          />
          <div className="leading-tight">
            <span className="block font-heading text-lg font-bold tracking-wide">
              {siteInfo.name}
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
              {siteInfo.tagline}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {mainNav.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass} end={item.path === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CartButton />
          {user ? (
            <>
              {canEdit && (
                <Button
                  variant={editMode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={toggleEditMode}
                >
                  <Icon name="Pencil" size={16} className="mr-1.5" />
                  {editMode ? 'Редактирую' : 'Редактор'}
                </Button>
              )}
              {isStaff && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <Icon name="LayoutDashboard" size={16} className="mr-1.5" />
                    Админка
                  </Link>
                </Button>
              )}
              <Button asChild size="sm">
                <Link to="/account">
                  <Icon name="User" size={16} className="mr-1.5" />
                  Кабинет
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">
                  <Icon name="LogIn" size={16} className="mr-1.5" />
                  Вход
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">
                  <Icon name="UserPlus" size={16} className="mr-1.5" />
                  Регистрация
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <CartButton />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icon name="Menu" size={22} />
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-6 flex flex-col gap-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-secondary text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`
                  }
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </NavLink>
              ))}
              <div className="my-3 h-px bg-border" />
              <CartButton mobile />
              {user ? (
                <>
                  {isStaff && (
                    <Button asChild variant="outline" className="justify-start" onClick={() => setOpen(false)}>
                      <Link to="/admin">
                        <Icon name="LayoutDashboard" size={18} className="mr-2" />
                        Админ-панель
                      </Link>
                    </Button>
                  )}
                  <Button asChild className="justify-start" onClick={() => setOpen(false)}>
                    <Link to="/account">
                      <Icon name="User" size={18} className="mr-2" />
                      Личный кабинет
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="justify-start" onClick={() => setOpen(false)}>
                    <Link to="/login">
                      <Icon name="LogIn" size={18} className="mr-2" />
                      Вход
                    </Link>
                  </Button>
                  <Button asChild className="justify-start" onClick={() => setOpen(false)}>
                    <Link to="/register">
                      <Icon name="UserPlus" size={18} className="mr-2" />
                      Регистрация
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;