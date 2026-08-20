const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import route handlers
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/contactRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/* ===========================
   MIDDLEWARE
=========================== */

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// 🔥 Serve static files from uploads folder
console.log("Static folder path:", path.join(__dirname, 'uploads'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/* ===========================
   DATABASE CONNECTION
=========================== */

console.log("Mongo URI:", process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connection promise resolved'))
  .catch((err) => console.error('MongoDB connection failed:', err));


/* ===========================
   ROUTES
=========================== */

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to Handicraft Hub API!');
});


/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});