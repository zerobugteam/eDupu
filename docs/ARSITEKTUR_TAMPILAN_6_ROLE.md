# 🖥️ ARSITEKTUR TAMPILAN & STRUKTUR MENU 6 ROLE eDupu
## SMK Puger Jember — Sistem Informasi Pembelajaran Terintegrasi (APK Learning)

Dokumen ini merupakan panduan implementasi teknis antarmuka (*User Interface / UI*) untuk **seluruh 6 Role Resmi** pada sistem **eDupu SMK Puger**.

---

## 📌 Ringkasan Distribusi Halaman per Role

| No | Role Akses | Pengguna Representatif | Akun Testing | Halaman Utama | Jumlah Menu |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **1** | **Siswa** | Bagus Permadi (XII RPL 1) | `bagus` / `siswa123` | [`dashboard.html`](../dashboard.html) | **6 Menu** |
| **2** | **Wali Kelas** | Bpk. Hendro, S.Kom. | `wali` / `wali123` | [`instructor-dashboard.html`](../instructor-dashboard.html) | **5 Menu** |
| **3** | **Guru Mapel** | Bpk. Rian Hidayat, S.T. | `guru` / `guru123` | [`instructor-dashboard.html`](../instructor-dashboard.html) | **6 Menu** |
| **4** | **Admin Sekolah / TU** | Ibu Siti Rahayu, S.Pd. | `admin` / `admin123` | [`instructor-dashboard.html`](../instructor-dashboard.html) | **6 Menu** |
| **5** | **Kepala Sekolah** | Drs. H. Bambang Sutrisno | `kepsek` / `kepsek123` | [`instructor-dashboard.html`](../instructor-dashboard.html) | **4 Menu** |
| **6** | **Super Admin** | Tim IT Administrator | `superadmin` / `superadmin123` | [`instructor-dashboard.html`](../instructor-dashboard.html) | **5 Menu** |

---

## 📋 1. Detail Menu: Role Siswa (`dashboard.html`)
*Antarmuka model SIM Akademik Online Polije (Single-Row Navbar Rata Tengah & Header Biru Muda).*

1. **Beranda** (`view-dashboard`)
   - Data Induk Siswa & Biodata Lengkap.
   - Data Akademik Resmi: NISN, Jenjang SMK, Rombel XII RPL 1, Wali Kelas.
2. **Jadwal Pelajaran** (`view-jadwal`)
   - Tabel jadwal harian + Alokasi ruang teori & lab komputer.
   - Fitur: Tombol **Cetak PDF Resmi**, Tombol **Muat Ulang**, Filter Hari (Semua, Senin - Jumat), dan Kotak Pencarian.
3. **Presensi GPS** (`view-absensi`)
   - Peta interaktif Leaflet Geofencing (Radius toleransi gerbang kampus 80 meter).
   - Validasi status lokasi & tombol **KIRIM PRESENSI MASUK**.
   - Tabel riwayat jam masuk & pulang mingguan.
4. **Jadwal Ujian** (`view-jadwal-ujian`)
   - Tabel sesi ujian UTS & UAS CBT.
   - Fitur: Tombol **Mulai Ujian CBT** (langsung membuka `view-cbt`), Tombol **Cetak Kartu Ujian PDF**, dan Muat Ulang.
5. **Nilai Raport** (`view-nilai`)
   - Capaian kompetensi formatif (NF) & sumatif (NS), Nilai Akhir (NA), dan batas KKTP 75.0.
   - Fitur: Tombol **Cetak Raport Siswa PDF**, Pilihan Semester (1 - 5), dan Keterangan Capaian.
6. **Materi Modul** (`view-modul`)
   - Daftar jobsheet lab & modul ajar PDF guru yang dapat diunduh langsung.

---

## 📋 2. Detail Menu: Role Wali Kelas (`instructor-dashboard.html`)
*Fokus: Pembinaan 1 rombel (XII RPL 1), rekapitulasi kehadiran, leger nilai, dan pengesahan raport.*

1. **Dashboard Wali Kelas** (`sec-dashboard`)
   - Metrik Rombel: Total 36 Siswa, KPI kehadiran hari ini (96.8%), sesi CBT aktif, dan rata-rata nilai kelas (88.4).
   - Kartu peringatan dini siswa bermasalah absensi (*Early Warning System*).
2. **Monitoring Presensi Rombel** (`sec-attendance`)
   - Rekapitulasi absensi harian, mingguan, dan bulanan siswa XII RPL 1.
   - Status: Hadir, Terlambat, Sakit, Izin, Alpha + Tombol Ekspor Excel.
3. **Leger Nilai Kelas** (`sec-grades`)
   - Himpunan nilai seluruh mata pelajaran semester 5 untuk penentuan peringkat kelas.
4. **Cetak Raport Siswa** (`sec-raport`)
   - Daftar siswa siap cetak raport Kurikulum Merdeka A4 lengkap format dinas.
   - Tombol Cetak PDF per siswa dan tombol Cetak Massal Rombel.
5. **Catatan Konseling & Karakter** (`sec-konseling`)
   - Pengisian catatan wali kelas untuk kepribadian, nilai ekstrakurikuler, dan catatan kenaikan kelas.

