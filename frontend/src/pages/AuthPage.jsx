import { ArrowRight, Eye, EyeOff, Leaf, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorMessage } from '../components/PageState';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthPage({ register = false }) {
  const { t } = useLanguage();
  const { login, register: createAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'vendor' ? 'vendor' : 'customer');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const signedInUser = register
        ? await createAccount({ ...form, role })
        : await login({ email: form.email, password: form.password });
      if (signedInUser.demoMode) {
        navigate(signedInUser.role === 'admin' ? '/admin' : signedInUser.role === 'vendor' ? '/vendor' : '/shop', { replace: true });
        return;
      }
      const destination = location.state?.from?.pathname;
      navigate(destination || (
        signedInUser.role === 'admin' ? '/admin' : signedInUser.role === 'vendor' ? '/vendor' : '/'
      ), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-2 md:items-center md:px-8 md:py-16">
    <div className="relative hidden min-h-[590px] overflow-hidden rounded-[28px] bg-forest p-10 text-white md:flex md:flex-col md:justify-between">
      <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest/40 via-forest/40 to-forest/95" />
      <Link to="/" className="relative z-10 font-display text-xl font-extrabold">Merkato Online Gebeya<span className="text-lime">.</span></Link>
      <div className="relative z-10"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-forest"><Leaf size={21} /></span><h2 className="mt-5 max-w-md font-display text-4xl font-extrabold leading-tight">{t('auth.promoTitle')}</h2><p className="mt-4 max-w-sm text-sm leading-6 text-white/75">{t('auth.promoCopy')}</p></div>
      <p className="relative z-10 text-xs text-white/55">{t('auth.promoFooter')}</p>
    </div>
    <div className="mx-auto w-full max-w-md">
      <Link to="/" className="font-display text-lg font-extrabold md:hidden">Merkato Online Gebeya<span className="text-forest">.</span></Link>
      <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-forest">{register ? t('auth.taglineRegister') : t('auth.taglineLogin')}</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">{register ? t('auth.joinTitle') : t('auth.loginTitle')}</h1>
      <p className="mt-3 text-sm text-muted">{register ? t('auth.registerDescription') : t('auth.loginDescription')}</p>
      <ErrorMessage message={error} />
      {register && <div className="mt-6 grid grid-cols-2 rounded-xl bg-[#e9ece5] p-1">{['customer', 'vendor'].map((value) => <button key={value} onClick={() => setRole(value)} type="button" className={`rounded-lg py-2.5 text-xs font-semibold capitalize transition ${role === value ? 'bg-white text-ink shadow-sm' : 'text-muted'}`}>{value === 'vendor' ? t('auth.sellThings') : t('auth.shopThings')}</button>)}</div>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        {register && <label className="block text-xs font-semibold">{t('auth.name')}<input required minLength="2" maxLength="120" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-forest" placeholder={t('auth.namePlaceholder')} /></label>}
        <label className="block text-xs font-semibold">{t('auth.email')}<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-forest" placeholder={t('auth.emailPlaceholder')} /></label>
        {register && <label className="block text-xs font-semibold">{t('auth.phone')}<input required minLength="7" maxLength="20" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-sm outline-none focus:border-forest" placeholder={t('auth.phonePlaceholder')} /></label>}
        <label className="block text-xs font-semibold">{t('auth.password')}<span className="relative mt-2 block"><input required minLength={register ? 8 : undefined} type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 pr-12 text-sm outline-none focus:border-forest" placeholder={register ? t('auth.passwordHint') : t('auth.passwordPlaceholder')} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
        <p className="flex items-center gap-2 text-[11px] leading-5 text-muted"><LockKeyhole size={13} /> {t('auth.privacy')}</p>
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-4 text-sm font-bold text-white transition hover:bg-ink">{busy ? t('auth.working') : register ? t('auth.createAccount') : t('buttons.signIn')} {!busy && <ArrowRight size={16} />}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">{register ? t('auth.alreadyMember') : t('auth.newHere')} <Link to={register ? '/login' : '/register'} className="font-bold text-forest">{register ? t('buttons.signIn') : t('auth.createAccountLink')}</Link></p>
    </div>
  </div>;
}
