# Dokumentasi Aplikasi: E-Kontrak PPPK Terintegrasi

## Informasi Meta Proyek

- Versi Protokol: v2.5.0 (Patuh pada Semantic Versioning)
- Fase Eksekusi: Lingkungan Produksi Terkelola (Stable)
- Pusat Tata Kelola: Divisi Administrasi & Tata Usaha Kepegawaian

Dokumentasi ini berfungsi sebagai *Single Source of Truth* (Sumber Kebenaran Tunggal). Dirancang dengan mereplika model klasifikasi informasi Diátaxis dan mematuhi panduan kualitas ISO/IEC/IEEE 26514, dokumen ini memberikan orientasi esensial operasional sistem Manajemen Kontrak PPPK secara otonom di sisi klien (Client-Side).

---

## Daftar Konten Hierarkis

- **1. Inisiasi dan Latar Belakang (Explanation)**
- **2. Arsitektur dan Toleransi Desain (Reference)**
- **3. Prasyarat Konfigurasi Sistem**
- **4. Panduan Penggunaan Aplikasi (Tutorials & How-To)**
- **5. Spesifikasi Teknis & Logika Eksekusi (Reference)**
- **6. Histori Rilis (Changelog)**

---

## 1. Inisiasi dan Latar Belakang (Explanation)

Platform **E-Kontrak PPPK** diinisiasi untuk meresolusi kompleksitas administratif dan inefisiensi waktu dalam mengelola siklus hidup Perjanjian Kerja Pegawai Pemerintah dengan Perjanjian Kerja (PPPK). 

Sebelumnya, pelacakan masa kedaluwarsa kontrak dan Batas Usia Pensiun (BUP) dilakukan secara manual yang rentan terhadap galat komputasi manusia (*human error*). Sistem ini secara revolusioner mendesentralisasikan seluruh proses perhitungan kalender, rendering dokumen fisik (.docx), hingga visualisasi analitik langsung ke dalam peramban web pengguna tanpa membutuhkan peladen (server) sentral.

**Target Audiens Operasional:**
- **Analis Kepegawaian (HR):** Untuk pemantauan masa aktif kontrak, BUP, dan eksekusi perpanjangan massal.
- **Administrator Sistem:** Untuk pemeliharaan basis data lokal dan pembaruan templat perjanjian kerja (SK & Kontrak).

---

## 2. Arsitektur dan Toleransi Desain (Reference)

Ekosistem mengadopsi arsitektur *Standalone Client-Side Single Page Application (SPA)*. Ini menjamin aplikasi dapat beroperasi di lingkungan *air-gapped* (tanpa koneksi internet publik), memastikan kerahasiaan data kepegawaian (PII - Personally Identifiable Information) terkunci secara lokal di perangkat klien (Local Storage).

### 2.1 Kompleksitas Sistem & Pustaka Dependensi Utama
Fungsi manipulasi dan analitik dikendalikan melalui injeksi pustaka-pustaka JavaScript yang dikompilasi secara *runtime*:
- **PizZip & Docxtemplater:** Mesin utama untuk memanipulasi, membaca, dan mensintesis variabel objek (JSON) ke dalam ruang XML `.docx` secara instan (*Client-side document generation*).
- **SheetJS (XLSX):** Pustaka untuk mengurai matriks *spreadsheet* (Excel/CSV) menjadi array JSON relasional secara sekuensial.
- **Chart.js:** Mesin perender grafik vektor berbasis HTML5 Canvas untuk menyajikan demografi kepegawaian (Tenaga Guru, Kesehatan, Teknis).
- **FileSaver.js:** Orkestrator proses penyimpanan (*Blob routing*) *output* sistem ke penyimpanan fisik lokal PC.

### 2.2 Model Caching (Local Storage)
Basis data dieksekusi secara asinkron (I/O non-blocking) ke dalam *Web Storage API* peramban dengan kunci (keys) utama:
- `pppkData`: Alokasi utama JSON.
- `extensionHistory`: Log kronologis aksi.
- `template_sk_f4`, `template_paruh_f4`, dll.: *Base64 string blobs* untuk retensi file cetak.

