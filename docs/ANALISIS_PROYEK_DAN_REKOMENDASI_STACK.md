# Ringkasan Analisis Proyek & Rekomendasi Teknologi
**Proyek:** APK Learning – Sistem Informasi Pembelajaran Terintegrasi  
**Instansi:** SMK Puger  
**Tanggal Dokumen:** November 2026  

---

## 1. Pendahuluan & Latar Belakang
APK Learning dirancang sebagai platform pembelajaran digital terintegrasi untuk menyederhanakan birokrasi administrasi akademik, meningkatkan disiplin kehadiran berbasis lokasi, dan memfasilitasi ujian terstandarisasi bagi seluruh civitas akademika SMK Puger.

Platform ditujukan untuk diakses secara responsif melalui browser di smartphone (mobile), tablet, maupun PC/laptop tanpa mewajibkan siswa mengunduh aplikasi native dari Play Store / App Store, namun dapat diinstal sebagai PWA (*Progressive Web App*).

---

## 2. Modul & Fitur Kunci Sistem

### A. Dashboard Terpadu
- Statistik real-time jumlah siswa, guru, kelas, jurusan, dan mata pelajaran aktif.
- Ringkasan statistik kehadiran harian (Hadir, Sakit, Izin, Alpa/Terlambat).
- Tampilan widget dan navigasi menyesuaikan *role* pengguna yang sedang login.

### B. Absensi Digital Berbasis Geofencing GPS
- Pengambilan titik koordinat pengguna secara otomatis menggunakan **HTML5 Geolocation API**.
- Validasi jarak antara posisi siswa dengan titik pusat koordinat sekolah menggunakan formula jarak geodesik (*Haversine*), dengan radius batas toleransi (misal 50–100 meter).
- Pencatatan parameter keamanan: *timestamp*, koordinat lintang/bujur, tingkat akurasi GPS (*accuracy in meters*), dan deteksi ganjil (*anti-fake GPS/spoofing checkpoint*).
- Rekapitulasi absensi harian dan bulanan dengan filter tanggal, kelas, dan perorangan.

### C. Pengelolaan & Rekap Nilai Akademik
- Form input nilai tugas, ujian, praktikum kejuruan, dan penilaian proyek.
- Perhitungan nilai akhir otomatis berdasarkan pembobotan/rumus kurikulum sekolah (Merdeka/K13).
- Lembar rekapitulasi nilai per kelas dan per mata pelajaran.
- Fitur ekspor lembar nilai ke format Excel (.xlsx) dan PDF siap cetak.

### D. Ujian Digital (CBT / Computer-Based Test)
- Manajemen bank soal oleh guru (Pilihan Ganda & Esai).
- Pengaturan jadwal pelaksanaan, durasi waktu pengerjaan (countdown timer), dan token ujian.
- **Autosave berkala** (penyimpanan jawaban otomatis ke memori lokal browser & background sync ke server) guna mengantisipasi putus jaringan saat ujian.
- Pencegahan kecurangan dasar: deteksi ganti tab / keluar dari layar ujian (*Page Visibility API*).
- Penilaian otomatis untuk soal pilihan ganda secara instan saat siswa menyelesaikan ujian.

### E. Manajemen Data Master & Akademik
- Data Master: Siswa, Guru, Kelas, Konsentrasi Keahlian/Jurusan, Mata Pelajaran, Tahun Ajaran/Semester.
- Manajemen Jadwal Pelajaran dan relasi pengampu mata pelajaran.
- Laporan komprehensif kehadiran dan nilai terintegrasi.

---

## 3. Matriks Role & Hak Akses Pengguna

| Role | Hak Akses & Tanggung Jawab Utama |
| :--- | :--- |
| **Super Admin** | Konfigurasi sistem penuh, manajemen database/backup, konfigurasi parameter GPS & radius geofence sekolah. |
| **Admin Sekolah / TU** | Manajemen data master siswa, guru, kelas, jurusan, jadwal pelajaran, cetak berkas administrasi. |
| **Kepala Sekolah** | Akses eksekutif pemantauan: dashboard kehadiran global, capaian akademik, evaluasi pembelajaran. |
| **Guru Mata Pelajaran** | Manajemen materi/tugas, input nilai, pembuatan bank soal, pengawasan ujian digital, presensi harian mengajar. |
| **Wali Kelas** | Pemantauan kehadiran khusus siswa kelas bimbingan, rekap rekam jejak nilai kelas, catatan wali kelas. |
| **Siswa** | Melakukan absensi masuk/pulang dalam radius geofence, mengikuti ujian online, melihat jadwal dan riwayat nilai. |

