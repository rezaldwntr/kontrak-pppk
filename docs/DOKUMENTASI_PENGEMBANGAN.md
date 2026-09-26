# Dokumentasi Pengembangan Aplikasi Manajemen Kontrak PPPK

Dokumen ini mencatat riwayat pembaruan, perbaikan bug, dan penambahan fitur pada aplikasi, khususnya di environment `staging`.

## [v3.8.0] - 2026-09-26 (Staging)

### Pembersihan Kode, Eliminasi Duplikasi, dan Optimasi Sesuai Kaidah Ponytail Master Rules
- **Pembersihan File Mati & Dead Routes (`ponytail-debt` & YAGNI)**:
  - Menghapus berkas usang yang tidak terpakai: `src/utils/docx.js`, `src/components/HelloWorld.vue`, dan `src/views/DummyPageView.vue`.
  - Menghapus impor tidak terpakai `DummyPageView` dari konfigurasi routing (`src/router/index.js`).
- **Standarisasi Modul Cetak Dokumen Word & Pencopotan Library Bloat**:
  - Menghapus berkas warisan `src/utils/docxPrinter.js` dan modal cetak lama `src/components/pegawai/PrintPreviewModal.vue`.
  - Mengalihkan seluruh alur cetak dokumen (termasuk tombol Cetak di modal Detail) ke `DownloadContractModal.vue` yang menggunakan `docxGenerator.js`. Semua cetak kini otomatis mendukung format nomor kontrak baru `800.1.2.5/.../BKPSDM`, terbilang Indonesia, konfigurasi bupati dari database, dan integrasi Google Drive.
  - Menghapus dependensi berat `docxtemplater` dari `package.json` karena seluruh penggantian tag dokumen kini menggunakan manipulasi XML string murni tanpa parser pihak ketiga.
- **Konsolidasi Utilitas Murni (Pure Functions & KISS)**:
  - Menyentralisasikan seluruh fungsi pembantu ke `src/utils/pppkLogic.js`:
    - `parseDate`: Menghapus duplikasi `parseDateLocal` di `gajiTable.js` dan menggunakan `parseDate` dari `pppkLogic.js`.
    - `cleanUnorName`, `getUnorAtasan`, `getUnorInduk`: Menghapus deklarasi lokal di `PegawaiTable.vue` dan `PerpanjanganView.vue`, beralih ke helper sentral yang mendukung pembagi `-` dan `/`.
    - `formatDateToInput`: Menghapus kode duplikat konversi `Date` ke `YYYY-MM-DD` di `DetailModal.vue` dan `ExtendModal.vue`.
    - `formatIndoDate`: Menghapus hardcode array bulan Indonesia di 4 file (`PegawaiTable.vue`, `RiwayatView.vue`, `DetailModal.vue`, `docxGenerator.js`), digantikan helper murni tunggal `formatIndoDate`.
    - `getNamaLengkap`: Menghapus duplikasi ekstraksi nama di `PegawaiTable.vue`, `DownloadContractModal.vue`, dan `docxGenerator.js`.
    - `formatRupiah`: Menghapus fungsi lokal `formatRupiahDisplay` di `DetailModal.vue` dan langsung memanfaatkan `formatRupiah` dari `gajiTable.js`.
    - Mengganti deep copy lambat `JSON.parse(JSON.stringify(...))` di `DetailModal.vue` dengan native `structuredClone`.
- **Penyatuan Penyimpanan Firestore (Chunking & Batas 50 Baris)**:
  - Mengekspor helper `savePegawaiChunks(pppkData)` di `src/services/firebase.js` untuk menangani kompresi `LZString` dan pembagian chunk 250.000 karakter ke `pegawai_chunk_0..N`.
  - Merampingkan method `batchExtend` (yang sebelumnya 106 baris) dan `cancelExtension` di `pegawaiStore.js` agar cukup memanggil `await this.saveAllPegawai()`.
  - Menyederhanakan `saveImportedData` di `src/utils/exportImport.js` dengan memanggil `savePegawaiChunks`, mengeliminasi lebih dari 70 baris duplikasi kode penyimpanan database.
- **Optimasi Performa Datar (Single-Pass Reducer / `ponytail-gain`)**:
  - Di `DashboardView.vue`: Menggabungkan 3 pass perulangan `.filter()` terpisah (`warningCount`, `activeCount`, `expiredCount`) menjadi 1 kali perulangan `single-pass` tanpa mengubah tipe kembalian maupun struktur reaktivitas.
  - Di `PegawaiTable.vue`: Menyatukan penghitungan opsi status kontrak dan status keaktifan PPPK ke dalam 1 iterasi tunggal, serta memanfaatkan `formatIndoDate` pada opsi filter perpanjangan.
- **Perbaikan Bug Notifikasi & Eksekusi Perpanjangan Kontrak (`PerpanjanganView.vue`)**:
  - Memperbaiki impor `customSwal` yang terlewat sehingga proses verifikasi modal password perpanjangan kontrak (individu maupun massal) dapat menampilkan dialog status proses loading dan mengeksekusi perpanjangan ke database dengan lancar tanpa error `ReferenceError: customSwal is not defined`.
- **Perbaikan Bug Data Profil Pegawai Kosong pada Modal Detail (`DetailModal.vue`)**:
  - Memperbaiki kegagalan inisialisasi data form saat membuka modal "Detail Data PPPK". Penggunaan `structuredClone(props.item)` sebelumnya menyebabkan JavaScript melempar `DOMException [DataCloneError]: #<Object> could not be cloned` karena objek reaktif Vue 3 berupa `Proxy` yang tidak dapat dikloning langsung oleh algoritma HTML Structured Clone bawaan browser.
  - Mengembalikan metode kloning mendalam ke `JSON.parse(JSON.stringify(item))` dengan fallback `{ ...item }`, serta memperluas watcher reaktif ke tuple `[() => props.isOpen, () => props.item]` dengan `{ immediate: true }` sehingga data profil pegawai selalu terisi dengan andal.

## [v3.7.0] - 2026-09-20 (Production & Staging)

