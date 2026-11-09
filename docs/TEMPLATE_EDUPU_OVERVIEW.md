# Dokumentasi Template Platform eDupu

Dokumen ini merangkum transformasi sistem **eDupu** menjadi sebuah **Website Template (White-Label School Management System)** yang siap digunakan oleh berbagai sekolah, madrasah, maupun institusi pendidikan kejuruan.

---

## 1. Identitas Branding Template
- **Nama Produk**: eDupu Platform / eDupu Learning System
- **Tagline**: *Transformasi Digital Pembelajaran & Presensi Sekolah Modern*
- **Kategori**: School Management System (SMS), Learning Management System (LMS), GPS Geofencing Attendance, & Digital CBT Examination
- **Target Pengguna**: Sekolah Menengah Kejuruan (SMK), SMA, MA, dan Lembaga Pelatihan Vokasi

---

## 2. Fitur Inti Platform

### A. Presensi GPS Geofencing Mandiri
- Menggunakan formula geodesik **Haversine** untuk kalkulasi jarak radius terhadap koordinat gerbang kampus sekolah (default toleransi: 80 meter).
- Dilengkapi checkpoint proteksi *Anti-Fake GPS* dan deteksi akurasi sinyal satelit.
- Interaktif dengan peta visual Leaflet.js.

### B. Ujian Digital CBT Online Anti-Curang
- Autosave berkala ke local storage & sinkronisasi otomatis ke cloud.
- Deteksi perpindahan tab browser (anti-cheat listener).
- Palet nomor soal interaktif dengan penanda ragu-ragu dan timer countdown otomatis terkunci.

### C. Pengelolaan Nilai & Ekspor Rapor Kurikulum Merdeka
- Format penilaian standar: Nilai Formatif (NF), Nilai Sumatif (NS), dan Nilai Akhir (NA) terbobot otomatis.
- Cetak lembar Kartu Peserta Ujian, Jadwal Pelajaran, dan Raport Resmi berformat PDF & lembar cetak standar instansi.

---

## 3. Ekosistem 6 Hak Akses (Role Matrix)

| Role | Username Demo | Password | Dashboard File | Fokus Utama |
|---|---|---|---|---|
| **Siswa** | `bagus` | `siswa123` | `dashboard.html` | Presensi GPS, Jadwal, CBT, Nilai Raport, Modul |
| **Guru Mapel** | `guru` | `guru123` | `instructor-dashboard.html` | Bank Soal CBT, Input Nilai Formatif & Sumatif |
| **Wali Kelas** | `wali` | `wali123` | `instructor-dashboard.html` | Rekap Kehadiran, Cetak Raport, Catatan Karakter |
| **Admin TU** | `admintu` | `admin123` | `instructor-dashboard.html` | Master Siswa & Guru (Dapodik), Reset Sandi Akun |
| **Kepala Sekolah** | `kepsek` | `kepsek123` | `instructor-dashboard.html` | Laporan Eksekutif, Mutu Kelulusan, Evaluasi Guru |
| **Super Admin** | `superadmin` | `superadmin123` | `instructor-dashboard.html` | Parameter GPS Geofence, Log Audit, Cadangkan DB |

---

## 4. Struktur File Proyek

```text
eDupu/
├── index.html                   # Landing page modern & responsif (fitur, alur, geofence, FAQ)
├── login.html                   # Unified portal login 6 role
├── dashboard.html               # Dashboard terpadu portal siswa
├── instructor-dashboard.html    # Dashboard DreamsLMS multi-role (5 role staf & admin)
├── instructor-profile.html      # Halaman profil & biodata pendidik terintegrasi
├── css/
│   ├── style.css                # Base design system & typography
│   ├── landing.css              # Custom styling landing page
│   ├── login.css                # Styling portal login
│   ├── dashboard.css            # Styling dashboard siswa
│   └── instructor.css           # Styling DreamsLMS compact layout & sidebar
├── js/
│   ├── main.js                  # Global utilities, toast notification, dynamic year
│   ├── auth.js                  # Preset akun 6 role & autentikasi sistem
│   ├── dashboard.js             # Logika dashboard siswa, peta GPS, CBT, & cetak PDF
│   └── instructor.js            # Switch role, navigasi 14 menu, simulator geofence, dsb.
└── docs/                        # Dokumentasi teknis & arsitektur proyek
```

---
*Dokumentasi ini dibuat otomatis sebagai referensi penerapan template eDupu.*