---

## 3. Prasyarat Konfigurasi Sistem

Karena sistem beroperasi independen secara klien murni, utilitas perangkat lunak yang disyaratkan sangat minimalistik:

| Komponen Infrastruktur | Revisi Versi Minimum | Deskripsi Fungsional |
| :--- | :--- | :--- |
| Peramban Web (Browser) | Chrome v80+, Edge v88+, Firefox v85+ | Eksekusi mesin JavaScript V8/SpiderMonkey modern untuk modul ES6, LocalStorage kapasitas 5MB+. |
| Sistem Operasi (Client) | Windows 10/11, macOS, Linux | Untuk komputasi I/O File (Unggah dan Unduh *Blob* secara masif). |
| Microsoft Office Suite | Word 2013+ | Untuk membuka dokumen tergenerasi (SK dan Kontrak .docx). |

*(Tidak ada instalasi Node.js Runtime, Docker, atau PostgreSQL yang diwajibkan untuk pengoperasian final pengguna).*

---

## 4. Panduan Penggunaan Aplikasi (Tutorials & How-To)

Dokumentasi *How-To* ini berorientasi murni pada pemecahan masalah operasional kepegawaian.

### 4.1 Menginisialisasi Basis Data (Import File)
Untuk memasukkan data pertama kali atau memperbarui daftar pegawai:
1. Klik tombol **<i class="fa-solid fa-file-import"></i> Impor Data** pada panel kanan atas.
2. Siapkan fail rekap data pegawai dalam format Excel (`.xlsx` atau `.xls`). *Catatan: Pastikan penamaan kolom (Header) di baris pertama Excel Anda identik dengan struktur variabel sistem (misal: "NIP BARU", "STATUS_PPPK", "JENIS_PPPK", dll).*
3. Unggah file tersebut ke dalam zona seret (*dropzone*).
4. Pilih metode injeksi:
   - **Ganti Keseluruhan (Timpa):** Menghapus *cache* lama dan menggunakan data absolut yang baru.
   - **Gabungkan Data (Append):** Mengawinkan data baru tanpa memusnahkan indeks NIP pegawai lama.
5. Eksekusi "Proses Impor".

### 4.2 Manajemen & Perpanjangan Kontrak Massal
Apabila muncul indikator **Peringatan Kontrak Habis/Hampir Habis** di *Dashboard*:
1. Transisi navigasi ke tab **Perpanjangan Kontrak**.
2. Anda dapat memanfaatkan fitur **Saringan (Filter) Jenis PPPK** (Reguler / Paruh Waktu) untuk menghindari pencampuran dokumen.
3. Centang modul kotak (Checkbox) pada pegawai yang ingin diperpanjang secara kolektif (Batch processing).
4. Klik tombol **Perpanjang Massal**. Sistem secara otonom akan menghitung tanggal akhir (*TMT Pensiun* atau jatuh tempo 1/5 tahun).
5. Pasca-persetujuan (Disetujui), kembali seleksi pegawai tersebut, lalu klik **Gabung & Unduh Kontrak (.docx)** untuk mengekstraksi seluruh perjanjian kerja yang tergabung dalam satu lampiran *Word* utuh.

### 4.3 Registrasi Template Dokumen Word Baru
1. Buka Tab **Pengaturan & Templat**.
2. Fokus pada segmentasi jenis kertas yang Anda operasikan (misal: *Kontrak PPPK F4*).
3. Seret templat fail `.docx` yang telah dibubuhi tag kurung kurawal ganda (contoh: `{{NAMA}}`, `{{NIP}}`).
4. Klik **Simpan Pengaturan**. Fail tersebut akan dienkripsi menjadi *Base64* dan tertanam permanen di dalam sistem komputer.

---

## 5. Spesifikasi Teknis & Logika Eksekusi (Reference)

Referensi ini ekuivalen dengan panduan teknis mendalam tentang algoritma dan arsitektur internal dari kode (Source Code).

### 5.1 Mesin Waktu Kontrak (Contract Engine: `calculateContractPeriod`)
Logika *frontend* mendasarkan perulangan pada konstanta waktu presisi tinggi (epoch time).

