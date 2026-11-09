/**
 * eDupu Platform - School Learning Management System
 * DreamsLMS Style Multi-Role Dashboard Logic (js/instructor.js)
 * Mendukung 5 Role Staff: Guru Mapel, Wali Kelas, Admin TU, Kepsek, Super Admin
 */

let performanceChart, attendanceDonutChart;
let currentActiveRole = 'walikelas';

// Konfigurasi Navigasi dan Menu Resmi per Role
const ROLE_NAV_CONFIGS = {
  guru: {
    roleTitle: 'Menu Guru Mapel',
    defaultView: 'dashboard',
    headerAction: {
      label: 'Buat Ujian CBT',
      icon: 'plus',
      onclick: 'openCreateExamModal()'
    },
    menus: [
      { id: 'dashboard', label: 'Dashboard Guru Pengampu', icon: 'layout-dashboard', badge: 'Aktif' },
      { id: 'schedule', label: 'Jadwal Mengajar Saya', icon: 'calendar', badge: 'Senin - Jumat' },
      { id: 'attendance', label: 'Presensi Jam Pelajaran', icon: 'check-square', badge: 'Tatap Muka' },
      { id: 'grades', label: 'Input & Rekap Nilai', icon: 'clipboard-check' },
      { id: 'cbt', label: 'Bank Soal & Ujian CBT', icon: 'laptop', badge: '3 Sesi' },
      { id: 'courses', label: 'Materi & Modul Ajar', icon: 'book-open', badge: '4 Modul' }
    ]
  },
  walikelas: {
    roleTitle: 'Menu Wali Kelas',
    defaultView: 'dashboard',
    headerAction: {
      label: 'Cetak Raport Kelas',
      icon: 'printer',
      onclick: "switchInstructorView('raport')"
    },
    menus: [
      { id: 'dashboard', label: 'Dashboard Wali Kelas', icon: 'layout-dashboard', badge: 'XII RPL 1' },
      { id: 'attendance', label: 'Monitoring Presensi Rombel', icon: 'map-pin', badge: '36 Siswa' },
      { id: 'grades', label: 'Leger Nilai Kelas', icon: 'clipboard-check', badge: 'Semester 5' },
      { id: 'raport', label: 'Cetak Raport Siswa', icon: 'file-text', badge: 'A4 Resmi' },
      { id: 'konseling', label: 'Catatan Konseling & Karakter', icon: 'award' }
    ]
  },
  admin: {
    roleTitle: 'Menu Administrasi TU',
    defaultView: 'admin-dashboard',
    headerAction: {
      label: 'Tambah Data Siswa',
      icon: 'user-plus',
      onclick: 'openAddStudentModal()'
    },
    menus: [
      { id: 'admin-dashboard', label: 'Dashboard Administrasi TU', icon: 'layout-dashboard', badge: 'Dapodik' },
      { id: 'admin-students', label: 'Data Master Kesiswaan', icon: 'users', badge: '864 Siswa' },
      { id: 'admin-teachers', label: 'Data Pendidik & Staf', icon: 'user-check', badge: '48 Guru' },
      { id: 'schedule', label: 'Kurikulum & Jadwal Sekolah', icon: 'calendar-days' },
      { id: 'admin-accounts', label: 'Layanan Akun & Sandi', icon: 'key-round', badge: 'Reset' },
      { id: 'admin-reports', label: 'Laporan & Rekapitulasi', icon: 'file-spreadsheet', badge: 'Export' }
    ]
  },
  kepsek: {
    roleTitle: 'Menu Kepala Sekolah',
    defaultView: 'kepsek-dashboard',
    headerAction: {
      label: 'Unduh Laporan Mutu',
      icon: 'download',
      onclick: 'downloadLaporanMutu()'
    },
    menus: [
      { id: 'kepsek-dashboard', label: 'Dashboard Eksekutif', icon: 'layout-dashboard', badge: 'Monitoring' },
      { id: 'attendance', label: 'Monitoring Presensi Sekolah', icon: 'map-pin', badge: '97.4%' },
      { id: 'kepsek-evaluation', label: 'Monitoring Hasil Belajar & CBT', icon: 'line-chart', badge: 'KKTP 75.0' },
      { id: 'kepsek-reports', label: 'Laporan Mutu Pendidikan', icon: 'award', badge: 'Dinas' }
    ]
  },
  superadmin: {
    roleTitle: 'Menu Super Admin IT',
    defaultView: 'super-dashboard',
    headerAction: {
      label: 'Backup Database',
      icon: 'database',
      onclick: 'backupSystemDatabase()'
    },
    menus: [
      { id: 'super-dashboard', label: 'Dashboard Teknis Sistem', icon: 'layout-dashboard', badge: 'Online' },
      { id: 'super-users', label: 'Manajemen Akun & Hak Akses', icon: 'shield-alert', badge: '6 Role' },
      { id: 'super-gps', label: 'Pengaturan GPS & Geofence', icon: 'map-pin', badge: '80m Valid' },
      { id: 'super-cbt', label: 'Konfigurasi Sistem & CBT', icon: 'sliders', badge: 'Safe Exam' },
      { id: 'super-backup', label: 'Cadangan Basis Data & Audit', icon: 'database', badge: 'Auto Sync' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initRoleContext();
  initInstructorCharts();
  startInstructorClock();
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Switch modules inside Instructor Dashboard
function switchInstructorView(viewId) {
  // Update sidebar active state
  document.querySelectorAll('.instructor-nav-link').forEach(link => {
    link.classList.remove('active');
  });

  const activeLink = document.getElementById(`nav-${viewId}`);
  if (activeLink) activeLink.classList.add('active');

  // Toggle sections
  document.querySelectorAll('.instructor-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  const targetSec = document.getElementById(`sec-${viewId}`);
  if (targetSec) {
    targetSec.classList.remove('hidden');
    targetSec.classList.add('animate-fade-in');
  }

  // Refresh Lucide icons if any in target section
  if (window.lucide) {
    lucide.createIcons();
  }

  // Scroll to section title smoothly on mobile
  if (window.innerWidth < 1024) {
    const el = document.getElementById(`sec-${viewId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  // Update Header Center Banner Title (Dukungan Responsif Sesuai Role & View)
  const headerBanner = document.getElementById('header-center-banner');
  if (headerBanner) {
    const viewTitles = {
      'admin-dashboard': 'Dasbor Administrasi Sekolah & Layanan Tata Usaha',
      'admin-students': 'Data Master Kesiswaan & Penempatan Rombel',
      'admin-teachers': 'Data Tenaga Pendidik & Kependidikan (PTK)',
      'schedule': currentActiveRole === 'admin' ? 'Kurikulum & Jadwal Pembelajaran Sekolah' : 'Jadwal Mengajar Saya',
      'admin-accounts': 'Layanan Reset Kata Sandi & Verifikasi Akun',
      'admin-reports': 'Pusat Rekapitulasi Data & Laporan Resmi Administrasi',
      'kepsek-dashboard': 'Dashboard Eksekutif & Monitoring Mutu Sekolah',
      'kepsek-evaluation': 'Evaluasi Hasil Belajar & Ketuntasan CBT Siswa',
      'kepsek-reports': 'Laporan Mutu Pendidikan & Akreditasi Sekolah',
      'super-dashboard': 'Pusat Kontrol Teknis & Keamanan Infrastruktur Sistem',
      'super-users': 'Manajemen Akun Terpadu 6 Role & Hak Akses',
      'super-gps': 'Pengaturan Radius GPS Geofence & Titik Gerbang Sekolah',
      'super-cbt': 'Konfigurasi Keamanan Ujian CBT & Server Autosave',
      'super-backup': 'Pencadangan Basis Data & Log Audit Aktivitas',
      'dashboard': currentActiveRole === 'walikelas' ? 'Dashboard Pemantauan Rombel - Wali Kelas' : 'Portal Pembelajaran & Jadwal - Guru Mapel',
      'attendance': currentActiveRole === 'kepsek' ? 'Monitoring Presensi Real-Time Sekolah' : (currentActiveRole === 'walikelas' ? 'Monitoring Presensi Rombel XII RPL 1' : 'Presensi Jam Pelajaran Siswa'),
      'grades': currentActiveRole === 'walikelas' ? 'Leger Nilai Kelas XII RPL 1' : 'Input & Rekap Nilai Siswa',
      'raport': 'Leger & Pencetakan Raport Resmi Kurikulum Merdeka',
      'konseling': 'Buku Catatan Karakter & Bimbingan Konseling Siswa',
      'cbt': 'Bank Soal & Penjadwalan Ujian Online CBT',
      'courses': 'Materi Pembelajaran & Modul Ajar Digital'
    };

    if (viewTitles[viewId]) {
      headerBanner.textContent = viewTitles[viewId];
    } else {
      headerBanner.textContent = 'Dasbor Administrasi Sekolah & Layanan Tata Usaha';
    }
  }
}

// Inisialisasi Konteks Role Pengguna Aktif
function initRoleContext() {
  let user = null;
  try {
    const raw = localStorage.getItem('edupu_current_user');
    if (raw) user = JSON.parse(raw);
  } catch (err) {
    console.error('Error parsing stored user:', err);
  }

  // Jika belum login atau role siswa, defaultkan ke walikelas untuk view staf
  if (!user || user.role === 'siswa' || !ROLE_NAV_CONFIGS[user.role]) {
    user = (typeof DEMO_ACCOUNTS !== 'undefined' && DEMO_ACCOUNTS.walikelas) ? DEMO_ACCOUNTS.walikelas : {
      role: 'walikelas',
      name: 'Bpk. Hendro, S.Kom.',
      nisn: '198402122008011004',
      roleLabel: 'Wali Kelas XII RPL 1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    };
  }

  currentActiveRole = user.role;

  // Update Header User Info
  const nameEl = document.getElementById('header-user-name');
  if (nameEl) nameEl.textContent = user.name;

  const nipEl = document.getElementById('header-user-nip');
  if (nipEl) {
    nipEl.textContent = user.nisn ? `NIP: ${user.nisn}` : `User: ${user.username || 'Staff'}`;
  }

  const badgeEl = document.getElementById('header-user-badge');
  if (badgeEl) badgeEl.textContent = user.roleLabel || 'Staff Pengajar';

  const avatarEl = document.getElementById('header-user-avatar');
  if (avatarEl && user.avatar) avatarEl.src = user.avatar;

  // Update Header Action Button
  const actionContainer = document.getElementById('header-action-container');
  const roleCfg = ROLE_NAV_CONFIGS[user.role] || ROLE_NAV_CONFIGS.walikelas;

  if (actionContainer && roleCfg.headerAction) {
    actionContainer.innerHTML = `
      <button onclick="${roleCfg.headerAction.onclick}" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow transition flex items-center gap-1.5 shrink-0">
        <i data-lucide="${roleCfg.headerAction.icon}" class="w-3.5 h-3.5"></i>
        <span>${roleCfg.headerAction.label}</span>
      </button>
    `;
  }

  // Render Sidebar
  renderRoleSidebar(user.role);

  // Tampilkan View Default Role
  switchInstructorView(roleCfg.defaultView);
}

// Beralih Role Secara Cepat untuk Keperluan Testing
function switchActiveRole(roleKey) {
  if (typeof DEMO_ACCOUNTS !== 'undefined' && DEMO_ACCOUNTS[roleKey]) {
    localStorage.setItem('edupu_current_user', JSON.stringify(DEMO_ACCOUNTS[roleKey]));
    initRoleContext();
    if (typeof showToast === 'function') {
      showToast(`Beralih ke mode tampilan: ${DEMO_ACCOUNTS[roleKey].roleLabel}`, 'info');
    }
  }
}

// Render Dinamis Menu Sidebar Berdasarkan Role
function renderRoleSidebar(role) {
  const container = document.getElementById('sidebar-menu-container');
  if (!container) return;

  const cfg = ROLE_NAV_CONFIGS[role] || ROLE_NAV_CONFIGS.walikelas;

  let html = `
    <div class="instructor-sidebar-title">${cfg.roleTitle}</div>
  `;

  cfg.menus.forEach((item, idx) => {
    const badgeHtml = item.badge ? `<span class="badge bg-blue-100 text-blue-700 ml-auto font-mono text-[9px]">${item.badge}</span>` : '';
    html += `
      <a href="javascript:void(0)" onclick="switchInstructorView('${item.id}')" id="nav-${item.id}" class="instructor-nav-link ${idx === 0 ? 'active' : ''}">
        <i data-lucide="${item.icon}"></i>
        <span class="truncate">${item.label}</span>
        ${badgeHtml}
      </a>
    `;
  });

  // Tambahkan Menu Navigasi Standar di Bagian Bawah
  html += `
    <div class="instructor-sidebar-title pt-3">Akses & Sesi</div>
    <a href="dashboard.html" class="instructor-nav-link text-slate-500">
      <i data-lucide="monitor"></i>
      <span>Mode Portal Siswa</span>
    </a>
    <a href="javascript:void(0)" onclick="logoutUser()" class="instructor-nav-link text-rose-600 hover:bg-rose-50 hover:text-rose-700">
      <i data-lucide="log-out" class="text-rose-500"></i>
      <span>Keluar / Logout</span>
    </a>
  `;

  container.innerHTML = html;

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Initialize Charts with DreamsLMS Look & Feel
function initInstructorCharts() {
  // 1. Performance & Attendance Line Chart
  const perfCtx = document.getElementById('instructorPerfChart');
  if (perfCtx) {
    if (performanceChart) performanceChart.destroy();

    const ctx = perfCtx.getContext('2d');
    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 260);
    gradientGreen.addColorStop(0, 'rgba(5, 150, 105, 0.25)');
    gradientGreen.addColorStop(1, 'rgba(5, 150, 105, 0.01)');

    const gradientBlue = ctx.createLinearGradient(0, 0, 0, 260);
    gradientBlue.addColorStop(0, 'rgba(37, 99, 235, 0.22)');
    gradientBlue.addColorStop(1, 'rgba(37, 99, 235, 0.01)');

    performanceChart = new Chart(perfCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
        datasets: [
          {
            label: 'Rata-rata Nilai Tugas & CBT',
            data: [78, 80, 84, 82, 86, 88, 85, 89, 91, 88, 92],
            borderColor: '#059669',
            backgroundColor: gradientGreen,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#059669',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Tingkat Kehadiran (%)',
            data: [92, 94, 91, 95, 96, 94, 97, 95, 96, 98, 97],
            borderColor: '#3d5ee1',
            backgroundColor: gradientBlue,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#3d5ee1',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1b2559',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 10
          }
        },
        scales: {
          y: {
            min: 60,
            max: 100,
            ticks: {
              stepSize: 10,
              font: { family: 'Inter', size: 11 },
              color: '#8c97a8'
            },
            grid: {
              color: '#f0f2f5',
              borderDash: [3, 3]
            },
            border: { display: false }
          },
          x: {
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#8c97a8'
            },
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }

  // 2. Attendance Donut Chart
  const donutCtx = document.getElementById('instructorDonutChart');
  if (donutCtx) {
    if (attendanceDonutChart) attendanceDonutChart.destroy();

    attendanceDonutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Hadir Tepat Waktu (GPS)', 'Terlambat Masuk', 'Izin / Sakit'],
        datasets: [{
          data: [95.4, 3.2, 1.4],
          backgroundColor: ['#159f46', '#f6a000', '#f04438'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1b2559',
            callbacks: {
              label: function(item) {
                return ` ${item.label}: ${item.raw}%`;
              }
            }
          }
        }
      }
    });
  }
}

// Live Clock in Header
function startInstructorClock() {
  const clockEl = document.getElementById('instructor-live-clock');
  if (clockEl) {
    setInterval(() => {
      const now = new Date();
      clockEl.innerText = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
    }, 1000);
  }
}

// Modal: Buat Ujian CBT Baru
function openCreateExamModal() {
  const modal = document.getElementById('modal-create-exam');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeCreateExamModal() {
  const modal = document.getElementById('modal-create-exam');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function submitNewExam(e) {
  if (e) e.preventDefault();
  closeCreateExamModal();
  if (typeof showToast === 'function') {
    showToast('Paket Soal CBT Baru Berhasil Diterbitkan untuk Siswa!', 'success');
  } else {
    alert('Paket Soal CBT Baru Berhasil Diterbitkan!');
  }
}

// ==============================================================
// 0. HEADER PROFILE AVATAR DROPDOWN (Shadcn Style)
// ==============================================================
function toggleProfileDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown-menu');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
    if (window.lucide) {
      lucide.createIcons();
    }
  }
}

function closeProfileDropdown() {
  const dropdown = document.getElementById('profile-dropdown-menu');
  if (dropdown) {
    dropdown.classList.add('hidden');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('profile-dropdown-menu');
  const btn = document.getElementById('btn-profile-dropdown');
  if (dropdown && !dropdown.classList.contains('hidden')) {
    if (btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  }
});

// ==============================================================
// 1. PROFIL & BIODATA PENDIDIK
// ==============================================================
function saveProfileSettings(e) {
  if (e) e.preventDefault();
  const phone = document.getElementById('prof-phone')?.value || '';
  const email = document.getElementById('prof-email')?.value || '';
  
  if (typeof showToast === 'function') {
    showToast('Biodata & kontak Bpk. Hendro berhasil diperbarui!', 'success');
  } else {
    alert('Perubahan profil berhasil disimpan!');
  }
}

// ==============================================================
// 2. JADWAL MENGAJAR FILTER HARI
// ==============================================================
function filterScheduleDay(day, btnEl) {
  // Update button active state
  document.querySelectorAll('.schedule-day-btn').forEach(btn => {
    btn.classList.remove('bg-orange-500', 'text-white');
    btn.classList.add('bg-slate-100', 'text-slate-600');
  });

  if (btnEl) {
    btnEl.classList.remove('bg-slate-100', 'text-slate-600');
    btnEl.classList.add('bg-orange-500', 'text-white');
  }

  // Filter cards
  const cards = document.querySelectorAll('.schedule-card');
  cards.forEach(card => {
    const cardDay = card.getAttribute('data-day');
    if (day === 'all' || cardDay === day) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// ==============================================================
// 3. PENGUMUMAN KELAS
// ==============================================================
function openCreateAnnouncementModal() {
  const modal = document.getElementById('modal-create-announcement');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeCreateAnnouncementModal() {
  const modal = document.getElementById('modal-create-announcement');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function submitNewAnnouncement(e) {
  if (e) e.preventDefault();
  const title = document.getElementById('ann-title')?.value || 'Pengumuman Baru';
  const category = document.getElementById('ann-category')?.value || 'Informasi Umum';
  const target = document.getElementById('ann-target')?.value || 'Semua Siswa RPL';
  const content = document.getElementById('ann-content')?.value || '';

  const container = document.getElementById('announcements-list-container');
  if (container) {
    const newCard = document.createElement('div');
    newCard.className = 'p-5 rounded-2xl border-2 border-orange-400 bg-orange-50/20 space-y-3 animate-fade-in';
    newCard.innerHTML = `
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white flex items-center gap-1">
            <i class="fa-solid fa-bullhorn text-[9px]"></i> Baru Saja
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">${category}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Sasaran: ${target}</span>
        </div>
        <div class="text-[11px] text-slate-400 font-mono">
          <i class="fa-regular fa-clock mr-1"></i> Baru saja
        </div>
      </div>
      <div>
        <h3 class="text-base font-extrabold text-slate-900">${title}</h3>
        <p class="text-xs text-slate-600 leading-relaxed mt-1.5">${content}</p>
      </div>
      <div class="pt-2 border-t border-orange-100 flex items-center justify-between text-xs">
        <span class="font-bold text-emerald-600 text-[11px]"><i class="fa-solid fa-check mr-1"></i> Notifikasi terkirim ke ponsel siswa</span>
      </div>
    `;
    container.prepend(newCard);
  }

  closeCreateAnnouncementModal();
  if (typeof showToast === 'function') {
    showToast('Pengumuman baru berhasil disiarkan ke siswa!', 'success');
  }
}

// ==============================================================
// 4. PESAN & KONSULTASI SISWA INTERAKTIF
// ==============================================================
const studentChatData = {
  fauzi: {
    name: 'Ahmad Fauzi',
    sub: 'Siswa XII RPL 1 • Sedang Online di Aplikasi Siswa',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    messages: [
      { sender: 'siswa', text: 'Selamat pagi Pak Hendro. Mohon izin bertanya, untuk tugas Modul 8 Laravel 11 bagian migrasi database apakah tabel <code class="bg-slate-100 px-1 py-0.5 rounded text-orange-600 font-mono">students</code> perlu ditambahkan foreign key ke tabel <code class="bg-slate-100 px-1 py-0.5 rounded text-orange-600 font-mono">classes</code> sekarang pak?', time: '08:05 WIB' },
      { sender: 'guru', text: 'Pagi Ahmad. Betul sekali, silakan gunakan constrained foreign key di migrasi: <br><code class="bg-black/20 text-orange-100 px-1.5 py-0.5 rounded font-mono text-[11px] mt-1 inline-block">$table->foreignId(\'class_id\')->constrained();</code>', time: '08:09 WIB' },
      { sender: 'siswa', text: 'Siap pak, terima kasih banyak pencerahannya. Untuk ujian CBT nanti jam 09.00 apakah laptop kami wajib terhubung ke WiFi Lab RPL 1 pak?', time: '08:12 WIB' }
    ]
  },
  siti: {
    name: 'Siti Nurhaliza',
    sub: 'Siswa XII RPL 2 • Aktif 15 menit lalu',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    messages: [
      { sender: 'siswa', text: 'Assalamu\'alaikum Pak Hendro, izin melaporkan tugas API endpoint produk sudah selesai saya upload ke GitHub pak.', time: '07:30 WIB' },
      { sender: 'guru', text: 'Wa\'alaikumsalam Siti. Bagus sekali, pastikan format return JSON sesuai standar ya.', time: '07:38 WIB' },
      { sender: 'siswa', text: 'Terima kasih pak, REST API Controller saya sudah bisa return JSON dengan status 200 OK.', time: '07:45 WIB' }
    ]
  },
  budi: {
    name: 'Budi Santoso',
    sub: 'Siswa XI RPL 1 • Offline',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    messages: [
      { sender: 'siswa', text: 'Pak izin bertanya mengenai jadwal remidi presensi GPS hari Kamis, apakah di ruang Lab Komputer 2 pak?', time: 'Kemarin 14:20 WIB' },
      { sender: 'guru', text: 'Iya Budi, jam 13.00 di Lab Komputer 2 bersama staf TU.', time: 'Kemarin 14:35 WIB' }
    ]
  },
  rangga: {
    name: 'Rangga Pratama',
    sub: 'Siswa X PPLG • Offline',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    messages: [
      { sender: 'siswa', text: 'Pak link materi dasar algoritma pemrograman bab 3 belum bisa dibuka di portal siswa...', time: 'Kemarin 16:10 WIB' },
      { sender: 'guru', text: 'Halo Rangga, sudah bapak perbarui akses link Google Drive-nya. Silakan dicoba lagi ya.', time: 'Kemarin 16:40 WIB' }
    ]
  }
};

let currentChatId = 'fauzi';

function selectChatContact(studentId, el) {
  currentChatId = studentId;
  const data = studentChatData[studentId];
  if (!data) return;

  // Update contact list styling
  document.querySelectorAll('.chat-contact-item').forEach(item => {
    item.classList.remove('bg-orange-50/60', 'border-l-4', 'border-orange-500');
  });
  if (el) {
    el.classList.add('bg-orange-50/60', 'border-l-4', 'border-orange-500');
  }

  // Update header
  const nameEl = document.getElementById('chat-header-name');
  const subEl = document.getElementById('chat-header-sub');
  const avatarEl = document.getElementById('chat-header-avatar');
  if (nameEl) nameEl.innerText = data.name;
  if (subEl) subEl.innerText = data.sub;
  if (avatarEl) avatarEl.src = data.avatar;

  // Render messages
  const msgContainer = document.getElementById('chat-messages-container');
  if (msgContainer) {
    let html = `
      <div class="flex items-center justify-center">
        <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-600 font-mono">
          Riwayat Percakapan • ${data.name}
        </span>
      </div>
    `;

    data.messages.forEach(m => {
      if (m.sender === 'siswa') {
        html += `
          <div class="flex items-start gap-3 max-w-[85%]">
            <img src="${data.avatar}" class="w-8 h-8 rounded-full object-cover shrink-0 mt-1">
            <div class="space-y-1">
              <div class="p-3.5 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs leading-relaxed">
                ${m.text}
              </div>
              <span class="text-[10px] font-mono text-slate-400 pl-1">${m.time}</span>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="flex items-start justify-end gap-3 max-w-[85%] ml-auto">
            <div class="space-y-1 text-right">
              <div class="p-3.5 rounded-2xl rounded-tr-sm bg-lms-primary text-white text-xs shadow-2xs leading-relaxed text-left">
                ${m.text}
              </div>
              <span class="text-[10px] font-mono text-slate-400 pr-1">${m.time} • Dibaca</span>
            </div>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250" class="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-orange-500">
          </div>
        `;
      }
    });

    msgContainer.innerHTML = html;
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
}

function sendChatMessage(e) {
  if (e) e.preventDefault();
  const inputEl = document.getElementById('chat-input-field');
  if (!inputEl) return;
  const msgText = inputEl.value.trim();
  if (!msgText) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  // Append teacher message
  const msgContainer = document.getElementById('chat-messages-container');
  if (msgContainer) {
    const teacherBubble = document.createElement('div');
    teacherBubble.className = 'flex items-start justify-end gap-3 max-w-[85%] ml-auto animate-fade-in';
    teacherBubble.innerHTML = `
      <div class="space-y-1 text-right">
        <div class="p-3.5 rounded-2xl rounded-tr-sm bg-lms-primary text-white text-xs shadow-2xs leading-relaxed text-left">
          ${msgText}
        </div>
        <span class="text-[10px] font-mono text-slate-400 pr-1">${timeStr} • Terkirim</span>
      </div>
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250" class="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-orange-500">
    `;
    msgContainer.appendChild(teacherBubble);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  inputEl.value = '';

  // Auto-reply simulation from student after 1.2s
  setTimeout(() => {
    if (msgContainer) {
      const studentData = studentChatData[currentChatId] || { name: 'Siswa', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120' };
      const replies = [
        'Baik Pak Hendro, sudah kami catat dan dipahami. Terima kasih banyak arahannya pak!',
        'Siap laksanakan pak, kami langsung implementasikan ke kodingan projek kami.',
        'Baik pak, terima kasih infonya, akan saya sampaikan juga ke teman-teman sekelas.'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const studentBubble = document.createElement('div');
      studentBubble.className = 'flex items-start gap-3 max-w-[85%] animate-fade-in';
      studentBubble.innerHTML = `
        <img src="${studentData.avatar}" class="w-8 h-8 rounded-full object-cover shrink-0 mt-1">
        <div class="space-y-1">
          <div class="p-3.5 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs leading-relaxed">
            ${randomReply}
          </div>
          <span class="text-[10px] font-mono text-slate-400 pl-1">${timeStr}</span>
        </div>
      `;
      msgContainer.appendChild(studentBubble);
      msgContainer.scrollTop = msgContainer.scrollHeight;

      if (typeof showToast === 'function') {
        showToast(`Pesan balasan masuk dari ${studentData.name}`, 'info');
      }
    }
  }, 1200);
}

// Export Excel Simulation
function exportAttendanceExcel() {
  if (typeof showToast === 'function') {
    showToast('Mengunduh Rekap_Presensi_Siswa_November_2026.xlsx...', 'success');
  }
}

// ==============================================================
// FITUR MODUL ROLE RESMI: WALI KELAS, TU, KEPSEK, SUPER ADMIN
// ==============================================================

// 1. Cetak Raport Siswa (Wali Kelas)
function printRaportSiswa(nama, nisn, kelas) {
  if (typeof showToast === 'function') {
    showToast(`Menyiapkan lembar Raport Resmi Kurikulum Merdeka: ${nama} (${nisn})...`, 'info');
  }

  // Gunakan dialog cetak atau iframe cetak A4
  setTimeout(() => {
    let printFrame = document.getElementById('raport-staff-print-frame');
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'raport-staff-print-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
    }

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Raport Resmi • ${nama} (${nisn})</title>
        <style>
          * { box-sizing: border-box; font-family: 'Times New Roman', Times, serif; }
          body { padding: 30px; color: #000; line-height: 1.4; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
          .kop h2 { margin: 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; }
          .kop h3 { margin: 3px 0; font-size: 13pt; }
          .kop p { margin: 0; font-size: 9.5pt; font-family: Arial, sans-serif; }
          .title { text-align: center; margin: 15px 0; font-size: 13pt; font-weight: bold; text-decoration: underline; }
          table.meta { width: 100%; margin-bottom: 15px; font-size: 10pt; }
          table.meta td { padding: 3px 5px; }
          table.data { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
          table.data th, table.data td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          table.data th { background: #f0f0f0; text-align: center; font-weight: bold; }
          .ttd-wrap { margin-top: 35px; width: 100%; display: flex; justify-content: space-between; font-size: 10pt; }
          .ttd-box { width: 45%; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>LEMBAGA PENDIDIKAN & AKADEMIK</h2>
          <h3>EDUPU VOCATIONAL ACADEMY (TERAKREDITASI A)</h3>
          <p>Jl. Pendidikan Nusantara No. 88, Indonesia • Telp: (021) 7890-1234 • Email: support@edupu.id</p>
        </div>
        <div class="title">LAPORAN CAPAIAN HASIL BELAJAR PESERTA DIDIK (RAPORT)</div>
        <table class="meta">
          <tr>
            <td width="20%"><strong>Nama Siswa</strong></td>
            <td width="30%">: ${nama || 'Bagus Permadi'}</td>
            <td width="20%"><strong>Tahun Ajaran</strong></td>
            <td width="30%">: 2026/2027 (Ganjil)</td>
          </tr>
          <tr>
            <td><strong>NISN / NIPD</strong></td>
            <td>: ${nisn || '0058291042'}</td>
            <td><strong>Kelas / Rombel</strong></td>
            <td>: ${kelas || 'XII RPL 1'}</td>
          </tr>
          <tr>
            <td><strong>Program Keahlian</strong></td>
            <td>: Teknik Komputer & Informatika</td>
            <td><strong>Wali Kelas</strong></td>
            <td>: Bpk. Hendro, S.Kom.</td>
          </tr>
        </table>
        <table class="data">
          <thead>
            <tr>
              <th width="5%">No</th>
              <th width="35%">Mata Pelajaran</th>
              <th width="10%">KKTP</th>
              <th width="12%">Nilai Akhir</th>
              <th width="10%">Predikat</th>
              <th width="28%">Capaian Kompetensi</th>
            </tr>
          </thead>
          <tbody>
            <tr><td align="center">1</td><td>Pemrograman Web & Perangkat Bergerak</td><td align="center">75.0</td><td align="center"><strong>92.5</strong></td><td align="center">A</td><td>Sangat menguasai RESTful API Laravel & arsitektur Vue.js.</td></tr>
            <tr><td align="center">2</td><td>Basis Data Terdistribusi & SQL Server</td><td align="center">75.0</td><td align="center"><strong>89.0</strong></td><td align="center">A</td><td>Terampil optimasi stored procedure & replikasi database.</td></tr>
            <tr><td align="center">3</td><td>Pemrograman Berorientasi Objek (Java OOP)</td><td align="center">75.0</td><td align="center"><strong>88.0</strong></td><td align="center">A</td><td>Memahami enkapsulasi, polimorfisme, dan GUI framework.</td></tr>
            <tr><td align="center">4</td><td>Pemodelan Perangkat Lunak & Analisis Sistem</td><td align="center">75.0</td><td align="center"><strong>86.5</strong></td><td align="center">B+</td><td>Mampu merancang UML Diagram & Flowchart sistem akurat.</td></tr>
            <tr><td align="center">5</td><td>Produk Kreatif & Kewirausahaan (RPL)</td><td align="center">75.0</td><td align="center"><strong>90.0</strong></td><td align="center">A</td><td>Berhasil memproduksi prototipe aplikasi kasir UMKM.</td></tr>
          </tbody>
        </table>
        <div class="ttd-wrap">
          <div class="ttd-box">
            <p>Mengetahui,<br>Orang Tua / Wali Murid</p><br><br><br>
            <p>( ..................................................... )</p>
          </div>
          <div class="ttd-box">
            <p>Indonesia, 05 November 2026<br>Wali Kelas XII RPL 1</p><br><br><br>
            <p><strong>Bpk. Hendro, S.Kom.</strong><br>NIP. 198402122008011004</p>
          </div>
        </div>
      </body>
      </html>
    `);
    doc.close();
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 300);
}

// 2. Simpan Catatan Konseling & Karakter (Wali Kelas)
function saveKonselingNotes(e) {
  if (e) e.preventDefault();
  if (typeof showToast === 'function') {
    showToast('Catatan perkembangan karakter & konseling siswa berhasil disimpan ke Raport.', 'success');
  } else {
    alert('Catatan berhasil disimpan!');
  }
}

// 3. Unduh Laporan Mutu Pendidikan (Kepala Sekolah)
function downloadLaporanMutu() {
  if (typeof showToast === 'function') {
    showToast('Menyiapkan Laporan_Evaluasi_Mutu_Semester_Ganjil_2026.pdf...', 'success');
  }
}

// 4. Cadangkan Basis Data (Super Admin)
function backupSystemDatabase() {
  if (typeof showToast === 'function') {
    showToast('Membuat cadangan database: eDupu_Database_Backup_20261105.sql (42.8 MB)... Selesai diunduh.', 'success');
  }
}

// 5. Tambah Data Siswa Baru (Admin TU)
function openAddStudentModal() {
  const modal = document.getElementById('add-student-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeAddStudentModal() {
  const modal = document.getElementById('add-student-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function saveNewStudent(e) {
  if (e) e.preventDefault();
  closeAddStudentModal();
  if (typeof showToast === 'function') {
    showToast('Data siswa baru berhasil ditambahkan dan disinkronkan ke master data Dapodik.', 'success');
  }
}

// 6. Reset Kata Sandi Pengguna (Admin TU)
function resetUserPasswordDirect(username) {
  if (confirm(`Reset kata sandi akun ${username} ke kata sandi standar sekolah?`)) {
    if (typeof showToast === 'function') {
      showToast(`Kata sandi akun ${username} berhasil direset ke sandi awal!`, 'success');
    }
  }
}

// 7. Simpan Pengaturan Geofence GPS (Super Admin)
function saveGpsGeofenceSettings(e) {
  if (e) e.preventDefault();
  const radius = document.getElementById('setting-geofence-radius')?.value || '80';
  if (typeof showToast === 'function') {
    showToast(`Parameter Geofence berhasil disimpan! Titik gerbang aktif dengan radius toleransi ${radius} meter.`, 'success');
  }
}

// 8. Simpan Pengaturan Keamanan CBT (Super Admin)
function saveCbtSecuritySettings(e) {
  if (e) e.preventDefault();
  if (typeof showToast === 'function') {
    showToast('Aturan proteksi Safe Exam Browser & Anti-Kecurangan CBT berhasil diperbarui.', 'success');
  }
}

// 9. Mobile Sidebar Drawer Toggle
function toggleInstructorMobileSidebar() {
  const sidebar = document.getElementById('instructor-sidebar-aside');
  if (sidebar) {
    sidebar.classList.toggle('hidden');
    sidebar.classList.toggle('flex');
    sidebar.classList.toggle('fixed');
    sidebar.classList.toggle('inset-y-0');
    sidebar.classList.toggle('left-0');
    sidebar.classList.toggle('z-50');
    sidebar.classList.toggle('w-72');
    sidebar.classList.toggle('shadow-2xl');
  }
}