---

## 📋 3. Detail Menu: Role Guru Mapel (`instructor-dashboard.html`)
*Fokus: Proses belajar mengajar, pengelolaan bank soal, ujian CBT, dan penilaian siswa.*

1. **Dashboard Guru Pengampu** (`sec-dashboard`)
   - Jadwal mengajar hari ini, kelas aktif, notifikasi pengumpulan tugas, dan aktivitas pembelajaran.
2. **Jadwal Mengajar Saya** (`sec-schedule`)
   - Matriks jadwal mengajar mingguan dan penetapan laboratorium komputer RPL.
3. **Presensi Jam Pelajaran** (`sec-attendance`)
   - Pembukaan presensi jam tatap muka dan verifikasi kehadiran siswa di kelas/lab.
4. **Input & Rekap Nilai** (`sec-grades`)
   - Input nilai Formatif (NF), Sumatif (NS), dan pembobotan otomatis Nilai Akhir (NA).
5. **Bank Soal & Ujian CBT** (`sec-cbt`)
   - Pembuatan bank soal (Pilihan Ganda & Esai), penjadwalan ujian, durasi timer, monitoring pengerjaan live, dan koreksi esai.
6. **Materi & Modul Ajar** (`sec-courses`)
   - Unggah jobsheet praktikum, silabus, dan modul materi digital PDF.

---

## 📋 4. Detail Menu: Role Admin Sekolah / TU (`instructor-dashboard.html`)
*Fokus: Administrasi master data sekolah, jadwal pelajaran terpusat, layanan akun, dan pelaporan.*

1. **Dashboard Administrasi TU** (`sec-admin-dashboard`)
   - Statistik: 864 Siswa Aktif, 48 Guru, 24 Rombel, status sinkronisasi Dapodik, dan kalender akademik.
2. **Data Master Kesiswaan** (`sec-admin-students`)
   - Tabel pencarian siswa per NISN/nama, filter jurusan (RPL, TKJ, dll.), mutasi kesiswaan, dan tambah siswa baru.
3. **Data Pendidik & Staf** (`sec-admin-teachers`)
   - Data guru pengampu, penetapan wali kelas, dan surat keputusan beban mengajar.
4. **Kurikulum & Jadwal Sekolah** (`sec-schedule`)
   - Penyusunan master jadwal pelajaran sekolah dan alokasi ruang lab/teori terpadu.
5. **Layanan Akun & Sandi** (`sec-admin-accounts`)
   - Fitur reset kata sandi mandiri bagi siswa/guru yang lupa sandi serta aktivasi akun baru.
6. **Laporan & Rekapitulasi** (`sec-admin-reports`)
   - Ekspor rekapitulasi berkas Dapodik, buku induk, dan cetak surat keterangan resmi sekolah.

---

## 📋 5. Detail Menu: Role Kepala Sekolah (`instructor-dashboard.html`)
*Fokus: Pengawasan eksekutif, evaluasi mutu akademik, dan pengambilan kebijakan.*

1. **Dashboard Eksekutif** (`sec-kepsek-dashboard`)
   - KPI Kehadiran sekolah hari ini, grafik tren bulanan, dan indikator mutu akademik per jurusan.
2. **Monitoring Presensi Sekolah** (`sec-attendance`)
   - Rekapitulasi tingkat kehadiran seluruh rombel (Kelas X, XI, XII) dan persentase keterlambatan.
3. **Monitoring Hasil Belajar & CBT** (`sec-kepsek-evaluation`)
   - Grafik distribusi nilai PTS/PAS dan pemantauan siswa di bawah batas tuntas KKTP (75.0).
4. **Laporan Mutu Pendidikan** (`sec-kepsek-reports`)
   - Unduh dan cetak berkas laporan evaluasi sekolah semesteran untuk dinas pendidikan.

---

## 📋 6. Detail Menu: Role Super Admin (`instructor-dashboard.html`)
*Fokus: Konfigurasi teknis infrastruktur, parameter GPS Geofence, keamanan CBT, dan pemeliharaan.*

1. **Dashboard Teknis Sistem** (`sec-super-dashboard`)
   - Status server, CPU load, RAM, pemakaian penyimpanan database, dan total pengguna aktif bersamaan.
2. **Manajemen Akun & Hak Akses** (`sec-super-users`)
   - Manajemen akun 6 role (*Create, Read, Update, Delete*) dan konfigurasi permissions.
3. **Pengaturan GPS & Geofence** (`sec-super-gps`)
   - Pengaturan titik koordinat gerbang kampus SMK Puger (`latitude: -8.36515`, `longitude: 113.47518`) dan slider batas radius (50–100 meter).
4. **Konfigurasi Sistem & CBT** (`sec-super-cbt`)
   - Pengaturan batasan anti-kecurangan (*Safe Exam*), limit perpindahan jendela/tab, autosave interval, dan zona waktu server (WIB).
5. **Cadangan Basis Data & Audit** (`sec-super-backup`)
   - Tombol buat cadangan basis data (*Backup SQL/JSON*), restore data, dan log audit aktivitas sistem.

---
*Dokumen resmi sistem eDupu SMK Puger Jember • Versi 2.8*

