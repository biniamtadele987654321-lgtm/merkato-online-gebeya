const mongoose = require('mongoose');

const wholesaleTierSchema = new mongoose.Schema(
  {
    minQuantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isInteger,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    price: {
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
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [
        {
          type: String,
          trim: true,
          match: /^https?:\/\/.+/i,
        },
      ],
      default: [],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    wholesalePricingTiers: {
      type: [wholesaleTierSchema],
      default: [],
    },
  },
  { timestamps: true },
);

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
