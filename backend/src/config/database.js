const mongoose = require('mongoose');

async function connectDatabase() {
  const { MONGODB_URI: uri } = process.env;

  if (!uri) {
    throw new Error('MONGODB_URI must be set before starting the server');
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

module.exports = connectDatabase;
