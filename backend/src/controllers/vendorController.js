const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

exports.getStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ vendor: req.user.id }).select('+bankAccountDetails');
  res.json({ store });
});

exports.saveStore = asyncHandler(async (req, res) => {
  const { name, description, address, bankAccountDetails } = req.body;
  const fields = { name, description, address };
  if (bankAccountDetails !== undefined) fields.bankAccountDetails = bankAccountDetails;

  let store = await Store.findOne({ vendor: req.user.id }).select('+bankAccountDetails');
  if (!store) {
    store = await Store.create({ ...fields, vendor: req.user.id });
  } else {
    Object.assign(store, fields);
    await store.save();
  }

  res.json({ store });
});

exports.dashboard = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ vendor: req.user.id });
  if (!store) {
    res.json({ store: null, stats: { productCount: 0, orderCount: 0, revenue: 0 }, orders: [] });
    return;
  }

  const productIds = await Product.find({ vendor: store.id }).distinct('_id');
  const [productCount, orderRows, orders] = await Promise.all([
    Product.countDocuments({ vendor: store.id }),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.product': { $in: productIds }, deliveryStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          orders: { $addToSet: '$_id' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $project: { orderCount: { $size: '$orders' }, revenue: 1 } },
    ]),
    Order.find({ $or: [{ 'vendorFulfillments.vendor': store.id }, { 'items.product': { $in: productIds } }] })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name email')
      .populate('items.product', 'title vendor'),
  ]);

  res.json({
    store,
    stats: { productCount, orderCount: orderRows[0]?.orderCount || 0, revenue: orderRows[0]?.revenue || 0 },
    orders: orders.map((order) => vendorOrderView(order, store)),
  });
});

function vendorOrderView(order, store) {
  const result = order.toJSON();
  result.items = result.items.filter((item) => item.product?.vendor?.toString() === store.id);
  result.totalAmount = result.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  result.vendorDeliveryStatus =
    result.vendorFulfillments.find((fulfillment) => fulfillment.vendor.toString() === store.id)?.deliveryStatus ||
    result.deliveryStatus;
  return result;
}

exports.listProducts = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ vendor: req.user.id });
  if (!store) {
    res.json({ products: [] });
    return;
  }
  const products = await Product.find({ vendor: store.id }).sort({ createdAt: -1 });
  res.json({ products });
});

exports.listOrders = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ vendor: req.user.id });
  if (!store) {
    res.json({ orders: [] });
    return;
  }
  const productIds = await Product.find({ vendor: store.id }).distinct('_id');
  const orders = await Order.find({ $or: [{ 'vendorFulfillments.vendor': store.id }, { 'items.product': { $in: productIds } }] })
    .sort({ createdAt: -1 })
    .populate('customer', 'name email')
    .populate('items.product', 'title vendor');
  const ownOrders = orders.map((order) => vendorOrderView(order, store));
  res.json({ orders: ownOrders });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const allowedStatuses = ['Processing', 'Shipped', 'Delivered'];
  if (!allowedStatuses.includes(req.body.deliveryStatus)) {
    throw httpError(400, 'Delivery status is invalid');
  }
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(400, 'Order ID is invalid');

  const store = await Store.findOne({ vendor: req.user.id });
  if (!store) throw httpError(404, 'Store not found');
  const productIds = await Product.find({ vendor: store.id }).distinct('_id');
  const order = await Order.findOne({
    _id: req.params.id,
    $or: [{ 'vendorFulfillments.vendor': store.id }, { 'items.product': { $in: productIds } }],
  });
  if (!order) throw httpError(404, 'Order not found for this store');
  let fulfillment = order.vendorFulfillments.find((entry) => entry.vendor.toString() === store.id);
  if (!fulfillment) {
    fulfillment = { vendor: store.id, deliveryStatus: 'Processing' };
    order.vendorFulfillments.push(fulfillment);
  }
  fulfillment.deliveryStatus = req.body.deliveryStatus;
  const statuses = order.vendorFulfillments.map((entry) => entry.deliveryStatus);
  order.deliveryStatus = statuses.every((status) => status === 'Delivered')
    ? 'Delivered'
    : statuses.some((status) => status === 'Shipped' || status === 'Delivered')
      ? 'Shipped'
      : 'Processing';
  await order.save();
  res.json({ order });
});
