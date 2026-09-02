# Dokumentasi Pengembangan Aplikasi Manajemen Kontrak PPPK

Dokumen ini mencatat riwayat pembaruan, perbaikan bug, dan penambahan fitur pada aplikasi, khususnya di environment `staging`.

## [v3.5.0] - 2026-09-01 RILIS KE PRODUCTION

### Pembaruan UI/UX Menu Perpanjangan & Sidebar
- **Tab Menu Perpanjangan**: Memisahkan menu Perpanjangan Kontrak menjadi 2 tab, yaitu "Perpanjangan PPPK" dan "Perpanjangan PPPK Paruh Waktu" untuk membedakan kategori secara jelas.
- **Grafik Horizontal Bar Dinamis**: Menambahkan visualisasi grafik jumlah pegawai yang belum diperpanjang berdasarkan Unor Induk. Grafik bersifat pintar: jika semua pegawai dalam filter berada di Unor Induk yang sama (misal Dinas Pendidikan), grafik akan otomatis menampilkan pemecahan berdasarkan **Unor Atasan** (SD A, SMP B, dst). Tinggi grafik juga menyesuaikan banyaknya data secara dinamis agar tidak bertumpuk.
- **Penyederhanaan Filter**: Menghapus dropdown filter *Status Kontrak* dan *Jenis PPPK* di halaman Perpanjangan karena sudah terwakili secara otomatis oleh Tab dan logika halaman.
- **Interaksi Sidebar (Collapse)**: Menghapus tombol panah *absolute* yang terkesan kurang rapi. Jika sidebar mengecil, logo akan berubah menjadi *icon* panah pembesar saat di-*hover*. Jika sidebar membesar, tombol panah pengecil digabung (*inline*) di samping nama aplikasi.
- **Penyesuaian UI Kolom Berhenti**: Mengubah nama kolom *header* pada menu Diberhentikan menjadi "Keterangan Diberhentikan" dan memastikannya mendukung fitur Edit cepat (*inline edit*).
## [v3.4.0] - 2026-08-31 RILIS KE PRODUCTION

### Pembaruan Logika Kepegawaian & Perbaikan Bug
- **Status Diberhentikan**: Menyesuaikan regulasi status keaktifan PPPK terbaru. Status "Tidak Diperpanjang" dan "Meninggal" digabung ke dalam satu status utama yaitu **Diberhentikan**.
- **Keterangan Tambahan Diberhentikan**: Jika pegawai bersatus Diberhentikan, pengguna kini dapat memilih keterangan spesifik (Meninggal, Kontrak Tidak Diperpanjang, Mengundurkan Diri) di dalam form Edit (Detail Modal).
- **Tab Menu Pegawai**: Tab "Tidak Diperpanjang" pada menu Data PPPK otomatis disesuaikan namanya menjadi "Diberhentikan".
- **Bug Fix Anomali Jenis Kelamin**: Memperbaiki anomali di mana pegawai laki-laki tampil sebagai perempuan akibat ketidakcocokan *string* data. Sistem kini sangat akurat karena otomatis mengurai (parsing) Jenis Kelamin secara langsung dari digit ke-15 pada **NIP BARU** saat data diimpor, atau saat modal edit dibuka.

## [v3.3.0] - 2026-08-30 RILIS KE PRODUCTION

### Perbaikan Sistem Unduhan & Penggabungan Dokumen
- **Bug Fix Penomoran**: Memperbaiki logika `generateMergedDocx` yang sebelumnya menyebabkan urutan angka di "1 File Gabungan" saling bersambung (contoh: 1,2,3 di orang pertama menjadi 4,5,6 di orang kedua). Sekarang ditambahkan injeksi `<w:lvlOverride>` dan `<w:startOverride w:val="1"/>` secara dinamis ke `numbering.xml` agar setiap pegawai memiliki urutan 1,2,3 masing-masing.
- **Dinamika Tombol Unduh**: Tombol "Unduh ZIP" otomatis disesuaikan menjadi "Unduh Word" jika pengguna hanya mengunduh 1 dokumen utuh (`.docx`), untuk menghilangkan kebingungan pengguna.

