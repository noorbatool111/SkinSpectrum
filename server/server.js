const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const analyzeRoute = require('./routes/analyzeSkin');
const melanomaRoute = require('./routes/melanoma'); // ✅ NEW

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
app.use('/api', analyzeRoute);
app.use('/api/melanoma', melanomaRoute); // ✅ NEW

// Root route
app.get('/', (req, res) => {
  res.send('SkinSpectrum API is running...');
});

// Facebook OAuth redirect handler — replaces broken auth.expo.io proxy
// This serves a tiny HTML page that reads the hash fragment (access_token)
// and redirects to the app's custom scheme deep link
app.get('/auth/facebook/redirect', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Sign-in Complete</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: sans-serif; text-align: center; padding: 40px; color: #333; }
    .btn { 
      display: inline-block; padding: 12px 24px; background: #1877f2; color: white; 
      text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;
    }
  </style>
</head>
<body>
  <h2>Almost there!</h2>
  <p>If you are not redirected automatically, please tap the button below:</p>
  <a id="redirect-btn" class="btn" href="#">Return to SkinSpectrum</a>

  <script>
    var hash = window.location.hash;
    if (hash) {
      // Try multiple possible return schemes for Expo Go vs Built App
      var expoUrl = 'exp://' + window.location.host + '/--/expo-auth-session' + hash;
      var customUrl = 'skinspectrum-fyp://expo-auth-session' + hash;
      
      // Update the button
      var btn = document.getElementById('redirect-btn');
      btn.href = expoUrl;
      
      // Try automatic redirect to Expo Go first (most likely for development)
      setTimeout(function() {
        window.location.href = expoUrl;
        // Fallback to custom scheme after 1 second if still on page
        setTimeout(function() {
          window.location.href = customUrl;
        }, 1000);
      }, 500);
    } else {
      document.body.innerHTML = '<h2>Authentication Failed</h2><p>No token received. Please go back and try again.</p>';
    }
  </script>
</body>
</html>`);
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