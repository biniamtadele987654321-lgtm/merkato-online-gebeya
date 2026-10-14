import { ArrowLeft, ArrowUpRight, Minus, Plus, ShieldCheck, ShoppingBag, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, money } from '../api';
import { ErrorMessage } from '../components/PageState';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api(`/products/${id}`).then((result) => setProduct(result.product)).catch((requestError) => setError(requestError.message));
  }, [id]);

  if (!product) return <div className="mx-auto max-w-7xl px-5 py-16">{error ? <ErrorMessage message={error} /> : <p className="text-sm text-muted">Loading product…</p>}<Link to="/shop" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest"><ArrowLeft size={16} /> Back to market</Link></div>;
  const image = product.images?.[0] || 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=80';

  return <div className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-14">
    <Link to="/shop" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-forest"><ArrowLeft size={16} /> All finds</Link>
    <div className="grid gap-9 md:grid-cols-2 md:gap-14">
      <div className="overflow-hidden rounded-[26px] bg-[#e9ece5]"><img src={image} alt={product.title} className="aspect-square w-full object-cover" /></div>
      <div className="py-1 md:py-5">
        <span className="rounded-full bg-[#e9efe8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-forest">{product.category}</span>
        <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{product.title}</h1>
        <div className="mt-4 flex items-center gap-2 text-sm"><span className="flex items-center gap-1 font-semibold"><Star size={15} className="fill-lime text-forest" /> 4.9</span><span className="text-muted">·</span><span className="text-muted">A lovely local find</span></div>
        <p className="mt-6 font-display text-3xl font-extrabold">{money(product.price)}</p>
        <p className="mt-1 text-xs text-muted">Price in Ethiopian birr</p>
        <p className="mt-7 whitespace-pre-line text-sm leading-7 text-muted">{product.description}</p>
        {product.wholesalePricingTiers?.length > 0 && <div className="mt-6 rounded-xl bg-[#edf0e9] p-4"><p className="text-xs font-bold uppercase tracking-wider">Bulk pricing</p><div className="mt-3 flex flex-wrap gap-3">{product.wholesalePricingTiers.map((tier) => <span key={tier.minQuantity} className="text-xs text-muted">{tier.minQuantity}+ · {money(tier.unitPrice)} each</span>)}</div></div>}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex h-12 items-center rounded-full border border-black/10 bg-white"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-11 w-10 place-items-center" aria-label="Decrease quantity"><Minus size={15} /></button><span className="w-6 text-center text-sm font-semibold">{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="grid h-11 w-10 place-items-center" aria-label="Increase quantity"><Plus size={15} /></button></div>
          <span className="text-xs text-muted">{product.stock > 0 ? `${product.stock} available` : 'Sold out'}</span>
        </div>
        <button disabled={!product.stock} onClick={() => { addItem(product, quantity); setAdded(true); }} className="mt-5 flex h-13 w-full items-center justify-center gap-3 rounded-full bg-forest px-6 py-4 text-sm font-bold text-white transition hover:bg-ink"><ShoppingBag size={17} /> {added ? 'Added to your bag' : 'Add to bag'} <ArrowUpRight size={16} /></button>
        <button onClick={() => navigate('/cart')} className="mt-3 w-full rounded-full border border-black/10 py-3.5 text-sm font-semibold transition hover:border-forest">Go to bag</button>
        <div className="mt-7 flex items-start gap-3 border-t border-black/10 pt-5 text-xs leading-5 text-muted"><ShieldCheck size={18} className="shrink-0 text-forest" /> Every purchase supports an independent seller. Delivery and payment options are available at checkout.</div>
      </div>
    </div>
  </div>;
}