### Pembaruan UI & Kemudahan Pengguna (UX)
- **Format Tanggal TMT**: Seluruh format tanggal lama seperti (2026-10-01) pada menu Riwayat Perpanjangan (Tabel, Filter Dropdown, Konfirmasi Pembatalan, maupun Ekspor Excel) telah diubah menjadi format Indonesia panjang yang mudah dibaca (misal: "01 Oktober 2026").
- **Fitur Cari di Riwayat**: Menambahkan kolom pencarian pintar (berdasarkan Nama atau NIP Baru) di dalam halaman Riwayat Perpanjangan. Hasil *export* ke Excel akan langsung mengikuti penyaringan pencarian ini.
- **Sidebar Dinamis (Collapse)**: Menambahkan tombol *toggle* kecil di panel samping untuk menyembunyikan label dan profil (collapse), memberikan sensasi area kerja (workspace) yang jauh lebih luas tanpa menghilangkan navigasi inti berbasis ikon. (Tombol ini disembunyikan pada perangkat *mobile* karena sudah menggunakan model *drawer*).
- **Penyederhanaan Visual**:
  - Mengubah ukuran tombol "Reset" agar tidak membentang selebar layar (*flex: 1* dinonaktifkan).
  - Membersihkan halaman pengaturan dan proses perpanjangan dari berbagai *alert* petunjuk biru/oranye (*disclaimer* box) untuk tampilan yang lebih bersih.
  - Menyelaraskan warna *font* tabel daftar tag referensi di halaman Pengaturan agar menggunakan warna *cyan/green* dari tema utama (SIKOn Dark Theme).

## [v3.2.0] - 2026-08-28 RILIS KE PRODUCTION

### Deployment
- **Naik ke Production**: Branch `staging` berhasil dipindahkan ke `main`. Versi baru mencakup pembaruan layout dan filter tabel PPPK.

### Pembaruan Fitur & UI
- **Penyederhanaan Navigasi**: Menghapus sistem Accordion di Sidebar untuk sub-menu PPPK dan mengandalkan sistem Tab Horizontal di dalam halaman agar UI lebih ringkas.
- **Scroll pada Sidebar**: Memperbaiki isu penumpukan (overlap) antara menu dan footer di Sidebar dengan mengaktifkan internal scroll (`overflow-y: auto`).
- **Filter Kategorikal Data PPPK**: 
  - PPPK yang berstatus *Akan Pensiun (BUP)* kini dimunculkan secara serentak di dua tempat: Tab "Akan Pensiun (BUP)" dan Tab "PPPK Aktif".
  - Filter tabel dikonfigurasi dinamis sesuai Tab yang dibuka (misal: menyembunyikan filter status untuk tab pensiun).
- **Pengurutan Otomatis BUP**: Data pada tab *Akan Pensiun (BUP)* otomatis diurutkan dengan pegawai yang waktu pensiunnya paling dekat berada di urutan teratas.
- **Kustomisasi Kolom Tabel**: 
  - Kolom "Status Kontrak" dan "Status PPPK" dihapus dan diganti dengan kolom "Unit Organisasi".
  - Untuk tab *Akan Pensiun* dan *Sudah Pensiun*, kolom "TMT CPNS" dan "Akhir Kontrak" diganti menjadi 1 kolom tunggal yaitu **TMT Pensiun** (yang dikalkulasi otomatis sebagai Batas Usia Pensiun + 1 hari).

## [v3.0.0] - 2026-08-27 RILIS KE PRODUCTION

### Deployment
- **Naik ke Production**: Branch `staging` berhasil dipindahkan ke `main`. Versi baru kini aktif di URL production Vercel.
- **Arsip Versi Lama**: Versi production lama disimpan permanen di branch `archive/v1-production` di GitHub. Dapat di-restore kapanpun.
- **Strategi 2 Firebase**: Tetap dipertahankan 2 proyek Firebase terpisah (Production dan Staging) agar eksperimen di preview tidak mempengaruhi data nyata.

