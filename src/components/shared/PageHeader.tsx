import Icon from '@/components/ui/icon';

interface PageHeaderProps {
  icon: string;
  title: string;
  description: string;
  eyebrow?: string;
}

const PageHeader = ({ icon, title, description, eyebrow }: PageHeaderProps) => {
  return (
    <section className="relative overflow-hidden border-b border-border bg-card">
      <div className="absolute inset-0 grid-tech opacity-40" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="container-page relative py-16 md:py-20">
        <div className="max-w-3xl animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5">
            <Icon name={icon} size={16} className="text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow ?? title}
            </span>
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PageHeader;
