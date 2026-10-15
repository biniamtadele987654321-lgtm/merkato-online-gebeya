import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { money } from '../api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function CartPage() {
  const { items, total, setQuantity, removeItem } = useCart();
  const { t } = useLanguage();
  return <div className="mx-auto w-full max-w-[1800px] px-5 py-10 md:px-8 md:py-14">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-forest">{t('cart.eyebrow')}</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">{t('cart.title')}<span className="text-forest">.</span></h1>
    {!items.length ? <div className="mt-10 rounded-[24px] bg-white p-12 text-center"><ShoppingBag size={30} className="mx-auto text-forest" /><h2 className="mt-4 font-display text-xl font-bold">{t('cart.emptyTitle')}</h2><p className="mt-2 text-sm text-muted">{t('cart.emptyDescription')}</p><Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">{t('cart.explore')} <ArrowRight size={16} /></Link></div> : <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="divide-y divide-black/10 rounded-2xl bg-white px-5">
        {items.map((item) => <div key={item._id} className="flex gap-4 py-5">
          <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=300&q=70'} alt="" className="h-24 w-24 rounded-xl object-cover" />
          <div className="flex min-w-0 flex-1 flex-col justify-between py-1 sm:flex-row sm:items-center"><div><Link to={`/products/${item._id}`} className="line-clamp-1 font-display font-bold">{item.title}</Link><p className="mt-1 text-xs text-muted">{money(item.price)} {t('cart.each')}</p></div><div className="mt-3 flex items-center justify-between gap-5 sm:mt-0"><div className="flex items-center rounded-full border border-black/10"><button onClick={() => setQuantity(item._id, item.quantity - 1)} className="grid h-8 w-8 place-items-center" aria-label={t('cart.decrease')}><Minus size={13} /></button><span className="w-6 text-center text-xs font-semibold">{item.quantity}</span><button onClick={() => setQuantity(item._id, item.quantity + 1)} className="grid h-8 w-8 place-items-center" aria-label={t('cart.increase')}><Plus size={13} /></button></div><span className="min-w-20 text-right text-sm font-bold">{money(item.price * item.quantity)}</span><button onClick={() => removeItem(item._id)} className="text-muted hover:text-red-600" aria-label={t('cart.remove').replace('{title}', item.title)}><Trash2 size={16} /></button></div></div>
        </div>)}
      </div>
      <aside className="h-fit rounded-2xl bg-white p-6"><h2 className="font-display text-lg font-bold">{t('cart.summary')}</h2><div className="mt-5 flex justify-between text-sm text-muted"><span>{t('cart.subtotal')}</span><span>{money(total)}</span></div><div className="mt-3 flex justify-between text-sm text-muted"><span>{t('cart.delivery')}</span><span>{t('cart.deliveryCheckout')}</span></div><div className="my-5 border-t border-black/10" /><div className="flex justify-between font-display font-extrabold"><span>{t('cart.total')}</span><span>{money(total)}</span></div><p className="mt-2 text-xs text-muted">{t('cart.deliverySeller')}</p><Link to="/checkout" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white">{t('cart.checkout')} <ArrowRight size={16} /></Link><Link to="/shop" className="mt-4 block text-center text-xs font-semibold text-muted hover:text-forest">{t('cart.keepLooking')}</Link></aside>
    </div>}
  </div>;
}
