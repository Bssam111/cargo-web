/**
 * One-time script to create the CarGo admin account.
 * Run from the cargo-portal directory:
 *   node scripts/create-admin.mjs
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env.local');
if (!existsSync(envPath)) {
  console.error('❌  .env.local not found. Create it from .env.local.example and fill in the Firebase values.');
  process.exit(1);
}

const env = {};
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const raw = trimmed.slice(idx + 1).trim();
  env[trimmed.slice(0, idx).trim()] = raw.replace(/^["']|["']$/g, '');
}

const missingKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
].filter(k => !env[k]);

if (missingKeys.length) {
  console.error('❌  Missing required env values in .env.local:');
  missingKeys.forEach(k => console.error(`   - ${k}`));
  process.exit(1);
}

// ── Firebase config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@cargo.sa';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME     = 'CarGo Admin';

// ── Create account ───────────────────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

console.log(`\n🔧  Creating admin account: ${ADMIN_EMAIL} …\n`);

import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';

async function writeFirestoreDoc(uid) {
  await setDoc(doc(db, 'users', uid), {
    email:     ADMIN_EMAIL,
    fullName:  ADMIN_NAME,
    phone:     '',
    role:      'admin',
    isActive:  true,
    createdAt: Timestamp.now(),
  }, { merge: true });
}

try {
  // Try creating a fresh account first
  const credential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  const uid = credential.user.uid;
  await writeFirestoreDoc(uid);

  console.log('✅  Admin account created successfully!');
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log(`   UID      : ${uid}`);
  console.log('\n   Sign in at → http://localhost:3000/login\n');
} catch (err) {
  if (err.code === 'auth/email-already-in-use') {
    // Account exists — sign in, update password, ensure Firestore doc
    console.log('ℹ️   Account already exists. Signing in and updating password…\n');
    try {
      const credential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      const uid = credential.user.uid;
      await updatePassword(credential.user, ADMIN_PASSWORD);
      await writeFirestoreDoc(uid);

      console.log('✅  Admin account updated successfully!');
      console.log(`   Email    : ${ADMIN_EMAIL}`);
      console.log(`   Password : ${ADMIN_PASSWORD}`);
      console.log(`   UID      : ${uid}`);
      console.log('\n   Sign in at → http://localhost:3000/login\n');
    } catch (signInErr) {
      if (signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/wrong-password') {
        console.log('⚠️   Account exists but password is different.');
        console.log('    → Go to Firebase Console → Authentication → Users');
        console.log(`    → Find ${ADMIN_EMAIL} → ⋮ → Edit user → set password to: ${ADMIN_PASSWORD}\n`);
      } else {
        console.error('❌  Sign-in error:', signInErr.message);
      }
    }
  } else {
    console.error('❌  Error:', err.message, `(${err.code})`);
  }
}

process.exit(0);
