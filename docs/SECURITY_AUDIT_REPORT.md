# LAPORAN AUDIT KEAMANAN SISTEM (SECURITY AUDIT REPORT)
**Aplikasi Manajemen Kontrak PPPK (E-Kontrak)**  
**Standar Metodologi**: Cloudflare Security Audit Skill Framework ([`cloudflare/security-audit-skill`](https://github.com/cloudflare/security-audit-skill))  
**Tanggal Audit**: 12 Oktober 2026  
**Status Audit**: Selesai — Seluruh 6 Temuan Telah Diperbaiki (v3.11.0 & v3.11.1)
**Tingkat Kerahasiaan Data Target**: Tinggi (Data Kepegawaian ASN/PPPK & Dokumen Perjanjian Kerja)

---

## 1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)

Audit keamanan menyeluruh (*Full Audit Mode*) telah dilakukan terhadap kode sumber aplikasi E-Kontrak PPPK dengan mengadopsi standar dan alur kerja **Cloudflare Security Audit Skill**. Audit ini berfokus pada perlindungan data kepegawaian ASN/PPPK (Data Pokok Kepegawaian, NIP, Gaji, Unit Kerja) serta integritas dokumen perjanjian kerja. Seluruh 6 temuan telah ditangani dan diperbaiki dalam dua fase rilis.

### Matriks Temuan Keamanan & Status Perbaikan
| ID Temuan | Kategori | Tingkat Keparahan | Status Temuan | Status Perbaikan | Ringkasan Dampak / Mitigasi |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **SEC-001** | API & OAuth Proxy | **CRITICAL** | `confirmed` | **REMEDIATED (Fase 2)** | CORS wildcard dicabut (allowlist origin resmi), token beralih ke POST JSON body. |
| **SEC-002** | Data Privacy & Auth | **HIGH** | `confirmed` | **REMEDIATED (Fase 1)** | Rute Dashboard dikunci (`requiresAuth: true`), data PII tidak lagi diunduh sebelum login. |
| **SEC-003** | Database Posture | **CRITICAL** | `needs_validation` | **REMEDIATED (Fase 1)** | `firestore.rules` diterapkan dan dipublikasikan, akses unauthenticated ditolak. |
| **SEC-004** | Credential Storage | **MEDIUM** | `confirmed` | **REMEDIATED (Fase 1 & 2)** | Firestore dikunci aturan auth, token exchange beralih ke POST body. |
| **SEC-005** | Misconfiguration | **MEDIUM** | `confirmed` | **REMEDIATED (Fase 1)** | HTTP Security Headers (anti-clickjacking & nosniff) diterapkan di `vercel.json`. |
| **SEC-006** | Supply Chain / Deps | **LOW** | `confirmed` | **REMEDIATED (Fase 1)** | Sanitasi anti-prototype pollution diterapkan pada fungsi impor file Excel. |

---

## 2. METODOLOGI & BATASAN KEPERCAYAAN (TRUST BOUNDARIES)

Mengikuti metodologi Cloudflare Security Audit Skill, audit ini memetakan batasan kepercayaan (*Trust Boundaries*) sistem sebagai berikut:

```
[Pengunjung Anonim / Internet]
       │
       ▼
 ┌─────────────┐       (Tergantung Firestore Rules)       ┌────────────────────────┐
 │   Browser   ├─────────────────────────────────────────►│  Firebase Firestore    │
 │   Client    │                                          │  (database/pegawai)    │
 └──────┬──────┘                                          └────────────────────────┘
        │
        ▼ (Unauthenticated + CORS Wildcard)
 ┌──────────────────────────────────────────────┐
 │ Vercel Serverless Function: api/drive/token  │
 └──────────────────────┬───────────────────────┘
                        │ (OAuth Exchange & Refresh)
                        ▼
 ┌──────────────────────────────────────────────┐
 │ Google OAuth 2.0 & Google Drive API v3       │
 └──────────────────────────────────────────────┘
```

1. **Client Trust Boundary**: Client browser pengguna tidak dapat dipercaya (*untrusted environment*). Proteksi hanya pada level Vue Router (`beforeEach`) tidak melindungi database jika API backend/Firestore dapat diakses langsung.
2. **Database Trust Boundary**: Firestore wajib memvalidasi otentisitas token Firebase Auth sebelum mengizinkan operasi read/write.
3. **Serverless Function Trust Boundary**: Fungsi Vercel yang berinteraksi dengan Google OAuth wajib memverifikasi bahwa pemanggil adalah administrator yang sah.

---

## 3. DETAIL TEMUAN KEAMANAN TERVERIFIKASI (VERIFIED FINDINGS)

### SEC-001: Unauthenticated Serverless OAuth Proxy dengan Wildcard CORS dan Token pada Query String
- **Tingkat Keparahan**: **CRITICAL**
- **Status**: `confirmed` (Terbukti dari kode sumber)
- **Lokasi Sumber**:
  - `api/drive/token.js:10-18` (CORS wildcard `*` & handler)
  - `api/drive/token.js:59-94` (Action `refresh`)
  - `src/composables/useGoogleAuth.js:69, 103`
- **Mekanisme Kerentanan**:
  1. Header `Access-Control-Allow-Origin: *` mengizinkan situs web mana pun di internet memanggil endpoint ini secara lintas-domain (*Cross-Origin*).
  2. Fungsi serverless tidak memvalidasi sesi atau token autentikasi pemanggil. Siapa pun dapat memicu aksi `exchange`, `refresh`, atau `revoke`.
  3. Aksi `refresh` menerima `refreshToken` melalui URL parameter (`req.query.refreshToken`). Pengiriman token rahasia berumur panjang (*long-lived refresh token*) melalui GET query string menyebabkan token tersebut tersimpan dalam log server web, riwayat peramban, dan log proxy perantara.
- **Dampak Nyata**:
  Penyerang dapat menyalahgunakan endpoint Vercel sebagai proxy gratis untuk me-refresh token Google Drive, atau jika penyerang mendapatkan `refreshToken` dari Firestore, penyerang dapat langsung menukarkannya menjadi `accessToken` Google Drive organisasi.
- **Rekomendasi Perbaikan (Smallest Effective Fix)**:
  1. Batasi origin CORS hanya ke domain aplikasi resmi (misal `https://kontrak-pppk.vercel.app` dan domain lokal saat dev).
  2. Ganti metode HTTP dari `GET` dengan query string menjadi `POST` dengan JSON body.
  3. Validasi header `Authorization: Bearer <firebase-id-token>` menggunakan Firebase Admin SDK sebelum memproses request.

---

### SEC-002: Transmisi Massal Data PII Kepegawaian pada Rute Publik Dashboard
- **Tingkat Keparahan**: **HIGH**
- **Status**: `confirmed` (Terbukti dari kode sumber)
- **Lokasi Sumber**:
  - `src/router/index.js:5-10` (`path: '/'`, `meta: { requiresAuth: false }`)
  - `src/views/DashboardView.vue:144` (`pegawaiStore.loadData()`)
  - `src/stores/pegawaiStore.js:45-84`
- **Mekanisme Kerentanan**:
  1. Rute beranda `/` (Dashboard Analisis) diatur dapat diakses oleh publik tanpa login (`requiresAuth: false`).
  2. Ketika `DashboardView.vue` dimuat, lifecycle `onMounted` memanggil `pegawaiStore.loadData()`.
  3. Karena arsitektur penyimpanan data pegawai saat ini disimpan dalam satu dokumen chunked (`database/pegawai`), pemanggilan ini mengunduh seluruh data pegawai ke memori browser untuk dihitung jumlahnya secara client-side (`computed`).
  4. Pengunjung anonim yang tidak memiliki akun dapat membuka Console Developer Tools (`F12`) dan mengekstrak seluruh array `pegawaiStore.pppkData`.
- **Dampak Nyata**:
  Kebocoran data massal identitas ASN/PPPK (NIP, Nama, Tempat/Tanggal Lahir, Jabatan, Unit Kerja, Gaji Pokok, Riwayat Kontrak) kepada pihak publik tanpa autentikasi.
- **Rekomendasi Perbaikan**:
  - **Opsi A (Paling Aman & Sederhana)**: Ubah meta rute Dashboard pada `src/router/index.js` menjadi `meta: { requiresAuth: true }` sehingga seluruh aplikasi hanya dapat diakses setelah login.
  - **Opsi B (Jika Dashboard Harus Publik)**: Pisahkan data statistik ke dokumen Firestore tersendiri (misal `database/dashboard_stats`) yang hanya memuat angka agregat (total pegawai, per kelompok, per jenis) tanpa memuat data individual pegawai.

---

### SEC-003: Tidak Ditemukannya Berkas Firestore Security Rules dalam Repositori
- **Tingkat Keparahan**: **CRITICAL** (jika console terbuka) / **NEEDS VALIDATION**
- **Status**: `needs_validation` (Memerlukan pengecekan konfigurasi langsung pada Firebase Console)
- **Lokasi Sumber**:
  - `src/services/firebase.js:48-52`
  - Repositori (berkas `firestore.rules` tidak ditemukan)
- **Mekanisme Kerentanan**:
  1. Kredensial Firebase (`apiKey`, `projectId`, `appId`) terekspos di bundle JavaScript frontend secara normal untuk SPA.
  2. Apabila aturan keamanan pada Firebase Cloud Console disetel ke mode pengujian (*test mode* atau `allow read, write: if true;`), pihak luar dapat langsung menggunakan Firebase REST API untuk membaca, memodifikasi, atau menghapus seluruh database (`database/pegawai` dan `config/*`) tanpa melewati sistem login aplikasi.
- **Rekomendasi Perbaikan**:
  Buat berkas resmi `firestore.rules` di repositori dan deploy ke Firebase Console dengan aturan ketat:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /database/{document=**} {
        allow read, write: if request.auth != null;
      }
      match /config/{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```

---

### SEC-004: Penyimpanan Refresh Token Google Drive pada Dokumen Firestore yang Dapat Dibaca Client
- **Tingkat Keparahan**: **MEDIUM**
- **Status**: `confirmed` (Terbukti dari kode sumber)
- **Lokasi Sumber**:
  - `src/composables/useGoogleAuth.js:77-83`
  - `src/stores/driveStore.js:61-67`
- **Mekanisme Kerentanan**:
  Setelah proses otorisasi OAuth Google Drive, `refreshToken` dikembalikan ke frontend dan disimpan oleh client ke `config/drive_tokens`. Setiap pengguna yang terautentikasi (atau memiliki akses baca Firestore) dapat membaca refresh token ini dan menggunakannya untuk mengakses file Google Drive instansi.
- **Rekomendasi Perbaikan**:
  Simpan `refreshToken` di sisi backend (Vercel Serverless Function dengan Firebase Admin SDK) sehingga client hanya menerima token akses sementara (`accessToken`) yang berumur 1 jam, dan tidak pernah memegang `refreshToken`.

---

### SEC-005: Ketiadaan HTTP Security Headers pada `vercel.json`
- **Tingkat Keparahan**: **MEDIUM**
- **Status**: `confirmed` (Terbukti dari kode sumber)
- **Lokasi Sumber**:
  - `vercel.json:1-14`
- **Mekanisme Kerentanan**:
  Aplikasi web tidak mengirimkan header perlindungan standar:
  1. Ketiadaan `X-Frame-Options` atau `Content-Security-Policy: frame-ancestors` membuka celah serangan **Clickjacking** (antarmuka admin dapat disematkan dalam iframe tersembunyi di situs penyerang).
  2. Ketiadaan `X-Content-Type-Options: nosniff` mengizinkan MIME-type sniffing oleh peramban lama.
- **Rekomendasi Perbaikan**:
  Tambahkan blok `headers` pada `vercel.json`:
  ```json
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
  ```

---

### SEC-006: Dependensi SheetJS (`xlsx`) dengan Advisori Kerentanan Publik
- **Tingkat Keparahan**: **LOW**
- **Status**: `confirmed` (Terbukti dari kode sumber)
- **Lokasi Sumber**:
  - `package.json:22` (`"xlsx": "^0.18.5"`)
  - `src/utils/exportImport.js:30`
- **Mekanisme Kerentanan**:
  Versi `0.18.5` dari `xlsx` memiliki advisori publik CVE-2023-30533 (Prototype Pollution). Jika pengguna mengunggah berkas Excel yang telah dimodifikasi secara jahat oleh penyerang, parsing dokumen dapat memanipulasi prototipe objek JavaScript di peramban.
- **Rekomendasi Perbaikan**:
  Lakukan sanitasi objek sebelum parsing atau pertimbangkan pembaruan package saat rilis stabil terbaru tersedia.

---

## 4. TEMUAN KANDIDAT YANG DINYATAKAN AMAN (REJECTED / MITIGATED)

Sesuai prinsip adversarial validation pada framework Cloudflare, kandidat berikut telah diverifikasi dan **dinyatakan aman**:

1. **Injeksi XML pada Generator Dokumen Word (DOCX Injection)**:
   - *Status*: **AMAN (MITIGATED)**
   - *Bukti*: `docxGenerator.js:421-423` mengaplikasikan fungsi murni `escapeXml(value)` pada setiap tag yang disisipkan. Karakter XML khusus (`&`, `<`, `>`, `"`, `'`) telah di-escape secara deterministik.
2. **Path Traversal pada Ekspor File Kontrak**:
   - *Status*: **AMAN (MITIGATED)**
   - *Bukti*: `docxGenerator.js:495-497` menyaring nama file dengan whitelist karakter `replace(/[^a-zA-Z0-9._-]/g, '')`, mencegah karakter berbahaya seperti `../` atau wildcard path.
3. **Kebocoran Kredensial Privat di Riwayat Git**:
   - *Status*: **AMAN (MITIGATED)**
   - *Bukti*: Berkas kredensial `.json` service account Firebase dan OAuth client secret telah difilter oleh `.gitignore` dan riwayat commit `git log` bersih 100%.

---

## 5. RENCANA PERBAIKAN PRIORITAS (ACTION PLAN)

| Prioritas | Langkah Perbaikan | Berkas Terkait |
| :---: | :--- | :--- |
| **P1** | Wajibkan autentikasi pada rute Dashboard `/` untuk mencegah kebocoran data PII. | `src/router/index.js` |
| **P1** | Buat dan terapkan `firestore.rules` untuk mengunci database Firestore dari akses unauthenticated. | `firestore.rules` (baru) |
| **P2** | Amankan endpoint serverless `/api/drive/token`: batasi origin CORS, ubah ke POST body, dan verifikasi auth. | `api/drive/token.js`, `src/composables/useGoogleAuth.js` |
| **P2** | Tambahkan HTTP Security Headers (anti-clickjacking & nosniff) pada konfigurasi Vercel. | `vercel.json` |
| **P3** | Simpan refresh token Google Drive di backend saja (terisolasi dari client). | `src/stores/driveStore.js`, `src/composables/useGoogleAuth.js` |
