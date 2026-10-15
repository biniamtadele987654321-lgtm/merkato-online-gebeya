import {
  BadgeCheck,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api, jsonBody, money } from '../api';
import { ErrorMessage } from '../components/PageState';
import { categoryTranslationKey, useLanguage } from '../context/LanguageContext';

const PAGE_SIZE = 25;
const SEARCH_DELAY = 250;
const sections = [
  { id: 'overview', label: 'adminOverview', icon: LayoutDashboard },
  { id: 'vendors', label: 'adminVendors', icon: Store },
  { id: 'users', label: 'adminUsers', icon: Users },
  { id: 'products', label: 'adminProducts', icon: Package },
  { id: 'orders', label: 'adminOrders', icon: ShoppingBag },
];

function Pagination({ pagination, onChange, t }) {
  if (!pagination || pagination.pages < 2) return null;
  return <div className="flex items-center justify-between border-t border-black/5 px-1 pt-4 text-xs text-muted">
    <span>{pagination.total} {t('admin.records')} · {t('pageOf').replace('{page}', pagination.page).replace('{pages}', pagination.pages)}</span>
    <div className="flex gap-2">
      <button type="button" disabled={pagination.page <= 1} onClick={() => onChange(pagination.page - 1)} className="rounded-lg border border-black/10 px-3 py-2 font-semibold disabled:opacity-40">{t('previous')}</button>
      <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => onChange(pagination.page + 1)} className="rounded-lg border border-black/10 px-3 py-2 font-semibold disabled:opacity-40">{t('next')}</button>
    </div>
  </div>;
}

function useDebouncedValue(value) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), SEARCH_DELAY);
    return () => clearTimeout(timeout);
  }, [value]);
  return debouncedValue;
}