### Ditambahkan
- **Script Sinkronisasi Firebase** (`scripts/sync-firebase.js`): Salin data Firestore dari Production ke Staging kapanpun dibutuhkan. Cara pakai: isi `.env.sync` lalu jalankan `node scripts/sync-firebase.js`.
- Unduhan dokumen dengan penamaan file otomatis berdasarkan bagian yang dipilih (`_utuh`, `_perjanjian`, `_tandatangan`).
- Modal unduhan responsif dengan lebar dinamis menggunakan CSS `clamp()`.
- Opsi "Bagian Dokumen (Isi)" tampil 4 kolom horizontal di desktop, 1 kolom di HP.
- Tag section `{{#perjanjian}}` dan `{{#tandatangan}}` dengan pesan error informatif saat tag tidak lengkap.

## [v3.1.0-staging] - 2026-08-27

### Ditambahkan
- **Sub-Menu Data PPPK**: Halaman Data PPPK kini terbagi menjadi 4 sub-kategori otomatis berdasarkan status kepegawaian:
  - **PPPK Aktif**: Pegawai dengan kontrak masih berlaku atau hampir habis.
  - **Akan Pensiun (BUP)**: Pegawai yang terkena Batas Usia Pensiun namun tanggal BUP-nya belum terlewat.
  - **Sudah Pensiun**: Pegawai dengan BUP yang sudah terlewat.
  - **Tidak Diperpanjang**: Pegawai dengan kontrak habis (bukan karena BUP).
- **Accordion Sidebar**: Menu "Data PPPK" di sidebar kini memiliki sub-menu accordion yang dapat dibuka/tutup, menampilkan 4 pilihan kategori di bawahnya. Accordion otomatis terbuka saat pengguna berada di halaman data-pegawai.
- **Tab-Bar di Halaman**: Navigasi antar kategori juga tersedia sebagai tab horizontal di atas tabel, dengan badge jumlah data per kategori.
- **Keterangan Inline "Tidak Diperpanjang"**: Pada tab "Tidak Diperpanjang", admin dapat mengisi alasan kenapa kontrak tidak diperpanjang langsung dari tabel (klik ikon pensil), tanpa perlu masuk ke halaman detail. Alasan tersimpan ke field `ALASAN_TIDAK_DIPERPANJANG` di Firestore.
- **Fungsi `getPegawaiCategory()`**: Menambahkan fungsi baru di `pppkLogic.js` yang mengkategorikan setiap pegawai ke salah satu dari 4 kategori berdasarkan hasil kalkulasi kontrak dan BUP.
- **Prop `customData` di PegawaiTable**: Komponen PegawaiTable kini mendukung prop `customData` untuk menerima data yang sudah tersaring dari parent, sehingga filter tabel berjalan hanya di atas subset data yang relevan.
## [v2.2.0-staging] - 2026-08-24

### Ditambahkan
- **Fitur Pisah & Gabung Halaman Kontrak**: Menambahkan kemampuan *advanced* untuk mengontrol hasil unduhan dokumen:
  - **1 File Word Gabungan**: Pengguna sekarang bisa mengunduh kontrak banyak pegawai sekaligus yang secara otomatis digabung ke dalam **satu dokumen Word (.docx) panjang**, di mana masing-masing kontrak pegawai dipisahkan oleh halaman baru (*Page Break*). Sistem juga secara cerdas akan membuat file ZIP berisi beberapa dokumen gabungan jika terdeteksi penggunaan *template* yang berbeda (misal: Reguler vs Paruh Waktu) dalam satu *batch* unduhan, demi menjaga struktur dokumen tetap aman.
  - **Filter Bagian Dokumen**: Pengguna dapat memilih untuk hanya mengunduh **Halaman Isi Perjanjian** saja atau **Halaman Tanda Tangan** saja dari kontrak.
  - **Mode Pisah 2 File**: Mengunduh bagian isi perjanjian dan halaman tanda tangan menjadi 2 file terpisah di dalam 1 file ZIP.
  - **Prasyarat Mode Khusus**: Pengguna harus membungkus template Word menggunakan tag khusus `{{#perjanjian}}...` dan `{{#tandatangan}}...` agar fitur Filter dan Mode Pisah 2 File dapat bekerja. Sistem dilengkapi penahan (error notification) untuk mencegah unduhan rusak jika tag tidak ditemukan.
  