**A. Parameter Input & Eksekusi Kondisional:**
Fungsi mencegat objek pegawai (`item`) dan mengevaluasi Properti `JENIS_PPPK`:
- Jika bernilai `"PPPK Paruh Waktu"`, koefisien iterasi `contractYears = 1`.
- Jika bernilai lazim (Reguler), koefisien iterasi `contractYears = 5`.

**B. Algoritma Batas Usia Pensiun (BUP Limit):**
Mengevaluasi grup kerja via `getKelompokPegawai()`. 
- Tenaga Guru / Nakes Spesialis: Modulus BUP 60 Tahun.
- Tenaga Teknis / Lainnya: Modulus BUP 58 Tahun.
- Apabila proyeksi 5 tahun (atau 1 tahun) melampaui `retireEndDate` (hari terakhir bulan kelahiran di tahun pensiun), siklus kontrak secara agresif dikunci tepat pada tanggal `retireEndDate` (pemenggalan kontrak).

### 5.2 Tata Letak Fitur Pemotongan Dokumen Parsial (Section Parsing)
Docxtemplater menggunakan *Looping Conditionals*. Jika pengguna mengklik fitur cetak spesifik (misal: "Tanda Tangan Saja"), sistem mengonstruksi *Payload JSON* bool:
```json
{
  "perjanjian": false,
  "tandatangan": true
}
```
Sistem akan membuang blok XML Word yang terapit oleh sintaks pembatas `{{#perjanjian}} ... {{/perjanjian}}` secara mulus tanpa meninggalkan spasi kosong, berkat ekstensi *paragraph looping*.

---

## 6. Histori Rilis (Changelog)

Catatan kronologis perubahan siklus (Semantic Versioning).

### [v2.5.0] - 2026-07-05
**Pembaruan Fitur (Added):**
- Restrukturisasi arsitektur dokumentasi mengadopsi standar internasional (ISO/IEC/IEEE 2651x) dan kerangka Diátaxis.
- Menambahkan kapabilitas penyaringan kolektif (*Bulk Filtering*) berdasarkan atribut spesifik "Jenis PPPK" pada antarmuka *Dashboard Perpanjangan*.

**Mitigasi dan Perbaikan Kutu (Fixed):**
- Resolusi fatal logika *Batas Usia Pensiun (BUP)* pada komponen antarmuka dasbor. Atribut TMT Awal dan Akhir kontrak yang kadaluwarsa kini dirangkum (merged) menjadi matriks `TMT Pensiun`.
- Injeksi otomatis *override* mutlak status *Badge* antarmuka menjadi "Pensiun" ketika algoritma mendeteksi blok masa aktif terkunci oleh tanggal `retireEndDate`.
- Penghapusan seluruh rujukan tekstual harfiah (hardcoded) statis berbunyi "5 Tahun" dari *prompt* konfirmasi sistem dan rendering log, menggantikannya dengan konstruksi dinamis yang menghormati parameter `JENIS_PPPK` (1 Tahun untuk Paruh Waktu, 5 Tahun untuk Reguler).

### [v2.4.0] 
**Pembaruan Historis (Legacy):**
- Implementasi dukungan entitas `PPPK Paruh Waktu` yang melibatkan diferensiasi siklus kontrak (1-Year Cycle).
- Manipulasi ukuran dimensi halaman (*Page Size Layout*) untuk sinkronisasi F4 - A4 secara seketika (*real-time*).
- Fitur *Append Data Import* untuk menghindari penimpaan destruktif.

Semua integrasi ini menempatkan dokumentasi tidak sekadar sebagai lampiran mati, melainkan infrastruktur presisi yang mendampingi pengembangan sistem.

### Rilis 1.2.0 (Juli 2026)
- **Migrasi Cloud Firebase**: Sistem login admin terintegrasi dengan Firebase Auth, serta penyimpanan data PPPK dan Template Surat secara tersentralisasi melalui sinkronisasi Firestore.
- **Fix**: Resolusi Bug durasi masa perpanjangan kontrak otomatis (Paruh Waktu = 1 Tahun, Reguler = 5 Tahun).
