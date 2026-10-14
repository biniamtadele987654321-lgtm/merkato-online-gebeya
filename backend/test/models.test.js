const assert = require('node:assert/strict');
const test = require('node:test');
const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const Product = require('../src/models/Product');
const Review = require('../src/models/Review');
const Store = require('../src/models/Store');
const User = require('../src/models/User');

test('marketplace documents satisfy the five model schemas', async () => {
  const vendor = new mongoose.Types.ObjectId();
  const storeId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const user = new User({
    name: 'Test vendor',
    email: 'vendor@example.com',
    password: 'long-secure-password',
    phone: '+251911123456',
    role: 'vendor',
  });
  const product = new Product({
    title: 'Coffee set',
    description: 'Made locally',
    price: 700,
    category: 'Handmade',
    stock: 10,
    vendor: storeId,
    wholesalePricingTiers: [{ minQuantity: 5, unitPrice: 650 }],
  });
  const documents = [
    user,
    new Store({ vendor, name: 'Local maker', address: 'Addis Ababa' }),
    product,
    new Order({
      customer: vendor,
      items: [{ product: productId, quantity: 2, price: 700 }],
      vendorFulfillments: [{ vendor: storeId }],
      totalAmount: 1400,
      shippingAddress: {
        fullName: 'Test customer',
        phone: '+251911123456',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        streetAddress: 'Test road',
      },
      paymentMethod: 'CashOnDelivery',
    }),
    new Review({ product: productId, user: vendor, rating: 5, comment: 'Lovely' }),
  ];

  await Promise.all(documents.map((document) => document.validate()));
  assert.equal(Object.hasOwn(user.toJSON(), 'password'), false);
  assert.equal(User.schema.path('password').options.select, false);
  assert.equal(Store.schema.path('bankAccountDetails').options.select, false);
  assert.equal(product.isActive, true);
});

test('model schemas reject invalid roles, ratings, and stock values', async () => {
  const vendor = new mongoose.Types.ObjectId();
  const invalidUser = new User({
    name: 'Invalid role',
    email: 'invalid@example.com',
    password: 'long-secure-password',
    phone: '+251911123456',
    role: 'superuser',
  });
  const invalidProduct = new Product({
    title: 'Invalid stock',
    description: 'Invalid',
    price: 10,
    category: 'Other',
    stock: -1,
    vendor,
  });
  const invalidReview = new Review({ product: vendor, user: vendor, rating: 6 });

  await assert.rejects(invalidUser.validate(), mongoose.Error.ValidationError);
  await assert.rejects(invalidProduct.validate(), mongoose.Error.ValidationError);
  await assert.rejects(invalidReview.validate(), mongoose.Error.ValidationError);
});
