import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { mainNav, siteInfo } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useContentEditor } from '@/context/ContentContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { user, isStaff } = useAuth();
  const { canEdit, editMode, toggleEditMode } = useContentEditor();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="group flex items-center" aria-label={siteInfo.name}>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-heading text-2xl font-bold text-primary-foreground ring-1 ring-primary/30 transition-transform group-hover:scale-105">
            R
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {mainNav.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass} end={item.path === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
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

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
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
    </header>
  );
};

export default Header;