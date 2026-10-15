const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

const app = express();
const allowedOrigins = [...new Set([
  ...(process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','),
  'https://merkato-online-gebeya.onrender.com',
])]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  const status = error.status ||
    (error.name === 'ValidationError' || error.name === 'CastError' || error.type === 'entity.parse.failed'
      ? 400
      : error.code === 11000
        ? 409
        : 500);
  if (status >= 500) {
    console.error('API request failed:', error);
  } else {
    console.warn(`${status} ${req.method} ${req.path}: ${error.message}`);
  }
  res.status(status).json({
    message:
      process.env.NODE_ENV === 'production'
        ? error.code === 11000
          ? 'A record with those details already exists'
          : status >= 500 ? 'An unexpected error occurred' : error.message
        : error.message,
  });
});

module.exports = app;
