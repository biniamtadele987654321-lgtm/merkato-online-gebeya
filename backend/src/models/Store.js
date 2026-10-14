const mongoose = require('mongoose');

const bankAccountDetailsSchema = new mongoose.Schema(
  {
    bankName: { type: String, trim: true, maxlength: 120 },
    accountName: { type: String, trim: true, maxlength: 120 },
    accountNumber: { type: String, trim: true, maxlength: 64 },
  },
  { _id: false },
);

const storeSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    bankAccountDetails: {
      type: bankAccountDetailsSchema,
      default: () => ({}),
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Store', storeSchema);
