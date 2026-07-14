# E-Kontrak PPPK - Design System Documentation

> Dokumen ini mencerminkan implementasi UI yang benar-benar sudah diterapkan di aplikasi.
> Gunakan sebagai referensi tunggal (single source of truth) agar tampilan tidak berubah.

---

## 1. Visual Theme

E-Kontrak mengadopsi desain sistem SIKOn: platform digital pemerintah modern dengan
warna teal/hijau sebagai aksen utama di atas kanvas putih bersih (Light Mode) atau
abu-abu gelap netral (Dark Mode).

Karakteristik:
- Layout dua-kolom: sidebar 280px (kiri) + konten utama
- Tombol pill shape: border-radius 24px, tinggi 48px
- Dua tema: Light Mode dan Dark Mode (toggle di sidebar bawah)
- Font: Roboto (konten), Montserrat (judul & branding)
- Transisi: 0.2s cubic-bezier fast, 0.3s normal

---

## 2. CSS Custom Properties

### Light Mode (:root)

- --bg-primary: #F4F5F7
- --bg-secondary: #FFFFFF
- --bg-sidebar: #FFFFFF
- --text-primary: #1F2937
- --text-secondary: #6B7280
- --text-light: #9CA3AF
- --border-color: #E5E7EB
- --border-hover: #D1D5DB
- --primary-color: #10B981
- --primary-light: rgba(16, 185, 129, 0.08)
- --primary-hover: #059669
- --accent-blue: #485FC7
- --accent-green: #41B983
- --success-color: #10B981 | --success-light: rgba(16,185,129,0.15)
- --warning-color: #A855F7 | --warning-light: rgba(168,85,247,0.15)
- --danger-color: #EF4444 | --danger-light: #FEE2E2
- --info-color: #485FC7 | --info-light: rgba(72,95,199,0.1)
- --shadow-sm: 0px 2px 8px rgba(0,0,0,0.04)
- --shadow-md: 0px 4px 12px rgba(16,185,129,0.25)
- --shadow-lg: 0px 4px 16px rgba(0,0,0,0.08)
- --shadow-glass: 0px 6px 20px rgba(0,0,0,0.12)
- --radius-sm:6px | --radius-md:8px | --radius-lg:12px | --radius-xl:24px
- --transition-fast: 0.2s cubic-bezier(0.4,0,0.2,1)
- --transition-normal: 0.3s cubic-bezier(0.4,0,0.2,1)

### Dark Mode ([data-theme="dark"])

Diterapkan ke elemen HTML via document.documentElement.setAttribute('data-theme', 'dark')

- --bg-primary: #25262B
- --bg-secondary: #2C2D31
- --bg-sidebar: #2C2D31
- --text-primary: #FFFFFF
- --text-secondary: #A3A6AD
- --text-light: #7E828A
- --border-color: #3F4148
- --border-hover: #50535B
- --primary-color: #00C897  <-- Vibrant Green, lebih cerah untuk kontras di latar gelap
- --primary-light: rgba(0,200,151,0.15)
- --primary-hover: #00A87E
- --accent-blue: #3498DB
- --accent-green: #00C897
- --success-color: #00C897 | --success-light: rgba(0,200,151,0.15)
- --warning-color: #F5B041 | --warning-light: rgba(245,176,65,0.15)
- --danger-color: #E74C3C | --danger-light: rgba(231,76,60,0.15)
- --info-color: #3498DB | --info-light: rgba(52,152,219,0.15)
- --shadow-sm: 0px 4px 6px rgba(0,0,0,0.2)
- --shadow-md: 0px 6px 12px rgba(0,0,0,0.3)
- --shadow-lg: 0px 8px 24px rgba(0,0,0,0.4)
- --shadow-glass: 0px 8px 32px rgba(0,0,0,0.4)

---

## 3. Layout

.app-container: display grid, 280px 1fr, min-height 100vh
.sidebar: bg var(--bg-sidebar), color var(--text-primary), padding 30px 20px,
          width 280px, sticky, height 100vh, border-right 1px var(--border-color)
.main-content: padding 40px, height 100vh, overflow-y auto

---

## 4. Sidebar

