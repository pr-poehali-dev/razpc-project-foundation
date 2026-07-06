import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { type Product, formatPrice, formatLead } from '@/api/shop';

const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      kind: 'part',
      productId: product.id,
      slug: product.slug,
      name: `${product.brand} ${product.name}`,
      description: product.category_title,
      image_url: product.image_url,
      price: product.price,
      weight_g: product.weight_g,
      length_mm: product.length_mm,
      width_mm: product.width_mm,
      height_mm: product.height_mm,
    });
    toast({ title: 'Добавлено в корзину', description: `${product.brand} ${product.name}` });
  };

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group flex flex-col rounded-xl border border-border/80 bg-card p-3.5 transition-all hover:border-primary/40 hover:shadow-md-premium"
    >
      <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-secondary/40">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
        ) : (
          <Icon name={product.category_icon} size={44} className="text-muted-foreground/40" fallback="Package" />
        )}
        {product.old_price && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white">
            −{Math.round((1 - product.price / product.old_price) * 100)}%
          </span>
        )}
        {product.condition === 'used' && (
          <span className="absolute right-2 top-2 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white">Б/У</span>
        )}
      </div>

      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{product.brand}</p>
      <h4 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight group-hover:text-primary">{product.name}</h4>

      <ul className="mt-2 flex flex-wrap gap-1">
        {product.short_specs.slice(0, 2).map((s) => (
          <li key={s} className="rounded bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">{s}</li>
        ))}
      </ul>

      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span className={cn('flex items-center gap-1', product.in_stock ? 'text-emerald-400' : 'text-amber-400')}>
          <Icon name={product.in_stock ? 'Check' : 'Truck'} size={11} />
          {formatLead(product.lead_days)}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <div>
          {product.old_price && <p className="text-xs text-muted-foreground line-through">{formatPrice(product.old_price)}</p>}
          <p className="font-heading text-lg font-bold">{formatPrice(product.price)}</p>
        </div>
        <Button size="sm" onClick={addToCart} className="shrink-0">
          <Icon name="ShoppingCart" size={15} />
        </Button>
      </div>
    </Link>
  );
};

export default ProductCard;
