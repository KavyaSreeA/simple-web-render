/* ════════════════════════════════════════════════════════════
   BIG "O" MINDS  –  Express Server
   Serves static files + Razorpay order creation
   ══════════════════════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'bigominds2025';

app.use(cors());
app.use(express.json());

/* ══════════════════════════════════════════════════════════
   ADMIN ROUTE GUARD
   Access admin only via: /admin?key=YOUR_SECRET
   Without the correct key, returns 404 (looks like page doesn't exist)
   ══════════════════════════════════════════════════════════ */
app.get('/admin.html', (req, res) => {
  if (req.query.key === ADMIN_SECRET) {
    return res.sendFile(path.join(__dirname, '..', 'admin.html'));
  }
  res.status(404).send('<!DOCTYPE html><html><head><title>404</title></head><body><h1>Page not found</h1></body></html>');
});

app.use(express.static(path.join(__dirname, '..'), {
  index: 'index.html',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('admin.html')) {
      res.status(404).end();
    }
  }
}));

/* ══════════════════════════════════════════════════════════
   RAZORPAY – Order Creation (Server-side for security)
   ══════════════════════════════════════════════════════════ */

const RAZORPAY_KEY_ID     = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

app.post('/api/create-order', async (req, res) => {
  const { amount, eventTitle } = req.body;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return res.status(200).json({
      message: 'Razorpay not configured. Using client-side test mode.',
      testMode: true
    });
  }

  try {
    const Razorpay = require('razorpay');
    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'order_' + Date.now(),
      notes: { eventTitle: eventTitle || '' },
    });

    res.json(order);
  } catch (err) {
    console.error('Razorpay order error:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!RAZORPAY_KEY_SECRET) {
    return res.json({ verified: true, message: 'Test mode – no verification' });
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false, error: 'Signature mismatch' });
  }
});

/* ══════════════════════════════════════════════════════════
   STATIC FILE SERVING
   ══════════════════════════════════════════════════════════ */

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, '..', req.path);
  res.sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(__dirname, '..', 'index.html'));
  });
});

/* ── START ────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n  Big "O" Minds server running at http://localhost:${PORT}\n`);
  console.log(`  Pages:`);
  console.log(`    Home:          http://localhost:${PORT}/`);
  console.log(`    Turning Point: http://localhost:${PORT}/turning-point.html`);
  console.log(`    Events:        http://localhost:${PORT}/events.html`);
  console.log(`    Admin:         http://localhost:${PORT}/admin.html?key=${ADMIN_SECRET}`);
  console.log(`\n  Data: Firebase Firestore (configure in firebase-config.js)`);
  console.log(`  Payments: ${RAZORPAY_KEY_ID ? 'Razorpay configured' : 'Razorpay not configured (mock mode)'}`);
  console.log('');
});
