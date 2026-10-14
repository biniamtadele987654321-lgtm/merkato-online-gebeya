const hanaStore = {
  _id: 'demo-store-hana',
  name: 'Hana Handmade',
  isVerified: true,
};

const coffeeStore = {
  _id: 'demo-store-coffee',
  name: 'Coffee & Clay',
  isVerified: true,
};

const featuredDemoProductIds = new Set([
  'demo-product-masinko',
  'demo-product-krar',
  'demo-product-berbere-trio',
  'demo-product-leather-jacket',
  'demo-product-heritage-souvenir',
  'demo-product-leather-shoes',
]);

export const demoProducts = [
  {
    _id: 'demo-product-market-tote',
    title: 'Handwoven Cotton Market Tote',
    description: 'A sturdy, everyday market bag woven by local artisans from soft Ethiopian cotton. Each piece has its own natural variations.',
    price: 1250,
    currency: 'ETB',
    category: 'Handmade',
    stock: 24,
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [{ minQuantity: 5, unitPrice: 1100 }],
  },
  {
    _id: 'demo-product-table-runner',
    title: 'Traditional Woven Table Runner',
    description: 'A colourful handwoven accent for a dining table or coffee ceremony. Crafted in small batches with traditional patterns.',
    price: 1850,
    currency: 'ETB',
    category: 'Home & Living',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-cotton-scarf',
    title: 'Natural Cotton Scarf',
    description: 'A lightweight, breathable scarf woven from Ethiopian cotton. An easy layer for cool mornings and evenings.',
    price: 980,
    currency: 'ETB',
    category: 'Fashion',
    stock: 32,
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-yirgacheffe-coffee',
    title: 'Yirgacheffe Coffee Beans · 500g',
    description: 'A small-batch, washed Yirgacheffe coffee with a floral aroma and bright citrus notes. Roasted locally and packed fresh.',
    price: 1450,
    currency: 'ETB',
    category: 'Food & Drink',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [{ minQuantity: 10, unitPrice: 1300 }],
  },
  {
    _id: 'demo-product-ceramic-cup',
    title: 'Handmade Ceramic Coffee Cup',
    description: 'A one-of-a-kind stoneware cup shaped and glazed by hand in a local ceramics studio. Made for your daily coffee or buna.',
    price: 720,
    currency: 'ETB',
    category: 'Home & Living',
    stock: 18,
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-ceremony-set',
    title: 'Ethiopian Coffee Ceremony Set',
    description: 'A curated coffee moment with freshly roasted beans and handmade cups. A thoughtful gift for coffee lovers.',
    price: 2300,
    currency: 'ETB',
    category: 'Handmade',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-traditional-dress',
    title: 'Handwoven Habesha Kemis',
    description: 'A graceful white cotton dress with a handwoven Tibeb border, made in Addis Ababa for celebrations and special gatherings.',
    price: 6800,
    currency: 'ETB',
    category: 'Traditional Clothing',
    stock: 8,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-buna-kit',
    title: 'Buna Ceremony Essentials Box',
    description: 'A warm welcome in a box: freshly roasted Ethiopian coffee, a small woven serving mat and a handmade incense holder.',
    price: 3200,
    currency: 'ETB',
    category: 'Coffee & Ceremony Essentials',
    stock: 14,
    images: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [{ minQuantity: 5, unitPrice: 2950 }],
  },
  {
    _id: 'demo-product-leather-sandals',
    title: 'Artisan Leather Sandals',
    description: 'Comfortable everyday sandals cut and stitched by a local leather workshop using supple, responsibly sourced leather.',
    price: 2450,
    currency: 'ETB',
    category: 'Handcrafted Leather',
    stock: 16,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-berbere',
    title: 'Homestyle Berbere Spice Blend',
    description: 'A fragrant small-batch blend of Ethiopian chilli, warm spices and herbs. Packed fresh for your favourite stews and sauces.',
    price: 420,
    currency: 'ETB',
    category: 'Spices & Berbere',
    stock: 55,
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [{ minQuantity: 10, unitPrice: 360 }],
  },
  {
    _id: 'demo-product-earbuds',
    title: 'Everyday Wireless Earbuds',
    description: 'Compact wireless earbuds with a pocket charging case for calls, music and the daily commute.',
    price: 2850,
    currency: 'ETB',
    category: 'Electronics',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-silver-earrings',
    title: 'Handcrafted Silver Drop Earrings',
    description: 'Lightweight silver-tone earrings inspired by Ethiopian filigree and shaped by hand in a small Addis Ababa studio.',
    price: 1750,
    currency: 'ETB',
    category: 'Jewelry',
    stock: 11,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-ethiopian-storybook',
    title: 'Stories from the Highlands',
    description: 'A beautifully illustrated collection of Ethiopian folktales for curious readers and family story time.',
    price: 890,
    currency: 'ETB',
    category: 'Books',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-teff',
    title: 'Organic Brown Teff · 2kg',
    description: 'Carefully cleaned Ethiopian brown teff, sourced from local growers and ready for injera, porridge and everyday cooking.',
    price: 1150,
    currency: 'ETB',
    category: 'Groceries',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [{ minQuantity: 8, unitPrice: 1030 }],
  },
  {
    _id: 'demo-product-wholesale-coffee',
    title: 'Yirgacheffe Café Supply · 5kg',
    description: 'A wholesale-sized bag of freshly roasted Yirgacheffe beans for cafés, offices and hospitality teams.',
    price: 12800,
    currency: 'ETB',
    category: 'Wholesale',
    stock: 9,
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [{ minQuantity: 3, unitPrice: 11900 }],
  },
  {
    _id: 'demo-product-honey-soap',
    title: 'Honey & Shea Botanical Soap',
    description: 'A gentle, small-batch botanical soap bar made with honey, shea butter and a soft, naturally inspired fragrance.',
    price: 360,
    currency: 'ETB',
    category: 'Beauty',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1600428853876-fb5a850b444f?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-masinko',
    title: 'Handmade Masinko · One-String Fiddle',
    description: 'A locally made masinko with a carved wooden body and traditional bow, carefully finished by an Ethiopian instrument maker.',
    price: 7400,
    currency: 'ETB',
    category: 'Traditional Musical Instruments',
    stock: 5,
    images: ['https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-krar',
    title: 'Ethiopian Krar Lyre',
    description: 'A hand-assembled six-string krar with a warm, resonant sound, made for traditional melodies and contemporary performances.',
    price: 5900,
    currency: 'ETB',
    category: 'Traditional Musical Instruments',
    stock: 7,
    images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-berbere-trio',
    title: 'Three-Region Berbere Spice Collection',
    description: 'Three small-batch berbere blends with distinct regional character, freshly packed for stews, lentils and roasted vegetables.',
    price: 980,
    currency: 'ETB',
    category: 'Spices & Berbere',
    stock: 28,
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80'],
    vendor: coffeeStore,
    wholesalePricingTiers: [{ minQuantity: 6, unitPrice: 850 }],
  },
  {
    _id: 'demo-product-leather-jacket',
    title: 'Handstitched Ethiopian Leather Jacket',
    description: 'A timeless, made-to-order leather jacket cut and stitched by an Addis Ababa workshop using locally crafted leather.',
    price: 14500,
    currency: 'ETB',
    category: 'Handcrafted Leather',
    stock: 4,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-heritage-souvenir',
    title: 'Hand-carved Ethiopian Coffee Keepsake',
    description: 'A small hand-carved wooden keepsake inspired by Ethiopian coffee ceremony forms, made by a local artisan.',
    price: 1350,
    currency: 'ETB',
    category: 'Ethiopian Artifacts & Souvenirs',
    stock: 13,
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
  {
    _id: 'demo-product-leather-shoes',
    title: 'Addis Handcrafted Leather Shoes',
    description: 'Durable, everyday leather shoes shaped and stitched in Addis Ababa, with a cushioned insole and sturdy sole.',
    price: 3950,
    currency: 'ETB',
    category: 'Footwear & Shoes',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80'],
    vendor: hanaStore,
    wholesalePricingTiers: [],
  },
];

export function getDemoCatalog(path) {
  const [pathname, queryString = ''] = path.split('?');
  const query = new URLSearchParams(queryString);
  const productPath = pathname.match(/^\/products\/([^/]+)$/);

  if (productPath) {
    const product = demoProducts.find((item) => item._id === productPath[1]);
    if (!product) return null;
    return { product, demo: true };
  }

  if (pathname !== '/products') return null;

  const search = (query.get('search') || '').toLowerCase();
  const category = query.get('category');
  const minPrice = query.has('minPrice') ? Number(query.get('minPrice')) : undefined;
  const maxPrice = query.has('maxPrice') ? Number(query.get('maxPrice')) : undefined;
  const matchingProducts = demoProducts.filter((product) => {
    const matchesSearch = !search ||
      `${product.title} ${product.description} ${product.category} ${product.vendor.name}`.toLowerCase().includes(search);
    return matchesSearch &&
      (!category || product.category === category) &&
      (minPrice === undefined || product.price >= minPrice) &&
      (maxPrice === undefined || product.price <= maxPrice);
  });
  const orderedProducts = query.get('featured') === 'true'
    ? [
      ...matchingProducts.filter((product) => featuredDemoProductIds.has(product._id)),
      ...matchingProducts.filter((product) => !featuredDemoProductIds.has(product._id)),
    ]
    : matchingProducts;

  const page = Math.max(1, Number.parseInt(query.get('page'), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.get('limit'), 10) || 24));
  return {
    products: orderedProducts.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total: matchingProducts.length,
      pages: Math.ceil(matchingProducts.length / limit),
    },
    demo: true,
  };
}