### Fitur Impor Nomor Kontrak Massal & Riwayat Kontrak Multi-Periode (Contract Versioning)
- **Impor Nomor Kontrak Massal via Excel (`ImportNomorKontrakModal.vue`)**:
  - Menyediakan modal khusus untuk memperbarui nomor kontrak pegawai secara kolektif dalam hitungan detik.
  - Format Excel sangat sederhana: cukup membutuhkan 2 kolom utama (`NIP` dan `NOMOR KONTRAK`), serta mendukung kolom opsional (`NOMOR SK` dan `TANGGAL SK`).
  - Dilengkapi tombol **Unduh Format Contoh** (`downloadTemplateNomorKontrak`) yang langsung menghasilkan template file Excel siap pakai.
  - Dropzone unggah file interaktif dengan drag-and-drop dan deteksi otomatis kolom fleksibel (`NIP`, `NIP BARU`, `NOMOR KONTRAK`, `NO KONTRAK`, `NOMOR PERJANJIAN`).
  - Fitur **Pratinjau Cerdas (Smart Preview)**: Menampilkan statistik jumlah baris, NIP yang cocok, NIP yang tidak ditemukan di database, serta tabel pratinjau 5 baris pertama sebelum dieksekusi.
- **Deteksi Target Periode Kontrak Fleksibel**:
  - **Otomatis Sesuai Status Aktif Pegawai (Rekomendasi)**: Sistem secara otomatis mengevaluasi status masing-masing pegawai. Pegawai yang belum diperpanjang akan diperbarui nomor kontrak awalnya, sedangkan yang sudah diperpanjang akan masuk ke nomor kontrak perpanjangan aktifnya.
  - **Khusus Kontrak Pertama (Awal)**: Dikhususkan untuk melengkapi nomor kontrak awal (periode 1) yang masih kosong di database.
  - **Khusus Perpanjangan Kontrak Baru**: Dikhususkan untuk mengisi nomor kontrak baru bagi pegawai yang baru saja diproses perpanjangannya.
- **Sistem Penyimpanan Riwayat Kontrak Multi-Periode (`RIWAYAT_KONTRAK`)**:
  - Memastikan nomor kontrak lama (misal nomor 19) tidak hilang saat perpanjangan kontrak dilakukan ke nomor baru (misal nomor 27).
  - Menyimpan array `RIWAYAT_KONTRAK` pada profil data pegawai yang mencakup nomor periode, jenis ("Kontrak Pertama", "Perpanjangan I", dst), nomor kontrak, nomor SK, tanggal SK, serta rentang TMT.
  - Integrasi otomatis saat melakukan **Perpanjangan Massal maupun Individu** di `pegawaiStore.batchExtend` dan pemulihan otomatis saat pembatalan di `pegawaiStore.cancelExtension`.
- **Pembaruan Tampilan Modal Detail Pegawai (`DetailModal.vue`)**:
  - Pada Tab **Kontrak & Gaji**, ditambahkan tabel **Riwayat Kontrak & Perpanjangan** yang menampilkan riwayat lengkap seluruh periode kontrak pegawai, nomor kontrak masing-masing periode, rentang TMT, dan status badge (Aktif / Arsip).
  - Sinkronisasi otomatis dua arah: pengeditan nomor kontrak aktif pada formulir modal langsung menyelaraskan entri kontrak aktif pada riwayat.
- **Tombol Header Global Terintegrasi (`Header.vue`)**:
  - Tombol aksi `Impor No. Kontrak` disematkan langsung di Header utama saat admin membuka menu **Data PPPK** maupun menu **Perpanjangan Kontrak**.

### Standardisasi Format Nomor Kontrak (800.1.2.5/[No.Kontrak]/BKPSDM) & Integrasi Tag Dokumen Word
- **Format Penomoran Baku (`800.1.2.5/<Nomor>/BKPSDM`)**:
  - Seluruh tampilan aplikasi (tabel data pegawai, modal perpanjangan, modal detail profil, tabel riwayat perpanjangan multi-periode, dan pratinjau impor) kini menstandarkan penulisan nomor kontrak ke format resmi: `800.1.2.5/<Nomor>/BKPSDM`.
  - Pada tabel pegawai (`PegawaiTable.vue`), nomor kontrak lengkap ditampilkan dengan ikon dokumen di bawah tanggal TMT jika pegawai sudah memiliki nomor kontrak.
- **Kemudahan Impor Excel & Penginputan (Cukup Nomor Tengah Saja)**:
  - Pada template Excel impor nomor kontrak (`downloadTemplateNomorKontrak`), kolom nomor kontrak diisi nomor intinya saja (contoh: `19` atau `27`).
  - Sistem otomatis mengekstrak nomor tengah secara cerdas (`cleanNomorKontrakTag`), baik admin hanya memasukkan angka `19` maupun mem-paste format utuh `800.1.2.5/19/BKPSDM`.
  - Pada formulir input modal (`DetailModal.vue` dan `ExtendModal.vue`), input didesain menggunakan input-group modern dengan awalan statis `800.1.2.5/` dan akhiran `/BKPSDM`, sehingga admin cukup mengetikkan nomor tengahnya tanpa khawatir salah format pemisah/garis miring.
- **Injeksi Tag Dokumen Perjanjian Word (`{{NO_KONTRAK_BARU}}`) Tanpa Duplikasi**:
  - Pada saat dokumen kontrak Word di-generate (`docxGenerator.js`), nilai yang disuntikkan ke tag `{{NO_KONTRAK_BARU}}` dipastikan **HANYA nomor tengahnya saja** (misal: `19`).
  - Hal ini mencegah duplikasi teks format karena pada template berkas kontrak Word aslinya sudah tertulis teks statis `800.1.2.5/{{NO_KONTRAK_BARU}}/BKPSDM`.

### Perbaikan Resolusi Kolom Golongan BKN/SIASN (`ExtendModal.vue`, `DetailModal.vue`, `pppkLogic.js`, `gajiTable.js`)
- **Penyebab Tampilan "Golongan -"**:
  - File data impor BKN/SIASN menyimpan golongan pada kolom `GOL AKHIR NAMA` (contoh: `"Golongan IX"` atau `"IX"`), `GOL RUANG`, `GOLONGAN AKHIR`, atau `GOL AKHIR ID`, sementara properti `GOLONGAN` kosong/tidak terdefinisi pada data mentah sebelum diedit manual.
  - Komponen kartu pegawai pada Modal Perpanjangan (`ExtendModal.vue`) sebelumnya hanya membaca `currentPegawai['GOLONGAN']`, sehingga menghasilkan fallback `"Golongan -"`.