---

## 4. Rekomendasi Tech Stack

### Pilihan Utama (Sangat Direkomendasikan): **Laravel 11 + Filament v3 / Livewire + Tailwind CSS**
Kombinasi ini merupakan *industry sweet-spot* untuk ekosistem aplikasi institusi pendidikan di Indonesia:

1. **Backend Framework**: **Laravel 11 (PHP 8.x)**
   - Ekosistem andal, aman, dilengkapi ORM Eloquent, Queue, Task Scheduler, dan Spatie Role Permission.
   - Performa optimal, pemeliharaan mudah, serta ramah terhadap berbagai pilihan server (baik VPS murah seperti DigitalOcean/Biznet/IdCloudHost maupun Shared Hosting/Dedicated Server lokal SMK).
2. **Admin Panel**: **FilamentPHP v3**
   - Menghemat waktu pengerjaan modul CRUD administrasi sekolah (manajemen siswa, guru, kelas, nilai, filter, pagination, dan import/export Excel) hingga 60-70%.
3. **Frontend Siswa & Presensi**: **Blade + Tailwind CSS + Alpine.js**
   - Ringan, *mobile-first*, meminimalkan latensi dan konsumsi kuota data siswa.
   - PWA (*Progressive Web App*): Siswa dapat menyematkan sistem ke layar utama HP (*Add to Home Screen*) layaknya aplikasi APK tanpa biaya rilis Google Play Store.
4. **Database**: **MySQL / MariaDB**
   - Standar database relasional, mudah dikelola menggunakan phpMyAdmin atau DBeaver, serta proses backup yang mudah diotomatisasi.
5. **Geolocation & Pemetaan**: **HTML5 Geolocation + Leaflet.js / OpenStreetMap**
   - Gratis tanpa limit kuota penagihan API (dibandingkan Google Maps Platform berbayar).
6. **Modul CBT / Autosave**: **Alpine.js + LocalStorage + API Endpoint Throttling**
   - Melindungi data jawaban siswa tetap aman meskipun koneksi internet di ruang kelas fluktuatif.
7. **Reporting & Ekspor**: **Maatwebsite Excel & DomPDF / Snappy**
   - Standar ekspor laporan absensi dan rapor format resmi PDF/Excel.

---

## 5. Pertimbangan Teknis Penting untuk Implementasi

1. **Wajib Protokol HTTPS (SSL)**:
   Browser seluler modern (Google Chrome, Apple Safari) **memblokir penuh** pengambilan lokasi (`navigator.geolocation`) pada koneksi HTTP biasa. Pastikan domain/subdomain produksi telah aktif sertifikat SSL (misal: Let's Encrypt gratis).
2. **Akurasi & Anti-Fake GPS**:
   - Hitung jarak di sisi server (backend), bukan sekadar mengandalkan validasi di browser/client.
   - Cek nilai `accuracy` yang dikembalikan GPS. Bila nilai akurasi > 50 meter (indikasi sinyal lemah atau sinyal seluler tower), berikan notifikasi peringatan.
3. **Konkurensi Ujian (High Traffic Handling)**:
   - Saat 200–500 siswa mengerjakan ujian serentak, request autosave dijadwalkan secara bertahap (*staggered*) tiap 30–60 detik atau *on-selection change* untuk menghindari *database lock*.
4. **Page Visibility API**:
   - Pasang event listener saat siswa meminimalisir tab ujian atau membuka tab baru untuk memberikan peringatan pelanggaran.

---

## 6. Estimasi Roadmap Pengembangan

- **Fase 1 (Minggu 1–3) – Fondasi & Modul Presensi GPS**:
  - Setup database, autentikasi multi-role, CRUD data master (siswa, guru, kelas, mapel), modul absensi GPS + Geofence.
- **Fase 2 (Minggu 4–6) – Modul Penilaian & Akademik**:
  - Input nilai, bobot nilai, rekapitulasi, dashboard statistik, ekspor PDF/Excel.
- **Fase 3 (Minggu 7–9) – Modul Ujian Digital (CBT)**:
  - Bank soal, pembuatan ujian, timer, autosave, sistem penilaian otomatis, mitigasi ganti tab.
- **Fase 4 (Minggu 10) – UAT, Finishing & Deployment**:
  - Pengujian bersama pihak sekolah (*User Acceptance Test*), optimasi mobile UI, konfigurasi server dan domain sekolah.

