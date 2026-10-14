import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import ProductPage from './pages/ProductPage';
import ShopPage from './pages/ShopPage';
import VendorPage from './pages/VendorPage';
import { useLanguage } from './context/LanguageContext';

function Shell() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="min-h-[65vh]"><Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route element={<ProtectedRoute roles={['customer']} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['vendor']} />}>
          <Route path="/vendor" element={<VendorPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} unauthorizedTo="/access-denied" />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes></main>
      <footer id="sell" className="mt-24 bg-ink text-white">
        <div className="mx-auto grid w-full max-w-[1800px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 md:px-8 xl:px-10">
          <div><Link to="/" className="font-display text-2xl font-extrabold">Merkato Online Gebeya<span className="text-lime">.</span></Link><p className="mt-3 max-w-sm text-base leading-7 text-white/70">{t('footerCopy')}</p></div>
          <div><p className="text-sm font-bold uppercase tracking-[.2em] text-lime">{t('explore')}</p><div className="mt-4 grid gap-3 text-base text-white/80"><Link to="/shop">{t('shopAll')}</Link><Link to="/orders">{t('orders')}</Link><a href="mailto:hello@merkato.et">{t('contact')}</a></div></div>
          <div><p className="text-sm font-bold uppercase tracking-[.2em] text-lime">{t('makers')}</p><div className="mt-4 grid gap-3 text-base text-white/80"><Link to="/register?role=vendor">{t('openStore')}</Link><p>{t('footerMakerCopy')}</p></div></div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-sm text-white/55">© {new Date().getFullYear()} Merkato Online Gebeya · {t('footerEnd')}</div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function App() {
  return <Shell />;
}