- **Solusi & Standardisasi**:
  - Menambahkan fungsi pembantu terpusat `getGolonganPegawai(item)` di `src/utils/pppkLogic.js` yang otomatis memeriksa semua kemungkinan alias kolom BKN (`GOLONGAN`, `GOL AKHIR NAMA`, `GOL RUANG`, `GOLONGAN AKHIR`, `GOL AKHIR ID`, `GOL AWAL NAMA`) dan menstandarisasi teks dengan awalan `"Golongan <Angka/Romawi>"`.
  - Memperbarui `ExtendModal.vue` untuk memanggil `getGolonganPegawai(currentPegawai)` dan menampilkannya dalam format pill badge rapi serta menyertakan nama jabatan pegawai (`JABATAN NAMA`).
  - Memperbarui `DetailModal.vue` agar saat modal dibuka, input Golongan otomatis terisi dengan resolusi BKN jika sebelumnya masih kosong atau bernilai `'-'`.
  - Memperbarui `gajiTable.js` (`calculateGajiFromItem`) untuk mendukung seluruh variasi kolom BKN tersebut dalam kalkulasi MKG dan gaji pokok.

### Harmonisasi & Peningkatan Desain UI/UX Seluruh Modal Dialog (Modal UX Overhaul)
- **Modal Detail Pegawai (`DetailModal.vue`)**:
  - Header diperbarui dengan badge ikon modern, status keaktifan PPPK, serta nama pegawai dan NIP yang jelas di sub-header.
  - Tab navigasi internal dirombak menjadi **Segmented Pill Tabs** yang konsisten dengan ikon (`Personal`, `Kepegawaian`, `Jabatan & OPD`, `Kontrak & Gaji`).
  - Mengganti seluruh tombol footer icon-only menjadi tombol aksi berlabel jelas (`Tutup`, `Cetak Kontrak`, `Simpan Perubahan`).
- **Modal Perpanjangan Kontrak (`ExtendModal.vue`)**:
  - Header dilengkapi badge ikon perpanjangan dan deskripsi mode (individu / massal).
  - Pada mode individu: Menampilkan kartu ringkasan identitas pegawai terpilih (Nama, NIP, Golongan, Jenis PPPK).
  - Pada mode massal: Dilengkapi panduan praktis penomoran kontrak serta tips impor massal via Excel.
  - Tombol footer diperbarui menjadi tombol teks berlabel informatif (`Batal`, `Proses Perpanjangan (X Pegawai)`).
- **Modal Unduh & Cetak Dokumen (`PrintPreviewModal.vue` & `DownloadContractModal.vue`)**:
  - Mengganti input radio konvensional dengan **Kartu Pilihan Interaktif** berikon dan berpenjelasan detail (`Seluruh Halaman`, `Hanya Isi Perjanjian`, `Hanya Lembar Tanda Tangan`).
  - Menampilkan ringkasan identitas pegawai yang sedang dicetak.
  - Tombol aksi berlabel jelas (`Batal`, `Unduh Berkas Word (.docx)`).
- **Modal Impor Data Pegawai (`ImportModal.vue`)**:
  - Header modern dengan ikon badge dan panduan berkas.
  - Opsi Jenis PPPK dan Metode Penggabungan Data diubah menjadi kartu seleksi yang mudah dipahami (`Tambah & Gabungkan Data`, `Tulis Ulang & Timpa Seluruh Data`).
  - Tombol aksi footer lengkap dengan status proses (*Memproses Berkas...*).
- **Modal Login & Verifikasi Keamanan (`LoginModal.vue` & `PasswordPromptModal.vue`)**:
  - Menambahkan tombol tutup silang (`x`) di sudut atas modal login.
  - Mengganti tombol submit ikon gundul menjadi tombol berlabel tegas: `Masuk ke Sistem` disertai indikator loading.
  - Pada modal verifikasi keamanan: Menambahkan tombol *toggle* mata (*show/hide password*) untuk kenyamanan pengguna saat memasukkan kata sandi.
- **Global Modal Styles (`styles.css`)**:
  - Memperbarui gaya tombol tutup modal (`.close-btn`) dengan transisi halus dan latar melengkung saat di-hover.

## [v3.6.0] - 2026-09-19 (Staging)

### Harmonisasi & Peningkatan Desain UI/UX Seluruh Menu (User-Friendly Overhaul)
- **Header Global (`Header.vue`)**:
  - Mengubah tombol aksi menjadi tombol berlabel teks yang jelas dan informatif (`Impor Data`, `Ekspor`, `Hapus Semua`), menggantikan tombol ikon gundul sebelumnya.
  - Menambahkan garis pembatas visual (*divider*) sebelum tombol bahaya `Hapus Semua` untuk mencegah klik yang tidak disengaja.
  - Tampilan responsif adaptif: teks label otomatis disembunyikan pada layar kecil/perangkat mobile untuk menjaga kerapian header.
- **Dashboard Overview (`DashboardView.vue`)**:
  - Menambahkan *empty state card* bertema modern dengan ikon informatif dan tombol "Reset Filter Dashboard" jika tidak ada data yang cocok dengan kriteria filter.
  - Memperbaiki tata letak responsif pada kartu statistik dan bagan analitik.
- **Tabel & Filter Data PPPK (`PegawaiTable.vue` & `PegawaiView.vue`)**:
  - **Filter 2-Tier Terstruktur**:
    - **Tier 1 (Pencarian & Kelompok Cepat)**: Kolom input pencarian dengan tombol hapus cepat (`x`), tombol chip cepat untuk kelompok pegawai (*Semua Kelompok*, *Guru*, *Kesehatan*, *Teknis*), pill total jumlah pegawai terpilih, serta tombol reset filter.
    - **Tier 2 (Dimensi Spesifik)**: Dropdown teratur untuk *Jenis PPPK*, *Unor Induk*, *Unor Atasan*, *Status Kontrak*, *Status PPPK*, dan *Periode Perpanjangan*.
  - **Segmented Pill Tab Bar**: Mengganti tab garis bawah lama dengan desain pill segmented yang modern, elevasi aktif, dan badge jumlah data yang kontras.
  - **Batch Action Bar Mengambang (Sticky)**: Dilengkapi tombol berlabel teks yang jelas (`Perpanjang Massal`, `Unduh Kontrak`, `Hapus Data`) menggantikan tombol ikon sempit.
  - **Tabel & Paginasi Modern**: Baris tabel berstatus seleksi yang jelas, cell teks rapi, serta bilah paginasi modern dengan indikator rentang data ("Menampilkan X - Y dari Z PPPK") dan tombol navigasi yang nyaman.
  - **Penyempurnaan Tab Diberhentikan**: Tampilan tabel diberhentikan diselaraskan dengan tata letak tabel utama serta aksi edit keterangan inline yang intuitif.
