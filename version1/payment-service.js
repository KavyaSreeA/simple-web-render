/* ════════════════════════════════════════════════════════════
   PAYMENT SERVICE  –  Razorpay Integration
   ──────────────────────────────────────────────────────────
   HOW TO SET UP:
   1. Go to https://dashboard.razorpay.com and create an account
   2. Get your Key ID from Settings → API Keys
   3. For production: set up the backend server for order creation
   ══════════════════════════════════════════════════════════ */

var RAZORPAY_CONFIG = {
  keyId: 'YOUR_RAZORPAY_KEY_ID',
  currency: 'INR',
  companyName: 'Big "O" Minds',
  companyLogo: 'assets/logo1.png',
  theme: '#7ba7bc',
};

function isRazorpayConfigured() {
  return RAZORPAY_CONFIG.keyId !== 'YOUR_RAZORPAY_KEY_ID' && typeof Razorpay !== 'undefined';
}

/**
 * Initiate Razorpay payment
 * @param {Object} opts
 * @param {number} opts.amount     – Amount in rupees
 * @param {string} opts.eventTitle – Event name
 * @param {string} opts.name       – Customer name
 * @param {string} opts.email      – Customer email
 * @param {string} opts.phone      – Customer phone
 * @param {Function} opts.onSuccess – Called with payment response
 * @param {Function} opts.onFailure – Called on payment failure
 */
function initiatePayment(opts) {
  if (!isRazorpayConfigured()) {
    console.log('Razorpay not configured. Simulating payment...');
    setTimeout(function() {
      opts.onSuccess({
        razorpay_payment_id: 'mock_pay_' + Date.now(),
        razorpay_order_id: 'mock_order_' + Date.now(),
        status: 'mock_success'
      });
    }, 1500);
    return;
  }

  var options = {
    key: RAZORPAY_CONFIG.keyId,
    amount: opts.amount * 100, // Razorpay expects paise
    currency: RAZORPAY_CONFIG.currency,
    name: RAZORPAY_CONFIG.companyName,
    description: opts.eventTitle,
    image: RAZORPAY_CONFIG.companyLogo,
    handler: function(response) {
      opts.onSuccess(response);
    },
    prefill: {
      name: opts.name,
      email: opts.email,
      contact: opts.phone,
    },
    theme: {
      color: RAZORPAY_CONFIG.theme,
    },
    modal: {
      ondismiss: function() {
        if (opts.onFailure) opts.onFailure({ reason: 'Payment cancelled by user' });
      }
    }
  };

  // If backend is running, create an order first (recommended for production)
  fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: opts.amount, eventTitle: opts.eventTitle })
  })
  .then(function(r) { return r.json(); })
  .then(function(order) {
    if (order.id) options.order_id = order.id;
    var rzp = new Razorpay(options);
    rzp.open();
  })
  .catch(function() {
    // No backend — open Razorpay without order_id (test mode)
    var rzp = new Razorpay(options);
    rzp.open();
  });
}
