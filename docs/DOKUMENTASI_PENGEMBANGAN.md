# Dokumentasi Pengembangan Aplikasi Manajemen Kontrak PPPK

Dokumen ini mencatat riwayat pembaruan, perbaikan bug, dan penambahan fitur pada aplikasi, khususnya di environment `staging`.

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
- **Optimasi Performa INP (Interaction to Next Paint)**: Mengatasi peringatan *INP Issue* (jeda UI panjang/mampet) saat menyimpan atau menghapus data. Sebelumnya, proses serialisasi JSON dan kompresi `LZString` untuk ribuan data dilakukan secara sinkron langsung setelah tombol diklik, menyebabkan antarmuka "membeku" (*freeze*) selama ±800ms. Solusi yang diterapkan adalah menyisipkan jeda *thread* (`setTimeout`) agar sistem sempat menutup modal dan menampilkan animasi "*Loading...*" ke layar pengguna sebelum memulai pekerjaan komputasi berat di belakang layar.
- **Filter "Perpanjangan Kontrak" Dinamis**: Menambahkan fitur filter baru pada tabel Pegawai. Pilihan *dropdown* ini dibangkitkan secara otomatis dengan memindai seluruh data pegawai dan mengelompokkannya berdasarkan Tanggal TMT Perpanjangan yang baru. Jika dalam satu tahun terdapat lebih dari satu tanggal TMT yang berbeda, sistem akan mengurutkannya secara kronologis dan otomatis membubuhi label **Tahap 1**, **Tahap 2**, dst.
- **Konsistensi Data Grafik Dasbor**: Mengatasi masalah perbedaan jumlah orang pada grafik *Jadwal Perpanjangan* di *Dashboard* dengan filter data tabel. Perbedaan angka tersebut (misal: Dasbor 738 vs Tabel 734) terjadi karena sebelumnya grafik di *Dashboard* masih menghitung pegawai yang akan pensiun (BUP) atau meninggal di tahun tersebut. Kini, algoritma di grafik *Dashboard* telah disempurnakan agar selaras 100% dengan tabel: mengabaikan BUP/Meninggal, dan menghitung berdasarkan Tahun TMT Perpanjangan yang baru.
- **Otomatisasi & Proteksi Kolom Detail Data**:
  - Kolom **Masa Kerja (Tahun)** dan **Masa Kerja (Bulan)** kini *dihitung sepenuhnya secara otomatis* (dinamis) berdasarkan selisih antara hari ini dan tanggal **TMT CPNS (Awal PPPK)**. Pengguna tidak perlu lagi menghitung dan menginput manual.
  - Kolom **Awal Kontrak Aktif** dan **Akhir Kontrak Aktif** kini *dikunci (disabled)* agar tidak bisa diedit sembarangan, karena sistem sudah dijamin menghitung tanggal akhir kontrak secara otomatis (Reguler 5 tahun / Paruh Waktu 1 tahun, atau terpotong BUP) langsung dari TMT.
- **Bug Modal Kosong**: Memperbaiki isu form kosong pada DetailModal setelah impor data dengan menambahkan `immediate: true` pada `watch`.
- **Payload Size Error**: Penanganan isu batasan *payload size* saat deploy ke Vercel/Firebase.