- **Perpanjangan Kontrak (`PerpanjanganView.vue`)**:
  - Mengadopsi navigasi segmented pill tab bar yang seragam dan konsisten dengan menu Data PPPK.
  - Menghilangkan *double-card nesting* agar tabel tampil bersih dan menyatu dengan kontainer utama.
  - Menyelaraskan jarak dan pembungkus bagan distribusi OPD.
- **Riwayat Perpanjangan (`RiwayatView.vue`)**:
  - Menyatukan filter floating yang terpisah-pisah ke dalam satu kartu toolbar filter terpadu (`filter-panel-card`).
  - Mengubah tombol ekspor ikon menjadi tombol berlabel `Ekspor Excel`.
  - Mengubah kotak pembatalan massal menjadi bilah batch action modern dengan tombol `Batalkan Terpilih`.
  - Memodernisasi tabel dengan badge TMT Baru (`badge-tmt-baru`), tombol aksi tabel terstandarisasi, dan bilah paginasi modern.
- **Pengaturan Aplikasi (`SettingsView.vue`)**:
  - Mengganti halaman pengaturan satu gulir panjang menjadi antarmuka 3 sub-tab segmented:
    1. **Pihak Pertama**: Formulir bersih dengan panduan kolom dan tombol `Simpan Pihak Pertama`.
    2. **Template Master Dokumen**: Kartu unggah master F4 Penuh Waktu dan Paruh Waktu dengan status terpasang, disertai tabel referensi tag template yang dilengkapi **kolom pencarian tag langsung** dan **tombol salin tag satu-klik** ke clipboard. Memperbaiki masalah horizontal scroll pada tampilan layar ponsel/mobile (`overflow-x: auto !important` dan `min-width: 620px`), kolom SALIN dibuat mengambang (*sticky column*) di tepi kanan, serta teks tag kini dapat langsung diketuk (*tap-to-copy*) untuk menyalin instan.
    3. **Keamanan & Akun**: Kartu aksi ganti email dan password dengan tombol aksi berlabel jelas (`Ubah Email Akun` dan `Ubah Kata Sandi`).
- **Sidebar Global (`Sidebar.vue`)**:
  - Memperbarui tombol keluar (*logout*) agar menampilkan teks `Keluar` saat sidebar terbuka dan otomatis beralih ke ikon saat sidebar diciutkan (*collapsed*).

### Integrasi Sinkronisasi Dokumen Google Drive & Optimalisasi Google Picker
- **Tampilan Google Picker Rapi & Terstruktur**:
  - Mengonfigurasi DocsView dengan .setParent('root') agar hanya memuat folder tingkat utama di "Drive Saya" (*My Drive*). Hal ini mencegah pemindaian rekursif ke ribuan folder sistem/chunk backup yang tidak diinginkan (seperti folder angka/kode hash 67, de, e0, dll).
  - Mengubah mode tampilan dari Grid kartu menjadi Tabel/Daftar vertikal (google.picker.DocsViewMode.LIST), sehingga tampilan daftar folder terlihat teratur, bersih, dan identik dengan antarmuka native Google Drive asli.
  - Mendukung penjelajahan multi-drive: tab utama "Drive Saya" dan tab "Drive Bersama" (*Shared Drives*).
- **Fleksibilitas Pemilihan Folder Google Drive**:
  - Menyediakan 3 opsi terpadu untuk menentukan folder tujuan:
    1. **Google Picker**: Memilih langsung melalui modal visual Google Drive.
    2. **Tempel Link Folder**: Mendukung input URL Google Drive secara manual dengan ekstraksi ID folder otomatis.
    3. **Buat Folder Otomatis**: Membuat folder baru di root Google Drive tanpa perlu berpindah tab.
- **Pembaruan Izin & Keamanan OAuth2 (Google Scopes)**:
  - Memperluas cakupan scope Google OAuth mencakup drive, drive.file, userinfo.email, dan openid dengan include_granted_scopes: 'true'.
  - Menambahkan banner peringatan otomatis (*scope check*) dan tombol "Perbarui Izin Akun" di UI jika akun Google belum memberikan hak akses penyimpanan file.
- **Penyempurnaan Navigasi & UI**:
  - Memindahkan menu **Google Drive Sync** langsung ke navigasi **Sidebar** utama agar mudah diakses.
  - Membersihkan duplikasi header teks pada halaman integrasi Google Drive.
  - Memodernisasi komponen filter di halaman Dashboard.
- **Perbaikan Bug Sinkronisasi Massal & Pemuatan Data Pegawai**:
  - **Pemuatan Data Otomatis di Menu Google Drive:** Memperbaiki masalah data pegawai kosong ([]) saat pengguna membuka langsung menu /drive, dengan memastikan pegawaiStore.loadData() dijalankan otomatis saat halaman dimuat.
  - **Pemisahan Logika Auto-Sync & Manual Sync:** Memisahkan evaluasi shouldSync (hanya untuk trigger penyimpanan otomatis saat edit pegawai dengan syarat toggle aktif) dari fungsi kriteria aturan (matchRules). Tombol "Sync Semua Sekarang" kini dapat langsung berjalan menyinkronkan pegawai yang memenuhi filter tanpa terhalang toggle Auto-Sync yang belum diaktifkan.
  - **Pratinjau Jumlah Pegawai Dinamis & Real-time:** Menghubungkan banner pratinjau previewCount langsung ke aturan lokal di layar secara interaktif sehingga pengguna langsung melihat berapa pegawai aktif yang terkena dampak aturan.
  - **Auto-Save Aturan & Dialog Konfirmasi:** Otomatis menyimpan aturan lokal saat tombol "Sync Semua Sekarang" diklik dan menampilkan dialog konfirmasi jumlah total pegawai sebelum proses upload dimulai.
