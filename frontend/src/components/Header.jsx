import { ArrowUpRight, Languages, LogOut, Menu, Search, ShoppingBag, Store, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { languages, useLanguage } from '../context/LanguageContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#d6b15e]/30 bg-[#12372b] text-white shadow-lg shadow-black/10">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1800px] items-center gap-2 px-4 py-2 sm:gap-5 sm:px-6 xl:px-10">
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl p-2 text-white/85 transition-colors hover:bg-white/10 hover:text-[#f2ce78] lg:hidden" aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="primary-navigation">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" className="flex shrink-0 items-center gap-2 transition-transform hover:-translate-y-0.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e3bd68] font-display text-lg font-extrabold text-[#12372b] shadow-inner shadow-white/20 sm:h-10 sm:w-10 sm:text-xl">M</span>
          <span className="flex flex-col font-display font-extrabold leading-tight tracking-tight"><span className="text-[15px] sm:text-[19px]">Merkato<span className="text-[#e3bd68]">.</span></span><span className="hidden text-[8px] font-bold uppercase tracking-[.17em] text-white/65 min-[380px]:block sm:text-[9px]">Online Gebeya</span></span>
        </Link>

        <form onSubmit={submitSearch} className="mx-auto hidden w-full max-w-lg items-center rounded-full border border-white/20 bg-white/[.07] px-4 py-2.5 transition-colors focus-within:border-[#e3bd68]/80 focus-within:bg-white/10 lg:flex">
          <Search size={17} className="shrink-0 text-[#e3bd68]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchPlaceholder')} className="ml-3 w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/50" />
          <button className="text-sm font-bold text-[#f2ce78] transition-colors hover:text-white">{t('search')}</button>
        </form>

        <nav id="primary-navigation" className={`${menuOpen ? 'absolute left-0 right-0 top-full flex border-b border-[#d6b15e]/25 bg-[#12372b] px-5 py-5 shadow-xl shadow-black/20' : 'hidden'} flex-col gap-4 text-[15px] font-semibold text-white/85 lg:static lg:flex lg:flex-row lg:items-center lg:gap-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)} className={({ isActive }) => `whitespace-nowrap transition-colors hover:text-[#f2ce78] ${isActive ? 'text-[#f2ce78]' : ''}`}>{t('shop')}</NavLink>
          <a href="/#sell" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 whitespace-nowrap transition-colors hover:text-[#f2ce78]">{t('sell')} <ArrowUpRight size={14} /></a>
          {user?.role === 'vendor' && <Link to="/vendor" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 whitespace-nowrap transition-colors hover:text-[#f2ce78]"><Store size={15} /> {t('dashboard')}</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="whitespace-nowrap transition-colors hover:text-[#f2ce78]">{t('admin')}</Link>}
          {user ? (
            <>
              {user.role === 'customer' && <Link to="/orders" onClick={() => setMenuOpen(false)} className="whitespace-nowrap transition-colors hover:text-[#f2ce78]">{t('orders')}</Link>}
              <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-2 whitespace-nowrap text-left text-white/65 transition-colors hover:text-[#f2ce78]"><LogOut size={15} />{t('signOut')}</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 whitespace-nowrap font-bold text-[#f2ce78] transition-colors hover:text-white"><UserRound size={16} />{t('signIn')}</Link>
          )}
        </nav>
        <label className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/[.07] px-2 py-2 text-xs font-semibold transition-colors hover:border-[#e3bd68]/70 sm:ml-0 sm:gap-2 sm:px-3">
          <Languages size={15} className="text-[#e3bd68]" />
          <span className="sr-only">Language</span>
          <select aria-label="Select language" value={language} onChange={(event) => setLanguage(event.target.value)} className="max-w-[56px] cursor-pointer appearance-none bg-transparent text-xs text-white outline-none sm:max-w-[105px]">
            {languages.map((item) => <option key={item.code} value={item.code} className="text-ink">{item.native}</option>)}
          </select>
        </label>
        <Link to="/cart" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-all hover:-translate-y-0.5 hover:bg-[#e3bd68] hover:text-[#12372b]" aria-label={`${t('cart')} (${count})`}>
          <ShoppingBag size={19} strokeWidth={1.9} />
          {count > 0 && <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#e3bd68] px-1 text-[10px] font-extrabold text-[#12372b]">{count}</span>}
        </Link>
      </div>
      <form onSubmit={submitSearch} className="flex items-center gap-3 border-t border-white/10 px-5 py-3 text-white/80 lg:hidden"><Search size={16} className="shrink-0 text-[#e3bd68]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchPlaceholder')} className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/50" /><button className="text-sm font-bold text-[#f2ce78] transition-colors hover:text-white">{t('search')}</button></form>
    </header>
  );
}
