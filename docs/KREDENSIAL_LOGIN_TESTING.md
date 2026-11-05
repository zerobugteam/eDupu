# 🔑 DAFTAR AKUN DAN KREDENSIAL TESTING 6 ROLE
## Sistem Informasi Pembelajaran Terintegrasi (eDupu) — SMK Puger Jember

Dokumen ini berisi daftar nama pengguna (*username*), nomor induk (NISN/NIP), dan kata sandi (*password*) yang dirancang khusus agar **mudah diingat dan cepat diuji** untuk masing-masing dari **6 Role Resmi** sesuai *Proposal Sistem APK Learning SMK Puger*.

---

## 📌 Ringkasan Akun 6 Role Siap Uji

| No | Role Akses | Nama Pengguna | Username / ID | Password | Target Halaman |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Siswa** | Bagus Permadi | `0058291042` *atau* `bagus` | **`siswa123`** | `dashboard.html` (Portal Siswa) |
| **2** | **Guru Mata Pelajaran** | Bpk. Rian Hidayat, S.T. | `19880415` *atau* `guru` | **`guru123`** | `instructor-dashboard.html` |
| **3** | **Wali Kelas** | Bpk. Hendro, S.Kom. | `19840212` *atau* `wali` | **`wali123`** | `instructor-dashboard.html` |
| **4** | **Admin Sekolah / TU** | Ibu Siti Rahayu, S.Pd. | `admintu` *atau* `admin` | **`admin123`** | `instructor-dashboard.html` |
| **5** | **Kepala Sekolah** | Drs. H. Bambang Sutrisno, M.Pd. | `kepsek` *atau* `19671108` | **`kepsek123`** | `instructor-dashboard.html` |
| **6** | **Super Admin** | Tim IT Administrator | `superadmin` | **`superadmin123`** | `instructor-dashboard.html` |

---

siswa : bagus / siswa123
walikelas : wali / wali123
guru mapel : guru / guru123
admin TU : admin / admin123
kepala sekolah : kepsek / kepsek123
super admin : superadmin / superadmin123

## 🚀 Cara Cepat Melakukan Pengujian di Halaman Login

