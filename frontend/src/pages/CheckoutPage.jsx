import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, jsonBody, money } from '../api';
import { ErrorMessage } from '../components/PageState';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const initialAddress = { fullName: '', phone: '', region: '', city: '', subCity: '', woreda: '', streetAddress: '', additionalDirections: '' };

export default function CheckoutPage() {
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
      setError('Order placement requires an active marketplace account and live catalog items.');
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

  if (!items.length && !confirmation) return <div className="mx-auto max-w-3xl px-5 py-16 text-center"><h1 className="font-display text-3xl font-extrabold">Your bag is empty.</h1><Link to="/shop" className="mt-5 inline-block text-sm font-semibold text-forest">Find a good thing to bring home</Link></div>;

  if (confirmation) return <div className="mx-auto max-w-2xl px-5 py-20 text-center"><CheckCircle2 size={45} className="mx-auto text-forest" /><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-forest">Order received</p><h1 className="mt-2 font-display text-4xl font-extrabold">That’s a good choice.</h1><p className="mt-3 text-sm text-muted">Order #{confirmation.order._id.slice(-8).toUpperCase()} · {money(confirmation.order.totalAmount)}</p>{confirmation.paymentNotice && <div className="mt-6 text-left"><ErrorMessage message={paymentMethod === 'CashOnDelivery' ? '' : confirmation.paymentNotice} /></div>}<p className="mt-4 text-sm text-muted">{paymentMethod === 'CashOnDelivery' ? 'Your seller will be in touch to arrange delivery and payment.' : 'Your order is saved as pending until secure payment checkout is configured.'}</p><div className="mt-7 flex justify-center gap-3"><Link to="/orders" className="rounded-full bg-forest px-6 py-3 text-sm font-bold text-white">View my orders</Link><Link to="/shop" className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold">Keep exploring</Link></div></div>;

  return <div className="mx-auto w-full max-w-[1800px] px-5 py-10 md:px-8 md:py-14">
    <Link to="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-forest"><ArrowLeft size={16} /> Back to your bag</Link><h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight">Make it yours.</h1>
    <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-5 md:p-7"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9efe8] text-forest"><MapPin size={17} /></span><div><h2 className="font-display font-bold">Where should we send it?</h2><p className="text-xs text-muted">Delivery details in Ethiopia</p></div></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">{[['fullName', 'Full name'], ['phone', 'Phone number'], ['region', 'Region'], ['city', 'City'], ['subCity', 'Sub-city (optional)'], ['woreda', 'Woreda (optional)'], ['streetAddress', 'Street address'], ['additionalDirections', 'Directions (optional)']].map(([key, label]) => <label key={key} className={`text-xs font-semibold ${['streetAddress', 'additionalDirections'].includes(key) ? 'sm:col-span-2' : ''}`}>{label}<input required={!['subCity', 'woreda', 'additionalDirections'].includes(key)} maxLength={key === 'streetAddress' || key === 'additionalDirections' ? 500 : 120} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" /></label>)}</div>
        </section>
        <section className="rounded-2xl bg-white p-5 md:p-7"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9efe8] text-forest"><CreditCard size={17} /></span><div><h2 className="font-display font-bold">How would you like to pay?</h2><p className="text-xs text-muted">Choose at checkout</p></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{[['CashOnDelivery', 'Cash on delivery'], ['Chapa', 'Chapa'], ['Telebirr', 'Telebirr']].map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-xs font-semibold transition ${paymentMethod === value ? 'border-forest bg-[#f0f4ed]' : 'border-black/10'}`}><input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="accent-forest" />{label}</label>)}</div><p className="mt-4 text-xs leading-5 text-muted">Online payment options are presented as integration placeholders until secure provider checkout and verified callbacks are configured. Orders are not marked paid without confirmation.</p>
        </section>
        <ErrorMessage message={error} />
      </div>
      <aside className="h-fit rounded-2xl bg-white p-6"><h2 className="font-display text-lg font-bold">Order summary</h2><div className="mt-5 space-y-4">{items.map((item) => <div key={item._id} className="flex justify-between gap-3 text-sm"><span className="line-clamp-1 text-muted">{item.title} × {item.quantity}</span><span className="shrink-0 font-semibold">{money(item.price * item.quantity)}</span></div>)}</div><div className="my-5 border-t border-black/10" /><div className="flex justify-between text-sm text-muted"><span>Subtotal</span><span>{money(total)}</span></div><div className="mt-3 flex justify-between text-sm text-muted"><span>Delivery</span><span>Confirmed by seller</span></div><div className="my-5 border-t border-black/10" /><div className="flex justify-between font-display font-extrabold"><span>Total</span><span>{money(total)}</span></div><button disabled={busy || !canPlaceOrder} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-3.5 text-sm font-bold text-white">{busy ? 'Placing your order…' : 'Place my order'} {!busy && canPlaceOrder && <ArrowRight size={16} />}</button>{!canPlaceOrder && <p className="mt-3 text-center text-xs leading-5 text-muted">Order placement requires an active marketplace account and live catalog items.</p>}</aside>
    </form>
  </div>;
}