### Penyempurnaan Pengelompokan Folder Google Drive & Perbaikan Klasifikasi Rumpun Pegawai
- **Aturan Penamaan Subfolder Google Drive (Mode Per-Pegawai)**:
  - **Standardisasi Unor Induk:** Mengganti parsing nama folder yang sebelumnya menggunakan unor kepanjangan (akibat pemisah /) menjadi **Unor Induk** yang bersih.
  - **Pengecualian Khusus Sesuai Regulasi & Kebutuhan Pengarsipan:**
    1. **Tenaga Guru:** Pegawai dengan rumpun Tenaga Guru otomatis dialihkan ke folder khusus **Guru** (tidak digabung ke Dinas Pendidikan).
    2. **Rumah Sakit:** Pegawai pada unit organisasi yang memuat kata *Rumah Sakit* atau *RSUD* otomatis masuk ke folder **RUMAH SAKIT UMUM DAERAH PAMBALAH BATUNG** (tidak masuk ke Dinas Kesehatan).
    3. **Puskesmas:** Seluruh unit Puskesmas otomatis disatukan ke dalam folder **Dinas Kesehatan** tanpa membuat subfolder pecahan untuk masing-masing Puskesmas.
    4. **Kecamatan dan Kelurahan:** Seluruh unit Kecamatan dan Kelurahan otomatis disatukan ke dalam folder **KECAMATAN DAN KELURAHAN**.
  - **Pencegahan Folder Ganda (Case-Insensitive Match):** Menambahkan pencocokan nama folder secara *case-insensitive* pada API Google Drive untuk mencegah terbentuknya folder duplikat jika sudah ada folder dengan penulisan huruf besar/kecil sebelumnya.
- **Perbaikan Bug Klasifikasi Rumpun Pegawai (Guru, Kesehatan, Teknis)**:
  - **Dukungan Penuh 30 Rumpun Nakes:** Memperbaiki fungsi getKelompokPegawai yang sebelumnya salah mengklasifikasikan tenaga kesehatan seperti *Nutrisionis*, *Terapis Gigi dan Mulut*, *Radiografer*, *Fisioterapis*, *Perekam Medis*, dsb. ke dalam *Tenaga Teknis*. Rumpun kini mengenali seluruh 30 standar jabatan fungsional kesehatan Permenpan-RB & Kemenkes.
  - **Integrasi Menyeluruh:** Perbaikan rumpun pegawai ini secara otomatis memperbarui keakuratan filter di tabel Data PPPK, kartu statistik di Dashboard, aturan filter Google Drive Sync, serta tag KELOMPOK_PEGAWAI, FUNGSI_PEGAWAI, dan SASARAN_PELAYANAN pada template cetak Word dokumen kontrak.
  - **Penyempurnaan UI Form Aturan Sync:** Dropdown Unor Induk pada form kriteria aturan sinkronisasi Google Drive kini otomatis terisi daftar pilihan OPD yang tersedia dari database, mencegah salah ketik nilai filter.
### Standarisasi Huruf Besar Folder Dinas, Penataan Spasi Nama File & Opsi Gelar
- **Standarisasi Huruf Besar Nama Folder (`DINAS KESEHATAN`)**:
  - Mengubah output nama folder untuk unit Puskesmas menjadi huruf besar penuh: `DINAS KESEHATAN` (sebelumnya `Dinas Kesehatan`) serta memastikan seluruh penamaan folder Unor Induk default menggunakan `.toUpperCase()`.
  - **Auto-Rename Folder Google Drive In-Place:** Menambahkan logika penyesuaian nama folder pada `getOrCreateFolder` di `useGoogleDrive.js`. Jika folder target sudah ada di Google Drive namun penulisannya masih huruf kecil/Title Case (misal `Dinas Kesehatan`), sistem secara otomatis mengirimkan permintaan `PATCH` ke Google Drive REST API untuk memperbarui nama folder menjadi `DINAS KESEHATAN` tanpa merusak ID folder maupun memindahkan file yang sudah ada di dalamnya.
- **Pemeliharaan Spasi Nama Pegawai pada File Dokumen**:
  - Menghapus konversi spasi menjadi underscore (`_`) pada nama pegawai di nama file dokumen kontrak Google Drive. Spasi asli antar kata pada nama pegawai tetap dipertahankan sesuai nama aslinya (contoh: `197407042025212030_ANA ERPINA.docx`, bukan `197407042025212030_ANA_ERPINA.docx`).
  - Pembersihan nama file secara selektif hanya membuang karakter terlarang sistem berkas (`[\/\\:*?"<>|]`).
- **Opsi Konfigurasi Gelar pada Penamaan File Dokumen**:
  - Menambahkan pengaturan baru pada menu Google Drive: **Format Penamaan File Dokumen** dengan dua pilihan:
    1. **Tanpa Gelar (Rekomendasi)**: Contoh: `197407042025212030_ANA ERPINA.docx`
    2. **Sertakan Gelar**: Contoh: `197407042025212030_ANA ERPINA, S.Pd.docx` atau `197407042025212030_Dr. ANA ERPINA, Sp.A.docx`
  - Pengaturan tersimpan secara persisten ke Firestore (`config/drive_sync_settings`) pada atribut `includeGelar` dan berlaku otomatis saat proses sinkronisasi dokumen berjalan.
### Penyempurnaan UI/UX Menu Google Drive & Pembersihan Teks Contoh Format Gelar
- **Pembersihan Teks Contoh Format Penamaan Berkas**:
  - Menghapus teks contoh penamaan panjang (`Contoh: 197407042025212030_...`) pada kartu pilihan format nama pegawai ("Tanpa Gelar" & "Sertakan Gelar"). Hal ini mencegah terjadinya teks patah (*text wrapping*) yang membuat tinggi kartu tidak seimbang di layar pengguna.
  - Tampilan kartu format nama kini tampil ringkas, elegan, dan seimbang dengan penanda *badge* "Rekomendasi" yang proporsional.
- **Redesain Menyeluruh Tata Letak (UI/UX) Halaman Google Drive**:
  - **Arsitektur Kartu Modern**: Membungkus setiap bagian konfigurasi ke dalam komponen kartu (`drive-card`) dengan sudut melengkung 16px, efek bayangan lembut, dan tajuk berikon tematik (*branding icon accent*).
  - **Status Koneksi & Auto-Sync Terpadu**: Menata ulang kartu akun terhubung dengan indikator status dot hijau, email pengguna yang jelas, tombol aksi yang terkelompok rapi ("Perbarui Izin" & "Putuskan"), serta kontrol sakelar *Auto-Sync* bergaya iOS yang intuitif.
  - **Tata Letak Grid 2 Kolom Seimbang**: Mengorganisir form pengaturan dokumen ke dalam grid 2 kolom yang simetris (Bagian Dokumen, Tanggal Kontrak, Mode Pengelompokan File, dan Format Penamaan Berkas) yang otomatis adaptif (*responsive*) pada perangkat seluler/tablet.
  - **Folder Tujuan & Manajemen Input Terstruktur**: Mempercantik kartu folder aktif dengan badge status, ID folder monospace, tombol cepat buka di Drive, dan integrasi input link manual yang teratur.
  - **Dukungan Penuh Mode Gelap & Terang**: Menyematkan CSS scoped dengan variabel CSS global (`--bg-primary`, `--bg-secondary`, `--border-color`, `--primary-color`, dll) sehingga tampilan selalu tajam dan nyaman dilihat di tema terang maupun gelap.
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

