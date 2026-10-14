import { PackageCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, jsonBody, money } from '../api';
import { ErrorMessage } from '../components/PageState';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    if (user?.demoMode) return;
    api('/orders/mine').then((result) => setOrders(result.orders)).catch((requestError) => setError(requestError.message));
  }, [user?.demoMode]);

  async function cancelOrder(orderId) {
    if (!window.confirm('Cancel this order? Available product stock will be restored.')) return;
    setError('');
    setBusyId(orderId);
    try {
      const result = await api(`/orders/${orderId}/cancel`, { method: 'POST', body: jsonBody({}) });
      setOrders((previous) => previous.map((order) => order._id === orderId ? { ...order, deliveryStatus: result.order.deliveryStatus } : order));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  return <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14"><p className="text-xs font-bold uppercase tracking-[.2em] text-forest">A look back</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Your orders.</h1><div className="mt-8"><ErrorMessage message={error} /></div>
    {!error && orders.length === 0 ? <div className="mt-8 rounded-2xl bg-white p-12 text-center"><PackageCheck size={32} className="mx-auto text-forest" /><h2 className="mt-4 font-display text-xl font-bold">No orders just yet.</h2><p className="mt-2 text-sm text-muted">Your next good find is only a little way away.</p></div> : <div className="mt-7 space-y-4">{orders.map((order) => <article key={order._id} className="rounded-2xl bg-white p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4"><div><p className="text-xs text-muted">Order #{order._id.slice(-8).toUpperCase()}</p><p className="mt-1 text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('en-ET', { dateStyle: 'long' })}</p></div><div className="flex gap-2"><span className="rounded-full bg-[#f1f3ee] px-3 py-1.5 text-[10px] font-bold">{order.deliveryStatus}</span><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${order.paymentStatus === 'Paid' ? 'bg-[#e7f3df] text-forest' : 'bg-[#fff2db] text-[#815d1b]'}`}>{order.paymentStatus}</span></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">{order.items.map((item) => <span key={item.product?._id || item.product}>{item.product?.title || 'Marketplace item'} × {item.quantity}</span>)}</div><div className="text-right"><p className="font-display font-extrabold">{money(order.totalAmount)}</p><p className="mt-1 text-[10px] text-muted">{order.paymentMethod}</p></div></div>{order.deliveryStatus === 'Processing' && <button disabled={busyId === order._id} onClick={() => cancelOrder(order._id)} className="mt-4 text-xs font-semibold text-red-700 underline">{busyId === order._id ? 'Cancelling…' : 'Cancel order'}</button>}</article>)}</div>}
  </div>;
}
