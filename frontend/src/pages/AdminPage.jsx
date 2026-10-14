import {
  BadgeCheck,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api, demoFallbackEnabled, isNetworkError, jsonBody, money } from '../api';
import { ErrorMessage } from '../components/PageState';
import { adminDemoData } from '../adminDemoData';

const PAGE_SIZE = 25;
const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'vendors', label: 'Vendors', icon: Store },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
];

function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages < 2) return null;
  return <div className="flex items-center justify-between border-t border-black/5 px-1 pt-4 text-xs text-muted">
    <span>{pagination.total} records · page {pagination.page} of {pagination.pages}</span>
    <div className="flex gap-2">
      <button type="button" disabled={pagination.page <= 1} onClick={() => onChange(pagination.page - 1)} className="rounded-lg border border-black/10 px-3 py-2 font-semibold disabled:opacity-40">Previous</button>
      <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => onChange(pagination.page + 1)} className="rounded-lg border border-black/10 px-3 py-2 font-semibold disabled:opacity-40">Next</button>
    </div>
  </div>;
}

function EmptyState({ children }) {
  return <p className="py-10 text-center text-sm text-muted">{children}</p>;
}

function SectionHeading({ title, subtitle, icon: Icon }) {
  return <div className="flex items-center gap-3">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9efe8] text-forest"><Icon size={18} /></span>
    <div><h2 className="font-display text-xl font-extrabold">{title}</h2>{subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}</div>
  </div>;
}

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState(null);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderPagination, setOrderPagination] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [section, setSection] = useState('overview');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [summary, userList, storeList, productList, orderList] = await Promise.all([
        api('/admin/dashboard'),
        api(`/admin/users?page=${userPage}&limit=${PAGE_SIZE}`),
        api('/admin/stores'),
        api(`/admin/products?page=${productPage}&limit=${PAGE_SIZE}`),
        api(`/admin/orders?page=${orderPage}&limit=${PAGE_SIZE}`),
      ]);
      setDashboard(summary.stats);
      setUsers(userList.users);
      setUserPagination(userList.pagination);
      setStores(storeList.stores);
      setProducts(productList.products);
      setProductPagination(productList.pagination);
      setOrders(orderList.orders);
      setOrderPagination(orderList.pagination);
      setDemoMode(false);
      setError('');
    } catch (requestError) {
      if (!demoFallbackEnabled || !isNetworkError(requestError)) throw requestError;
      setDashboard(adminDemoData.dashboard);
      setUsers(adminDemoData.users);
      setUserPagination(adminDemoData.userPagination);
      setStores(adminDemoData.stores);
      setProducts(adminDemoData.products);
      setProductPagination(adminDemoData.productPagination);
      setOrders(adminDemoData.orders);
      setOrderPagination(adminDemoData.orderPagination);
      setDemoMode(true);
      setError('');
    }
  }, [userPage, productPage, orderPage]);

  useEffect(() => {
    refresh().catch((requestError) => setError(requestError.message));
  }, [refresh]);

  async function runAction(id, successMessage, action) {
    if (demoMode) return;
    setBusyId(id);
    setError('');
    setNotice('');
    try {
      await action();
      await refresh();
      setNotice(successMessage);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  function verifyStore(store, isVerified) {
    return runAction(
      store._id,
      `${store.name} ${isVerified ? 'approved and verified' : 'suspended'}.`,
      () => api(`/admin/stores/${store._id}/verification`, { method: 'PATCH', body: jsonBody({ isVerified }) }),
    );
  }

  function changeRole(user, role) {
    return runAction(
      user._id,
      `${user.name} is now a ${role}.`,
      () => api(`/admin/users/${user._id}/role`, { method: 'PATCH', body: jsonBody({ role }) }),
    );
  }

  function deleteUser(user) {
    if (!window.confirm(`Delete ${user.name}'s account? Accounts with order history cannot be deleted.`)) return;
    return runAction(user._id, `${user.name}'s account was deleted.`, () =>
      api(`/admin/users/${user._id}`, { method: 'DELETE' }));
  }

  function deleteProduct(product) {
    if (!window.confirm(`Remove "${product.title}" from the public catalog? Existing order records will be preserved.`)) return;
    return runAction(product._id, `${product.title} was removed from the public catalog.`, () =>
      api(`/admin/products/${product._id}`, { method: 'DELETE' }));
  }

  function restoreProduct(product) {
    return runAction(product._id, `${product.title} is visible in the public catalog again.`, () =>
      api(`/admin/products/${product._id}/visibility`, { method: 'PATCH', body: jsonBody({ isActive: true }) }));
  }

  if (!dashboard && !error) return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">Loading your overview…</div>;

  const cards = [
    { label: 'Total users', value: dashboard?.users ?? '—', icon: Users },
    { label: 'Total vendors', value: dashboard?.vendors ?? '—', icon: Store },
    { label: 'Total products', value: dashboard?.products ?? '—', icon: Package },
    { label: 'Total orders', value: dashboard?.orders ?? '—', icon: ShoppingBag },
    { label: 'Platform revenue', value: money(dashboard?.paidRevenue), icon: CircleDollarSign, detail: `${dashboard?.paidOrders ?? 0} paid orders · ETB` },
  ];

  return <div className="mx-auto w-full max-w-[1800px] px-5 py-8 md:px-8 md:py-12">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-forest">Marketplace control center</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Admin dashboard<span className="text-forest">.</span></h1><p className="mt-2 text-sm text-muted">Manage members, stores, products, and platform orders.</p></div>
      <span className="flex items-center gap-2 rounded-full bg-[#e7f3df] px-4 py-2 text-xs font-bold text-forest"><ShieldCheck size={15} /> Secure admin workspace</span>
    </div>

    <div className="mt-6 space-y-3">
      <ErrorMessage message={error} />
      {notice && <div role="status" className="rounded-xl bg-[#e7f3df] px-4 py-3 text-sm text-forest">{notice}</div>}
    </div>

    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ label, value, icon: Icon, detail }) => <div key={label} className="rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between"><span className="text-xs font-semibold text-muted">{label}</span><Icon size={18} className="text-forest" /></div>
        <p className="mt-4 font-display text-2xl font-extrabold">{value}</p>
        {detail && <p className="mt-1 text-[11px] text-muted">{detail}</p>}
      </div>)}
    </div>

    <div className="mt-8 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2" role="tablist" aria-label="Admin sections">
      {sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={section === id} onClick={() => setSection(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${section === id ? 'bg-forest text-white' : 'text-muted hover:bg-paper hover:text-ink'}`}>
        <Icon size={16} />{label}{id === 'vendors' && dashboard?.pendingVendors > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] ${section === id ? 'bg-white/20 text-white' : 'bg-[#fff2db] text-[#73541b]'}`}>{dashboard.pendingVendors}</span>}
      </button>)}
    </div>

    {section === 'overview' && <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
      <section className="rounded-2xl bg-white p-5 md:p-7">
        <SectionHeading title="Vendor applications" subtitle={`${dashboard?.pendingVendors ?? 0} stores need review`} icon={BadgeCheck} />
        {stores.filter((store) => !store.isVerified).slice(0, 6).map((store) => <div key={store._id} className="flex items-center justify-between gap-3 border-b border-black/5 py-4 last:border-0">
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{store.name}</p><p className="truncate text-xs text-muted">{store.vendor?.name} · {store.vendor?.email}</p></div>
          <button type="button" disabled={demoMode || busyId === store._id} onClick={() => verifyStore(store, true)} className="shrink-0 rounded-full bg-forest px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busyId === store._id ? 'Saving…' : 'Approve'}</button>
        </div>)}
        {!stores.some((store) => !store.isVerified) && <EmptyState>There are no vendor applications waiting for review.</EmptyState>}
      </section>
      <section className="rounded-2xl bg-white p-5 md:p-7">
        <SectionHeading title="Recent orders" subtitle="Latest marketplace activity" icon={ShoppingBag} />
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[570px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">Order</th><th className="pb-3 font-semibold">Customer</th><th className="pb-3 font-semibold">Status</th><th className="pb-3 text-right font-semibold">Amount</th></tr></thead><tbody className="divide-y divide-black/5">{orders.slice(0, 6).map((order) => <tr key={order._id}><td className="py-3 font-semibold">#{order._id.slice(-8).toUpperCase()}</td><td className="py-3">{order.customer?.name || 'Unknown'}</td><td className="py-3 text-xs">{order.deliveryStatus}</td><td className="py-3 text-right font-semibold">{money(order.totalAmount)}</td></tr>)}</tbody></table>{orders.length === 0 && <EmptyState>No orders to show yet.</EmptyState>}</div>
        <button type="button" onClick={() => setSection('orders')} className="mt-3 text-xs font-bold text-forest">View all orders</button>
      </section>
    </div>}

    {section === 'vendors' && <section className="mt-6 rounded-2xl bg-white p-5 md:p-7">
      <SectionHeading title="Vendor verification" subtitle="Approve eligible stores or suspend previously verified stores." icon={Store} />
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">Store</th><th className="pb-3 font-semibold">Owner</th><th className="pb-3 font-semibold">Address</th><th className="pb-3 font-semibold">Status</th><th className="pb-3 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-black/5">{stores.map((store) => <tr key={store._id}><td className="py-4 font-semibold">{store.name}</td><td className="py-4"><p>{store.vendor?.name || 'Unknown'}</p><p className="text-xs text-muted">{store.vendor?.email}</p></td><td className="py-4 text-xs text-muted">{store.address}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${store.isVerified ? 'bg-[#e7f3df] text-forest' : 'bg-[#fff2db] text-[#73541b]'}`}>{store.isVerified ? 'Verified' : 'Not verified'}</span></td><td className="py-4 text-right"><button type="button" disabled={demoMode || busyId === store._id} onClick={() => verifyStore(store, !store.isVerified)} className={`rounded-full px-3 py-2 text-xs font-semibold disabled:opacity-50 ${store.isVerified ? 'border border-[#b42318]/20 text-[#b42318]' : 'bg-forest text-white'}`}>{busyId === store._id ? 'Saving…' : store.isVerified ? 'Reject / suspend' : 'Approve / verify'}</button></td></tr>)}</tbody></table>{stores.length === 0 && <EmptyState>No vendor stores have been registered yet.</EmptyState>}</div>
    </section>}

    {section === 'users' && <section className="mt-6 rounded-2xl bg-white p-5 md:p-7">
      <SectionHeading title="User management" subtitle="Manage customer and vendor access. Admin roles are protected from changes here." icon={Users} />
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">Member</th><th className="pb-3 font-semibold">Phone</th><th className="pb-3 font-semibold">Joined</th><th className="pb-3 font-semibold">Role</th><th className="pb-3 text-right font-semibold">Account</th></tr></thead><tbody className="divide-y divide-black/5">{users.map((user) => <tr key={user._id}><td className="py-4"><p className="font-semibold">{user.name}</p><p className="text-xs text-muted">{user.email}</p></td><td className="py-4 text-xs text-muted">{user.phone || '—'}</td><td className="py-4 text-xs text-muted">{new Date(user.createdAt).toLocaleDateString()}</td><td className="py-4">{user.role === 'admin' ? <span className="text-xs font-semibold text-forest">Admin</span> : <select aria-label={`Change role for ${user.name}`} value={user.role} disabled={demoMode || busyId === user._id} onChange={(event) => changeRole(user, event.target.value)} className="rounded-lg border border-black/10 bg-paper px-3 py-2 text-xs capitalize"><option value="customer">Customer</option><option value="vendor">Vendor</option></select>}</td><td className="py-4 text-right">{user.role === 'admin' ? <span className="text-xs text-muted">Protected</span> : <button type="button" aria-label={`Delete ${user.name}`} disabled={demoMode || busyId === user._id} onClick={() => deleteUser(user)} className="inline-flex items-center gap-2 rounded-full border border-[#b42318]/20 px-3 py-2 text-xs font-semibold text-[#b42318] disabled:opacity-50"><Trash2 size={14} />Delete</button>}</td></tr>)}</tbody></table>{users.length === 0 && <EmptyState>No users to show.</EmptyState>}</div>
      <Pagination pagination={userPagination} onChange={setUserPage} />
    </section>}

    {section === 'products' && <section className="mt-6 rounded-2xl bg-white p-5 md:p-7">
      <SectionHeading title="Product moderation" subtitle="Review marketplace listings and remove inappropriate items." icon={Package} />
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">Product</th><th className="pb-3 font-semibold">Vendor</th><th className="pb-3 font-semibold">Category</th><th className="pb-3 font-semibold">Stock</th><th className="pb-3 font-semibold">Visibility</th><th className="pb-3 text-right font-semibold">Price / action</th></tr></thead><tbody className="divide-y divide-black/5">{products.map((product) => <tr key={product._id}><td className="py-4"><p className="max-w-xs truncate font-semibold">{product.title}</p><p className="text-xs text-muted">{new Date(product.createdAt).toLocaleDateString()}</p></td><td className="py-4 text-xs">{product.vendor?.name || 'Unknown vendor'}</td><td className="py-4 text-xs text-muted">{product.category}</td><td className="py-4 text-xs">{product.stock}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${product.isActive === false ? 'bg-[#fff0ed] text-[#b42318]' : 'bg-[#e7f3df] text-forest'}`}>{product.isActive === false ? 'Removed' : 'Live'}</span></td><td className="py-4 text-right"><span className="mr-4 font-semibold">{money(product.price)}</span>{product.isActive === false ? <button type="button" disabled={demoMode || busyId === product._id} onClick={() => restoreProduct(product)} className="rounded-full bg-forest px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busyId === product._id ? 'Saving…' : 'Restore'}</button> : <button type="button" aria-label={`Remove ${product.title}`} disabled={demoMode || busyId === product._id} onClick={() => deleteProduct(product)} className="inline-flex items-center gap-2 rounded-full border border-[#b42318]/20 px-3 py-2 text-xs font-semibold text-[#b42318] disabled:opacity-50"><Trash2 size={14} />Remove</button>}</td></tr>)}</tbody></table>{products.length === 0 && <EmptyState>No product listings to show.</EmptyState>}</div>
      <Pagination pagination={productPagination} onChange={setProductPage} />
    </section>}

    {section === 'orders' && <section className="mt-6 rounded-2xl bg-white p-5 md:p-7">
      <SectionHeading title="Platform orders" subtitle="Marketplace-wide customer orders, payment status, and fulfillment progress." icon={ShoppingBag} />
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[930px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">Order / date</th><th className="pb-3 font-semibold">Customer</th><th className="pb-3 font-semibold">Items</th><th className="pb-3 font-semibold">Delivery</th><th className="pb-3 font-semibold">Payment</th><th className="pb-3 text-right font-semibold">Total (ETB)</th></tr></thead><tbody className="divide-y divide-black/5">{orders.map((order) => <tr key={order._id}><td className="py-4"><p className="font-semibold">#{order._id.slice(-8).toUpperCase()}</p><p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</p></td><td className="py-4"><p>{order.customer?.name || 'Unknown'}</p><p className="text-xs text-muted">{order.customer?.email || ''}</p><p className="text-xs text-muted">{order.customer?.phone || ''}</p></td><td className="py-4 text-xs text-muted">{order.items?.map((item) => `${item.product?.title || 'Removed item'} × ${item.quantity}`).join(', ') || '—'}</td><td className="py-4"><span className="rounded-full bg-[#eef2ed] px-2.5 py-1 text-[10px] font-bold">{order.deliveryStatus}</span></td><td className="py-4 text-xs">{order.paymentMethod}<br /><span className="text-muted">{order.paymentStatus}</span></td><td className="py-4 text-right font-semibold">{money(order.totalAmount)}</td></tr>)}</tbody></table>{orders.length === 0 && <EmptyState>No customer orders have been placed yet.</EmptyState>}</div>
      <Pagination pagination={orderPagination} onChange={setOrderPage} />
    </section>}
  </div>;
}