- **Visibilitas Menu Sidebar (*Landscape* Mobile):** Memperbaiki masalah di mana item menu navigasi pada *sidebar* hilang/tersembunyi ketika layar berorientasi *landscape* (memanjang ke samping) atau memiliki tinggi yang sangat terbatas. Kini *sidebar* secara otomatis menyesuaikan diri menjadi panel yang bisa di-*scroll* secara penuh jika ruang vertikal tidak mencukupi.

- **Responsivitas Jendela Detail PPPK:** Mengatasi masalah di mana modal/jendela *Detail Data PPPK* melebar ke luar layar HP. Sekarang, tab navigasi di bagian atas jendela dapat digeser secara horizontal (*swipeable*). Selain itu, untuk layar sempit, kolom isian formulir (kiri-kanan) dan rentetan tombol aksi di bawah (*Batal, Simpan, Cetak*) secara otomatis diubah menjadi tersusun secara vertikal (ditumpuk atas-bawah) agar ukuran tombol lebih pas dengan lebar layar ponsel dan mudah ditekan.

- **Optimalisasi Kolom Formulir (Lanjutan):** Menyempurnakan pembaruan kolom formulir satu lajur pada tampilan ponsel. Sebelumnya, beberapa baris (*seperti NIP Baru dan Lama*) masih saling membelah layar (2 lajur) karena gaya *inline grid-column* yang memicu *bug layout*. Sekarang, aturan dipaksa secara mutlak agar seluruh isi kolom *Detail PPPK* menjadi satu lajur lurus ke bawah, sehingga tidak ada lagi teks seperti NIP yang terpotong/sempit.

- **Perbaikan Perilaku Select All (Centang Semua):** Memodifikasi logika *checkbox* utama pada tabel pegawai dan tabel riwayat agar ketika dicentang, sistem akan langsung memilih *seluruh data yang sedang disaring (terfilter)* lintas halaman, tidak lagi terbatas hanya pada data yang tampil di halaman aktif saja. Hal ini mempermudah aksi perpanjangan massal.

- **Visibilitas Label Grafik Unor:** Memperbaiki *bug* pada grafik Statistik Unor di mana nama-nama instansi (label sumbu-Y) sering terlewat/hilang berselang-seling. Kini fitur *auto-skip* pada grafik telah dimatikan, dan tinggi wadah grafik akan bertambah secara dinamis menyesuaikan jumlah data (hingga 45px per baris), sehingga semua label sekolah/unor dijamin 100% muncul dan tidak akan saling tumpang tindih.

- **Dinamisasi Filter Perpanjangan (Penyelesaian Bug):** Memperbaiki kendala di mana menu _dropdown_ filter 'Perpanjangan Kontrak' selalu menampilkan seluruh periode (2026 s.d. 2031) secara statis tanpa peduli data apa yang sedang ditinjau. Kini daftar periode tersebut menjadi dinamis dan hanya akan memuat opsi perpanjangan yang benar-benar tersedia pada data yang sedang tampil/difilter (misalnya jika sedang meninjau 'PPPK Paruh Waktu', maka opsinya akan menyusut sesuai ketersediaan data tersebut).

- **Refaktor UI Tombol Bersih (Icon Only):** Mengubah seluruh tombol aksi di dalam aplikasi (seperti Impor Data, Ekspor CSV, Hapus Semua, Detail, Unduh Kontrak, Batal, Simpan Perubahan, Logout, Login, dll.) menjadi tombol yang hanya menampilkan ikon (bersih tanpa teks label di dalamnya) dengan standar ikon universal dari FontAwesome. Menambahkan fitur _tooltip_ (teks penjelas) yang akan muncul ketika kursor diletakkan (_hover_) di atas tombol, sehingga fungsi tombol tetap jelas bagi pengguna tanpa menghabiskan ruang layar.

- **Pembaruan Pengaturan Pihak Pertama:** Mengubah input Jabatan Pihak Pertama pada halaman pengaturan dari _dropdown_ terkunci (Bupati / Pj. Bupati) menjadi kolom input teks bebas (isian biasa). Hal ini memungkinkan administrator untuk mengisi jabatan pihak pertama dengan lebih fleksibel (misalnya Sekda, Kepala Dinas, Walikota, dll.) tanpa harus terikat pada opsi Bupati.

- **Perbaikan UI Tombol di Layar Mobile:** Memperbaiki tata letak (*layout*) dan dimensi tombol *icon-only* saat diakses melalui perangkat seluler (HP) yang sebelumnya meregang/membesar sepenuhnya (*full width*). Tombol-tombol pada *header* dan *footer* modal kini tertata secara horizontal dengan ukuran persegi (persegi kecil sempurna) yang proporsional dan tidak memakan banyak ruang vertikal layar.

- **Pengurutan Berdasarkan Abjad pada Unduh Massal:** Menambahkan fitur pengurutan data agar saat pengguna melakukan Unduh Massal (baik format digabung maupun format ZIP), urutan halaman dokumen atau nama file akan otomatis diurutkan secara alfabetis berdasarkan nama pegawai (A-Z). Format nama file di dalam ZIP juga diubah menjadi kontrak_<NAMA>_<NIP>.docx agar Explorer komputer otomatis mengurutkannya berdasarkan abjad nama.

- **Pembaruan Tag Nama Pegawai:** Mengubah implementasi tag {{NAMA_PEGAWAI}} pada sistem *generate* dokumen Word (kontrak) dan tampilan tabel. Sebelumnya sistem secara otomatis menggabungkan *Gelar Depan* + *Nama* + *Gelar Belakang*. Kini tag dan tampilan tersebut diperbaiki hanya memunculkan *Nama Lengkap tanpa gelar* sesuai permintaan.

