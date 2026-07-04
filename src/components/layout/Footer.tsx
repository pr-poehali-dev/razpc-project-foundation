import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { footerNav, siteInfo } from '@/config/navigation';

const Footer = () => {
  const columns = [footerNav.company, footerNav.services, footerNav.account];

  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
                <Icon name="Cpu" size={20} className="text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-bold tracking-wide">
                {siteInfo.name}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Профессиональный ремонт, сборка ПК и продажа комплектующих. Надёжность, проверенная временем.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Icon name="Phone" size={15} className="text-primary" />
                {siteInfo.phone}
              </p>
              <p className="flex items-center gap-2">
                <Icon name="Mail" size={15} className="text-primary" />
                {siteInfo.email}
              </p>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading text-sm font-semibold uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteInfo.name}. Все права защищены.
          </p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Clock" size={14} className="text-primary" />
            {siteInfo.workHours}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
