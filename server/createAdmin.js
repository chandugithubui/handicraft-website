const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@handicraft.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@handicraft.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@handicraft.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();

    console.log('Admin user created successfully!');
    console.log('Email: admin@handicraft.com');
    console.log('Password: admin123');
    console.log('\nPlease login at: http://localhost:3000/login');
    console.log('Then access admin dashboard at: http://localhost:3000/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
