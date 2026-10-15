import { ShieldX } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function AccessDeniedPage() {
  const location = useLocation();
  const { t } = useLanguage();
  const requiredRole = location.state?.requiredRole;

  return <div className="mx-auto grid min-h-[55vh] max-w-xl place-items-center px-5 py-16 text-center">
    <div>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0ed] text-[#b42318]"><ShieldX size={25} /></span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#b42318]">{t('access.restricted')}</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">{t('access.adminOnly')}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{requiredRole === 'admin' ? t('access.adminRequired') : t('access.permissionRequired')}</p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to="/" className="rounded-full bg-forest px-5 py-3 text-sm font-bold text-white">{t('access.backToMarketplace')}</Link>
        <Link to="/login" className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold">{t('buttons.signIn')}</Link>
      </div>
    </div>
  </div>;
}
