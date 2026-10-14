const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

function positiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

exports.list = asyncHandler(async (req, res) => {
  const page = positiveInteger(req.query.page, 1, Number.MAX_SAFE_INTEGER);
  const limit = positiveInteger(req.query.limit, 24, 100);
  const filter = { isActive: { $ne: false } };

  if (typeof req.query.category === 'string' && req.query.category.length <= 100) {
    filter.category = req.query.category;
  }
  const verifiedStoreIds = await Store.find({ isVerified: true }).distinct('_id');
  filter.vendor = typeof req.query.vendor === 'string' && mongoose.isValidObjectId(req.query.vendor)
    ? { $in: verifiedStoreIds.filter((id) => id.toString() === req.query.vendor) }
    : { $in: verifiedStoreIds };

  const minPrice = req.query.minPrice === undefined
    ? undefined
    : typeof req.query.minPrice === 'string' ? Number(req.query.minPrice) : Number.NaN;
  const maxPrice = req.query.maxPrice === undefined
    ? undefined
    : typeof req.query.maxPrice === 'string' ? Number(req.query.maxPrice) : Number.NaN;
  if (
    (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
    (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
    (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
  ) {
    throw httpError(400, 'Price range is invalid');
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  if (search.length > 100) throw httpError(400, 'Search query is too long');
  const textFilter = search ? { $text: { $search: search } } : {};
  const query = { ...filter, ...textFilter };
  const sort = search ? { score: { $meta: 'textScore' } } : { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('vendor', 'name isVerified'),
    Product.countDocuments(query),
  ]);

  res.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.get = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('vendor', 'name isVerified');
  if (!product || product.isActive === false || !product.vendor?.isVerified) throw httpError(404, 'Product not found');
  res.json({ product });
});

exports.create = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ vendor: req.user.id });
  if (!store) throw httpError(400, 'Set up your store before adding products');
  if (!store.isVerified) throw httpError(403, 'Your store must be verified before selling products');

  const product = await Product.create({ ...req.body, vendor: store.id });
  res.status(201).json({ product });
});

exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  const store = await Store.findOne({ vendor: req.user.id });
  if (!store || product.vendor.toString() !== store.id) {
    throw httpError(403, 'You can only manage products from your own store');
  }

  const fields = ['title', 'description', 'price', 'category', 'stock', 'images', 'wholesalePricingTiers'];
  for (const field of fields) {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  }
  await product.save();
  res.json({ product });
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  const store = await Store.findOne({ vendor: req.user.id });
  if (!store || product.vendor.toString() !== store.id) {
    throw httpError(403, 'You can only manage products from your own store');
  }
  if (await Order.exists({ 'items.product': product.id })) {
    throw httpError(409, 'Products with order history cannot be deleted. Set stock to zero to stop new sales.');
  }

  await product.deleteOne();
  res.status(204).end();
});