### Diperbarui
- **Tabel Referensi Tag Pengaturan**: Menambahkan seksi khusus *"Pemisahan Halaman (Khusus Mode Unduh Pisah)"* pada menu Pengaturan agar pengguna mendapat panduan tentang penggunaan tag `{{#perjanjian}}` dan `{{#tandatangan}}` di dalam dokumen.

## [v2.0.0-staging] - 2026-07-16

### Ditambahkan
- **Vue 3 Migration**: Migrasi penuh dari arsitektur HTML/JS (legacy) menjadi Single Page Application (SPA) berbasis Vue 3 dengan Vite.
- **Smart Filter Data**: Dropdown filter pada tabel utama (`PegawaiTable.vue`) kini bersifat dinamis mengikuti data yang diimpor.
  - Dropdown akan menyembunyikan opsi "Semua" dan otomatis terpilih jika data yang tersedia hanya memiliki 1 jenis/kategori.
- **Auto Salary Calculator**: Penambahan fitur perhitungan "Gaji Pokok Saat Ini (Rp)" otomatis di Detail Modal yang menyesuaikan dengan nilai Golongan.
- **Auto Contract End Date**: Penambahan logika perhitungan "Akhir Kontrak Aktif" otomatis berdasarkan TMT CPNS (1 tahun untuk Paruh Waktu, 5 tahun untuk Reguler).

### Ditambahkan
- **Smart Contract Status & BUP**: Logika cerdas untuk menghitung status kontrak secara spesifik:
  - Penambahan status *Hampir Habis* dengan ambang batas dinamis (3 bulan untuk Paruh Waktu, 6 bulan untuk Reguler).
  - Penambahan status *Habis (BUP)* jika kontrak berakhir lebih awal karena mencapai Batas Usia Pensiun.
  - Perhitungan BUP secara otomatis mengambil umur pensiun 60 tahun untuk Guru dan 58 tahun untuk non-Guru. Jatuh tempo BUP ditetapkan pada hari terakhir di bulan ulang tahun.
  - Tanggal *Akhir Kontrak Aktif* dihitung otomatis dengan memilih skenario terpendek antara standar masa kontrak dan usia pensiun.

### Diubah
- **UI Revamp DetailModal**: Pembaruan desain UI Detail Data PPPK menjadi 4 tab yang lebih terorganisir (Personal, Kepegawaian, Jabatan & Kerja, Kontrak & Gaji PPPK).
- **Edit Mode DetailModal**: Seluruh kolom di DetailModal kini bisa diedit (interaktif) dan dilengkapi dengan tombol "Simpan Perubahan" yang terintegrasi dengan `pegawaiStore`.
- **Mapping Data**: Penyesuaian mapping data pada DetailModal:
  - *Status Pernikahan* menggunakan dropdown `JENIS KAWIN NAMA`.
  - Penambahan form untuk `NOMOR HP`, `EMAIL`, `EMAIL GOV`, dan `ALAMAT`.
  - *PNS ID* disembunyikan dari UI tab Kepegawaian.
  - *Golongan* dipetakan dari `GOL AKHIR NAMA`.
  - *Tingkat Pendidikan* dipetakan dari `TINGKAT PENDIDIKAN NAMA`.
  - *Lokasi Kerja* dipetakan dari `LOKASI KERJA NAMA`.
- **Nama Lengkap**: Pembaruan tabel utama untuk menampilkan gelar depan dan belakang pada kolom Nama Lengkap.

