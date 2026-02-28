const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import your route handlers
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/contactRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Initialize dotenv for loading environment variables
dotenv.config();  

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON data and enable CORS
app.use(express.json()); 
app.use(cors()); 

// MongoDB connection setup
// MongoDB connection (without deprecated options)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Define routes
app.use('/api/products', productRoutes);  
app.use('/api/contacts', contactRoutes);  
app.use('/api/categories', categoryRoutes);  

// Default route for testing
app.get('/', (req, res) => {
  res.send('Welcome to Handicraft Hub API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
