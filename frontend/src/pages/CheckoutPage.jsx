import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, jsonBody, money } from '../api';
import { ErrorMessage } from '../components/PageState';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const initialAddress = { fullName: '', phone: '', region: '', city: '', subCity: '', woreda: '', streetAddress: '', additionalDirections: '' };

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const hasDemoProducts = items.some((item) => item._id.startsWith('demo-product-'));
  const canPlaceOrder = !user?.demoMode && !hasDemoProducts;
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (!canPlaceOrder) {
      setError(t('checkout.liveAccountRequired'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        body: jsonBody({ items: items.map((item) => ({ product: item._id, quantity: item.quantity })), shippingAddress: address, paymentMethod }),
      });
      let paymentNotice = '';
      if (paymentMethod !== 'CashOnDelivery') {
        try {
          await api(`/orders/${order._id}/payment`, { method: 'POST' });
        } catch (paymentError) {
          paymentNotice = paymentError.message;
        }
      }
      clear();
      setConfirmation({ order, paymentNotice });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  if (!items.length && !confirmation) return <div className="mx-auto max-w-3xl px-5 py-16 text-center"><h1 className="font-display text-3xl font-extrabold">{t('checkout.empty')}</h1><Link to="/shop" className="mt-5 inline-block text-sm font-semibold text-forest">{t('checkout.findItem')}</Link></div>;

  if (confirmation) return <div className="mx-auto max-w-2xl px-5 py-20 text-center"><CheckCircle2 size={45} className="mx-auto text-forest" /><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-forest">{t('checkout.orderReceived')}</p><h1 className="mt-2 font-display text-4xl font-extrabold">{t('checkout.choice')}</h1><p className="mt-3 text-sm text-muted">Order #{confirmation.order._id.slice(-8).toUpperCase()} · {money(confirmation.order.totalAmount)}</p>{confirmation.paymentNotice && <div className="mt-6 text-left"><ErrorMessage message={paymentMethod === 'CashOnDelivery' ? '' : confirmation.paymentNotice} /></div>}<p className="mt-4 text-sm text-muted">{paymentMethod === 'CashOnDelivery' ? t('checkout.cashSeller') : t('checkout.paymentPending')}</p><div className="mt-7 flex justify-center gap-3"><Link to="/orders" className="rounded-full bg-forest px-6 py-3 text-sm font-bold text-white">{t('checkout.viewOrders')}</Link><Link to="/shop" className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold">{t('checkout.keepExploring')}</Link></div></div>;

  return <div className="mx-auto w-full max-w-[1800px] px-5 py-10 md:px-8 md:py-14">
    <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-forest"><ArrowLeft size={16} /> {t('checkout.backToBag')}</Link><h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight">{t('checkout.title')}</h1>
    <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-5 md:p-7"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9efe8] text-forest"><MapPin size={17} /></span><div><h2 className="font-display font-bold">{t('checkout.shippingTitle')}</h2><p className="text-xs text-muted">{t('checkout.shippingDescription')}</p></div></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">{[['fullName', 'checkout.fullName'], ['phone', 'auth.phone'], ['region', 'checkout.region'], ['city', 'checkout.city'], ['subCity', 'checkout.subCity'], ['woreda', 'checkout.woreda'], ['streetAddress', 'checkout.streetAddress'], ['additionalDirections', 'checkout.directions']].map(([key, label]) => <label key={key} className={`text-xs font-semibold ${['streetAddress', 'additionalDirections'].includes(key) ? 'sm:col-span-2' : ''}`}>{t(label)}<input required={!['subCity', 'woreda', 'additionalDirections'].includes(key)} maxLength={key === 'streetAddress' || key === 'additionalDirections' ? 500 : 120} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" /></label>)}</div>
        </section>
        <section className="rounded-2xl bg-white p-5 md:p-7"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9efe8] text-forest"><CreditCard size={17} /></span><div><h2 className="font-display font-bold">{t('checkout.paymentTitle')}</h2><p className="text-xs text-muted">{t('checkout.paymentDescription')}</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{[['CashOnDelivery', t('checkout.cash')], ['Chapa', 'Chapa'], ['Telebirr', 'Telebirr']].map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-xs font-semibold transition ${paymentMethod === value ? 'border-forest bg-[#f0f4ed]' : 'border-black/10'}`}><input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="accent-forest" />{label}</label>)}</div><p className="mt-4 text-xs leading-5 text-muted">{t('checkout.onlinePaymentNote')}</p>
        </section>
        <ErrorMessage message={error} />
      </div>
      <aside className="h-fit rounded-2xl bg-white p-6"><h2 className="font-display text-lg font-bold">{t('checkout.summary')}</h2><div className="mt-5 space-y-4">{items.map((item) => <div key={item._id} className="flex justify-between gap-3 text-sm"><span className="line-clamp-1 text-muted">{item.title} × {item.quantity}</span><span className="shrink-0 font-semibold">{money(item.price * item.quantity)}</span></div>)}</div><div className="my-5 border-t border-black/10" /><div className="flex justify-between text-sm text-muted"><span>{t('cart.subtotal')}</span><span>{money(total)}</span></div><div className="mt-3 flex justify-between text-sm text-muted"><span>{t('cart.delivery')}</span><span>{t('checkout.confirmedSeller')}</span></div><div className="my-5 border-t border-black/10" /><div className="flex justify-between font-display font-extrabold"><span>{t('cart.total')}</span><span>{money(total)}</span></div><button disabled={busy || !canPlaceOrder} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white">{busy ? t('checkout.placing') : t('checkout.placeOrder')} {!busy && canPlaceOrder && <ArrowRight size={16} />}</button>{!canPlaceOrder && <p className="mt-3 text-center text-xs leading-5 text-muted">{t('checkout.liveAccountRequired')}</p>}</aside>
    </form>
  </div>;
}