### Diperbaiki
- **Status Kontrak di Tabel Utama**: Memperbaiki masalah ketidaksesuaian (*mismatch*) antara filter status kontrak ("Habis (BUP)") dengan isi tabel. Kolom "STATUS KONTRAK" kini langsung menampilkan hasil kalkulasi kontrak secara *real-time* ("Masih Berlaku", "Habis (BUP)", dsb.) dan bukan menampilkan "Belum Diproses".
- **Bug Filter Status Ganda**: Memperbaiki isu di mana filter Status Kontrak menampilkan opsi ganda (misal: "Habis" dan "Kontrak Habis") akibat *caching* data lama di database. Kalkulasi status kini murni dilakukan secara *real-time* di sisi klien.
- **Bug Durasi PPPK Paruh Waktu**: Memperbaiki eror perhitungan (`typo` pada variabel *key*) yang menyebabkan kontrak PPPK Paruh Waktu dikalkulasi menjadi 5 tahun (seharusnya 1 tahun).
- **Status PPPK Pensiun Otomatis**: Menambahkan logika pada kolom "STATUS PPPK" agar secara otomatis berubah menjadi "Pensiun" jika status kontraknya terdeteksi sebagai "Habis (BUP)", dan "Tidak Diperpanjang" jika kontrak berakhir normal ("Habis").
- **Aturan Lintas Status & Override Manual**: Menerapkan aturan bisnis baru di mana Status PPPK akan secara otomatis mengikuti Status Kontrak. Jika pengguna memaksa untuk mengatur Status PPPK menjadi "Aktif" pada kontrak yang sudah habis melalui Detail Data, sistem akan menampilakan *banner* peringatan kuning, namun tetap mengizinkan penyimpanan dengan status khusus (`FORCE_AKTIF`). Selain itu, jika Status PPPK diubah menjadi "Meninggal", maka Status Kontrak otomatis menjadi "Kontrak Habis".
- **Penamaan Status Kontrak**: Menambahkan awalan "Kontrak" pada semua label status (misal: "Kontrak Habis", "Kontrak Hampir Habis", dsb) untuk memperjelas konteks.
- **Parsing Tanggal Lebih Kuat**: Memperbaiki format parsing tanggal untuk dapat menerima input data yang menggunakan format garis miring (`DD/MM/YYYY`) di samping strip (`DD-MM-YYYY`), sehingga meminimalisir eror perhitungan.
- **UI Spacing**: Memperbaiki jarak (*margin*) yang terlalu sempit antara deretan Tab dan kolom isian di bawahnya pada `DetailModal.vue`.
- **Sinkronisasi UI Detail Data**: Menambal celah (*bug*) di mana tabel utama sudah menampilkan status PPPK yang benar (misal: "Tidak Diperpanjang"), namun saat modal "Detail Data" dibuka, pilihan pada *dropdown* masih menampilkan "Aktif" (karena data mentah dari database belum ditimpa logika otomatis). Kini, ketika modal dibuka, formulir akan otomatis menyinkronkan status tersebut sesuai perhitungan terkini sebelum ditampilkan ke pengguna.
- **Keselarasan Data Global (Dashboard & Ekspor)**: Melakukan refaktor arsitektur dengan memusatkan logika `calculateContractPeriod` dan `getStatusPppk` ke dalam berkas utilitas tunggal (`pppkLogic.js`). Hal ini memastikan bahwa data statistik di halaman Dashboard dan data yang diekspor ke Excel akan *100% selaras* dengan status perhitungan *real-time* yang tampil pada Tabel Pegawai, menghindari perbedaan angka akibat logika perhitungan yang terpisah.
- **Optimasi Performa INP (Interaction to Next Paint)**: Mengatasi peringatan *INP Issue* (jeda UI panjang/mampet) saat menyimpan atau menghapus data. Sebelumnya, proses serialisasi JSON dan kompresi `LZString` untuk ribuan data dilakukan secara sinkron langsung setelah tombol diklik, menyebabkan antarmuka "membeku" (*freeze*) selama Â±800ms. Solusi yang diterapkan adalah menyisipkan jeda *thread* (`setTimeout`) agar sistem sempat menutup modal dan menampilkan animasi "*Loading...*" ke layar pengguna sebelum memulai pekerjaan komputasi berat di belakang layar.
- **Filter "Perpanjangan Kontrak" Dinamis**: Menambahkan fitur filter baru pada tabel Pegawai. Pilihan *dropdown* ini dibangkitkan secara otomatis dengan memindai seluruh data pegawai dan mengelompokkannya berdasarkan Tanggal TMT Perpanjangan yang baru. Jika dalam satu tahun terdapat lebih dari satu tanggal TMT yang berbeda, sistem akan mengurutkannya secara kronologis dan otomatis membubuhi label **Tahap 1**, **Tahap 2**, dst.
- **Konsistensi Data Grafik Dasbor**: Mengatasi masalah perbedaan jumlah orang pada grafik *Jadwal Perpanjangan* di *Dashboard* dengan filter data tabel. Perbedaan angka tersebut (misal: Dasbor 738 vs Tabel 734) terjadi karena sebelumnya grafik di *Dashboard* masih menghitung pegawai yang akan pensiun (BUP) atau meninggal di tahun tersebut. Kini, algoritma di grafik *Dashboard* telah disempurnakan agar selaras 100% dengan tabel: mengabaikan BUP/Meninggal, dan menghitung berdasarkan Tahun TMT Perpanjangan yang baru.
- **Otomatisasi & Proteksi Kolom Detail Data**:
  - Kolom **Masa Kerja (Tahun)** dan **Masa Kerja (Bulan)** kini *dihitung sepenuhnya secara otomatis* (dinamis) berdasarkan selisih antara hari ini dan tanggal **TMT CPNS (Awal PPPK)**. Pengguna tidak perlu lagi menghitung dan menginput manual.
  - Kolom **Awal Kontrak Aktif** dan **Akhir Kontrak Aktif** kini *dikunci (disabled)* agar tidak bisa diedit sembarangan, karena sistem sudah dijamin menghitung tanggal akhir kontrak secara otomatis (Reguler 5 tahun / Paruh Waktu 1 tahun, atau terpotong BUP) langsung dari TMT.
