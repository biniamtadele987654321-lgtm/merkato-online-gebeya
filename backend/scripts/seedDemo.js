require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Store = require('../src/models/Store');
const User = require('../src/models/User');
const connectDatabase = require('../src/config/database');

const demoUsers = [
  {
    name: 'Hana Mekonnen',
    email: 'hana.vendor@merkato.test',
    phone: '+251911000101',
    password: 'HanaDemo2026!',
    role: 'vendor',
  },
  {
    name: 'Dawit Tesfaye',
    email: 'dawit.vendor@merkato.test',
    phone: '+251911000102',
    password: 'DawitDemo2026!',
    role: 'vendor',
  },
  {
    name: 'Mimi Bekele',
    email: 'mimi.customer@merkato.test',
    phone: '+251911000103',
    password: 'MimiDemo2026!',
    role: 'customer',
  },
];

const demoStores = [
  {
    ownerEmail: 'hana.vendor@merkato.test',
    name: 'Hana Handmade',
    description: 'Thoughtful woven pieces and home accents, made by hand in Addis Ababa.',
    address: 'Bole, Addis Ababa, Ethiopia',
  },
  {
    ownerEmail: 'dawit.vendor@merkato.test',
    name: 'Coffee & Clay',
    description: 'Ethiopian coffee rituals and handmade ceramics from a small local studio.',
    address: 'Piazza, Addis Ababa, Ethiopia',
  },
];