### Brand Icon (.brand-icon)
- 45x45px, border-radius 8px
- background: linear-gradient(135deg, var(--primary-color), #41b983)
- box-shadow: 0px 4px 12px rgba(16,185,129,0.25)

### Brand Name (.brand-name)
- h3: Montserrat 18px 700 letter-spacing 0.5px
- span: 11px var(--text-light) uppercase letter-spacing 1px

### Menu Item (.menu-item)
- Default: color var(--text-secondary), padding 14px 18px, border-radius 8px, weight 500
- Hover: color var(--primary-color), background var(--primary-light)
- Active: color var(--primary-color), background transparent, weight 600

### WAJIB: Dark Mode Sidebar Override

```css
[data-theme="dark"] .sidebar { color: #FFFFFF; }
[data-theme="dark"] .sidebar .menu-item { color: #A3A6AD; }
[data-theme="dark"] .sidebar .menu-item:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.06);
}
[data-theme="dark"] .sidebar .menu-item.active {
    color: #00C897;
    font-weight: 600;
}
```

Tanpa override ini, teks E-Kontrak dan nama pengguna tidak terlihat di Light Mode
(putih di atas putih). Bug yang sudah diperbaiki - jangan hapus.

### Theme Toggle (.theme-switch-wrapper)
- background var(--bg-primary), border 1px var(--border-color), border-radius 50px
- Toggle ON: background-color var(--primary-color)
- Toggle OFF: background-color #475569
- Knob: 18x18px circle, background #fff

### User Profile
- Avatar: 40x40px circle, background #cbd5e1
- Nama: 13px bold | Role: 11px var(--text-light)

---

## 5. Main Header

- Layout: flex, justify-content space-between, margin-bottom 35px
- Page Title h1: Montserrat 28px 700
- Subtitle: 14px var(--text-secondary)
- Search Box: 300px, bg var(--bg-secondary), border 1px var(--border-color), border-radius 8px
- Search Focus: border-color var(--primary-color), box-shadow 0 0 0 3px var(--primary-light)

---

## 6. Tombol (Buttons)

Base .btn: padding 12px 32px, border-radius 24px (pill), height 48px, Roboto 500 14px

### .btn-primary
- bg var(--primary-color), color #ffffff
- shadow: 0px 4px 12px rgba(16,185,129,0.25)
- Hover: var(--primary-hover), shadow 0px 6px 16px rgba(16,185,129,0.35), translateY(-1px)
- Active: #047857, shadow 0px 2px 8px

### .btn-secondary
- bg #ffffff, border 2px solid var(--text-primary), color var(--text-primary)
- Hover: bg #f3f4f6 | Active: bg #ededed
- DARK: bg transparent, border 1px solid #50535B, color #A3A6AD
- DARK Hover: bg #3F4148, color #FFFFFF | DARK Active: bg #2C2D31

### .btn-success
- bg var(--accent-green)=#41B983, color #ffffff, hover opacity 0.9

### .btn-info
- bg var(--accent-blue)=#485FC7, color #ffffff, hover opacity 0.9

### .btn-sm (tombol di dalam tabel)
- padding 8px 16px, font-size 12px, height 36px, border-radius 24px (tetap pill)

### .btn-icon-only
- 44x44px, border-radius 24px, bg var(--bg-secondary), border 1px var(--border-color)

---

## 7. Kartu & Widget

### Stat Card (.stat-card) - Dashboard
- bg var(--bg-secondary), border 1px var(--border-color), border-radius 12px, padding 24px
- Grid: 4 kolom, gap 24px, margin-bottom 35px
- Hover: translateY(-4px), shadow-md, border-color var(--border-hover)
- DARK Hover: background #3F4148, border-color #00C897

Stat Icon (55x55px, border-radius 8px):
- .bg-indigo: bg primary-light, icon primary-color
- .bg-warning: bg warning-light, icon warning-color
- .bg-success: bg success-light, icon success-color
- .bg-info: bg info-light, icon info-color
Stat Number: Montserrat 24px 700

### Widget Card (.widget-card) - Tabel & Panel
- bg var(--bg-secondary), border 1px var(--border-color), border-radius 12px
- box-shadow var(--shadow-sm), margin-bottom 30px, overflow hidden

!!PENTING!! Widget card TIDAK BOLEH punya style [data-theme="dark"] .widget-card:hover
Jika ditambahkan, seluruh tabel akan ikut tersorot (bukan per baris).
Bug ini pernah terjadi dan diperbaiki. Jangan ulangi.

Widget Header (.widget-header):
- padding 20px 24px, border-bottom 1px var(--border-color), h3 Montserrat 16px 600

---

## 8. Tabel Data (.table)

- width 100%, border-collapse collapse, text-align left

Header (th):
- padding 16px 20px, weight 600, bg var(--bg-primary), color var(--text-secondary)
- uppercase, font-size 11px, letter-spacing 0.5px
- DARK: bg rgba(31,32,36,0.5), color #A3A6AD

Data Row (td):
- padding 16px 20px, font-size 14px, border-bottom 1px var(--border-color)

### Row Hover - SANGAT PENTING

```css
/* Light Mode */
.table tbody tr:hover {
    background-color: var(--primary-light);  /* hijau transparan */
    cursor: pointer;
}

/* Dark Mode - hanya per baris */
[data-theme="dark"] .table tbody tr:hover {
    background-color: #3F4148;
}
```

JANGAN pakai .widget-card:hover di dark mode. Menyebabkan seluruh tabel berubah warna.

Employee Name Wrapper:
- strong: color var(--text-primary)
- span: font-size 12px, color var(--text-secondary)

---

## 9. Badges

padding 4px 10px, border-radius 12px, font-size 12px, weight 500

| Class | Background | Color | Border |
|-------|-----------|-------|--------|
| .badge-primary | primary-light | primary-color | rgba(16,185,129,0.2) |
| .badge-success | success-light | success-color | rgba(16,185,129,0.3) |
| .badge-warning | warning-light | warning-color | rgba(168,85,247,0.3) |
| .badge-danger | danger-light | danger-color | rgba(239,68,68,0.3) |
| .badge-secondary | #f3f4f6 | #4a4a4a | #d1d5db |

Dark .badge-secondary: bg rgba(63,65,72,0.3), color #A3A6AD, border #50535B

---

## 10. Form Controls

Input & Select:
- height 40px, padding 10px 14px, border 1px var(--border-color), border-radius 8px
- Roboto 400 14px, color var(--text-secondary)
- Light bg: #ffffff | Dark bg: #1F2024
- Focus Light: border var(--accent-blue), shadow 0 0 0 3px rgba(72,95,199,0.1)
- Focus Dark: border #00C897, shadow 0 0 0 3px rgba(0,200,151,0.2)
- Readonly: bg #f3f4f6 (light) / rgba(44,45,49,0.5) (dark), opacity 0.7

### WAJIB: Dark Mode Form Override

```css
[data-theme="dark"] .form-control,
[data-theme="dark"] .filter-group select,
[data-theme="dark"] .search-box input {
    background-color: #1F2024;
    border-color: #3F4148;
    color: #FFFFFF;
}
[data-theme="dark"] .form-control:focus,
[data-theme="dark"] .filter-group select:focus,
[data-theme="dark"] .search-box input:focus {
    border-color: #00C897;
    box-shadow: 0px 0px 0px 3px rgba(0, 200, 151, 0.2);
}
[data-theme="dark"] .form-control[readonly] {
    background-color: rgba(44, 45, 49, 0.5);
    color: #7E828A;
    border-color: #3F4148;
}
```

Form Label: 14px weight 600, color var(--text-primary), margin-bottom 6px
Filter Panel: bg var(--bg-secondary), border 1px var(--border-color), border-radius 12px, padding 20px

---

## 11. Modal Dialog

- bg var(--bg-secondary), border-radius 12px, box-shadow var(--shadow-glass), max-width 800px
- Header: padding 24px 28px, h2 Montserrat 20px 600
- Body: padding 28px
- Footer: padding 20px 28px, border-top, flex justify-end, gap 12px

Modal Tabs: bg var(--bg-primary), border-bottom, padding 0 20px
- DARK: bg #2C2D31

Tab Button: padding 15px 20px, 13px weight 600, color var(--text-secondary)
- Active: color var(--primary-color), border-bottom-color var(--primary-color)

---

## 12. Alert Banner

- padding 14px 20px, border-radius 8px, font-size 13px
- .alert-info: bg var(--info-light), border 1px var(--info-color), color var(--info-color)

---

## 13. Dashboard Charts (Chart.js via CDN)

### Doughnut Chart - Komposisi Jabatan PPPK (canvas id: chart-jabatan)
- Container height: 320px, padding 20px
- Colors: ['#10B981', '#485FC7', '#F59E0B', '#A855F7', '#EC4899', '#9CA3AF']
- Cutout: 70%, Legend: right

### Bar Chart - Jadwal Perpanjangan Kontrak (canvas id: chart-kontrak)
- Container height: 320px, padding 20px
- Bar color: #485FC7, border-radius 4px, barPercentage 0.6

### WAJIB: Cara Deteksi Tema di JavaScript

```js
// BENAR
const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
// SALAH - jangan gunakan ini:
// const isDark = document.body.getAttribute('data-theme') === 'dark';

const textColor = isDark ? '#FFFFFF' : '#4A4A4A';
const gridColor = isDark ? '#3F4148' : '#E5E7EB';
```

Menggunakan document.body akan membuat teks grafik selalu gelap meski di Dark Mode.

---

## 14. Depth & Elevation

| Level | Light Shadow | Dark Shadow | Digunakan |
|-------|-------------|-------------|-----------|
| Flat | none | none | Disabled |
| Raised | 0px 2px 8px rgba(0,0,0,0.04) | 0px 4px 6px rgba(0,0,0,0.2) | Kartu default |
| Elevated | 0px 4px 12px rgba(16,185,129,0.25) | 0px 6px 12px rgba(0,0,0,0.3) | Tombol primary |
| Lifted | 0px 4px 16px rgba(0,0,0,0.08) | 0px 8px 24px rgba(0,0,0,0.4) | Hover card |
| Floating | 0px 6px 20px rgba(0,0,0,0.12) | 0px 8px 32px rgba(0,0,0,0.4) | Modal |

---

## 15. Typography

| Role | Font | Size | Weight | Color Light | Color Dark |
|------|------|------|--------|------------|-----------|
| Page Title h1 | Montserrat | 28px | 700 | --text-primary | #FFFFFF |
| Widget h3 | Montserrat | 16px | 600 | --text-primary | #FFFFFF |
| Stat Number | Montserrat | 24px | 700 | --text-primary | #FFFFFF |
| Body/Table td | Roboto | 14px | 300 | --text-secondary | #A3A6AD |
| Form Label | Roboto | 14px | 600 | --text-primary | #FFFFFF |
| Button Text | Roboto | 14px | 500 | #ffffff | #ffffff |
| Caption/NIP | Roboto | 12px | 400 | --text-secondary | #A3A6AD |
| Table th | Roboto | 11px | 600 | --text-secondary | #A3A6AD |
| Brand Subtitle | Roboto | 11px | 400 | --text-light | #7E828A |

---

## 16. Do's & Don'ts

### LAKUKAN
- Gunakan CSS variables untuk semua warna - jangan hardcode
- border-radius 24px untuk semua tombol (pill)
- border-radius 8px untuk input & select
- border-radius 12px untuk widget card & stat card
- Hover HANYA ke tbody tr:hover - BUKAN .widget-card:hover
- Deteksi tema JS: document.documentElement.getAttribute('data-theme')
- Override Dark Mode di bagian bawah styles.css

### JANGAN LAKUKAN
- JANGAN hardcode warna di CSS komponen, gunakan variable
- JANGAN tambahkan [data-theme="dark"] .widget-card:hover (seluruh tabel tersorot)
- JANGAN gunakan document.body.getAttribute('data-theme') di JS
- JANGAN ubah --primary-color Light dari #10B981
- JANGAN ubah --primary-color Dark dari #00C897
- JANGAN ubah font Montserrat di heading
- JANGAN buat tombol border-radius < 24px
- JANGAN buat tombol height < 48px (kecuali .btn-sm = 36px)
- JANGAN ubah sidebar Light Mode dari background #FFFFFF

---

## 17. Checklist Dark Mode Override di styles.css

Semua override berikut harus ada di bagian BAWAH styles.css:

- [x] .sidebar -> color: #FFFFFF
- [x] .sidebar .menu-item -> color: #A3A6AD
- [x] .sidebar .menu-item:hover -> color: #FFFFFF, bg rgba(255,255,255,0.06)
- [x] .sidebar .menu-item.active -> color: #00C897, weight 600
- [x] .btn-secondary -> transparent bg, border #50535B, color #A3A6AD
- [x] .btn-secondary:hover -> bg #3F4148, color #FFFFFF
- [x] .btn-secondary:active -> bg #2C2D31
- [x] .form-control, .filter-group select, .search-box input -> bg #1F2024, border #3F4148, color #FFFFFF
- [x] .form-control:focus (dan varian) -> border #00C897, shadow rgba(0,200,151,0.2)
- [x] .form-control[readonly] -> bg rgba(44,45,49,0.5), color #7E828A
- [x] .stat-card:hover -> bg #3F4148, border #00C897
- [x] .table th -> bg rgba(31,32,36,0.5), color #A3A6AD
- [x] .table tbody tr:hover -> bg #3F4148 (HANYA per baris, bukan widget-card)
- [x] .modal-tabs -> bg #2C2D31
- [x] .badge-secondary -> bg rgba(63,65,72,0.3), color #A3A6AD, border #50535B