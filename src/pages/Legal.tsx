import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { PageHeader, BrandBackdrop } from '@/components/shared';
import { EmptyState, Button } from '@/components/ui';
import { legalDocs, getLegalDoc } from '@/config/legal';

const Legal = () => {
  const { doc } = useParams<{ doc: string }>();
  const navigate = useNavigate();
  const current = doc ? getLegalDoc(doc) : undefined;

  useEffect(() => { window.scrollTo(0, 0); }, [doc]);

  if (!current) {
    return (
      <div className="container-page py-24">
        <EmptyState
          icon="FileQuestion"
          title="Документ не найден"
          description="Возможно, ссылка устарела."
          action={<Button onClick={() => navigate('/')}><Icon name="Home" size={16} className="mr-1" /> На главную</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader icon={current.icon} eyebrow="Правовая информация" title={current.title} description={current.intro} />
      <section className="relative overflow-hidden py-14">
        <BrandBackdrop smokeOpacity={0.25} />
        <div className="container-page relative grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Навигация по документам */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Документы</p>
            <nav className="space-y-1">
              {legalDocs.map((d) => (
                <Link
                  key={d.slug}
                  to={`/legal/${d.slug}`}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    d.slug === current.slug
                      ? 'bg-primary/15 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon name={d.icon} size={16} className="shrink-0" />
                  {d.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Текст документа */}
          <article className="max-w-3xl rounded-2xl border border-border/80 bg-card p-6 shadow-sm-premium md:p-8">
            <div className="space-y-8">
              {current.sections.map((s) => (
                <div key={s.heading}>
                  <h2 className="font-heading text-lg font-semibold text-foreground">{s.heading}</h2>
                  <div className="mt-3 space-y-3">
                    {s.paragraphs.map((p, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-2 border-t border-border pt-6 text-xs text-muted-foreground">
              <Icon name="Info" size={14} className="text-primary" />
              Приведён типовой текст. Итоговая редакция документа предоставляется по запросу.
            </div>
          </article>
        </div>
      </section>
    </>
  );
};

export default Legal;
