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
        <Link to="/" className="flex items-center gap-2.5 group">
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label="RazPC"
            className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
          >
            {/* Верхняя дуга буквы R (белая) */}
            <path
              d="M30 18 H62 A20 20 0 0 1 62 58 H46 L64 82 H50 L34 60 V48 H60 A8 8 0 0 0 60 32 H42 V82 H30 Z"
              fill="#FFFFFF"
            />
            {/* Левая «объёмная» грань (контур) */}
            <path
              d="M30 18 L20 28 V72 L30 82 V18 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Жёлтая диагональная ножка */}
            <path
              d="M44 50 H60 L74 74 H58 Z"
              fill="hsl(var(--primary))"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
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