const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    region: { type: String, required: true, trim: true, maxlength: 100 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    subCity: { type: String, trim: true, maxlength: 100 },
    woreda: { type: String, trim: true, maxlength: 100 },
    streetAddress: { type: String, required: true, trim: true, maxlength: 500 },
    additionalDirections: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const vendorFulfillmentSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
      required: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'An order must contain at least one item',
      },
    },
    vendorFulfillments: {
      type: [vendorFulfillmentSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['ETB'],
      default: 'ETB',
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Chapa', 'Telebirr', 'CashOnDelivery'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

module.exports = mongoose.model('Order', orderSchema);
