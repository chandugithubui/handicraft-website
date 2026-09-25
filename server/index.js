const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const dotenv       = require('dotenv');
const path         = require('path');
const helmet       = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');

// Load environment variables FIRST — before importing env.js
dotenv.config({ path: path.join(__dirname, '.env') });

// Validated env config — exits process if required vars are missing
const env = require('./config/env');

// Import route handlers
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/contactRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const artisanRoutes = require('./routes/artisanRoutes');

const app  = express();
const PORT = env.PORT;

// Trust the first reverse proxy (Render, Vercel, etc.)
app.set('trust proxy', 1);

// ── CORS allowed origins ──────────────────────────────────────────────────────
// Loaded entirely from environment variables (ALLOWED_ORIGINS, ALLOWED_ORIGIN, FRONTEND_URL)
const parseCorsOrigins = () => {
  const list = [
    env.ALLOWED_ORIGIN,
    env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  return Array.from(new Set(list));
};

const ALLOWED_ORIGINS = parseCorsOrigins();

/* ===========================
   MIDDLEWARE
=========================== */

// Security headers
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));

// NoSQL injection sanitization
app.use(mongoSanitize());

// Cookie parser — must come before any middleware that reads cookies
app.use(cookieParser());

// ── CORS config object (reused for both middleware and preflight) ─────────────
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server, curl)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Respond to ALL preflight OPTIONS requests with the same credentials-aware config
app.options('*', cors(corsOptions));

// Parse JSON
app.use(express.json());

// 🔥 Serve static files from uploads folder
console.log("Static folder path:", path.join(__dirname, 'uploads'));

app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

app.use('/api/testimonials', testimonialRoutes);

/* ===========================
   DATABASE CONNECTION
=========================== */



mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

mongoose.connect(env.MONGODB_URI)
  .then(() => console.log('MongoDB connection promise resolved'))
  .catch((err) => console.error('MongoDB connection failed:', err));


/* ===========================
   ROUTES
=========================== */

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/upload', uploadRoutes);

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