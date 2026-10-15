import { ArrowRight, BadgeCheck, CircleDollarSign, LayoutDashboard, Package, Plus, Save, Store, Trash2, Truck, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api, jsonBody, money } from '../api';
import { ErrorMessage } from '../components/PageState';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const emptyProduct = { title: '', description: '', price: '', category: '', stock: '', images: '', wholesalePricingTiers: '' };
const emptyStore = { name: '', description: '', address: '' };
const emptyBankDetails = { bankName: '', accountName: '', accountNumber: '' };
export default function VendorPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [storeForm, setStoreForm] = useState(emptyStore);
  const [bankDetails, setBankDetails] = useState(emptyBankDetails);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const [dashboard, inventory, storeDetails] = await Promise.all([
      api('/vendors/me/dashboard'),
      api('/vendors/me/products'),
      api('/vendors/me/store'),
    ]);
    setData(dashboard);
    setProducts(inventory.products);
    if (dashboard.store) setStoreForm({ name: dashboard.store.name, description: dashboard.store.description, address: dashboard.store.address });
    if (storeDetails.store?.bankAccountDetails) {
      setBankDetails({
        bankName: storeDetails.store.bankAccountDetails.bankName || '',
        accountName: storeDetails.store.bankAccountDetails.accountName || '',
        accountNumber: storeDetails.store.bankAccountDetails.accountNumber || '',
      });
    }
  }, []);

  useEffect(() => {
    if (user?.demoMode) {
      setData({ stats: { productCount: 0, orderCount: 0, revenue: 0 } });
      setLoading(false);
      return;
    }
    refresh().catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [refresh, user?.demoMode]);

  async function saveStore(event) {
    event.preventDefault();
    if (user?.demoMode) {
      setError(t('vendor.offlineNotice'));
      return;
    }
    setBusy(true); setError(''); setNotice('');
    try {
      await api('/vendors/me/store', { method: 'PUT', body: jsonBody({ ...storeForm, bankAccountDetails: bankDetails }) });
      await refresh();
      setNotice(t('vendor.storeSaved'));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  function beginEdit(product) {
    setEditingId(product._id);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: (product.images || []).join('\n'),
      wholesalePricingTiers: (product.wholesalePricingTiers || []).map((tier) => `${tier.minQuantity}:${tier.unitPrice}`).join('\n'),
    });
    document.getElementById('product-editor')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (user?.demoMode) {
      setError(t('vendor.offlineNotice'));
      return;
    }
    setBusy(true); setError(''); setNotice('');
    const body = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      images: productForm.images.split(/\n|,/).map((value) => value.trim()).filter(Boolean),
      wholesalePricingTiers: productForm.wholesalePricingTiers.split('\n').filter(Boolean).map((line) => {
        const [minQuantity, unitPrice] = line.split(':').map(Number);
        return { minQuantity, unitPrice };
      }),
    };
    try {
      await api(editingId ? `/products/${editingId}` : '/products', { method: editingId ? 'PATCH' : 'POST', body: jsonBody(body) });
      await refresh();
      setProductForm(emptyProduct);
      setEditingId('');
      setNotice(editingId ? t('vendor.productUpdated') : t('vendor.productListed'));
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  async function deleteProduct(product) {
    if (user?.demoMode) {
      setError(t('vendor.offlineNotice'));
      return;
    }
    if (!window.confirm(t('vendor.confirmRemove').replace('{title}', product.title))) return;
    setError(''); setNotice('');
    try {
      await api(`/products/${product._id}`, { method: 'DELETE' });
      await refresh();
      setNotice(t('vendor.productRemoved'));
    } catch (requestError) { setError(requestError.message); }
  }

  async function updateStatus(orderId, deliveryStatus) {
    if (user?.demoMode) {
      setError(t('vendor.offlineNotice'));
      return;
    }
    setError('');
    try {
      await api(`/vendors/me/orders/${orderId}/status`, { method: 'PATCH', body: jsonBody({ deliveryStatus }) });
      await refresh();
      setNotice(t('vendor.orderUpdated'));
    } catch (requestError) { setError(requestError.message); }
  }

  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">{t('vendor.loading')}</div>;
  const stats = data?.stats || { productCount: 0, orderCount: 0, revenue: 0 };

  return <div className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-12">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-forest">{t('vendor.eyebrow')}</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">{t('vendor.title')}<span className="text-forest">.</span></h1><p className="mt-2 text-sm text-muted">{t('vendor.description')}</p></div><a href="#store-details" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-xs font-bold text-white">{t('vendor.storeSettings')} <Store size={15} /></a></div>
    <div className="mt-7 space-y-3"><ErrorMessage message={error} />{notice && <div role="status" className="rounded-xl bg-[#e7f3df] px-4 py-3 text-sm text-forest">{notice}</div>}{data?.store && <div className={`rounded-xl px-4 py-3 text-sm ${data.store.isVerified ? 'bg-[#e7f3df] text-forest' : 'bg-[#fff2db] text-[#73541b]'}`}>{data.store.isVerified ? <span className="inline-flex items-center gap-2"><BadgeCheck size={16} /> {t('vendor.storeVerified')}</span> : t('vendor.storePending')}</div>}</div>
    <div className="mt-7 grid gap-4 sm:grid-cols-3">{[
      { icon: <Package size={18} />, label: t('vendor.productsListed'), value: stats.productCount },
      { icon: <Truck size={18} />, label: t('vendor.incomingOrders'), value: stats.orderCount },
      { icon: <CircleDollarSign size={18} />, label: t('vendor.orderValue'), value: money(stats.revenue) },
    ].map((item) => <div key={item.label} className="rounded-2xl bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted">{item.label}</span><span className="text-forest">{item.icon}</span></div><p className="mt-4 font-display text-2xl font-extrabold">{item.value}</p></div>)}</div>

    <section id="store-details" className="mt-8 rounded-2xl bg-white p-5 md:p-7"><div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-xl font-extrabold">{t('vendor.shopDetails')}</h2><p className="mt-1 text-xs text-muted">{t('vendor.shopDetailsDescription')}</p></div><LayoutDashboard className="text-forest" size={20} /></div>
      <form onSubmit={saveStore} className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold">{t('vendor.shopName')}<input required maxLength="120" value={storeForm.name} onChange={(event) => setStoreForm({ ...storeForm, name: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" placeholder={t('vendor.shopNamePlaceholder')} /></label><label className="text-xs font-semibold">{t('admin.address')}<input required maxLength="500" value={storeForm.address} onChange={(event) => setStoreForm({ ...storeForm, address: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" placeholder={t('vendor.addressPlaceholder')} /></label><label className="text-xs font-semibold md:col-span-2">{t('vendor.shopDescription')}<textarea maxLength="2000" rows="3" value={storeForm.description} onChange={(event) => setStoreForm({ ...storeForm, description: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" placeholder={t('vendor.shopDescriptionPlaceholder')} /></label><p className="text-xs font-bold md:col-span-2">{t('vendor.payoutAccount')} <span className="font-normal text-muted">{t('vendor.visibleOnlyToYou')}</span></p><label className="text-xs font-semibold">{t('vendor.bankName')}<input maxLength="120" value={bankDetails.bankName} onChange={(event) => setBankDetails({ ...bankDetails, bankName: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" /></label><label className="text-xs font-semibold">{t('vendor.accountHolder')}<input maxLength="120" value={bankDetails.accountName} onChange={(event) => setBankDetails({ ...bankDetails, accountName: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" /></label><label className="text-xs font-semibold">{t('vendor.accountNumber')}<input maxLength="64" value={bankDetails.accountNumber} onChange={(event) => setBankDetails({ ...bankDetails, accountNumber: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" /></label><div className="md:col-span-2"><button disabled={busy || user?.demoMode} className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-xs font-bold text-white"><Save size={14} /> {t('vendor.saveShop')}</button></div></form>
    </section>

    <div className="mt-8 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
      <section id="product-editor" className="h-fit rounded-2xl bg-white p-5 md:p-7"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-extrabold">{editingId ? t('vendor.editListing') : t('vendor.addListing')}</h2><p className="mt-1 text-xs text-muted">{t('vendor.priceCurrency')}</p></div>{editingId && <button onClick={() => { setEditingId(''); setProductForm(emptyProduct); }} className="text-muted" aria-label={t('vendor.cancelEditing')}><X size={18} /></button>}</div>
        <form onSubmit={saveProduct} className="mt-5 space-y-4"><label className="block text-xs font-semibold">{t('vendor.productName')}<input required maxLength="200" value={productForm.title} onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" /></label><label className="block text-xs font-semibold">{t('vendor.descriptionLabel')}<textarea required maxLength="10000" rows="3" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold">{t('vendor.price')}<input required type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-3 py-3 text-sm outline-none focus:border-forest" /></label><label className="text-xs font-semibold">{t('admin.stock')}<input required type="number" min="0" step="1" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-3 py-3 text-sm outline-none focus:border-forest" /></label></div><label className="block text-xs font-semibold">{t('vendor.category')}<input required maxLength="100" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" placeholder={t('vendor.categoryPlaceholder')} /></label><label className="block text-xs font-semibold">{t('vendor.images')} <span className="font-normal text-muted">{t('vendor.onePerLine')}</span><textarea rows="2" value={productForm.images} onChange={(event) => setProductForm({ ...productForm, images: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" placeholder={t('vendor.urlPlaceholder')} /></label><label className="block text-xs font-semibold">{t('vendor.wholesaleTiers')} <span className="font-normal text-muted">{t('vendor.wholesaleHint')}</span><textarea rows="2" value={productForm.wholesalePricingTiers} onChange={(event) => setProductForm({ ...productForm, wholesalePricingTiers: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-paper px-4 py-3 text-sm outline-none focus:border-forest" placeholder={'5:650\n10:600'} /></label><button disabled={busy || user?.demoMode || !data?.store?.isVerified} className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed">{editingId ? <Save size={15} /> : <Plus size={16} />}{busy ? t('vendor.saving') : editingId ? t('vendor.saveChanges') : t('vendor.listProduct')}<ArrowRight size={15} /></button>{!data?.store?.isVerified && !user?.demoMode && <p className="text-center text-[11px] text-muted">{t('vendor.verifyBeforeListing')}</p>}</form>
      </section>

      <div className="space-y-8">
        <section className="rounded-2xl bg-white p-5 md:p-7"><div className="flex items-end justify-between"><div><h2 className="font-display text-xl font-extrabold">{t('vendor.products')}</h2><p className="mt-1 text-xs text-muted">{t('vendor.listingsCount').replace('{count}', products.length)}</p></div></div>
          {!products.length ? <p className="mt-6 rounded-xl bg-paper p-5 text-sm text-muted">{t('vendor.firstListing')}</p> : <div className="mt-5 divide-y divide-black/5">{products.map((product) => <div key={product._id} className="flex items-center gap-3 py-3"><img src={product.images?.[0] || 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=100&q=60'} alt="" className="h-12 w-12 rounded-xl object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.title}</p><p className="mt-1 text-xs text-muted">{money(product.price)} · {t('vendor.stockCount').replace('{count}', product.stock)}</p></div><button onClick={() => beginEdit(product)} className="text-xs font-bold text-forest">{t('vendor.edit')}</button><button onClick={() => deleteProduct(product)} aria-label={`${t('admin.remove')} ${product.title}`} className="p-2 text-muted hover:text-red-600"><Trash2 size={15} /></button></div>)}</div>}
        </section>
        <section className="rounded-2xl bg-white p-5 md:p-7"><h2 className="font-display text-xl font-extrabold">{t('vendor.latestOrders')}</h2>{!data?.orders?.length ? <p className="mt-5 rounded-xl bg-paper p-5 text-sm text-muted">{t('vendor.noOrders')}</p> : <div className="mt-4 space-y-3">{data.orders.map((order) => <div key={order._id} className="rounded-xl bg-paper p-4"><div className="flex justify-between gap-3"><div><p className="text-xs font-bold">#{order._id.slice(-8).toUpperCase()}</p><p className="mt-1 text-[11px] text-muted">{order.customer?.name} · {new Date(order.createdAt).toLocaleDateString()}</p></div><div className="text-right"><p className="text-xs font-bold">{money(order.totalAmount)}</p><p className="mt-1 text-[10px] text-muted">{t(`status.${order.paymentStatus}`)}</p></div></div><div className="mt-3 flex items-center justify-between gap-3"><span className="text-[11px] text-muted">{order.items.map((item) => item.product?.title || t('vendor.productFallback')).join(', ')}</span><select value={order.vendorDeliveryStatus} onChange={(event) => updateStatus(order._id, event.target.value)} className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-[10px]"><option value="Processing">{t('status.Processing')}</option><option value="Shipped">{t('status.Shipped')}</option><option value="Delivered">{t('status.Delivered')}</option><option value="Cancelled" disabled>{t('status.Cancelled')}</option></select></div></div>)}</div>}</section>
      </div>
    </div>
  </div>;
}