- **Bug Modal Kosong**: Memperbaiki isu form kosong pada DetailModal setelah impor data dengan menambahkan `immediate: true` pada `watch`.
- **Payload Size Error**: Penanganan isu batasan *payload size* saat deploy ke Vercel/Firebase.

---


## [v3.0.0] - 2026-08-27 RILIS KE PRODUCTION

### Deployment
- **Naik ke Production**: Branch `staging` berhasil dipindahkan ke `main`. Versi baru kini aktif di URL production Vercel.
- **Arsip Versi Lama**: Versi production lama disimpan permanen di branch `archive/v1-production` di GitHub. Dapat di-restore kapanpun.
- **Strategi 2 Firebase**: Tetap dipertahankan 2 proyek Firebase terpisah (Production dan Staging) agar eksperimen di preview tidak mempengaruhi data nyata.

### Ditambahkan
- **Script Sinkronisasi Firebase** (`scripts/sync-firebase.js`): Salin data Firestore dari Production ke Staging kapanpun dibutuhkan. Cara pakai: isi `.env.sync` lalu jalankan `node scripts/sync-firebase.js`.
- Unduhan dokumen dengan penamaan file otomatis berdasarkan bagian yang dipilih (`_utuh`, `_perjanjian`, `_tandatangan`).
- Modal unduhan responsif dengan lebar dinamis menggunakan CSS `clamp()`.
- Opsi "Bagian Dokumen (Isi)" tampil 4 kolom horizontal di desktop, 1 kolom di HP.
- Tag section `{{#perjanjian}}` dan `{{#tandatangan}}` dengan pesan error informatif saat tag tidak lengkap.

## [v3.1.0-staging] - 2026-08-27

### Ditambahkan
- **Sub-Menu Data PPPK**: Halaman Data PPPK kini terbagi menjadi 4 sub-kategori otomatis berdasarkan status kepegawaian:
  - **PPPK Aktif**: Pegawai dengan kontrak masih berlaku atau hampir habis.
  - **Akan Pensiun (BUP)**: Pegawai yang terkena Batas Usia Pensiun namun tanggal BUP-nya belum terlewat.
  - **Sudah Pensiun**: Pegawai dengan BUP yang sudah terlewat.
  - **Tidak Diperpanjang**: Pegawai dengan kontrak habis (bukan karena BUP).
- **Accordion Sidebar**: Menu "Data PPPK" di sidebar kini memiliki sub-menu accordion yang dapat dibuka/tutup, menampilkan 4 pilihan kategori di bawahnya. Accordion otomatis terbuka saat pengguna berada di halaman data-pegawai.
- **Tab-Bar di Halaman**: Navigasi antar kategori juga tersedia sebagai tab horizontal di atas tabel, dengan badge jumlah data per kategori.
- **Keterangan Inline "Tidak Diperpanjang"**: Pada tab "Tidak Diperpanjang", admin dapat mengisi alasan kenapa kontrak tidak diperpanjang langsung dari tabel (klik ikon pensil), tanpa perlu masuk ke halaman detail. Alasan tersimpan ke field `ALASAN_TIDAK_DIPERPANJANG` di Firestore.
- **Fungsi `getPegawaiCategory()`**: Menambahkan fungsi baru di `pppkLogic.js` yang mengkategorikan setiap pegawai ke salah satu dari 4 kategori berdasarkan hasil kalkulasi kontrak dan BUP.
- **Prop `customData` di PegawaiTable**: Komponen PegawaiTable kini mendukung prop `customData` untuk menerima data yang sudah tersaring dari parent, sehingga filter tabel berjalan hanya di atas subset data yang relevan.
## [v2.2.0-staging] - 2026-08-24

