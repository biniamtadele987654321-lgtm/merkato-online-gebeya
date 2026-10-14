import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import { ErrorMessage } from '../components/PageState';
import { useLanguage } from '../context/LanguageContext';

const categoryList = [
  ['All', 'market'],
  ['Handmade', 'handmade'],
  ['Traditional Clothing', 'traditionalClothing'],
  ['Coffee & Ceremony Essentials', 'coffeeCeremony'],
  ['Handcrafted Leather', 'leather'],
  ['Spices & Berbere', 'spices'],
  ['Electronics', 'electronics'],
  ['Home & Living', 'homeLiving'],
  ['Beauty', 'beauty'],
  ['Fashion', 'fashion'],
  ['Jewelry', 'jewelry'],
  ['Books', 'books'],
  ['Groceries', 'groceries'],
  ['Food & Drink', 'foodDrink'],
  ['Art', 'art'],
  ['Wholesale', 'wholesale'],
  ['Traditional Musical Instruments', 'musicalInstruments'],
  ['Ethiopian Artifacts & Souvenirs', 'artifacts'],
  ['Footwear & Shoes', 'footwear'],
];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    setError('');
    api(`/products?limit=24&${params.toString()}`)
      .then((result) => {
        setProducts(result.products);
        setPagination(result.pagination);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [params]);

  function setCategory(value) {
    const next = new URLSearchParams(params);
    if (value) next.set('category', value);
    else next.delete('category');
    next.delete('page');
    setParams(next);
  }

  function applyPrice(event) {
    event.preventDefault();
    const next = new URLSearchParams(params);
    minPrice ? next.set('minPrice', minPrice) : next.delete('minPrice');
    maxPrice ? next.set('maxPrice', maxPrice) : next.delete('maxPrice');
    next.delete('page');
    setParams(next);
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 md:px-8 md:py-12 xl:px-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-forest">{t('categoryIntro')}</p><h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">{search ? `Results for “${search}”` : category ? t(categoryList.find(([name]) => name === category)?.[1] || category) : t('market')}</h1><p className="mt-3 text-base text-muted">{pagination?.total ?? 0} {t('thingsCount')}</p></div><form onSubmit={applyPrice} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-2"><SlidersHorizontal size={17} className="ml-1 text-muted" /><input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder={t('minPrice')} className="w-24 bg-transparent text-sm outline-none" /><span className="text-muted">—</span><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder={t('maxPrice')} className="w-24 bg-transparent text-sm outline-none" /><button className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white">{t('filter')}</button></form></div>
    <div className="mt-8 flex gap-2 overflow-x-auto pb-2">{categoryList.map(([value, key]) => <button key={value} onClick={() => setCategory(value === 'All' ? '' : value)} className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${((value === 'All' && !category) || category === value) ? 'bg-forest text-white' : 'bg-white text-muted hover:text-ink'}`}>{t(key)}</button>)}</div>
      {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
      {loading ? <div className="grid min-h-64 place-items-center text-base text-muted">{t('loadingProducts')}</div> : products.length ? <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : !error && <div className="mt-8 rounded-2xl bg-white p-12 text-center"><p className="font-display text-2xl font-bold">{t('emptyCategory')}</p><p className="mt-2 text-base text-muted">{t('emptyCategoryCopy')}</p><button onClick={() => { setMinPrice(''); setMaxPrice(''); setParams(new URLSearchParams()); }} className="mt-5 text-base font-semibold text-forest underline">{t('clearFilters')}</button></div>}
      {pagination?.pages > 1 && <div className="mt-10 flex justify-center gap-3"><button disabled={pagination.page <= 1} onClick={() => { const next = new URLSearchParams(params); next.set('page', pagination.page - 1); setParams(next); }} className="rounded-full border border-black/10 px-5 py-2 text-sm">Previous</button><span className="py-2 text-sm text-muted">Page {pagination.page} of {pagination.pages}</span><button disabled={pagination.page >= pagination.pages} onClick={() => { const next = new URLSearchParams(params); next.set('page', pagination.page + 1); setParams(next); }} className="rounded-full border border-black/10 px-5 py-2 text-sm">Next</button></div>}
      </div>
  );
}
