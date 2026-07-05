import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BrandBackdrop, ConfigItem } from '@/components/shared';
import {
  Spinner, EmptyState, Button, Badge, Icon,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator, useToast,
} from '@/components/ui';
import { fetchBuild, formatPrice, type BuildDetail as BuildDetailType } from '@/api/catalog';

const BuildDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [build, setBuild] = useState<BuildDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchBuild(slug)
      .then(setBuild)
      .catch((e) => {
        if (e.message === 'not_found') setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !build) {
    return (
      <div className="container-page py-24">
        <EmptyState
          icon="PackageX"
          title="Сборка не найдена"
          description="Возможно, эта конфигурация была снята с производства."
          action={
            <Button asChild>
              <Link to="/catalog">
                <Icon name="ArrowLeft" size={16} className="mr-1" />
                В каталог
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  const inStock = build.status === 'in_stock';

  return (
    <>
      {/* Верхний блок */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <BrandBackdrop smokeOpacity={0.3} />
        <div className="container-page relative py-8 md:py-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Главная</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/catalog">Каталог</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{build.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Фото */}
            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]" />
              <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary/20">
                {build.image_url ? (
                  <img src={build.image_url} alt={build.name} className="w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground/40">
                    <Icon name="ImageOff" size={48} />
                  </div>
                )}
              </div>
            </div>

            {/* Инфо */}
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {build.tier && <Badge variant="solid">{build.tier}</Badge>}
                {build.performance_badge && (
                  <Badge variant="default">
                    <Icon name="Gauge" size={13} />
                    {build.performance_badge}
                  </Badge>
                )}
              </div>

              <h1 className="font-heading text-4xl font-bold md:text-5xl">{build.name}</h1>
              {build.tagline && (
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{build.tagline}</p>
              )}

              <div className="mt-6 flex items-baseline gap-3">
                {build.old_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(build.old_price)}
                  </span>
                )}
                <span className="font-heading text-4xl font-bold text-foreground">
                  {formatPrice(build.price)}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="flex items-center gap-2">
                  <Icon
                    name={inStock ? 'CircleCheck' : 'Clock'}
                    size={17}
                    className={inStock ? 'text-success' : 'text-warning'}
                  />
                  <span className="font-medium">{inStock ? 'В наличии' : 'Под заказ'}</span>
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="ShieldCheck" size={17} className="text-primary" />
                  Гарантия {build.warranty}
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() =>
                    toast({
                      title: 'Заявка принята',
                      description: `Мы свяжемся с вами по сборке «${build.name}».`,
                    })
                  }
                >
                  <Icon name="ShoppingCart" size={18} className="mr-1" />
                  Заказать
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <Link to="/contacts">
                    <Icon name="MessageSquare" size={18} className="mr-1" />
                    Консультация
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Блок конфигурации */}
      <section className="relative overflow-hidden py-16">
        <BrandBackdrop smokeOpacity={0.2} arcs={false} />
        <div className="container-page relative">
          <div className="mb-8 flex items-center gap-3">
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Конфигурация</h2>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
              {build.components.length} компонентов
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {build.components.map((c) => (
              <ConfigItem key={c.type} component={c} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/catalog">
                <Icon name="ArrowLeft" size={16} className="mr-1" />
                Все сборки
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default BuildDetail;