### Ditambahkan
- **Fitur Pisah Halaman Perjanjian dan Tanda Tangan**: Menambahkan kemampuan untuk memisahkan hasil unduhan dokumen kontrak menjadi dua file Word terpisah (halaman isi perjanjian dan halaman tanda tangan) yang dibungkus dalam file ZIP.
  - Pengguna dapat membungkus template Word menggunakan tag \{{#perjanjian}}...\ dan \{{#tandatangan}}...\.
  - Opsi **Mode Unduhan** (Gabungan vs Pisah) ditambahkan ke dalam UI \DownloadContractModal.vue\.
  - Jika pengguna memilih mode 'Pisah' namun template belum dilengkapi tag section, sistem akan memberikan notifikasi error informatif sebelum proses generate dokumen dimulai, mencegah file terdownload secara tidak sengaja dalam format yang salah.
  - Untuk proses *batch download* dalam mode Pisah, struktur output di dalam file ZIP dibuat mendatar (flat), sehingga mempermudah proses pencetakan oleh pengguna.

### Diperbarui
- **Tabel Referensi Tag Pengaturan**: Menambahkan seksi khusus *"Pemisahan Halaman (Khusus Mode Unduh Pisah)"* pada menu Pengaturan agar pengguna mendapat panduan tentang penggunaan tag \{{#perjanjian}}\ dan \{{#tandatangan}}\ di dalam dokumen.

## [v2.1.0-staging] - 2026-08-24

### Diperbaiki â€” Fitur Generate Dokumen Word (Unduh Perjanjian Kerja)

- **Input Manual Tanggal Penandatanganan Kontrak**: Sebelumnya, tag `{{KONTRAK_HARI}}`, `{{KONTRAK_TANGGAL_TERBILANG}}`, `{{KONTRAK_BULAN}}`, dan `{{KONTRAK_TAHUN_TERBILANG}}` diisi otomatis dari TMT Awal. Kini, modal "Unduh Perjanjian Kerja" (`DownloadContractModal.vue`) dilengkapi **date picker** untuk memilih tanggal penandatanganan kontrak secara manual oleh user. Nilai yang diisi ke dalam dokumen mengikuti pilihan user, bukan TMT. Jika tanggal tidak dipilih, field di dokumen akan kosong dengan peringatan kuning di UI.

- **Format Huruf Besar (UPPERCASE)**:
  - `{{NAMA_BUPATI}}` kini selalu di-*uppercase* secara otomatis dari sisi JavaScript.
  - `{{KONTRAK_HARI}}`, `{{KONTRAK_TANGGAL_TERBILANG}}`, `{{KONTRAK_BULAN}}`, `{{KONTRAK_TAHUN_TERBILANG}}` kini di-*uppercase* secara otomatis.

- **Rename Tag TMT**: Tag `{{TMT_AWAL_BARU}}` diubah menjadi `{{TMT_AWAL_AKTIF}}` dan `{{TMT_AKHIR_BARU}}` menjadi `{{TMT_AKHIR_AKTIF}}` untuk memperjelas bahwa yang dimaksud adalah TMT *kontrak yang sedang aktif*.
  > âš ï¸ **Perlu update template Word**: Ganti `{{TMT_AWAL_BARU}}` â†’ `{{TMT_AWAL_AKTIF}}` dan `{{TMT_AKHIR_BARU}}` â†’ `{{TMT_AKHIR_AKTIF}}` di file template `.docx`.

- **Perbaikan Mapping Field yang Tidak Muncul**:
  - `{{TEMPAT_TGL_LAHIR}}`: Menambahkan dukungan untuk field `TEMPAT LAHIR NAMA` (nama standar dari export data BKN/SIASN) di samping `TEMPAT LAHIR`, `TEMPAT_LAHIR`, dan `KOTA LAHIR`.
  - `{{PENDIDIKAN_LULUS}}`: Memperbaiki format menjadi `[Pendidikan Terakhir], Tahun : [Tahun Lulus]` serta memperluas fallback pencarian nama pendidikan (`PENDIDIKAN TERAKHIR`, `PENDIDIKAN NAMA`, `PENDIDIKAN`, `TINGKAT PENDIDIKAN NAMA`).
  - `{{TMT_AKHIR_AKTIF}}`: Menghubungkan kalkulasi otomatis tanggal akhir kontrak dengan `calculateContractPeriod(item)` jika kolom `AKHIR KONTRAK AKTIF` belum tersimpan di data mentah, sehingga tidak lagi menghasilkan `-`.
  - `{{GOLONGAN}}`: Ditambahkan *fallback* kolom `GOL AKHIR NAMA`, `GOL RUANG`, `GOL AKHIR ID`, `GOL AWAL NAMA` di samping `GOLONGAN AKHIR` dan `GOLONGAN`.
  - `{{GAJI_BARU}}` & `{{GAJI_TERBILANG}}`: Jika nilai gaji pokok belum disimpan secara manual di database, sistem kini secara cerdas menghitung otomatis nominal gaji pokok berdasarkan Golongan dan Masa Kerja (MKG) sesuai tabel Perpres No. 11 Tahun 2024 via `calculateGajiFromItem(item)`. Dengan demikian, nominal tidak akan lagi `Rp 0` dan terbilang tidak akan kosong.

- **Penghapusan Tag yang Tidak Diperlukan**: Tag `{{NO_SK_BARU}}`, `{{TGL_SK_BARU}}`, `{{NIK_PEGAWAI}}`, dan `{{GAJI_BARU_ANGKA}}` dihapus dari `buildTagData` di `docxGenerator.js` dan tabel referensi Pengaturan karena sudah tidak relevan / redundan (cukup menggunakan `{{GAJI_BARU}}` untuk format Rupiah lengkap).
  > âš ï¸ Hapus juga tag-tag tersebut dari template Word jika masih ada.

- **Klarifikasi Tag Ambigu**:
  - `{{UNOR_NAMA}}` kini dipetakan ke kolom unit organisasi/OPD (`UNOR NAMA`, `NAMA UNOR`, `OPD`, `UNIT ORGANISASI`).
  - `{{UNIT_KERJA}}` kini dipetakan ke kolom unit kerja operasional (`UNIT KERJA`, `NAMA UNIT KERJA`), berbeda sumber dari `UNOR_NAMA`.
  - `{{GAJI_BARU}}` = format Rupiah lengkap (misal: `Rp 3.200.000`).





- **Pengurutan Data Pensiun:** Menambahkan fungsi pengurutan (*sorting*) otomatis secara descending pada tab **Sudah Pensiun**, sehingga pegawai yang paling baru pensiun akan selalu tampil di urutan teratas.

- **Paginasi Riwayat Perpanjangan:** Menambahkan fitur paginasi pada tabel halaman Riwayat Perpanjangan dengan batas 10 data per halaman untuk mencegah tampilan tabel memanjang ke bawah dan meningkatkan kenyamanan navigasi (*UX*).

- **Responsivitas Mobile:** Memperbaiki *bug* pada tombol menu (garis 3/hamburger) yang sebelumnya tidak merespon saat ditekan di HP. Selain itu, menyesuaikan skala ukuran font dan *padding* pada tab menu horizontal agar tidak terlalu memakan tempat dan lebih muat di layar kecil.

- **Optimalisasi Tata Letak Paginasi & Grafik:** Merapikan tata letak tombol navigasi paginasi (Sebelumnya/Selanjutnya) agar tidak terjepit dan tetap rapi di layar ponsel. Selain itu, menyesuaikan label teks nama Unor pada grafik batang agar otomatis terpotong menjadi beberapa baris (*multiline*) jika terlalu panjang, sehingga teks tidak lagi terpotong/hilang di sisi kiri layar.
