require('dotenv').config();

const User = require('../src/models/User');
const connectDatabase = require('../src/config/database');

async function createAdmin() {
  const { ADMIN_NAME: name, ADMIN_EMAIL: email, ADMIN_PHONE: phone, ADMIN_PASSWORD: password } = process.env;
  if (!name || !email || !phone || !password) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD in backend/.env before provisioning an admin account');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
  }

  await connectDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select('+password');
  if (existing) {
    if (existing.role === 'admin') {
      console.log('This email already belongs to an admin account.');
      return;
    }
    if (process.env.ADMIN_PROMOTE_EXISTING !== 'true') {
      throw new Error('An account with ADMIN_EMAIL already exists. Set ADMIN_PROMOTE_EXISTING=true to intentionally grant it admin access.');
    }
    existing.name = name;
    existing.phone = phone;
    existing.password = password;
    existing.role = 'admin';
    await existing.save();
    console.log('Existing account promoted to admin and its password updated.');
    return;
  }

  await User.create({ name, email: normalizedEmail, phone, password, role: 'admin' });
  console.log('Admin account created.');
}

createAdmin()
  .catch((error) => {
    console.error('Admin provisioning failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });
