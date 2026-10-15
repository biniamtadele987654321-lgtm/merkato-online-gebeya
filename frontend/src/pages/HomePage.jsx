import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Handshake, Leaf, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import { ErrorMessage } from '../components/PageState';
import { useLanguage } from '../context/LanguageContext';

const categories = [
  { name: 'Handmade', key: 'handmade', icon: '✳', image: 'photo-1452860606245-08befc0ff44b' },
  { name: 'Fashion', key: 'fashion', icon: '↗', image: 'photo-1490481651871-ab68de25d43d' },
  { name: 'Home & Living', key: 'homeLiving', icon: '⌂', image: 'photo-1600210492486-724fe5c67fb0' },
  { name: 'Beauty', key: 'beauty', icon: '✿', image: 'photo-1596462502278-27bfdc403348' },
  { name: 'Traditional Clothing', key: 'traditionalClothing', icon: '◇', image: 'photo-1610030469983-98e550d6193c' },
  { name: 'Coffee & Ceremony Essentials', key: 'coffeeCeremony', icon: '☕', image: 'photo-1442512595331-e89e73853f31' },
  { name: 'Handcrafted Leather', key: 'leather', icon: '◈', image: 'photo-1543163521-1bf539c55dd2' },
  { name: 'Spices & Berbere', key: 'spices', icon: '✺', image: 'photo-1596040033229-a9821ebd058d' },
  { name: 'Electronics', key: 'electronics', icon: '⌁', image: 'photo-1498049794561-7780e7231661' },
  { name: 'Jewelry', key: 'jewelry', icon: '✧', image: 'photo-1535632066927-ab7c9ab60908' },
  { name: 'Books', key: 'books', icon: '▤', image: 'photo-1544947950-fa07a98d237f' },
  { name: 'Groceries', key: 'groceries', icon: '◉', image: 'photo-1509440159596-0249088772ff' },
  { name: 'Food & Drink', key: 'foodDrink', icon: '◌', image: 'photo-1559525839-b184a4d698c7' },
  { name: 'Art', key: 'art', icon: '✷', image: 'photo-1579783902614-a3fb3927b6a5' },
  { name: 'Wholesale', key: 'wholesale', icon: '▦', image: 'photo-1447933601403-0c6688de566e' },
  { name: 'Traditional Musical Instruments', key: 'musicalInstruments', icon: '♫', image: 'photo-1516280440614-37939bbacd81' },
  { name: 'Ethiopian Artifacts & Souvenirs', key: 'artifacts', icon: '✥', image: 'photo-1579783902614-a3fb3927b6a5' },
  { name: 'Footwear & Shoes', key: 'footwear', icon: '◈', image: 'photo-1543163521-1bf539c55dd2' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    api('/products?limit=10&featured=true')
      .then((result) => {
        setProducts(result.products);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <>
      <section className="mx-auto w-full max-w-[1800px] px-4 pb-8 pt-5 sm:px-6 md:px-8 md:pt-10 xl:px-10">
        <div className="relative isolate min-h-[540px] overflow-hidden rounded-[30px] bg-[#17372a] md:min-h-[590px]">
          <img className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_42%] md:object-[center_48%]" src="/assets/ethiopian-woven-baskets-market.png" alt={t('home.heroImageAlt')} fetchpriority="high" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102a20]/95 via-[#17372a]/78 to-[#17372a]/25" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#102a20]/25 via-transparent to-[#102a20]/10" />
          <div className="absolute right-[8%] top-[13%] hidden rotate-3 rounded-[26px] border border-white/30 bg-white/15 p-3 shadow-2xl backdrop-blur-md lg:block">
            <div className="flex items-center gap-3 rounded-[19px] bg-white p-3 pr-6 text-ink">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-xl">✦</span>
              <span><span className="block text-xs font-bold">{t('home.localDelivered')}</span><span className="mt-1 block text-[11px] text-muted">{t('home.allEthiopia')}</span></span>
            </div>
          </div>
          <div className="flex min-h-[540px] max-w-2xl flex-col justify-center px-7 py-16 text-white md:min-h-[590px] md:px-14">
            <span className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] backdrop-blur"><span className="h-2 w-2 rounded-full bg-lime" /> {t('heroEyebrow')}</span>
            <h1 className="max-w-2xl font-display text-5xl font-extrabold leading-[1.08] tracking-[-.045em] md:text-7xl">{t('heroTitle')}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/85 md:text-xl">{t('heroCopy')}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-3 rounded-full bg-lime px-7 py-4 text-base font-bold text-ink shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white">{t('explore')} <ArrowRight size={18} /></Link>
              <a href="#sell" className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-7 py-4 text-base font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">{t('maker')} <ArrowUpRight size={17} /></a>
            </div>
            <div className="mt-12 flex items-center gap-4 text-sm text-white/85"><div className="flex -space-x-2">{['photo-1534528741775-53994a69daeb', 'photo-1500648767791-00dcc994a43e', 'photo-1531123897727-8f129e1688ce'].map((photo) => <img key={photo} className="h-9 w-9 rounded-full border-2 border-forest object-cover" src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=100&q=60`} alt="" />)}</div><span>{t('makerLove')}</span></div>
          </div>
          <span className="absolute bottom-7 right-8 hidden items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-white/80 md:flex">{t('scrollExplore')} <ArrowDownRight size={16} /></span>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1800px] px-4 py-10 sm:px-6 md:px-8 md:py-14 xl:px-10">
        <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-forest">{t('categoryIntro')}</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('categoryHeading')}</h2></div><Link to="/shop" className="hidden items-center gap-2 text-base font-semibold hover:text-forest sm:flex">{t('allCategories')} <ArrowUpRight size={17} /></Link></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-5 lg:grid-cols-6">
          {categories.map((category, index) => <Link key={category.name} to={`/shop?category=${encodeURIComponent(category.name)}`} className="group relative aspect-[1/1.03] overflow-hidden rounded-2xl">
            <img src={`https://images.unsplash.com/${category.image}?auto=format&fit=crop&w=700&q=80`} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white md:bottom-6 md:left-6"><div><span className="text-sm opacity-80">{category.icon} {String(index + 1).padStart(2, '0')}</span><h3 className="mt-1 font-display text-lg font-bold leading-snug md:text-xl">{t(category.key)}</h3></div><span className="grid h-9 w-9 place-items-center rounded-full border border-white/60 transition group-hover:bg-lime group-hover:text-ink"><MoveUpRight size={16} /></span></div>
          </Link>)}
        </div>
      </section>

      <section className="bg-[#ecefe8] py-14 md:py-18">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 xl:px-10">
          <div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-forest">{t('featuredIntro')}</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">{t('featuredHeading')}</h2></div><Link to="/shop" className="flex shrink-0 items-center gap-2 text-base font-semibold hover:text-forest">{t('discover')} <ArrowRight size={17} /></Link></div>
          <ErrorMessage message={error} />
          {products.length ? <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : !error && <div className="rounded-2xl bg-white p-8 text-center text-base text-muted">{t('noProducts')} <Link to="/shop" className="font-semibold text-forest">{t('browseMarket')}</Link>.</div>}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1800px] gap-8 px-4 py-14 sm:px-6 md:grid-cols-3 md:px-8 md:py-18 xl:px-10">
        {[
          { icon: <Handshake size={23} />, title: t('peopleFirst'), copy: t('peopleCopy') },
          { icon: <Leaf size={23} />, title: t('localFirst'), copy: t('localCopy') },
          { icon: <BadgeCheck size={23} />, title: t('thoughtful'), copy: t('thoughtfulCopy') },
        ].map((value) => <div key={value.title} className="border-l border-forest/20 pl-5"><span className="text-forest">{value.icon}</span><h3 className="mt-4 font-display text-lg font-bold">{value.title}</h3><p className="mt-2 max-w-xs text-sm leading-6 text-muted">{value.copy}</p></div>)}
      </section>
    </>
  );
}
