const demoUsers = [
  { _id: 'demo-admin-1', name: 'Alem Tesfaye', email: 'alem.admin@merkato.test', phone: '+251911000001', role: 'admin' },
  { _id: 'demo-vendor-1', name: 'Hana Bekele', email: 'hana.vendor@merkato.test', phone: '+251911000002', role: 'vendor' },
  { _id: 'demo-vendor-2', name: 'Dawit Kebede', email: 'dawit.vendor@merkato.test', phone: '+251911000003', role: 'vendor' },
  { _id: 'demo-vendor-3', name: 'Rahel Abebe', email: 'rahel.vendor@merkato.test', phone: '+251911000004', role: 'vendor' },
  { _id: 'demo-vendor-4', name: 'Mekdes Tadesse', email: 'mekdes.vendor@merkato.test', phone: '+251911000005', role: 'vendor' },
  { _id: 'demo-customer-1', name: 'Mimi Girma', email: 'mimi.customer@merkato.test', phone: '+251911000006', role: 'customer' },
  { _id: 'demo-customer-2', name: 'Samuel Haile', email: 'samuel.customer@merkato.test', phone: '+251911000007', role: 'customer' },
  { _id: 'demo-customer-3', name: 'Liya Solomon', email: 'liya.customer@merkato.test', phone: '+251911000008', role: 'customer' },
  { _id: 'demo-customer-4', name: 'Nahom Fikru', email: 'nahom.customer@merkato.test', phone: '+251911000009', role: 'customer' },
  { _id: 'demo-customer-5', name: 'Selam Worku', email: 'selam.customer@merkato.test', phone: '+251911000010', role: 'customer' },
  { _id: 'demo-customer-6', name: 'Yonas Getachew', email: 'yonas.customer@merkato.test', phone: '+251911000011', role: 'customer' },
  { _id: 'demo-customer-7', name: 'Tigist Desta', email: 'tigist.customer@merkato.test', phone: '+251911000012', role: 'customer' },
].map((user, index) => ({
  ...user,
  createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
}));

const demoStores = [
  { _id: 'demo-admin-store-1', name: 'Hana Handmade', address: 'Bole, Addis Ababa', vendor: demoUsers[1], isVerified: false },
  { _id: 'demo-admin-store-2', name: 'Coffee & Clay', address: 'Kazanchis, Addis Ababa', vendor: demoUsers[2], isVerified: false },
  { _id: 'demo-admin-store-3', name: 'Rahel Textile Studio', address: 'Piazza, Addis Ababa', vendor: demoUsers[3], isVerified: true },
  { _id: 'demo-admin-store-4', name: 'Mekdes Natural Goods', address: 'Megenagna, Addis Ababa', vendor: demoUsers[4], isVerified: true },
];

const demoOrders = [
  { _id: 'demo-order-0001', customer: demoUsers[5], items: [{ product: { title: 'Handwoven Cotton Market Tote' }, quantity: 2 }], totalAmount: 4500, deliveryStatus: 'Processing', paymentMethod: 'CashOnDelivery', paymentStatus: 'Pending' },
  { _id: 'demo-order-0002', customer: demoUsers[6], items: [{ product: { title: 'Yirgacheffe Coffee Beans · 500g' }, quantity: 3 }], totalAmount: 14350, deliveryStatus: 'Shipped', paymentMethod: 'Chapa', paymentStatus: 'Paid' },
  { _id: 'demo-order-0003', customer: demoUsers[7], items: [{ product: { title: 'Handwoven Habesha Kemis' }, quantity: 1 }], totalAmount: 16800, deliveryStatus: 'Delivered', paymentMethod: 'Telebirr', paymentStatus: 'Paid' },
  { _id: 'demo-order-0004', customer: demoUsers[8], items: [{ product: { title: 'Ethiopian Coffee Ceremony Set' }, quantity: 2 }], totalAmount: 9600, deliveryStatus: 'Processing', paymentMethod: 'Chapa', paymentStatus: 'Paid' },
  { _id: 'demo-order-0005', customer: demoUsers[9], items: [{ product: { title: 'Artisan Leather Sandals' }, quantity: 2 }], totalAmount: 4900, deliveryStatus: 'Shipped', paymentMethod: 'CashOnDelivery', paymentStatus: 'Pending' },
  { _id: 'demo-order-0006', customer: demoUsers[10], items: [{ product: { title: 'Handcrafted Silver Drop Earrings' }, quantity: 1 }], totalAmount: 4850, deliveryStatus: 'Delivered', paymentMethod: 'Chapa', paymentStatus: 'Paid' },
  { _id: 'demo-order-0007', customer: demoUsers[11], items: [{ product: { title: 'Buna Ceremony Essentials Box' }, quantity: 2 }], totalAmount: 6400, deliveryStatus: 'Processing', paymentMethod: 'CashOnDelivery', paymentStatus: 'Pending' },
].map((order, index) => ({
  ...order,
  createdAt: new Date(Date.now() - index * 3600000).toISOString(),
}));

const demoProductNames = [
  ['Handwoven Cotton Market Tote', 'Handmade', 1250, 24],
  ['Traditional Woven Table Runner', 'Home & Living', 1850, 15],
  ['Natural Cotton Scarf', 'Fashion', 980, 32],
  ['Yirgacheffe Coffee Beans · 500g', 'Food & Drink', 1450, 40],
  ['Handmade Ceramic Coffee Cup', 'Home & Living', 720, 18],
  ['Ethiopian Coffee Ceremony Set', 'Handmade', 2300, 12],
  ['Handwoven Habesha Kemis', 'Traditional Clothing', 6800, 8],
  ['Buna Ceremony Essentials Box', 'Coffee & Ceremony Essentials', 3200, 14],
  ['Artisan Leather Sandals', 'Handcrafted Leather', 2450, 16],
  ['Homestyle Berbere Spice Blend', 'Spices & Berbere', 420, 55],
  ['Everyday Wireless Earbuds', 'Electronics', 2850, 20],
  ['Handcrafted Silver Drop Earrings', 'Jewelry', 1750, 11],
  ['Stories from the Highlands', 'Books', 950, 28],
  ['Hand-carved Serving Bowl', 'Home & Living', 2100, 9],
  ['Organic Teff Flour', 'Food & Drink', 650, 35],
  ['Woven Leather Crossbody Bag', 'Fashion', 3900, 7],
  ['Natural Shea Body Butter', 'Beauty & Wellness', 780, 22],
  ['Traditional Incense Set', 'Coffee & Ceremony Essentials', 1200, 17],
];

export const adminDemoData = {
  dashboard: {
    users: 12,
    vendors: 4,
    products: 18,
    orders: 7,
    paidRevenue: 45600,
    paidOrders: 4,
    pendingVendors: 2,
  },
  users: demoUsers,
  userPagination: { page: 1, limit: 25, total: 12, pages: 1 },
  stores: demoStores,
  products: demoProductNames.map(([title, category, price, stock], index) => ({
    _id: `demo-admin-product-${index + 1}`,
    title,
    category,
    price,
    stock,
    vendor: { name: demoUsers[1 + (index % 4)].name },
    isActive: index !== 8,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  })),
  productPagination: { page: 1, limit: 25, total: 18, pages: 1 },
  orders: demoOrders,
  orderPagination: { page: 1, limit: 25, total: 7, pages: 1 },
};
