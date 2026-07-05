import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { footerNav, siteInfo, legalNav } from '@/config/navigation';
import Editable from '@/components/editor/Editable';

const Footer = () => {
  const columns = [footerNav.company, footerNav.services, footerNav.account];

  return (
    <footer className="border-t border-border bg-card">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/bucket/c72fd3c0-7a01-4c2c-936a-c2c8a39fcd85.jpg"
                alt="RazPC"
                className="h-10 w-10 rounded-lg object-cover ring-1 ring-border"
              />
              <span className="font-heading text-lg font-bold tracking-wide">
                {siteInfo.name}
              </span>
            </Link>
            <Editable
              id="footer.about"
              as="p"
              multiline
              className="mt-4 text-sm leading-relaxed text-muted-foreground"
            >
              Профессиональный ремонт, сборка ПК и продажа комплектующих. Надёжность, проверенная временем.
            </Editable>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Icon name="Phone" size={15} className="text-primary shrink-0" />
                <Editable id="footer.phone" as="span">{siteInfo.phone}</Editable>
              </p>
              <p className="flex items-center gap-2">
                <Icon name="Mail" size={15} className="text-primary shrink-0" />
                <Editable id="footer.email" as="span">{siteInfo.email}</Editable>
              </p>
              <p className="flex items-center gap-2">
                <Icon name="MapPin" size={15} className="text-primary shrink-0" />
                <Editable id="footer.address" as="span">{siteInfo.address}</Editable>
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

        <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6">
          {legalNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteInfo.name}. Все права защищены.
          </p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Clock" size={14} className="text-primary shrink-0" />
            <Editable id="footer.workhours" as="span">{siteInfo.workHours}</Editable>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;