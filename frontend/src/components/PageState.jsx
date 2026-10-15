import { useLanguage } from '../context/LanguageContext';

export function LoadingState({ label }) {
  const { t } = useLanguage();
  return <div className="grid min-h-[35vh] place-items-center text-sm text-muted">{label || t('loading')}</div>;
}

export function ErrorMessage({ message }) {
  return message ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</div> : null;
}
