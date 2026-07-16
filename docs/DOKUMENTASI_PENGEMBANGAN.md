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
- **Status PPPK Pensiun Otomatis**: Menambahkan logika pada kolom "STATUS PPPK" agar secara otomatis berubah menjadi "Pensiun" jika status kontraknya terdeteksi sebagai "Habis (BUP)", dan "Tidak Diperpanjang" jika kontrak berakhir normal ("Habis").
- **UI Spacing**: Memperbaiki jarak (*margin*) yang terlalu sempit antara deretan Tab dan kolom isian di bawahnya pada `DetailModal.vue`.
- **Bug Modal Kosong**: Memperbaiki isu form kosong pada DetailModal setelah impor data dengan menambahkan `immediate: true` pada `watch`.
- **Payload Size Error**: Penanganan isu batasan *payload size* saat deploy ke Vercel/Firebase.
