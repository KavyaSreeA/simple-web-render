/* ════════════════════════════════════════════════════════════
   FIREBASE CONFIG  –  Big "O" Minds
   ──────────────────────────────────────────────────────────
   HOW TO SET UP:
   1. Go to https://console.firebase.google.com
   2. Create a new project (or use existing)
   3. Enable Firestore Database (start in test mode)
   4. Enable Authentication → Email/Password
   5. Go to Project Settings → General → Your apps → Web
   6. Copy your config values below
   ══════════════════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const db   = firebase.firestore();
const auth = firebase.auth();

/* ── Firestore Collections ────────────────────────────────── */
const DB = {
  events:        db.collection('events'),
  journeys:      db.collection('journeys'),
  registrations: db.collection('registrations'),
};

/* ── Helper: Check if Firebase is configured ──────────────── */
function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY';
}

/* ── Helper: Timestamp ────────────────────────────────────── */
function serverTimestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

/* ── Helper: Generate ID ──────────────────────────────────── */
function generateId(prefix) {
  return (prefix || 'id') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}
