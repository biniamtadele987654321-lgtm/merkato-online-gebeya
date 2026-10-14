import { ArrowUpRight, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { money } from '../api';

export default function ProductCard({ product }) {
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80';
  return (
    <article className="group min-w-0">
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden rounded-[20px] bg-[#e9ece5]">
        <img src={image} alt={product.title} className="aspect-[4/4.5] w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]">{product.category}</span>
        <button onClick={(event) => event.preventDefault()} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink transition hover:bg-lime" aria-label="Save product"><Heart size={16} /></button>
        <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-lime opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={17} /></span>
      </Link>
      <div className="px-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product._id}`} className="line-clamp-2 min-h-11 font-display text-base font-bold leading-snug hover:text-forest">{product.title}</Link>
          <span className="shrink-0 text-[10px] text-muted">ETB</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="font-display text-base font-extrabold">{money(product.price)}</p>
          <span className="flex items-center gap-1 text-sm text-muted"><Star size={14} className="fill-lime text-forest" /> 4.9</span>
        </div>
        <p className="mt-1 text-sm text-muted">{product.vendor?.name || 'Independent seller'}</p>
      </div>
    </article>
  );
}