- **Penambahan Filter Kelompok Pegawai:** Menambahkan opsi penyaringan (filter) baru pada tabel utama untuk menyortir data berdasarkan **Kelompok Pegawai** (Tenaga Guru, Tenaga Kesehatan, dan Tenaga Teknis). Filter ini akan mendeteksi otomatis secara cerdas dari nama jabatan masing-masing pegawai.

- **Integrasi & Sinkronisasi Otomatis Google Drive (E-Kontrak PPPK):**
  - **Koneksi Akun Pribadi (OAuth 2.0):** Menambahkan sistem integrasi dengan Google Drive menggunakan OAuth 2.0 (Authorization Code & auto-refresh token via backend serverless Vercel function). Administrator dapat menghubungkan akun Google pribadinya langsung dari menu Pengaturan.
  - **Pemilih Folder Visual (Google Picker):** Mengintegrasikan Google Picker API agar administrator dapat memilih folder tujuan Google Drive secara visual melalui jendela popup.
  - **Struktur Folder & Penamaan Standar:** Menyusun dokumen secara otomatis ke dalam folder hierarkis: [Folder Root] / [Bagian Dokumen: Kontrak | Isi Perjanjian | Tanda Tangan] / [Subfolder Unor Induk] / [NIP_Nama.docx].
  - **Auto-Sync & Auto-Update Dinamis:** Menambahkan aturan filter kriteria otomatis (Kelompok Pegawai, Jenis PPPK, Unor Induk). Setiap kali data pegawai yang memenuhi kriteria disimpan lewat tombol Simpan di Detail Pegawai, dokumen perjanjian kerja di Google Drive akan otomatis dibuat atau diperbarui (update in-place). Jika file terhapus di Drive, sistem otomatis mengunggahnya kembali.
  - **Antrian Retry (Retry Queue):** Jika proses upload ke Google Drive gagal karena masalah jaringan atau sesi, antrian kegagalan disimpan ke koleksi Firestore sync_queue dan dapat dicoba kembali secara otomatis maupun manual lewat tombol 'Coba Lagi'.
  - **Simpan ke Google Drive dari Modal Unduh:** Menambahkan tombol langsung 'Simpan ke Drive' di jendela Unduh Perjanjian Kerja (DownloadContractModal.vue) agar admin dapat menyimpan 1 atau banyak dokumen kontrak langsung ke Drive dengan 1 kali klik.
  - **Pembatasan Fitur Kontrak (Khusus Pegawai Aktif):** Tombol Unduh Kontrak, Cetak, dan Tab Kontrak & Gaji di modal detail kini disembunyikan untuk pegawai berstatus Pensiun atau Diberhentikan, sesuai aturan bisnis bahwa kontrak hanya berlaku bagi pegawai yang masih aktif.

- **Optimalisasi Menu Google Drive & Penyederhanaan Template Master (Kertas F4):**
  - **Menu Google Drive di Sidebar:** Memindahkan fitur integrasi Google Drive dari tab sub-menu Pengaturan menjadi menu utama mandiri di Sidebar navigasi (/drive -> GoogleDriveView.vue). Hal ini memberikan tata letak halaman yang lebih luas dan navigasi yang lebih cepat.
  - **Penghapusan Opsi Kertas A4 & Standarisasi F4:** Menghapus seluruh pengaturan ukuran kertas A4 di seluruh modul aplikasi (Modal Unduh Kontrak, Modal Cetak, Pengaturan Google Drive, dan Pengaturan Template). Aplikasi kini distandarisasi menggunakan format F4 (Legal 33�21.5 cm) sebagai ukuran baku.
  - **Sistem 1 Upload Master Template Universal:** Mengubah halaman upload template di menu Pengaturan menjadi cukup 1 formulir upload master file .docx per kategori (PPPK Penuh Waktu dan PPPK Paruh Waktu). Sistem pembangkit dokumen Word kini secara cerdas membaca dan mempertahankan ukuran kertas serta margin asli dari file template Word yang diunggah. Dengan arsitektur ini, jika di kemudian hari instansi mengubah ukuran kertas atau margin, administrator cukup mengubah ukuran halaman langsung di Microsoft Word dan mengunggah 1 file tersebut tanpa perlu membuat atau memilih opsi ukuran terpisah di aplikasi.
  - **Kompatibilitas Template Fallback:** Menambahkan logika *fallback* cerdas pada pembacaan template di Firestore agar tetap kompatibel dan tidak *error* meskipun dokumen sebelumnya disimpan dengan format penamaan lama.

- **Perbaikan UI Google Drive & Modernisasi Toolbar Filter Dashboard:**
  - **Penghapusan Duplikasi Header Google Drive:** Memperbaiki tampilan halaman Google Drive Sync dengan menghapus elemen judul (.page-header) lokal di dalam GoogleDriveView.vue. Judul dan deskripsi halaman kini dirender secara terpusat oleh layout global Header.vue berdasarkan metadata rute, menghilangkan tampilan header ganda yang sebelumnya terjadi.
  - **Modernisasi UI Filter Dashboard:** Menggantikan kontrol *dropdown select* konvensional pada Dashboard dengan komponen *Dashboard Filter Toolbar* modern berjenjang:
    - **Tingkat Utama (Segmented Pills):** Tombol pil interaktif untuk jenis kepegawaian (*Semua Jenis*, *Penuh Waktu*, *Paruh Waktu*) dilengkapi efek *glow active* serta indikator *badge counter* jumlah pegawai secara *real-time*.
    - **Tingkat Sekunder (Kelompok Chips):** Deretan *chip* filter untuk menyaring berdasarkan kelompok kepegawaian (*Semua*, *Tenaga Guru*, *Tenaga Kesehatan*, *Tenaga Teknis*) dengan ikon penjelas dan kalkulasi jumlah dinamis sesuai jenis PPPK yang sedang aktif.
    - **Responsif & Kompatibilitas Tema:** Tampilan toolbar disesuaikan agar rapi dan adaptif pada perangkat seluler/layar sempit, serta mendukung penuh variabel warna tema terang dan gelap.
