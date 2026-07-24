import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Validasi env variables sebelum inisialisasi Firebase
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(key => !import.meta.env[key]);

if (missingVars.length > 0) {
  // Tampilkan pesan error yang jelas di halaman daripada blank putih
  document.body.innerHTML = `
    <div style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1a1a2e;color:#e2e8f0;">
      <div style="text-align:center;padding:40px;background:#16213e;border-radius:12px;border:1px solid #e53e3e;max-width:500px;">
        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
        <h2 style="color:#fc8181;margin-bottom:12px;">Konfigurasi Firebase Tidak Lengkap</h2>
        <p style="color:#a0aec0;margin-bottom:16px;">Environment variable berikut belum diatur di Vercel:</p>
        <code style="background:#2d3748;padding:12px;border-radius:8px;display:block;text-align:left;font-size:13px;color:#68d391;">
          ${missingVars.join('<br>')}
        </code>
        <p style="color:#718096;margin-top:16px;font-size:13px;">Tambahkan di Vercel → Settings → Environment Variables, lalu Redeploy.</p>
      </div>
    </div>
  `;
  throw new Error(`Missing Firebase env vars: ${missingVars.join(', ')}`);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