Halaman [`login.html`](file:///d:/Projects/Joki/eDupu/login.html) kini menggunakan **Portal Login Terpadu (Single Portal)**. Anda tidak perlu lagi memilih tab role secara manual:

1. **Masukkan Username**: Cukup ketikkan salah satu username role yang ingin Anda uji:
   - `bagus` (Role Siswa)
   - `guru` (Role Guru Mapel)
   - `wali` (Role Wali Kelas)
   - `admin` (Role Admin TU)
   - `kepsek` (Role Kepala Sekolah)
   - `superadmin` (Role Super Admin)
   *(Sistem juga mendukung login menggunakan NISN/NIP masing-masing)*.
2. **Masukkan Kata Sandi**: Ketikkan kata sandi yang sesuai (contoh: `siswa123`, `guru123`, `wali123`, `admin123`, `kepsek123`, `superadmin123`).
3. **Klik "Masuk ke Dashboard"**: Sistem akan secara otomatis mendeteksi role Anda dan langsung mengarahkan ke halaman dasbor yang sesuai hak aksesnya.

---

## 📋 Rincian Profil & Wewenang Masing-Masing Akun

### 1. Siswa — Bagus Permadi
- **Username / NISN**: `0058291042` atau `bagus`
- **Kata Sandi**: `siswa123`
- **Kelas / Rombel**: XII RPL 1 (Konsentrasi Rekayasa Perangkat Lunak)
- **Akses Menu**:
  - *Beranda*: Data Induk & Identitas Akademik Pribadi (Tampilan SIM Online Polije).
  - *Jadwal Pelajaran*: Tabel jadwal mata pelajaran kelas + Tombol Cetak PDF & Muat Ulang.
  - *Presensi GPS*: Geofence radius 80 meter gerbang kampus + Tombol Presensi Masuk.
  - *Jadwal Ujian*: Tabel sesi ujian PTS/PAS + Tombol Cetak Kartu Ujian + Tombol Mulai CBT.
  - *Nilai Raport*: Capaian kompetensi pembelajaran + Tombol Cetak / Unduh Raport PDF Resmi.
  - *Materi Modul*: Unduh jobsheet lab dan bahan ajar PDF.

---

### 2. Guru Mata Pelajaran — Bpk. Rian Hidayat, S.T.
- **Username / NIP**: `19880415` atau `guru`
- **Kata Sandi**: `guru123`
- **Mata Pelajaran**: Pemrograman Web & Basis Data Terdistribusi
- **Akses Menu**:
  - *Jadwal Mengajar*: Jadwal kelas dan alokasi ruang lab komputer.
  - *Presensi Jam Pelajaran*: Verifikasi daftar hadir siswa per sesi tatap muka.
  - *Input & Rekap Nilai*: Penilaian tugas, formatif (NF), dan sumatif (NS).
  - *Ruang Ujian CBT*: Bank soal (PG & esai), pembuatan jadwal sesi ujian, koreksi esai.
  - *Bahan Ajar*: Unggah modul dan materi pembelajaran siswa.

---

### 3. Wali Kelas — Bpk. Hendro, S.Kom.
- **Username / NIP**: `19840212` atau `wali`
- **Kata Sandi**: `wali123`
- **Kelas Binaan**: XII RPL 1 (36 Siswa)
- **Akses Menu**:
  - *Dasbor Rombel*: Rekapitulasi absensi harian kelas XII RPL 1.
  - *Monitoring Siswa*: Pemantauan siswa bermasalah absensi dan bimbingan konseling.
  - *Leger Nilai Semester*: Himpunan nilai seluruh mapel kelas binaan.
  - *Penerbitan & Cetak Raport*: Pengesahan dan cetak lembar Raport Hasil Belajar resmi.

---

### 4. Admin Sekolah / TU — Ibu Siti Rahayu, S.Pd.
- **Username**: `admintu` atau `admin`
- **Kata Sandi**: `admin123`
- **Divisi**: Tata Usaha & Kesiswaan (Dapodik)
- **Akses Menu**:
  - *Data Master*: Kelola data siswa aktif, penempatan rombel, dan data pendidik.
  - *Jadwal Pelajaran*: Penyusunan jadwal sekolah dan pengaturan ruang teori/lab.
  - *Layanan Akun*: Reset kata sandi siswa/guru dan aktivasi akun baru.
  - *Pelaporan Administrasi*: Rekapitulasi data sekolah untuk dinas pendidikan.

---

### 5. Kepala Sekolah — Drs. H. Bambang Sutrisno, M.Pd.
- **Username / NIP**: `kepsek` atau `19671108`
- **Kata Sandi**: `kepsek123`
- **Jabatan**: Kepala Sekolah SMK Puger Jember
- **Akses Menu**:
  - *Executive Dashboard*: Grafik kehadiran seluruh sekolah dan persentase kehadiran harian.
  - *Monitoring Mutu Akademik*: Evaluasi rata-rata capaian nilai per jurusan/jurusan.
  - *Laporan Evaluasi Pembelajaran*: Akses seluruh data rekapitulasi sekolah secara komprehensif.

---

### 6. Super Admin — Tim IT Administrator
- **Username**: `superadmin`
- **Kata Sandi**: `superadmin123`
- **Fungsi**: Pengelolaan Teknis, Infrastruktur & Keamanan
- **Akses Menu**:
  - *Konfigurasi Sistem Global*: Pengaturan parameter aplikasi dan token API.
  - *Titik Koordinat & Geofence GPS*: Konfigurasi latitude/longitude dan radius absensi sekolah.
  - *Manajemen Akun & Role*: Kontrol hak akses penuh seluruh akun.
  - *Backup & Restore Database*: Pencadangan berkala data sekolah dan log audit sistem.

