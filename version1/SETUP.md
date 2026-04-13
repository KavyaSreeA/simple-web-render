# Big "O" Minds – Setup Guide

Complete guide to configure Firebase, Razorpay, and EmailJS.

---

## 1. Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Name it (e.g. `bigominds`) and follow the steps
4. Once created, click the **Web** icon (`</>`) to add a web app
5. Register the app (name: `Big O Minds Web`)
6. **Copy the config object** — you'll need it in step 1c

### Enable Firestore

1. In Firebase Console → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **production mode**
4. Select a region close to your users
5. Go to **Rules** tab and paste the contents of `firestore.rules` from this project

### Enable Authentication

1. In Firebase Console → **Build → Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Go to **Users** tab → **Add user**
6. Create your admin account (e.g. `admin@bigominds.com` / your-password)

### Add Config to Project

Open `firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",        // from Firebase console
  authDomain:        "bigominds.firebaseapp.com",
  projectId:         "bigominds",
  storageBucket:     "bigominds.firebasestorage.app",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

---

## 2. Razorpay Setup

### Create Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up and complete KYC
3. Go to **Settings → API Keys**
4. Generate a new key pair

### Configure

**Client-side** – Open `payment-service.js`:

```js
var RAZORPAY_CONFIG = {
  keyId: 'rzp_test_xxxxx',    // Your Key ID
  // ...
};
```

**Server-side** – Edit `server/.env`:

```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

> Use `rzp_test_` keys for testing, `rzp_live_` for production.

---

## 3. EmailJS Setup

### Create Account

1. Go to [EmailJS](https://www.emailjs.com) and sign up (free tier: 200 emails/month)
2. Go to **Email Services** → **Add New Service**
3. Connect your Gmail/Outlook (follow the instructions)
4. Note your **Service ID**

### Create Email Template

1. Go to **Email Templates** → **Create New Template**
2. Set the **Subject** to: `Registration Confirmed – {{event_title}}`
3. Set the **Body** to:

```
Hello {{to_name}},

You're registered for {{event_title}}!

Confirmation ID: {{confirmation_id}}
Date: {{event_date}}
Location: {{event_location}}
Amount: {{amount}}

We're excited to see you there.

Warm regards,
Big "O" Minds
```

4. Note your **Template ID**

### Get Public Key

1. Go to **Account** → Copy your **Public Key**

### Configure

Open `email-service.js`:

```js
const EMAIL_CONFIG = {
  serviceId:  'service_xxxxx',     // Your Service ID
  templateId: 'template_xxxxx',    // Your Template ID
  publicKey:  'xxxxxxxxxxxxx',     // Your Public Key
};
```

---

## 4. Running the App

```bash
cd server
npm install
node server.js
```

Open `http://localhost:3000`

---

## 5. Firebase Hosting (Optional)

To deploy to Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to: ..  (parent folder)
# Configure as single-page app: No
firebase deploy
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                   Browser                    │
│                                              │
│  index.html          turning-point.html      │
│  events.html         admin.html              │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Firebase  │  │ Razorpay │  │ EmailJS  │   │
│  │ Firestore │  │ Checkout │  │  Client  │   │
│  │ + Auth    │  │          │  │          │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘   │
└────────┼─────────────┼─────────────┼────────┘
         │             │             │
    ┌────▼────┐   ┌────▼────┐  ┌────▼────┐
    │Firebase │   │Razorpay │  │EmailJS  │
    │  Cloud  │   │ Server  │  │ Server  │
    └─────────┘   └─────────┘  └─────────┘
```

All data flows through Firebase Firestore.
Payments are processed by Razorpay.
Emails are sent via EmailJS (client-side).
Express server is optional (for Razorpay order creation in production).