function SearchField({ value, onChange, placeholder, label }) {
  return <label className="mt-5 flex max-w-xl items-center gap-3 rounded-xl border border-black/10 bg-paper px-4 py-3 text-muted">
    <Search size={17} aria-hidden="true" />
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={label}
      className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
    />
  </label>;
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
  const { t, language } = useLanguage();
  const dateLocale = language === 'am' ? 'am-ET' : 'en-ET';
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState(null);
  const [stores, setStores] = useState([]);
  const [storePagination, setStorePagination] = useState(null);
  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderPagination, setOrderPagination] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const debouncedUserSearch = useDebouncedValue(userSearch);
  const debouncedStoreSearch = useDebouncedValue(storeSearch);
  const debouncedProductSearch = useDebouncedValue(productSearch);
  const debouncedOrderSearch = useDebouncedValue(orderSearch);
  const [section, setSection] = useState('overview');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  const refresh = useCallback(async () => {
    const buildListPath = (resource, page, search) => {
      const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) query.set('search', search);
      return `/admin/${resource}?${query}`;
    };
    const [summary, userList, storeList, productList, orderList] = await Promise.all([
      api('/admin/dashboard'),
      api(buildListPath('users', userPage, debouncedUserSearch)),
      api(buildListPath('vendors', storePage, debouncedStoreSearch)),
      api(buildListPath('products', productPage, debouncedProductSearch)),
      api(buildListPath('orders', orderPage, debouncedOrderSearch)),
    ]);
    setDashboard({ ...summary.stats, recentOrders: summary.recentOrders, pendingStores: summary.pendingStores });
    setUsers(userList.users);
    setUserPagination(userList.pagination);
    setStores(storeList.stores);
    setStorePagination(storeList.pagination);
    setProducts(productList.products);
    setProductPagination(productList.pagination);
    setOrders(orderList.orders);
    setOrderPagination(orderList.pagination);
    setError('');
  }, [userPage, storePage, productPage, orderPage, debouncedUserSearch, debouncedStoreSearch, debouncedProductSearch, debouncedOrderSearch]);

  useEffect(() => {
    refresh().catch((requestError) => setError(requestError.message));
  }, [refresh]);

  async function runAction(id, successMessage, action) {
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
      t(isVerified ? 'admin.storeApproved' : 'admin.storeSuspended').replace('{name}', store.name),
      () => api(`/admin/stores/${store._id}/verification`, { method: 'PATCH', body: jsonBody({ isVerified }) }),
    );
  }

  function changeRole(user, role) {
    return runAction(
      user._id,
      t('admin.roleChanged').replace('{name}', user.name).replace('{role}', t(role === 'vendor' ? 'admin.vendorRole' : 'admin.customerRole')),
      () => api(`/admin/users/${user._id}/role`, { method: 'PATCH', body: jsonBody({ role }) }),
    );
  }

  function deleteUser(user) {
    if (!window.confirm(t('admin.confirmDeleteUser').replace('{name}', user.name))) return;
    return runAction(user._id, t('admin.userDeleted').replace('{name}', user.name), () =>
      api(`/admin/users/${user._id}`, { method: 'DELETE' }));
  }

  function deleteProduct(product) {
    if (!window.confirm(t('admin.confirmDeleteProduct').replace('{title}', product.title))) return;
    return runAction(product._id, t('admin.productRemoved').replace('{title}', product.title), () =>
      api(`/admin/products/${product._id}`, { method: 'DELETE' }));
  }

  function restoreProduct(product) {
    return runAction(product._id, t('admin.productRestored').replace('{title}', product.title), () =>
      api(`/admin/products/${product._id}/visibility`, { method: 'PATCH', body: jsonBody({ isActive: true }) }));
  }

  if (!dashboard && !error) return <div className="grid min-h-[50vh] place-items-center text-sm text-muted">{t('admin.loading')}</div>;

  const cards = [
    { label: t('admin.totalUsers'), value: dashboard?.users ?? '—', icon: Users },
    { label: t('admin.totalVendors'), value: dashboard?.vendors ?? '—', icon: Store },
    { label: t('admin.totalProducts'), value: dashboard?.products ?? '—', icon: Package },
    { label: t('admin.totalOrders'), value: dashboard?.orders ?? '—', icon: ShoppingBag },
    { label: t('admin.platformRevenue'), value: money(dashboard?.paidRevenue), icon: CircleDollarSign, detail: t('admin.paidOrderCount').replace('{count}', dashboard?.paidOrders ?? 0) },
  ];

  return <div className="mx-auto w-full max-w-[1800px] px-5 py-8 md:px-8 md:py-12">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-forest">{t('admin.dashboardEyebrow')}</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">{t('admin.dashboardTitle')}<span className="text-forest">.</span></h1><p className="mt-2 text-sm text-muted">{t('admin.dashboardDescription')}</p></div>
      <span className="flex items-center gap-2 rounded-full bg-[#e7f3df] px-4 py-2 text-xs font-bold text-forest"><ShieldCheck size={15} /> {t('admin.secureWorkspace')}</span>
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

    <div className="mt-8 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2" role="tablist" aria-label={t('admin.sections')}>
      {sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={section === id} onClick={() => setSection(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${section === id ? 'bg-forest text-white' : 'text-muted hover:bg-paper hover:text-ink'}`}>
        <Icon size={16} />{t(label)}{id === 'vendors' && dashboard?.pendingVendors > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] ${section === id ? 'bg-white/20 text-white' : 'bg-[#fff2db] text-[#73541b]'}`}>{dashboard.pendingVendors}</span>}
      </button>)}
    </div>

    {section === 'overview' && <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
      <section className="rounded-2xl bg-white p-5 md:p-7">
        <SectionHeading title={t('admin.vendorApplications')} subtitle={t('admin.storesNeedReview').replace('{count}', dashboard?.pendingVendors ?? 0)} icon={BadgeCheck} />
        {dashboard?.pendingStores?.map((store) => <div key={store._id} className="flex items-center justify-between gap-3 border-b border-black/5 py-4 last:border-0">
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{store.name}</p><p className="truncate text-xs text-muted">{store.vendor?.name} · {store.vendor?.email}</p></div>
          <button type="button" disabled={busyId === store._id} onClick={() => verifyStore(store, true)} className="shrink-0 rounded-full bg-forest px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busyId === store._id ? t('admin.saving') : t('admin.approve')}</button>
        </div>)}
        {!dashboard?.pendingStores?.length && <EmptyState>{t('admin.noApplications')}</EmptyState>}
      </section>
      <section className="rounded-2xl bg-white p-5 md:p-7">
        <SectionHeading title={t('admin.recentOrders')} subtitle={t('admin.latestActivity')} icon={ShoppingBag} />
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[570px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">{t('admin.order')}</th><th className="pb-3 font-semibold">{t('admin.customer')}</th><th className="pb-3 font-semibold">{t('admin.status')}</th><th className="pb-3 text-right font-semibold">{t('admin.amount')}</th></tr></thead><tbody className="divide-y divide-black/5">{dashboard?.recentOrders?.map((order) => <tr key={order._id}><td className="py-3 font-semibold">#{order._id.slice(-8).toUpperCase()}</td><td className="py-3">{order.customer?.name || t('admin.unknown')}</td><td className="py-3 text-xs">{t(`status.${order.deliveryStatus}`)}</td><td className="py-3 text-right font-semibold">{money(order.totalAmount)}</td></tr>)}</tbody></table>{!dashboard?.recentOrders?.length && <EmptyState>{t('admin.noOrders')}</EmptyState>}</div>
        <button type="button" onClick={() => setSection('orders')} className="mt-3 text-xs font-bold text-forest">{t('admin.viewAllOrders')}</button>
      </section>
    </div>}

    {section === 'vendors' && <section className="mt-6 rounded-2xl bg-white p-5 md:p-7">
      <SectionHeading title={t('admin.vendorVerification')} subtitle={t('admin.vendorVerificationDescription')} icon={Store} />
      <SearchField value={storeSearch} onChange={(event) => { setStoreSearch(event.target.value); setStorePage(1); }} placeholder={t('admin.searchVendors')} label={t('admin.searchVendors')} />
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">{t('admin.store')}</th><th className="pb-3 font-semibold">{t('admin.owner')}</th><th className="pb-3 font-semibold">{t('admin.address')}</th><th className="pb-3 font-semibold">{t('admin.status')}</th><th className="pb-3 text-right font-semibold">{t('admin.action')}</th></tr></thead><tbody className="divide-y divide-black/5">{stores.map((store) => <tr key={store._id}><td className="py-4 font-semibold">{store.name}</td><td className="py-4"><p>{store.vendor?.name || t('admin.unknown')}</p><p className="text-xs text-muted">{store.vendor?.email}</p></td><td className="py-4 text-xs text-muted">{store.address}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${store.isVerified ? 'bg-[#e7f3df] text-forest' : 'bg-[#fff2db] text-[#73541b]'}`}>{store.isVerified ? t('admin.verified') : t('admin.notVerified')}</span></td><td className="py-4 text-right"><button type="button" disabled={busyId === store._id} onClick={() => verifyStore(store, !store.isVerified)} className={`rounded-full px-3 py-2 text-xs font-semibold disabled:opacity-50 ${store.isVerified ? 'border border-[#b42318]/20 text-[#b42318]' : 'bg-forest text-white'}`}>{busyId === store._id ? t('admin.saving') : store.isVerified ? t('admin.rejectSuspend') : t('admin.approveVerify')}</button></td></tr>)}</tbody></table>{stores.length === 0 && <EmptyState>{debouncedStoreSearch ? t('admin.noSearchResults') : t('admin.noStores')}</EmptyState>}</div>
      <Pagination pagination={storePagination} onChange={setStorePage} t={t} />
    </section>}

    {section === 'users' && <section className="mt-6 rounded-2xl bg-white p-5 md:p-7">
      <SectionHeading title={t('admin.userManagement')} subtitle={t('admin.userManagementDescription')} icon={Users} />
      <SearchField value={userSearch} onChange={(event) => { setUserSearch(event.target.value); setUserPage(1); }} placeholder={t('admin.searchUsers')} label={t('admin.searchUsers')} />
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">{t('admin.member')}</th><th className="pb-3 font-semibold">{t('admin.phone')}</th><th className="pb-3 font-semibold">{t('admin.joined')}</th><th className="pb-3 font-semibold">{t('admin.role')}</th><th className="pb-3 text-right font-semibold">{t('admin.account')}</th></tr></thead><tbody className="divide-y divide-black/5">{users.map((user) => <tr key={user._id}><td className="py-4"><p className="font-semibold">{user.name}</p><p className="text-xs text-muted">{user.email}</p></td><td className="py-4 text-xs text-muted">{user.phone || '—'}</td><td className="py-4 text-xs text-muted">{new Date(user.createdAt).toLocaleDateString(dateLocale)}</td><td className="py-4">{user.role === 'admin' ? <span className="text-xs font-semibold text-forest">{t('admin.adminRole')}</span> : <select aria-label={`${t('admin.role')} ${user.name}`} value={user.role} disabled={busyId === user._id} onChange={(event) => changeRole(user, event.target.value)} className="rounded-lg border border-black/10 bg-paper px-3 py-2 text-xs capitalize"><option value="customer">{t('admin.customerRole')}</option><option value="vendor">{t('admin.vendorRole')}</option></select>}</td><td className="py-4 text-right">{user.role === 'admin' ? <span className="text-xs text-muted">{t('admin.protected')}</span> : <button type="button" aria-label={`${t('admin.delete')} ${user.name}`} disabled={busyId === user._id} onClick={() => deleteUser(user)} className="inline-flex items-center gap-2 rounded-full border border-[#b42318]/20 px-3 py-2 text-xs font-semibold text-[#b42318] disabled:opacity-50"><Trash2 size={14} />{t('admin.delete')}</button>}</td></tr>)}</tbody></table>{users.length === 0 && <EmptyState>{debouncedUserSearch ? t('admin.noSearchResults') : t('admin.noUsers')}</EmptyState>}</div>
      <Pagination pagination={userPagination} onChange={setUserPage} t={t} />
    </section>}

    {section === 'products' && <section className="mt-6 rounded-2xl bg-white p-5 md:p-7">
      <SectionHeading title={t('admin.productModeration')} subtitle={t('admin.productModerationDescription')} icon={Package} />
      <SearchField value={productSearch} onChange={(event) => { setProductSearch(event.target.value); setProductPage(1); }} placeholder={t('admin.searchProducts')} label={t('admin.searchProducts')} />
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">{t('admin.product')}</th><th className="pb-3 font-semibold">{t('admin.vendorRole')}</th><th className="pb-3 font-semibold">{t('admin.category')}</th><th className="pb-3 font-semibold">{t('admin.stock')}</th><th className="pb-3 font-semibold">{t('admin.visibility')}</th><th className="pb-3 text-right font-semibold">{t('admin.priceAction')}</th></tr></thead><tbody className="divide-y divide-black/5">{products.map((product) => <tr key={product._id}><td className="py-4"><p className="max-w-xs truncate font-semibold">{product.title}</p><p className="text-xs text-muted">{new Date(product.createdAt).toLocaleDateString(dateLocale)}</p></td><td className="py-4 text-xs">{product.vendor?.name || t('admin.unknownVendor')}</td><td className="py-4 text-xs text-muted">{t(categoryTranslationKey(product.category))}</td><td className="py-4 text-xs">{product.stock}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${product.isActive === false ? 'bg-[#fff0ed] text-[#b42318]' : 'bg-[#e7f3df] text-forest'}`}>{product.isActive === false ? t('admin.removed') : t('admin.live')}</span></td><td className="py-4 text-right"><span className="mr-4 font-semibold">{money(product.price)}</span>{product.isActive === false ? <button type="button" disabled={busyId === product._id} onClick={() => restoreProduct(product)} className="rounded-full bg-forest px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{busyId === product._id ? t('admin.saving') : t('admin.restore')}</button> : <button type="button" aria-label={`${t('admin.remove')} ${product.title}`} disabled={busyId === product._id} onClick={() => deleteProduct(product)} className="inline-flex items-center gap-2 rounded-full border border-[#b42318]/20 px-3 py-2 text-xs font-semibold text-[#b42318] disabled:opacity-50"><Trash2 size={14} />{t('admin.remove')}</button>}</td></tr>)}</tbody></table>{products.length === 0 && <EmptyState>{debouncedProductSearch ? t('admin.noSearchResults') : t('admin.noProducts')}</EmptyState>}</div>
      <Pagination pagination={productPagination} onChange={setProductPage} t={t} />
    </section>}

    {section === 'orders' && <section className="mt-6 rounded-2xl bg-white p-5 md:p-7">
      <SectionHeading title={t('admin.platformOrders')} subtitle={t('admin.platformOrdersDescription')} icon={ShoppingBag} />
      <SearchField value={orderSearch} onChange={(event) => { setOrderSearch(event.target.value); setOrderPage(1); }} placeholder={t('admin.searchOrders')} label={t('admin.searchOrders')} />
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[930px] text-left text-sm"><thead className="border-b border-black/5 text-[10px] uppercase tracking-wider text-muted"><tr><th className="pb-3 font-semibold">{t('admin.orderDate')}</th><th className="pb-3 font-semibold">{t('admin.customer')}</th><th className="pb-3 font-semibold">{t('admin.items')}</th><th className="pb-3 font-semibold">{t('admin.delivery')}</th><th className="pb-3 font-semibold">{t('admin.payment')}</th><th className="pb-3 text-right font-semibold">{t('admin.totalEtb')}</th></tr></thead><tbody className="divide-y divide-black/5">{orders.map((order) => <tr key={order._id}><td className="py-4"><p className="font-semibold">#{order._id.slice(-8).toUpperCase()}</p><p className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</p></td><td className="py-4"><p>{order.customer?.name || t('admin.unknown')}</p><p className="text-xs text-muted">{order.customer?.email || ''}</p><p className="text-xs text-muted">{order.customer?.phone || ''}</p></td><td className="py-4 text-xs text-muted">{order.items?.map((item) => `${item.product?.title || t('admin.removedItem')} × ${item.quantity}`).join(', ') || '—'}</td><td className="py-4"><span className="rounded-full bg-[#eef2ed] px-2.5 py-1 text-[10px] font-bold">{t(`status.${order.deliveryStatus}`)}</span></td><td className="py-4 text-xs">{t(`status.${order.paymentMethod}`)}<br /><span className="text-muted">{t(`status.${order.paymentStatus}`)}</span></td><td className="py-4 text-right font-semibold">{money(order.totalAmount)}</td></tr>)}</tbody></table>{orders.length === 0 && <EmptyState>{debouncedOrderSearch ? t('admin.noSearchResults') : t('admin.noCustomerOrders')}</EmptyState>}</div>
      <Pagination pagination={orderPagination} onChange={setOrderPage} t={t} />
    </section>}
  </div>;
}
