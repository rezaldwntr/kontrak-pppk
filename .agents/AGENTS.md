# Aturan Proyek Manajemen Kontrak PPPK

File ini berisi aturan-aturan khusus (Project-Scoped Rules) yang harus selalu diikuti oleh asisten AI (Gemini/Antigravity) setiap kali bekerja pada proyek/workspace ini.

## Aturan Dokumentasi
Setiap kali Anda membuat perubahan signifikan pada aplikasi (seperti menambahkan fitur baru, mengubah arsitektur, mengubah komponen logika yang besar, atau memperbaiki bug major), Anda **WAJIB** secara otomatis memperbarui file `DOKUMENTASI_PENGEMBANGAN.md` yang ada di direktori: `G:\My Drive\Dev APPS\Kontrak\docs\DOKUMENTASI_PENGEMBANGAN.md`.

Tambahkan poin-poin perubahan tersebut sebagai entri baru ke dalam file dokumentasi tersebut (menggunakan format tanggal atau versi yang jelas) agar pengguna dan pengembang masa depan dapat terus melacak setiap perubahan yang telah Anda buat.

Jangan menunggu pengguna menyuruh Anda memperbarui file tersebut. Lakukan secara proaktif setiap kali sebuah tugas/fitur besar selesai diimplementasikan.

## Aturan Deployment & Git Workflow
- **Wajib ke Staging Dulu**: Setiap kali melakukan penambahan fitur atau perbaikan kode, commit dan push **HANYA ke branch `staging`** (sebagai lingkungan Preview).
- **Tunggu Verifikasi**: Jangan pernah langsung push atau merge ke branch `main` (Production). Minta pengguna untuk menguji terlebih dahulu di URL Preview.
- **Rilis ke Production**: Hanya lakukan push atau merge ke branch `main` SETELAH pengguna memberikan persetujuan eksplisit bahwa fitur di staging sudah berjalan dengan baik.