- **Penyempurnaan Integrasi Folder Google Drive (Solusi Error 403 Google Picker & Opsi Tempel Link):**
  - **Opsi Tempel Link / ID Folder Mandiri:** Menambahkan kolom input manual untuk menempelkan URL folder (misal drive.google.com/drive/folders/...) atau ID folder Google Drive secara langsung, disertai tombol *Terapkan Link*. Sistem secara otomatis memvalidasi ke Google Drive API (getFolderInfo), mengambil nama folder resmi, dan menyimpannya. Hal ini menjadi solusi praktis dan instan jika pengguna mengalami kendala sesi akun pada browser.
  - **Status & Manajemen Folder Aktif:** Menampilkan kartu status folder terpilih dengan indikator visual, nama folder, ID folder, tombol pintasan untuk membuka folder langsung di tab baru Google Drive, dan tombol untuk melepas/mengganti folder.
  - **Peningkatan Konfigurasi Google Picker:** Menambahkan parameter keamanan setOrigin dan setAppId (Google Cloud Project Number) pada pembuatan PickerBuilder untuk memenuhi standar komunikasi iframe lintas domain Google dan mencegah penolakan otentikasi.
- **Penyempurnaan Integrasi Google Picker & Penataan Alur Pemilihan Folder:**
  - **Optimalisasi Google Picker API:** Menyempurnakan konfigurasi openFolderPicker dengan DocsView (setIncludeFolders(true), setSelectFolderEnabled(true), setEnableDrives(true)) serta mengaktifkan fitur google.picker.Feature.SUPPORT_DRIVES agar mendukung pemilihan folder dari Google Drive pribadi maupun Shared Drive (Drive Bersama).
  - **Responsivitas Status Tombol Picker:** Menambahkan penanganan status *loading* interaktif dengan callback onOpened dan onCancel. Tombol tidak lagi mengalami kendala status 'Memuat...' saat pengguna membatalkan atau menutup popup pemilihan folder.
  - **Penataan UI Pemilihan Folder:** Menempatkan tombol **Pilih Folder** (Google Picker) sebagai tombol aksi utama yang dominan dan jelas di halaman Google Drive Sync, sementara opsi input manual (tempel link/ID) disembunyikan secara rapi di dalam toggle teks (*collapsible*) sebagai solusi cadangan jika terjadi masalah sesi pada browser.
- **Peralihan ke Solusi 2 (Manajemen Folder Google Drive Mandiri & Handal):**
  - **Latar Belakang:** Google Picker API mengalami kendala error 403 permanen pada peramban modern (seperti Chrome) akibat kebijakan keamanan pemblokiran *Third-Party Cookies (Tracking Protection)* pada dokumen iframe lintas-domain (docs.google.com/picker).
  - **Pemberlakuan Solusi 2 sebagai Antarmuka Utama:** Mengubah bagian konfigurasi folder tujuan Google Drive agar tidak lagi bergantung pada popup iframe Google Picker:
    - **Tempel Link / ID Folder:** Pengguna cukup menyalin URL folder dari address bar Google Drive lalu menempelkannya ke kolom formulir dan mengklik tombol *Hubungkan Folder*. Sistem langsung memvalidasi ke Google Drive REST API, mengambil nama folder, dan menyimpannya.
    - **Fitur Buat Folder Otomatis:** Menambahkan tombol *Buat Folder Otomatis* yang memungkinkan pengguna membuat folder tujuan baru langsung di root Google Drive mereka melalui Google Drive REST API hanya dengan mengetikkan nama folder (misal: "KONTRAK PPPK"), tanpa perlu membuka tab Google Drive.
    - **Tombol Pintasan Google Drive:** Menyediakan tombol cepat untuk membuka Google Drive di tab baru serta tautan langsung untuk meninjau folder yang sedang terhubung.
- **Penyelesaian Masalah Insufficient Scopes & Pembaruan Izin OAuth Google Drive:**
  - **Identifikasi Masalah:** Munculnya galat Google API 403 (Forbidden): Request had insufficient authentication scopes saat menghubungkan folder atau membuat folder baru di Drive disebabkan oleh token OAuth yang sebelumnya tersimpan tidak memiliki cakupan izin mengelola file Google Drive (pengguna belum mencentang kotak izin persetujuan Google Drive saat otentikasi awal).
  - **Penambahan Cakupan & Parameter OAuth:** Memperluas daftar SCOPES pada useGoogleAuth.js dengan drive, drive.file, userinfo.email, dan openid serta menambahkan parameter include_granted_scopes: 'true' dan prompt: 'consent' agar Google selalu menampilkan seluruh kotak pilihan persetujuan izin secara lengkap kepada pengguna.
  - **Pelacakan Status Scope di Store & Firestore:** Menyimpan data scope yang disetujui ke dalam dokumen Firestore drive_tokens dan memantaunya secara reaktif pada driveStore.js melalui hasDriveScope.
  - **Banner Peringatan & Dialog Bantuan Interaktif:** Menambahkan tombol *Hubungkan Ulang (Perbarui Izin)* dan banner peringatan langsung di halaman Google Drive jika terdeteksi izin akun belum lengkap. Apabila operasi Drive gagal karena masalah cakupan otentikasi, sistem menampilkan dialog panduan yang menjelaskan cara mencentang izin Google Drive lengkap dengan tombol pintas untuk langsung menghubungkan ulang.
- **Harmonisasi UI Pemilihan Folder Google Drive (Google Picker & Aksi Cepat):**
  - Mengintegrasikan tombol **Pilih Folder (Google Picker)** sebagai tombol aksi utama berfitur lengkap bersama tombol cepat **Buat Folder Otomatis** dan tautan **Buka Drive**.
  - Menyediakan formulir alternatif **Tempel Link / ID Folder Manual** di bagian bawah untuk fleksibilitas maksimal jika pengguna ingin menyalin link langsung dari browser.
- **Perbaikan Tampilan Folder Google Picker (Menampilkan Tab 'Drive Saya'):**
  - **Penyebab:** Pada konfigurasi sebelumnya, flag .setEnableDrives(true) dipasang pada satu-satunya tampilan DocsView. Hal ini menyebabkan Google Picker memprioritaskan hanya tab *Shared Drives* (Drive Bersama). Karena akun pengguna adalah akun personal (yang belum memiliki Shared Drive), tampilan picker menjadi kosong (*blank* dengan tulisan "No documents.").
  - **Solusi:** Memisahkan tampilan menjadi dua DocsView:
    - **View 1 (Utama/Default):** Menampilkan folder-folder dari **Drive Saya (My Drive)** pengguna.
    - **View 2 (Sekunder):** Menampilkan **Drive Bersama (Shared Drives)** jika instansi menggunakan Shared Drive.
    - Dengan perubahan ini, begitu dialog Google Picker terbuka, tab yang aktif pertama kali adalah seluruh folder yang ada di **Drive Saya** milik pengguna.