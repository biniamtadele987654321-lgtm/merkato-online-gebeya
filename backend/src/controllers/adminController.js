const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Store = require('../models/Store');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

exports.dashboard = asyncHandler(async (req, res) => {
  const [users, vendors, products, orders, paid, pendingVendors] = await Promise.all([
    User.countDocuments(),
    Store.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
    Store.countDocuments({ isVerified: false }),
  ]);
  res.json({
    stats: {
      users,
      vendors,
      products,
      orders,
      paidRevenue: paid[0]?.revenue || 0,
      paidOrders: paid[0]?.count || 0,
      pendingVendors,
    },
  });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);
  res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'User ID is invalid');
  if (req.params.id === req.user.id) throw httpError(409, 'You cannot delete your own account');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const user = await User.findById(req.params.id).session(session);
      if (!user) throw httpError(404, 'User not found');
      if (user.role === 'admin') throw httpError(409, 'Admin accounts cannot be deleted from the dashboard');
      if (await Order.exists({ customer: user._id }).session(session)) {
        throw httpError(409, 'This account has order history and cannot be deleted');
      }

      const store = await Store.findOne({ vendor: user._id }).session(session);
      if (store) {
        const productIds = await Product.find({ vendor: store._id }).distinct('_id').session(session);
        if (productIds.length && await Order.exists({ 'items.product': { $in: productIds } }).session(session)) {
          throw httpError(409, 'This store has products in order history and cannot be deleted');
        }
        await Review.deleteMany({ product: { $in: productIds } }, { session });
        await Product.deleteMany({ vendor: store._id }, { session });
        await store.deleteOne({ session });
      }

      await Review.deleteMany({ user: user._id }, { session });
      await user.deleteOne({ session });
    });
  } finally {
    await session.endSession();
  }
  res.status(204).end();
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'User ID is invalid');
  if (!['customer', 'vendor'].includes(req.body.role)) {
    throw httpError(400, 'Admin can assign customer or vendor roles; admin role changes are disabled');
  }
  if (req.params.id === req.user.id) throw httpError(409, 'You cannot change your own role');
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
  if (!user) throw httpError(404, 'User not found');
  res.json({ user });
});

exports.verifyStore = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Store ID is invalid');
  if (typeof req.body.isVerified !== 'boolean') {
    throw httpError(400, 'isVerified must be a boolean');
  }
  const store = await Store.findByIdAndUpdate(
    req.params.id,
    { isVerified: req.body.isVerified },
    { new: true, runValidators: true },
  );
  if (!store) throw httpError(404, 'Store not found');
  res.json({ store });
});

exports.listStores = asyncHandler(async (req, res) => {
  const stores = await Store.find()
    .populate('vendor', 'name email phone role')
    .sort({ createdAt: -1 });
  res.json({ stores });
});

exports.listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
  const [products, total] = await Promise.all([
    Product.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('vendor', 'name'),
    Product.countDocuments(),
  ]);
  res.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Product ID is invalid');

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const product = await Product.findById(req.params.id).session(session);
      if (!product) throw httpError(404, 'Product not found');
      if (await Order.exists({ 'items.product': product._id }).session(session)) {
        product.isActive = false;
        await product.save({ session });
        return;
      }
      await Review.deleteMany({ product: product._id }, { session });
      await product.deleteOne({ session });
    });
  } finally {
    await session.endSession();
  }
  res.status(204).end();
});

exports.setProductVisibility = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Product ID is invalid');
  if (typeof req.body.isActive !== 'boolean') throw httpError(400, 'isActive must be a boolean');
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true, runValidators: true },
  ).populate('vendor', 'name');
  if (!product) throw httpError(404, 'Product not found');
  res.json({ product });
});

exports.listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
  const [orders, total] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customer', 'name email phone')
      .populate('items.product', 'title'),
    Order.countDocuments(),
  ]);
  res.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
