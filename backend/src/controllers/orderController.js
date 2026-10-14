const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

exports.create = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'An order must contain at least one item');
  }
  if (!['Chapa', 'Telebirr', 'CashOnDelivery'].includes(paymentMethod)) {
    throw httpError(400, 'Choose a supported payment method');
  }

  const quantities = new Map();
  for (const item of items) {
    if (
      !item ||
      typeof item !== 'object' ||
      !mongoose.isValidObjectId(item.product) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw httpError(400, 'Every order item must have a valid product and positive whole-number quantity');
    }
    quantities.set(item.product, (quantities.get(item.product) || 0) + item.quantity);
  }
  if ([...quantities.values()].some((quantity) => !Number.isSafeInteger(quantity))) {
    throw httpError(400, 'Combined product quantity is too large');
  }

  const session = await mongoose.startSession();
  let createdOrder;
  try {
    await session.withTransaction(async () => {
      const productIds = [...quantities.keys()];
      const verifiedStoreIds = await Store.find({ isVerified: true }).distinct('_id').session(session);
      const products = await Product.find({
        _id: { $in: productIds },
        vendor: { $in: verifiedStoreIds },
        isActive: { $ne: false },
      }).session(session);
      if (products.length !== productIds.length) throw httpError(400, 'One or more products are no longer available');

      const orderItems = [];
      const fulfillments = new Map();
      for (const product of products) {
        const quantity = quantities.get(product.id);
        const tier = product.wholesalePricingTiers
          .filter((entry) => quantity >= entry.minQuantity)
          .sort((a, b) => b.minQuantity - a.minQuantity)[0];
        const price = tier ? tier.unitPrice : product.price;
        const updated = await Product.updateOne(
          { _id: product.id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { session },
        );
        if (updated.modifiedCount !== 1) {
          throw httpError(409, `${product.title} does not have enough stock`);
        }
        orderItems.push({ product: product.id, quantity, price });
        fulfillments.set(product.vendor.toString(), {
          vendor: product.vendor,
          deliveryStatus: 'Processing',
        });
      }

      const totalAmount = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
      const [order] = await Order.create(
        [
          {
            customer: req.user.id,
            items: orderItems,
            vendorFulfillments: [...fulfillments.values()],
            totalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'Pending',
            deliveryStatus: 'Processing',
          },
        ],
        { session },
      );
      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json({ order: createdOrder });
});

exports.listMine = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user.id })
    .sort({ createdAt: -1 })
    .populate('items.product', 'title images vendor');
  res.json({ orders });
});

exports.getMine = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.user.id })
    .populate('items.product', 'title images vendor');
  if (!order) throw httpError(404, 'Order not found');
  res.json({ order });
});

exports.cancelMine = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let updatedOrder;
  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: req.params.id, customer: req.user.id }).session(session);
      if (!order) throw httpError(404, 'Order not found');
      if (order.deliveryStatus !== 'Processing') {
        throw httpError(409, 'Only processing orders can be cancelled');
      }
      if (order.paymentStatus !== 'Pending') {
        throw httpError(409, 'Paid orders must go through the refund process before cancellation');
      }

      for (const item of order.items) {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }, { session });
      }
      order.vendorFulfillments.forEach((fulfillment) => {
        fulfillment.deliveryStatus = 'Cancelled';
      });
      order.deliveryStatus = 'Cancelled';
      await order.save({ session });
      updatedOrder = order;
    });
  } finally {
    await session.endSession();
  }
  res.json({ order: updatedOrder });
});

exports.initiatePayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.user.id });
  if (!order) throw httpError(404, 'Order not found');
  if (order.paymentMethod === 'CashOnDelivery') {
    throw httpError(400, 'Cash on delivery does not require online payment initialization');
  }
  if (order.paymentStatus === 'Paid') {
    res.json({ message: 'This order has already been paid', order });
    return;
  }

  const configured = order.paymentMethod === 'Chapa'
    ? Boolean(process.env.CHAPA_SECRET_KEY)
    : Boolean(process.env.TELEBIRR_API_URL && process.env.TELEBIRR_APP_ID);
  if (!configured) {
    res.status(501).json({
      message: `${order.paymentMethod} checkout is not configured. Add gateway credentials and implement server-side checkout and callback verification before accepting payments.`,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
    });
    return;
  }

  res.status(501).json({
    message: `${order.paymentMethod} credentials are configured, but the gateway adapter and verified callback are not implemented. No payment has been initiated.`,
    orderId: order.id,
    paymentStatus: order.paymentStatus,
  });
});
