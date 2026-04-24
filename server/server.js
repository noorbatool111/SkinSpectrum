const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const analyzeRoute = require('./routes/analyzeSkin'); // ✅ NEW

dotenv.config();

const app = express();

// -------------------------
// MIDDLEWARE
// -------------------------
app.use(express.json());
app.use(cors());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// -------------------------
// ROUTES
// -------------------------
app.use('/api/auth', authRoutes);
app.use('/api', analyzeRoute); // ✅ NEW (Python ML route)

// Root route
app.get('/', (req, res) => {
  res.send('SkinSpectrum API is running...');
});

// -------------------------
// DATABASE CONNECTION
// -------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});