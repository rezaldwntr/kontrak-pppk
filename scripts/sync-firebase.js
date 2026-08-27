/**
 * sync-firebase.js
 *
 * Script sinkronisasi data Firestore dari Firebase Production -> Firebase Staging.
 *
 * CARA PAKAI:
 *   1. Pastikan sudah mengisi file .env.sync (lihat .env.sync.example)
 *   2. Install dependency sekali saja: npm install firebase-admin
 *   3. Jalankan: node scripts/sync-firebase.js
 *
 * CATATAN:
 *   - Data di Firebase Staging akan DITIMPA oleh data dari Production.
 *   - Data Production TIDAK pernah diubah oleh script ini.
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function loadEnvSync() {
  const envPath = path.join(__dirname, "..", ".env.sync");
  if (!fs.existsSync(envPath)) {
    console.error("\n ERROR: File .env.sync tidak ditemukan!");
    console.error("   Salin .env.sync.example menjadi .env.sync dan isi kredensialnya.\n");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    env[key.trim()] = rest.join("=").trim().replace(/^["'"'"']|["'"'"']$/g, "");
  }
  return env;
}

function initFirebase(env) {
  const prodApp = initializeApp({
    credential: cert({
      projectId:   env.PROD_PROJECT_ID,
      clientEmail: env.PROD_CLIENT_EMAIL,
      privateKey:  env.PROD_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  }, "production");

  const stagingApp = initializeApp({
    credential: cert({
      projectId:   env.STAGING_PROJECT_ID,
      clientEmail: env.STAGING_CLIENT_EMAIL,
      privateKey:  env.STAGING_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  }, "staging");

  return {
    dbProd:    getFirestore(prodApp),
    dbStaging: getFirestore(stagingApp),
  };
}

// Sesuaikan dengan nama-nama collection Firestore Anda
const COLLECTIONS_TO_SYNC = [
  "pegawai",
  "settings",
  "templates",
  "users",
];

async function syncCollection(dbProd, dbStaging, collectionName) {
  process.stdout.write(`  Collection: ${collectionName} ... `);
  const snapshot = await dbProd.collection(collectionName).get();
  if (snapshot.empty) {
    console.log("kosong / tidak ditemukan, dilewati.");
    return 0;
  }

  // Tulis dalam batch (maks 500 per batch)
  const docs = snapshot.docs;
  const BATCH_SIZE = 400;
  let total = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = dbStaging.batch();
    docs.slice(i, i + BATCH_SIZE).forEach(doc => {
      const ref = dbStaging.collection(collectionName).doc(doc.id);
      batch.set(ref, doc.data());
    });
    await batch.commit();
    total += Math.min(BATCH_SIZE, docs.length - i);
  }
  console.log(`${total} dokumen disalin.`);
  return total;
}

async function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

async function main() {
  console.log("\n=== SYNC FIREBASE: Production -> Staging ===\n");
  console.log("PERHATIAN: Data di Firebase Staging akan DITIMPA.");
  console.log("Firebase Production hanya DIBACA, tidak diubah.\n");

  const env = loadEnvSync();
  console.log(`  Source  (Production): ${env.PROD_PROJECT_ID}`);
  console.log(`  Target  (Staging)   : ${env.STAGING_PROJECT_ID}`);
  console.log(`  Collections         : ${COLLECTIONS_TO_SYNC.join(", ")}\n`);

  const answer = await confirm('Lanjutkan sinkronisasi? (ketik "ya" untuk lanjut): ');
  if (answer !== "ya") {
    console.log("\nSinkronisasi dibatalkan.\n");
    process.exit(0);
  }

  const { dbProd, dbStaging } = initFirebase(env);
  console.log("\nMemulai sinkronisasi...\n");
  let total = 0;

  for (const col of COLLECTIONS_TO_SYNC) {
    try {
      total += await syncCollection(dbProd, dbStaging, col);
    } catch (err) {
      console.error(`  GAGAL sync "${col}": ${err.message}`);
    }
  }

  console.log(`\nSelesai! Total ${total} dokumen disinkronkan ke Firebase Staging.`);
  process.exit(0);
}

main().catch(err => {
  console.error("\nError:", err.message);
  process.exit(1);
});
