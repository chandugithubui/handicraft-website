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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


/* ===========================
   ROUTES
=========================== */

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/categories', categoryRoutes);

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