const demoProducts = [
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Handwoven Cotton Market Tote',
    description: 'A sturdy, everyday market bag woven by local artisans from soft Ethiopian cotton. Each piece has its own natural variations.',
    price: 1250,
    category: 'Handmade',
    stock: 24,
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [{ minQuantity: 5, unitPrice: 1100 }],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Traditional Woven Table Runner',
    description: 'A colourful handwoven accent for a dining table or coffee ceremony. Crafted in small batches with traditional patterns.',
    price: 1850,
    category: 'Home & Living',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Natural Cotton Scarf',
    description: 'A lightweight, breathable scarf woven from Ethiopian cotton. An easy layer for cool mornings and evenings.',
    price: 980,
    category: 'Fashion',
    stock: 32,
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Yirgacheffe Coffee Beans · 500g',
    description: 'A small-batch, washed Yirgacheffe coffee with a floral aroma and bright citrus notes. Roasted locally and packed fresh.',
    price: 1450,
    category: 'Food & Drink',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [{ minQuantity: 10, unitPrice: 1300 }],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Handmade Ceramic Coffee Cup',
    description: 'A one-of-a-kind stoneware cup shaped and glazed by hand in a local ceramics studio. Made for your daily coffee or buna.',
    price: 720,
    category: 'Home & Living',
    stock: 18,
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Ethiopian Coffee Ceremony Set',
    description: 'A curated coffee moment with freshly roasted beans and a pair of handmade cups. A thoughtful gift for coffee lovers.',
    price: 2300,
    category: 'Handmade',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Handwoven Habesha Kemis',
    description: 'A graceful white cotton dress with a handwoven Tibeb border, made in Addis Ababa for celebrations and special gatherings.',
    price: 6800,
    category: 'Traditional Clothing',
    stock: 8,
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Buna Ceremony Essentials Box',
    description: 'A warm welcome in a box: freshly roasted Ethiopian coffee, a small woven serving mat and a handmade incense holder.',
    price: 3200,
    category: 'Coffee & Ceremony Essentials',
    stock: 14,
    images: ['https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [{ minQuantity: 5, unitPrice: 2950 }],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Artisan Leather Sandals',
    description: 'Comfortable everyday sandals cut and stitched by a local leather workshop using supple, responsibly sourced leather.',
    price: 2450,
    category: 'Handcrafted Leather',
    stock: 16,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Homestyle Berbere Spice Blend',
    description: 'A fragrant small-batch blend of Ethiopian chilli, warm spices and herbs. Packed fresh for your favourite stews and sauces.',
    price: 420,
    category: 'Spices & Berbere',
    stock: 55,
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [{ minQuantity: 10, unitPrice: 360 }],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Everyday Wireless Earbuds',
    description: 'Compact wireless earbuds with a pocket charging case for calls, music and the daily commute.',
    price: 2850,
    category: 'Electronics',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Handcrafted Silver Drop Earrings',
    description: 'Lightweight silver-tone earrings inspired by Ethiopian filigree and shaped by hand in a small Addis Ababa studio.',
    price: 1750,
    category: 'Jewelry',
    stock: 11,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Stories from the Highlands',
    description: 'A beautifully illustrated collection of Ethiopian folktales for curious readers and family story time.',
    price: 890,
    category: 'Books',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Organic Brown Teff · 2kg',
    description: 'Carefully cleaned Ethiopian brown teff, sourced from local growers and ready for injera, porridge and everyday cooking.',
    price: 1150,
    category: 'Groceries',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [{ minQuantity: 8, unitPrice: 1030 }],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Yirgacheffe Café Supply · 5kg',
    description: 'A wholesale-sized bag of freshly roasted Yirgacheffe beans for cafés, offices and hospitality teams.',
    price: 12800,
    category: 'Wholesale',
    stock: 9,
    images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [{ minQuantity: 3, unitPrice: 11900 }],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Honey & Shea Botanical Soap',
    description: 'A gentle, small-batch botanical soap bar made with honey, shea butter and a soft, naturally inspired fragrance.',
    price: 360,
    category: 'Beauty',
    stock: 30,
    images: ['https://images.unsplash.com/photo-1600428853876-fb5a850b444f?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Handmade Masinko · One-String Fiddle',
    description: 'A locally made masinko with a carved wooden body and traditional bow, carefully finished by an Ethiopian instrument maker.',
    price: 7400,
    category: 'Traditional Musical Instruments',
    stock: 5,
    images: ['https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Ethiopian Krar Lyre',
    description: 'A hand-assembled six-string krar with a warm, resonant sound, made for traditional melodies and contemporary performances.',
    price: 5900,
    category: 'Traditional Musical Instruments',
    stock: 7,
    images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'dawit.vendor@merkato.test',
    title: 'Three-Region Berbere Spice Collection',
    description: 'Three small-batch berbere blends with distinct regional character, freshly packed for stews, lentils and roasted vegetables.',
    price: 980,
    category: 'Spices & Berbere',
    stock: 28,
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [{ minQuantity: 6, unitPrice: 850 }],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Handstitched Ethiopian Leather Jacket',
    description: 'A timeless, made-to-order leather jacket cut and stitched by an Addis Ababa workshop using locally crafted leather.',
    price: 14500,
    category: 'Handcrafted Leather',
    stock: 4,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Hand-carved Ethiopian Coffee Keepsake',
    description: 'A small hand-carved wooden keepsake inspired by Ethiopian coffee ceremony forms, made by a local artisan.',
    price: 1350,
    category: 'Ethiopian Artifacts & Souvenirs',
    stock: 13,
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
  {
    vendorEmail: 'hana.vendor@merkato.test',
    title: 'Addis Handcrafted Leather Shoes',
    description: 'Durable, everyday leather shoes shaped and stitched in Addis Ababa, with a cushioned insole and sturdy sole.',
    price: 3950,
    category: 'Footwear & Shoes',
    stock: 12,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80'],
    wholesalePricingTiers: [],
  },
];

async function ensureDemoUser(details) {
  let user = await User.findOne({ email: details.email });
  if (user) {
    if (user.role !== details.role) {
      throw new Error(`${details.email} already exists with role "${user.role}", expected "${details.role}". No user credentials were changed.`);
    }
    console.log(`Using existing ${details.role} account: ${details.email}`);
    return user;
  }

  user = await User.create(details);
  console.log(`Created demo ${details.role} account: ${details.email}`);
  return user;
}

async function seedDemoData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo data seeding is disabled when NODE_ENV=production');
  }

  const users = new Map();
  for (const details of demoUsers) {
    const user = await ensureDemoUser(details);
    users.set(user.email, user);
  }

  const stores = new Map();
  for (const details of demoStores) {
    const vendor = users.get(details.ownerEmail);
    let store = await Store.findOne({ vendor: vendor._id });
    if (store) {
      store.name = details.name;
      store.description = details.description;
      store.address = details.address;
      store.isVerified = true;
      await store.save();
    } else {
      store = await Store.create({
        vendor: vendor._id,
        name: details.name,
        description: details.description,
        address: details.address,
        isVerified: true,
      });
    }
    stores.set(details.ownerEmail, store);
  }

  for (const details of demoProducts) {
    const store = stores.get(details.vendorEmail);
    const { vendorEmail, ...productFields } = details;
    await Product.findOneAndUpdate(
      { vendor: store._id, title: productFields.title },
      { $set: { ...productFields, vendor: store._id } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  console.log(`Demo seed complete: ${demoUsers.length} users, ${demoStores.length} verified stores, ${demoProducts.length} products.`);
  console.log('Demo login passwords are listed in README.md. Do not use these accounts in production.');
}

if (require.main === module) {
  const ready = process.env.NODE_ENV === 'production'
    ? Promise.reject(new Error('Demo data seeding is disabled when NODE_ENV=production'))
    : connectDatabase().then(seedDemoData);

  ready
    .catch((error) => {
      console.error('Demo seeding failed:', error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = seedDemoData;
