/**
 * eDupu Platform - Modern School Learning System
 * Dashboard, Geofencing GPS, CBT Engine & Academic Logic (js/dashboard.js)
 */

// Coordinates: Campus Geofence Coordinates
const SCHOOL_COORDS = [-8.3650, 113.4750];
let mapSafetac, mapStudent, studentMarker;
let attendanceChart;

// CBT State
const cbtQuestions = [
  {
    num: 1,
    text: "Dalam arsitektur pengembangan web modern menggunakan framework Laravel, komponen yang bertanggung jawab untuk menerima request HTTP dari pengguna, memproses logika bisnis melalui model, dan mengembalikan respon berupa view atau data JSON adalah...",
    options: {
      A: "Migration & Database Seeder",
      B: "Controller",
      C: "Blade Template Engine",
      D: "Route Service Provider"
    },
    correct: 'B'
  },
  {
    num: 2,
    text: "Perintah Artisan pada Laravel yang digunakan untuk mengeksekusi migrasi tabel database baru sesuai dengan skema migration yang telah dirancang adalah...",
    options: {
      A: "php artisan serve",
      B: "php artisan make:model",
      C: "php artisan migrate",
      D: "php artisan db:seed"
    },
    correct: 'C'
  },
  {
    num: 3,
    text: "Metode HTTP standar yang digunakan dalam arsitektur RESTful API untuk memperbarui (update) data siswa yang ada di database adalah...",
    options: {
      A: "GET",
      B: "POST",
      C: "PUT / PATCH",
      D: "DELETE"
    },
    correct: 'C'
  },
  {
    num: 4,
    text: "Fungsi utama dari Geolocation API HTML5 pada sistem presensi digital sekolah berbasis geofencing adalah...",
    options: {
      A: "Menyimpan foto wajah siswa ke database server",
      B: "Mendeteksi koordinat lintang (latitude) dan bujur (longitude) perangkat siswa secara real-time",
      C: "Menghitung nilai rata-rata rapor semester siswa",
      D: "Menjalankan kompilasi kode program PHP di browser"
    },
    correct: 'B'
  },
  {
    num: 5,
    text: "Algoritma standar yang umum digunakan untuk menghitung jarak lingkaran besar antara dua koordinat bola bumi (geodesic distance) adalah formula...",
    options: {
      A: "Bubble Sort",
      B: "Dijkstra Algorithm",
      C: "Haversine Formula",
      D: "Binary Search"
    },
    correct: 'C'
  }
];

let currentQ = 1;
let userAnswers = { 1: 'B' };
let doubtFlags = {};
let cbtSecondsLeft = 5385; // ~89 mins 45 secs
let cbtTimerInterval = null;

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  setupUserSession();
  initAttendanceChart();
  initLeafletMaps();
  initCBT();
  startLiveClock();
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Setup user data from session or demo
function setupUserSession() {
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : {
    name: 'Bagus Permadi',
    role: 'siswa',
    roleLabel: 'Siswa • XII RPL 1',
    nisn: '0058291042',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
  };

  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-role-label');
  const avatarEl = document.getElementById('user-avatar-img');

  if (nameEl) nameEl.innerText = user.name;
  if (roleEl) roleEl.innerText = user.roleLabel;
  if (avatarEl) avatarEl.src = user.avatar;

  const dropName = document.getElementById('dropdown-user-name');
  const dropRole = document.getElementById('dropdown-user-role');
  const dropSub = document.getElementById('dropdown-user-sub');
  if (dropName) dropName.innerText = user.name;
  if (dropRole) dropRole.innerText = user.roleLabel;
  if (dropSub) dropSub.innerText = user.nisn ? `NISN: ${user.nisn}` : (user.role === 'guru' ? 'NIP: 198402122008011004' : 'Akun Resmi eDupu');

  // Default to dashboard view
  switchView('dashboard');
}

// Module View Switcher
function switchView(viewName) {
  // Hide all view panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  // Show target panel
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('animate-fade-in');
  }

  // Update Top Navigation (Desktop)
  document.querySelectorAll('.top-nav-item').forEach(btn => {
    btn.classList.remove('active', 'border-blue-600', 'text-blue-700', 'font-bold');
    btn.classList.add('border-transparent', 'text-slate-600', 'font-medium');
  });
  const topActive = document.getElementById(`top-nav-${viewName}`);
  if (topActive) {
    topActive.classList.add('active', 'border-blue-600', 'text-blue-700', 'font-bold');
    topActive.classList.remove('border-transparent', 'text-slate-600', 'font-medium');
  }

  // Update Mobile Bottom Nav
  document.querySelectorAll('.mob-nav-item').forEach(btn => {
    btn.classList.remove('text-blue-600', 'font-bold');
    btn.classList.add('text-slate-500', 'font-medium');
  });
  const mobActive = document.getElementById(`mob-nav-${viewName}`);
  if (mobActive) {
    mobActive.classList.add('text-blue-600', 'font-bold');
    mobActive.classList.remove('text-slate-500', 'font-medium');
  }

  // Update Sidebar Nav active state if present
  document.querySelectorAll('.sidebar-nav-btn, .instructor-nav-link').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`side-${viewName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update Page Header Titles & Breadcrumbs
  const titleMap = {
    dashboard: {
      title: 'Dasbor Siswa • Nilai & Presensi Terpadu',
      sub: 'Rekapitulasi Capaian Akademik, Presensi GPS Geofence & Jadwal Belajar Siswa',
      breadcrumb: 'Beranda'
    },
    jadwal: {
      title: 'Jadwal Pelajaran Kelas XII RPL 1',
      sub: 'Tahun Ajaran 2026/2027 Ganjil • eDupu Academy',
      breadcrumb: 'Jadwal Pelajaran'
    },
    'jadwal-ujian': {
      title: 'Jadwal Ujian Digital CBT (UTS / UAS)',
      sub: 'Penilaian Terstandarisasi • Semester Ganjil 2026/2027',
      breadcrumb: 'Jadwal Ujian'
    },
    absensi: {
      title: 'Presensi GPS Geofencing Siswa',
      sub: 'Validasi Titik Koordinat Real-Time • Radius Batas 80 Meter Gerbang Kampus',
      breadcrumb: 'Presensi GPS'
    },
    cbt: {
      title: 'Ruang Ujian Digital CBT Daring',
      sub: 'Penilaian Terstandarisasi • Simpan Otomatis & Bebas Kecurangan',
      breadcrumb: 'Ruang Ujian CBT'
    },
    nilai: {
      title: 'Nilai Raport Siswa & Capaian Belajar',
      sub: 'Rekapitulasi Capaian Kompetensi Kurikulum Merdeka • Kelas XII RPL 1',
      breadcrumb: 'Nilai Raport'
    },
    modul: {
      title: 'Materi & Modul Pembelajaran',
      sub: 'Unduh Silabus, Bahan Ajar Digital & Kisi-Kisi Ujian dari Guru',
      breadcrumb: 'Bahan Ajar & Modul'
    }
  };

  const headerInfo = titleMap[viewName] || titleMap.dashboard;
  const hTitle = document.getElementById('module-header-title');
  const hSub = document.getElementById('module-header-subtitle');
  if (hTitle) hTitle.innerText = headerInfo.title;
  if (hSub) hSub.innerText = headerInfo.sub;

  const breadcrumbEl = document.getElementById('breadcrumb-current-page');
  if (breadcrumbEl) breadcrumbEl.innerText = headerInfo.breadcrumb;

  // Scroll smoothly to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (window.lucide) {
    lucide.createIcons();
  }

  // Re-render student charts if entering dashboard
  if (viewName === 'dashboard') {
    setTimeout(() => {
      initStudentCharts();
    }, 50);
  }

  // Invalidate Leaflet maps to adjust canvas size
  setTimeout(() => {
    if (mapSafetac) mapSafetac.invalidateSize();
    if (mapStudent) mapStudent.invalidateSize();
  }, 200);
}

// Toggle Mobile Top Drawer
function toggleMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer-menu');
  if (drawer) {
    drawer.classList.toggle('hidden');
    if (window.lucide) {
      lucide.createIcons();
    }
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer-menu');
  if (drawer) {
    drawer.classList.add('hidden');
  }
}

// Profile Dropdown Controls
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

// Chart.js: Performance Line & Donut GPS Geofence (Dashboard Siswa)
let studentPerfChartInstance = null;
let studentDonutChartInstance = null;

function initStudentCharts() {
  // 1. Line Chart: Tren Nilai CBT & Presensi Kehadiran Siswa
  const perfCtx = document.getElementById('studentPerfChart');
  if (perfCtx) {
    if (studentPerfChartInstance) studentPerfChartInstance.destroy();

    const ctx = perfCtx.getContext('2d');
    const gradientBlue = ctx.createLinearGradient(0, 0, 0, 260);
    gradientBlue.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    gradientBlue.addColorStop(1, 'rgba(37, 99, 235, 0.01)');

    const gradientGreen = ctx.createLinearGradient(0, 0, 0, 260);
    gradientGreen.addColorStop(0, 'rgba(16, 185, 129, 0.22)');
    gradientGreen.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    studentPerfChartInstance = new Chart(perfCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
        datasets: [
          {
            label: 'Rata-rata Nilai CBT & Tugas',
            data: [82, 84, 86, 85, 88, 87, 89, 90, 88, 91, 90.8],
            borderColor: '#2563eb',
            backgroundColor: gradientBlue,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#2563eb',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Kehadiran GPS (%)',
            data: [96, 98, 97, 100, 98, 97, 99, 98, 100, 98, 98.4],
            borderColor: '#10b981',
            backgroundColor: gradientGreen,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#10b981',
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
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
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
              color: '#94a3b8'
            },
            grid: {
              color: '#f1f5f9',
              borderDash: [3, 3]
            },
            border: { display: false }
          },
          x: {
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#94a3b8'
            },
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }

  // 2. Donut Chart: Presensi Siswa Tepat Waktu
  const donutCtx = document.getElementById('studentDonutChart');
  if (donutCtx) {
    if (studentDonutChartInstance) studentDonutChartInstance.destroy();

    studentDonutChartInstance = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Hadir Tepat Waktu', 'Terlambat', 'Izin / Sakit'],
        datasets: [{
          data: [98.4, 1.1, 0.5],
          backgroundColor: ['#10b981', '#fbbf24', '#f43f5e'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '76%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  }
}

const initAttendanceChart = initStudentCharts;

// Leaflet GPS Setup
function initLeafletMaps() {
  // 1. Dashboard Mini Map
  const mapEl1 = document.getElementById('safetac-map');
  if (mapEl1 && !mapSafetac) {
    mapSafetac = L.map('safetac-map', { zoomControl: false }).setView(SCHOOL_COORDS, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      className: 'custom-map-tile'
    }).addTo(mapSafetac);

    L.circle(SCHOOL_COORDS, {
      color: '#7c3aed',
      fillColor: '#8b5cf6',
      fillOpacity: 0.22,
      radius: 80
    }).addTo(mapSafetac);

    const purpleIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background:#7c3aed;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 4px 10px rgba(124,58,237,0.4);"><i class="fa-solid fa-school" style="font-size:11px;"></i></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    L.marker(SCHOOL_COORDS, { icon: purpleIcon }).addTo(mapSafetac).bindPopup("<b>Kampus Sekolah</b><br>Titik Gerbang Utama");
  }

  // 2. Student Absensi Portal Map
  const mapEl2 = document.getElementById('student-geofence-map');
  if (mapEl2 && !mapStudent) {
    mapStudent = L.map('student-geofence-map').setView(SCHOOL_COORDS, 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapStudent);

    L.circle(SCHOOL_COORDS, {
      color: '#7c3aed',
      fillColor: '#8b5cf6',
      fillOpacity: 0.25,
      radius: 80
    }).addTo(mapStudent).bindPopup("<b>Zona Geofence Sekolah (Radius 80m)</b>");

    studentMarker = L.marker([-8.36515, 113.47518]).addTo(mapStudent)
      .bindPopup("<b>Posisi Siswa: Bagus Permadi</b><br>Jarak: 28 meter (VALID)");
  }
}

// GPS Simulation Controls
function setGPSLocation(status) {
  const box = document.getElementById('gps-status-box');
  const title = document.getElementById('gps-status-title');
  const pill = document.getElementById('gps-distance-pill');
  const desc = document.getElementById('gps-status-desc');
  const coords = document.getElementById('gps-coords-display');
  const btnInside = document.getElementById('btn-gps-inside');
  const btnOutside = document.getElementById('btn-gps-outside');
  const submitBtn = document.getElementById('btn-submit-absen');
  const logVal = document.getElementById('log-distance-val');

  if (!box || !studentMarker) return;

  if (status === 'inside') {
    studentMarker.setLatLng([-8.36515, 113.47518]);
    mapStudent.panTo([-8.36515, 113.47518]);
    studentMarker.setPopupContent("<b>Posisi Siswa</b><br>Radius: 28 meter (VALID)").openPopup();

    box.className = "p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-900 space-y-2";
    title.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-600"></i> Terverifikasi di Lokasi Sekolah';
    pill.innerText = "28 Meter";
    pill.className = "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800";
    desc.innerText = "Anda berada dalam zona radius resmi sekolah (Toleransi batas: 80 meter).";
    coords.innerText = "Lat: -8.36515, Lng: 113.47518 (Akurasi: ±4m)";

    if (btnInside) btnInside.className = "px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl shadow-xs transition";
    if (btnOutside) btnOutside.className = "px-3 py-1 bg-white text-slate-600 hover:bg-slate-100 font-bold rounded-xl border border-slate-200 transition";

    submitBtn.disabled = false;
    submitBtn.className = "w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-primary-600/30 transition flex items-center justify-center gap-2 cursor-pointer";
    submitBtn.innerHTML = '<i class="fa-solid fa-fingerprint text-base"></i> KIRIM PRESENSI MASUK';
    if (logVal) logVal.innerText = "28m";
  } else {
    studentMarker.setLatLng([-8.3620, 113.4765]);
    mapStudent.panTo([-8.3620, 113.4765]);
    studentMarker.setPopupContent("<b>Posisi Siswa</b><br>Jarak 340m - DILUAR JANGKAUAN").openPopup();

    box.className = "p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-900 space-y-2";
    title.innerHTML = '<i class="fa-solid fa-circle-xmark text-rose-600"></i> Di Luar Radius Sekolah!';
    pill.innerText = "340 Meter";
    pill.className = "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800";
    desc.innerText = "Jarak Anda 340 meter dari sekolah. Harap dekati lokasi sekolah untuk melakukan presensi.";
    coords.innerText = "Lat: -8.36200, Lng: 113.47650 (Akurasi: ±12m)";

    if (btnInside) btnInside.className = "px-3 py-1 bg-white text-slate-600 hover:bg-slate-100 font-bold rounded-xl border border-slate-200 transition";
    if (btnOutside) btnOutside.className = "px-3 py-1 bg-rose-600 text-white font-bold rounded-xl shadow-xs transition";

    submitBtn.disabled = true;
    submitBtn.className = "w-full py-3.5 bg-slate-200 text-slate-400 font-extrabold text-xs rounded-2xl cursor-not-allowed flex items-center justify-center gap-2";
    submitBtn.innerHTML = '<i class="fa-solid fa-ban text-base"></i> DILUAR RADIUS (TIDAK DAPAT ABSEN)';
    if (logVal) logVal.innerText = "340m (Gagal)";
  }
}

// Submit Absensi Action
function submitAbsensi() {
  if (typeof showToast === 'function') {
    showToast('Presensi Masuk Berhasil! Koordinat GPS terverifikasi oleh Geofence eDupu.', 'success');
  } else {
    alert("Berhasil! Presensi masuk siswa telah divalidasi oleh Geofence eDupu.");
  }

  // Prepend row to table
  const tbody = document.getElementById('absen-history-body');
  if (tbody) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const tr = document.createElement('tr');
    tr.className = 'bg-emerald-50/50';
    tr.innerHTML = `
      <td>Hari Ini</td>
      <td><span class="font-bold text-slate-800">${timeStr}</span></td>
      <td>16:00 WIB</td>
      <td><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">28m (Valid)</span></td>
      <td><span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">HADIR TEPAT WAKTU</span></td>
    `;
    tbody.prepend(tr);
  }
}

// CBT Engine
function initCBT() {
  renderCBTGrid();
  loadQuestion(1);
  startCBTTimer();

  // Page visibility anti-cheat detector
  document.addEventListener('visibilitychange', () => {
    const cbtPanel = document.getElementById('view-cbt');
    if (cbtPanel && !cbtPanel.classList.contains('hidden') && document.hidden) {
      if (typeof showToast === 'function') {
        showToast('Peringatan: Terdeteksi meninggalkan layar ujian! Aktivitas ini dicatat oleh pengawas.', 'error', 5000);
      }
    }
  });
}

function renderCBTGrid() {
  const grid = document.getElementById('q-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let i = 1; i <= 20; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;

    let cls = 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200';
    if (userAnswers[i]) cls = 'bg-primary-600 text-white font-bold shadow-xs';
    if (doubtFlags[i]) cls = 'bg-amber-400 text-slate-900 font-bold';
    if (i === currentQ) cls += ' ring-2 ring-slate-900 ring-offset-2';

    btn.className = `w-full h-9 rounded-xl text-xs font-semibold transition flex items-center justify-center cbt-num-btn ${cls}`;
    btn.onclick = () => loadQuestion(i);
    grid.appendChild(btn);
  }

  // Update Progress counter
  const answeredCount = Object.keys(userAnswers).length;
  const countEl = document.getElementById('cbt-answered-count');
  if (countEl) countEl.innerText = `${answeredCount} / 20 Soal`;
}

function loadQuestion(num) {
  currentQ = num;
  const q = cbtQuestions[num - 1] || {
    num: num,
    text: `Soal Kejuruan RPL nomor ${num}: Jelaskan mekanisme validasi data pada request form dan penanganan error handling dalam siklus aplikasi web modern...`,
    options: {
      A: "Opsi jawaban A untuk evaluasi kompetensi soal nomor " + num,
      B: "Opsi jawaban B untuk evaluasi kompetensi soal nomor " + num,
      C: "Opsi jawaban C untuk evaluasi kompetensi soal nomor " + num,
      D: "Opsi jawaban D untuk evaluasi kompetensi soal nomor " + num
    }
  };

  const titleEl = document.getElementById('q-title');
  const textEl = document.getElementById('q-text');
  if (titleEl) titleEl.innerText = `Soal Nomor ${num} dari 20`;
  if (textEl) textEl.innerText = q.text;

  const optContainer = document.getElementById('q-options');
  if (optContainer) {
    optContainer.innerHTML = '';
    ['A', 'B', 'C', 'D'].forEach(letter => {
      const isSelected = userAnswers[num] === letter;
      const card = `
        <label class="flex items-center p-3.5 sm:p-4 rounded-2xl border ${isSelected ? 'bg-primary-50/70 border-primary-500 shadow-xs' : 'border-slate-200/80 hover:bg-slate-50'} cursor-pointer transition">
          <input type="radio" name="cbt_ans" value="${letter}" ${isSelected ? 'checked' : ''} onchange="pickAnswer('${letter}')" class="w-4 h-4 text-primary-600 focus:ring-primary-500 mr-3">
          <span class="w-7 h-7 rounded-xl ${isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'} font-bold text-xs flex items-center justify-center mr-3 shrink-0">${letter}</span>
          <span class="text-xs text-slate-700 font-medium">${q.options[letter]}</span>
        </label>
      `;
      optContainer.insertAdjacentHTML('beforeend', card);
    });
  }

  const doubtCheckbox = document.getElementById('doubt-box');
  if (doubtCheckbox) doubtCheckbox.checked = !!doubtFlags[num];
  renderCBTGrid();
}

function pickAnswer(letter) {
  userAnswers[currentQ] = letter;
  const d = new Date();
  const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')} WIB`;
  
  const autosaveEl = document.getElementById('cbt-autosave-time');
  if (autosaveEl) autosaveEl.innerText = `Autosave: ${timeStr}`;
  
  renderCBTGrid();
  loadQuestion(currentQ);
}

function toggleDoubt() {
  const doubtBox = document.getElementById('doubt-box');
  if (doubtBox) {
    doubtFlags[currentQ] = doubtBox.checked;
    renderCBTGrid();
  }
}

function nextQuestion() {
  if (currentQ < 20) loadQuestion(currentQ + 1);
}

function prevQuestion() {
  if (currentQ > 1) loadQuestion(currentQ - 1);
}

function finishCBT() {
  const answered = Object.keys(userAnswers).length;
  if (confirm(`Anda telah menjawab ${answered} dari 20 soal. Apakah Anda yakin ingin mengakhiri sesi ujian ini?`)) {
    if (typeof showToast === 'function') {
      showToast('Ujian Berhasil Dikirim! Nilai instan: 92/100 telah masuk ke leger nilai.', 'success', 4000);
    } else {
      alert("Ujian Berhasil Dikirim! Nilai instan telah masuk ke leger nilai.");
    }
    switchView('nilai');
  }
}

// Countdown Timer
function startCBTTimer() {
  if (cbtTimerInterval) clearInterval(cbtTimerInterval);
  cbtTimerInterval = setInterval(() => {
    if (cbtSecondsLeft > 0) {
      cbtSecondsLeft--;
      const minutes = Math.floor(cbtSecondsLeft / 60);
      const seconds = cbtSecondsLeft % 60;
      const str = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      const timerEl = document.getElementById('cbt-timer-display');
      if (timerEl) timerEl.innerText = str;
    } else {
      clearInterval(cbtTimerInterval);
      alert("Waktu ujian telah habis! Jawaban Anda otomatis tersimpan.");
      finishCBT();
    }
  }, 1000);
}

// Live Clock
function startLiveClock() {
  setInterval(() => {
    const now = new Date();
    const clock = document.getElementById('live-clock');
    if (clock) {
      clock.innerText = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';
    }
  }, 1000);
}

// Export Nilai Demo
function exportNilai(format) {
  if (typeof showToast === 'function') {
    showToast(`Mengunduh Berkas Leger Nilai (${format.toUpperCase()})... Berkas siap dicetak.`, 'info');
  } else {
    alert(`Mengunduh Rekap Nilai dalam format ${format.toUpperCase()}`);
  }
}

// Filter Leger Nilai
function filterLeger() {
  const searchInput = document.getElementById('search-siswa');
  const classSelect = document.getElementById('filter-kelas');
  const query = searchInput ? searchInput.value.toLowerCase() : '';
  const selectedClass = classSelect ? classSelect.value : '';

  const rows = document.querySelectorAll('#table-leger tbody tr');
  rows.forEach(row => {
    const nameText = row.querySelector('.siswa-name')?.innerText.toLowerCase() || '';
    const classText = row.querySelector('.siswa-class')?.innerText || '';

    const matchQuery = !query || nameText.includes(query);
    const matchClass = !selectedClass || selectedClass === 'Semua Kelas' || classText.includes(selectedClass);

    if (matchQuery && matchClass) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Filter Jadwal Pelajaran Berdasarkan Hari
let currentJadwalHari = 'Semua';
function filterJadwalHari(hari, el) {
  currentJadwalHari = hari;
  
  // Update button active state
  if (el) {
    const parent = el.closest('#jadwal-day-filter');
    if (parent) {
      parent.querySelectorAll('button').forEach(btn => {
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 transition';
      });
      el.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-700 shadow-2xs transition';
    }
  }

  applyJadwalFilter();
}

function searchJadwal() {
  applyJadwalFilter();
}

function applyJadwalFilter() {
  const searchInput = document.getElementById('search-jadwal-input');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const rows = document.querySelectorAll('#table-jadwal-pelajaran tbody tr.jadwal-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const rowHari = row.getAttribute('data-hari');
    const mapel = row.querySelector('.mapel-name')?.innerText.toLowerCase() || '';
    const guru = row.querySelector('.guru-name')?.innerText.toLowerCase() || '';
    
    const matchHari = (currentJadwalHari === 'Semua' || rowHari === currentJadwalHari);
    const matchSearch = (!query || mapel.includes(query) || guru.includes(query));

    if (matchHari && matchSearch) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  const countEl = document.getElementById('count-jadwal-visible');
  if (countEl) countEl.innerText = visibleCount;
}

// Reload Jadwal Pelajaran
function reloadJadwalPelajaran() {
  const searchInput = document.getElementById('search-jadwal-input');
  if (searchInput) searchInput.value = '';
  currentJadwalHari = 'Semua';
  const filterBtns = document.querySelectorAll('#jadwal-day-filter button');
  filterBtns.forEach(btn => {
    if (btn.innerText.trim() === 'Semua') {
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-blue-700 shadow-2xs transition';
    } else {
      btn.className = 'px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 transition';
    }
  });
  applyJadwalFilter();

  if (typeof showToast === 'function') {
    showToast('Memuat ulang jadwal pelajaran...', 'info');
    setTimeout(() => {
      showToast('Data jadwal pelajaran berhasil dimuat ulang.', 'success');
    }, 400);
  }
}

// Download / Print Dokumen Resmi Jadwal Pelajaran
function downloadJadwalPelajaran() {
  if (typeof showToast === 'function') {
    showToast('Menyiapkan dokumen cetak & unduh Jadwal Pelajaran...', 'info');
  }

  let printFrame = document.getElementById('jadwal-print-frame');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'jadwal-print-frame';
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
      <title>Jadwal_Pelajaran_Bagus_Permadi_XII_RPL_1_Ganjil_2026</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; line-height: 1.35; margin: 0; padding: 0; }
        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 14px; }
        .kop h3 { margin: 0; font-size: 13pt; font-weight: normal; text-transform: uppercase; }
        .kop h2 { margin: 2px 0; font-size: 15pt; font-weight: bold; text-transform: uppercase; }
        .kop h1 { margin: 2px 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .kop p { margin: 2px 0; font-size: 9.5pt; font-style: italic; }
        .title { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 12px 0 10px 0; text-decoration: underline; }
        .info-table { width: 100%; margin-bottom: 12px; font-size: 10pt; }
        .info-table td { padding: 2px 4px; vertical-align: top; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5pt; }
        .data-table th, .data-table td { border: 1px solid #000; padding: 6px 7px; }
        .data-table th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
        .text-center { text-align: center; }
        .ttd-container { width: 100%; margin-top: 30px; font-size: 10pt; }
        .ttd-box { width: 45%; text-align: center; float: right; }
        .ttd-box-left { width: 45%; text-align: center; float: left; }
        .clear { clear: both; }
      </style>
    </head>
    <body>
      <div class="kop">
        <h3>LEMBAGA PENDIDIKAN & AKADEMIK</h3>
        <h2>SISTEM INFORMASI MANAJEMEN SEKOLAH</h2>
        <h1>EDUPU VOCATIONAL ACADEMY</h1>
        <p>Jl. Pendidikan Nusantara No. 88, Telp. (021) 7890-1234, Indonesia</p>
        <p>Website: edupu.id • Email: support@edupu.id • Terakreditasi A</p>
      </div>

      <div class="title">JADWAL PELAJARAN KELAS (KURIKULUM MERDEKA)</div>

      <table class="info-table">
        <tr>
          <td style="width: 18%;"><strong>Nama Siswa</strong></td>
          <td style="width: 2%;">:</td>
          <td style="width: 40%;"><strong>BAGUS PERMADI</strong></td>
          <td style="width: 16%;"><strong>Kelas / Rombel</strong></td>
          <td style="width: 2%;">:</td>
          <td style="width: 22%;">XII RPL 1</td>
        </tr>
        <tr>
          <td><strong>NISN</strong></td>
          <td>:</td>
          <td>0058291042</td>
          <td><strong>Semester</strong></td>
          <td>:</td>
          <td>5 (Ganjil)</td>
        </tr>
        <tr>
          <td><strong>Program Keahlian</strong></td>
          <td>:</td>
          <td>Pengembangan Perangkat Lunak (PPLG)</td>
          <td><strong>Tahun Ajaran</strong></td>
          <td>:</td>
          <td>2026/2027</td>
        </tr>
      </table>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 10%;">Hari</th>
            <th style="width: 15%;">Jam Pelajaran</th>
            <th style="width: 10%;">Durasi</th>
            <th style="width: 32%;">Mata Pelajaran</th>
            <th style="width: 13%;">Ruang Belajar</th>
            <th style="width: 15%;">Guru Pengampu</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td class="text-center"><strong>Senin</strong></td>
            <td class="text-center">07:00 - 09:15</td>
            <td class="text-center">135 Menit</td>
            <td><strong>Pemrograman Web & Perangkat Bergerak</strong></td>
            <td class="text-center">Lab Komputer RPL 1</td>
            <td>Bpk. Hendro, S.Kom</td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td class="text-center"><strong>Senin</strong></td>
            <td class="text-center">09:30 - 11:45</td>
            <td class="text-center">135 Menit</td>
            <td><strong>Basis Data Terdistribusi & SQL Server</strong></td>
            <td class="text-center">Lab Komputer RPL 2</td>
            <td>Ibu Siti Rahayu, M.Pd</td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td class="text-center"><strong>Selasa</strong></td>
            <td class="text-center">07:00 - 08:30</td>
            <td class="text-center">90 Menit</td>
            <td><strong>Pemodelan Perangkat Lunak & Sistem</strong></td>
            <td class="text-center">Ruang Teori 12</td>
            <td>Bpk. Hendro, S.Kom</td>
          </tr>
          <tr>
            <td class="text-center">4</td>
            <td class="text-center"><strong>Selasa</strong></td>
            <td class="text-center">08:45 - 11:45</td>
            <td class="text-center">180 Menit</td>
            <td><strong>Pemrograman Berorientasi Objek (OOP Java)</strong></td>
            <td class="text-center">Lab Komputer RPL 1</td>
            <td>Bpk. Rian Hidayat, S.T</td>
          </tr>
          <tr>
            <td class="text-center">5</td>
            <td class="text-center"><strong>Rabu</strong></td>
            <td class="text-center">07:00 - 09:15</td>
            <td class="text-center">135 Menit</td>
            <td><strong>Administrasi Infrastruktur Jaringan & Server</strong></td>
            <td class="text-center">Lab Jaringan TKJ</td>
            <td>Bpk. Rian Hidayat, S.T</td>
          </tr>
          <tr>
            <td class="text-center">6</td>
            <td class="text-center"><strong>Rabu</strong></td>
            <td class="text-center">09:30 - 11:45</td>
            <td class="text-center">135 Menit</td>
            <td><strong>Bahasa Inggris Komunikasi & IT Documentation</strong></td>
            <td class="text-center">Ruang Teori 08</td>
            <td>Ibu Nurul Hidayati, S.Pd</td>
          </tr>
          <tr>
            <td class="text-center">7</td>
            <td class="text-center"><strong>Kamis</strong></td>
            <td class="text-center">07:00 - 09:15</td>
            <td class="text-center">135 Menit</td>
            <td><strong>Produk Kreatif & Kewirausahaan (Proyek Software)</strong></td>
            <td class="text-center">Workshop RPL</td>
            <td>Bpk. Tri Wahyudi, S.Kom</td>
          </tr>
          <tr>
            <td class="text-center">8</td>
            <td class="text-center"><strong>Kamis</strong></td>
            <td class="text-center">09:30 - 11:45</td>
            <td class="text-center">135 Menit</td>
            <td><strong>Matematika Terapan & Logika Komputasi</strong></td>
            <td class="text-center">Ruang Teori 12</td>
            <td>Bpk. Ahmad Fauzi, M.Si</td>
          </tr>
          <tr>
            <td class="text-center">9</td>
            <td class="text-center"><strong>Jumat</strong></td>
            <td class="text-center">07:00 - 09:00</td>
            <td class="text-center">120 Menit</td>
            <td><strong>Pendidikan Pancasila & Etika Profesi IT</strong></td>
            <td class="text-center">Ruang Teori 12</td>
            <td>Bpk. M. Shodiq, M.Ag</td>
          </tr>
        </tbody>
      </table>

      <div class="ttd-container">
        <div class="ttd-box-left">
          Mengetahui,<br>
          Waka Kurikulum<br><br><br><br>
          <strong>Drs. H. Mulyadi, M.Pd.</strong><br>
          NIP. 19750510 200212 1 002
        </div>
        <div class="ttd-box">
          Indonesia, 05 November 2026<br>
          Wali Kelas XII RPL 1<br><br><br><br>
          <strong>Hendro, S.Kom.</strong><br>
          NIP. 19840212 200801 1 004
        </div>
        <div class="clear"></div>
      </div>

      <div style="margin-top: 18px; text-align: center; font-size: 8pt; color: #555; border-top: 1px dashed #ccc; padding-top: 5px;">
        Dokumen ini diterbitkan secara sah dan otomatis melalui Portal Sistem Informasi Akademik Terpadu (eDupu Platform).
      </div>
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 400);
}

// Reload Jadwal Ujian CBT
function reloadJadwalUjian() {
  const searchInput = document.getElementById('search-ujian-input');
  if (searchInput) searchInput.value = '';
  searchUjian();

  if (typeof showToast === 'function') {
    showToast('Memuat ulang jadwal ujian CBT...', 'info');
    setTimeout(() => {
      showToast('Data jadwal ujian berhasil dimuat ulang.', 'success');
    }, 400);
  }
}

// Download / Print Dokumen Resmi Jadwal Ujian UTS / UAS CBT
function downloadJadwalUjian() {
  if (typeof showToast === 'function') {
    showToast('Menyiapkan dokumen cetak & unduh Jadwal Ujian CBT...', 'info');
  }

  let printFrame = document.getElementById('ujian-print-frame');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'ujian-print-frame';
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
      <title>Kartu_Jadwal_Ujian_Bagus_Permadi_XII_RPL_1_Ganjil_2026</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; line-height: 1.35; margin: 0; padding: 0; }
        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 14px; }
        .kop h3 { margin: 0; font-size: 13pt; font-weight: normal; text-transform: uppercase; }
        .kop h2 { margin: 2px 0; font-size: 15pt; font-weight: bold; text-transform: uppercase; }
        .kop h1 { margin: 2px 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .kop p { margin: 2px 0; font-size: 9.5pt; font-style: italic; }
        .title { text-align: center; font-size: 12.5pt; font-weight: bold; text-transform: uppercase; margin: 12px 0 10px 0; text-decoration: underline; }
        .info-table { width: 100%; margin-bottom: 12px; font-size: 10pt; }
        .info-table td { padding: 2px 4px; vertical-align: top; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5pt; }
        .data-table th, .data-table td { border: 1px solid #000; padding: 6px 7px; }
        .data-table th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
        .text-center { text-align: center; }
        .tata-tertib { margin-top: 14px; border: 1px solid #000; padding: 8px 12px; font-size: 9pt; background-color: #fafafa; }
        .tata-tertib ol { margin: 4px 0 0 16px; padding: 0; }
        .ttd-container { width: 100%; margin-top: 24px; font-size: 10pt; }
        .ttd-box { width: 45%; text-align: center; float: right; }
        .ttd-box-left { width: 45%; text-align: center; float: left; }
        .clear { clear: both; }
      </style>
    </head>
    <body>
      <div class="kop">
        <h3>LEMBAGA PENDIDIKAN & AKADEMIK</h3>
        <h2>SISTEM INFORMASI MANAJEMEN SEKOLAH</h2>
        <h1>EDUPU VOCATIONAL ACADEMY</h1>
        <p>Jl. Pendidikan Nusantara No. 88, Telp. (021) 7890-1234, Indonesia</p>
        <p>Website: edupu.id • Email: support@edupu.id • Terakreditasi A</p>
      </div>

      <div class="title">KARTU PESERTA & JADWAL UJIAN PENILAIAN AKHIR SEMESTER (CBT)</div>

      <table class="info-table">
        <tr>
          <td style="width: 18%;"><strong>Nama Peserta</strong></td>
          <td style="width: 2%;">:</td>
          <td style="width: 40%;"><strong>BAGUS PERMADI</strong></td>
          <td style="width: 18%;"><strong>Nomor Peserta CBT</strong></td>
          <td style="width: 2%;">:</td>
          <td style="width: 20%;"><strong>CBT-2026-005829</strong></td>
        </tr>
        <tr>
          <td><strong>NISN</strong></td>
          <td>:</td>
          <td>0058291042</td>
          <td><strong>Kelas / Rombel</strong></td>
          <td>:</td>
          <td>XII RPL 1</td>
        </tr>
        <tr>
          <td><strong>Program Keahlian</strong></td>
          <td>:</td>
          <td>Pengembangan Perangkat Lunak (PPLG)</td>
          <td><strong>Semester / TA</strong></td>
          <td>:</td>
          <td>5 (Ganjil) / 2026-2027</td>
        </tr>
      </table>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 14%;">Tanggal</th>
            <th style="width: 10%;">Hari</th>
            <th style="width: 16%;">Jam Sesi Ujian</th>
            <th style="width: 12%;">Kode Mapel</th>
            <th style="width: 28%;">Mata Pelajaran Diujikan</th>
            <th style="width: 15%;">Ruang Laboratorium</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td class="text-center">10 Nov 2026</td>
            <td class="text-center"><strong>Senin</strong></td>
            <td class="text-center">07:30 - 09:00 WIB</td>
            <td class="text-center">RPL-301</td>
            <td><strong>Pemrograman Web & Perangkat Bergerak</strong></td>
            <td class="text-center">Lab Komputer RPL 1</td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td class="text-center">11 Nov 2026</td>
            <td class="text-center"><strong>Selasa</strong></td>
            <td class="text-center">07:30 - 09:00 WIB</td>
            <td class="text-center">RPL-302</td>
            <td><strong>Basis Data Terdistribusi & SQL Server</strong></td>
            <td class="text-center">Lab Komputer RPL 2</td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td class="text-center">12 Nov 2026</td>
            <td class="text-center"><strong>Rabu</strong></td>
            <td class="text-center">07:30 - 09:00 WIB</td>
            <td class="text-center">RPL-303</td>
            <td><strong>Pemodelan Perangkat Lunak & Sistem</strong></td>
            <td class="text-center">Lab Komputer RPL 1</td>
          </tr>
          <tr>
            <td class="text-center">4</td>
            <td class="text-center">13 Nov 2026</td>
            <td class="text-center"><strong>Kamis</strong></td>
            <td class="text-center">07:30 - 09:00 WIB</td>
            <td class="text-center">UMU-102</td>
            <td><strong>Bahasa Inggris Komunikasi & IT</strong></td>
            <td class="text-center">Lab Bahasa 1</td>
          </tr>
          <tr>
            <td class="text-center">5</td>
            <td class="text-center">14 Nov 2026</td>
            <td class="text-center"><strong>Jumat</strong></td>
            <td class="text-center">07:30 - 09:00 WIB</td>
            <td class="text-center">UMU-101</td>
            <td><strong>Matematika Kejuruan & Algoritma</strong></td>
            <td class="text-center">Lab Komputer RPL 1</td>
          </tr>
        </tbody>
      </table>

      <div class="tata-tertib">
        <strong>Tata Tertib Peserta Ujian Digital CBT:</strong>
        <ol>
          <li>Peserta wajib hadir di ruang lab komputer 15 menit sebelum sesi ujian dimulai.</li>
          <li>Login menggunakan NISN dan token sesi yang diberikan oleh pengawas ruang.</li>
          <li>Dilarang membuka tab baru, peramban lain, atau berkomunikasi selama ujian berlangsung.</li>
          <li>Sistem anti-kecurangan (Safe Exam) akan mencatat dan mendiskualifikasi pelanggaran otomatis.</li>
        </ol>
      </div>

      <div class="ttd-container">
        <div class="ttd-box-left">
          Ketua Panitia Ujian CBT<br><br><br><br>
          <strong>Rian Hidayat, S.T.</strong><br>
          NIP. 19880415 201101 1 003
        </div>
        <div class="ttd-box">
          Indonesia, 05 November 2026<br>
          Wali Kelas XII RPL 1<br><br><br><br>
          <strong>Hendro, S.Kom.</strong><br>
          NIP. 19840212 200801 1 004
        </div>
        <div class="clear"></div>
      </div>

      <div style="margin-top: 16px; text-align: center; font-size: 8pt; color: #555; border-top: 1px dashed #ccc; padding-top: 5px;">
        Dokumen ini diterbitkan secara sah dan otomatis melalui Portal Sistem Informasi Akademik Terpadu (eDupu Platform).
      </div>
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 400);
}

// Search Jadwal Ujian CBT
function searchUjian() {
  const query = document.getElementById('search-ujian-input')?.value.toLowerCase().trim() || '';
  const rows = document.querySelectorAll('#table-jadwal-ujian-cbt tbody tr.ujian-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const mapel = row.querySelector('.mapel-ujian-name')?.innerText.toLowerCase() || '';
    if (!query || mapel.includes(query)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  const countEl = document.getElementById('count-ujian-visible');
  if (countEl) countEl.innerText = visibleCount;
}

// Search Nilai KHS Siswa
function searchNilai() {
  const query = document.getElementById('search-nilai-input')?.value.toLowerCase().trim() || '';
  const rows = document.querySelectorAll('#table-khs-siswa tbody tr.khs-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const mapel = row.querySelector('.khs-mapel-name')?.innerText.toLowerCase() || '';
    if (!query || mapel.includes(query)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  const countEl = document.getElementById('count-khs-visible');
  if (countEl) countEl.innerText = visibleCount;
}

// Reload Data Nilai Raport
function reloadNilaiRaport() {
  const searchInput = document.getElementById('search-nilai-input');
  if (searchInput) searchInput.value = '';
  searchNilai();

  if (typeof showToast === 'function') {
    showToast('Memuat ulang data nilai raport...', 'info');
    setTimeout(() => {
      showToast('Data nilai raport berhasil diperbarui.', 'success');
    }, 500);
  }
}

// Filter Semester Nilai
function filterSemesterNilai(sem) {
  if (typeof showToast === 'function') {
    showToast(`Memuat data nilai raport Semester ${sem}...`, 'info');
  }
  const searchInput = document.getElementById('search-nilai-input');
  if (searchInput) searchInput.value = '';
  searchNilai();
}

// Download / Print Raport Hasil Belajar Siswa
function downloadNilaiRaport() {
  if (typeof showToast === 'function') {
    showToast('Menyiapkan dokumen cetak & unduh Raport Nilai...', 'info');
  }

  // Siapkan iframe tersembunyi untuk mencetak lembar raport resmi A4
  let printFrame = document.getElementById('raport-print-frame');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'raport-print-frame';
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
      <title>Raport_Bagus_Permadi_XII_RPL_1_Ganjil_2026</title>
      <style>
        @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; line-height: 1.35; margin: 0; padding: 0; }
        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 14px; position: relative; }
        .kop h3 { margin: 0; font-size: 13pt; font-weight: normal; text-transform: uppercase; }
        .kop h2 { margin: 2px 0; font-size: 15pt; font-weight: bold; text-transform: uppercase; }
        .kop h1 { margin: 2px 0; font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .kop p { margin: 2px 0; font-size: 9.5pt; font-style: italic; }
        .title { text-align: center; font-size: 12.5pt; font-weight: bold; text-transform: uppercase; margin: 12px 0 10px 0; text-decoration: underline; }
        .info-table { width: 100%; margin-bottom: 12px; font-size: 10pt; }
        .info-table td { padding: 2px 4px; vertical-align: top; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9.5pt; }
        .data-table th, .data-table td { border: 1px solid #000; padding: 5px 6px; }
        .data-table th { background-color: #f1f5f9; text-align: center; font-weight: bold; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .summary-box { margin-top: 10px; border: 1px solid #000; padding: 6px 10px; font-size: 9.5pt; background-color: #fafafa; }
        .ttd-container { width: 100%; margin-top: 24px; font-size: 10pt; }
        .ttd-box { width: 45%; text-align: center; float: right; }
        .ttd-box-left { width: 45%; text-align: center; float: left; }
        .clear { clear: both; }
        .badge { display: inline-block; padding: 1px 5px; border-radius: 3px; font-weight: bold; font-size: 9pt; }
      </style>
    </head>
    <body>
      <div class="kop">
        <h3>LEMBAGA PENDIDIKAN & AKADEMIK</h3>
        <h2>SISTEM INFORMASI MANAJEMEN SEKOLAH</h2>
        <h1>EDUPU VOCATIONAL ACADEMY</h1>
        <p>Jl. Pendidikan Nusantara No. 88, Telp. (021) 7890-1234, Indonesia</p>
        <p>Website: edupu.id • Email: support@edupu.id • Terakreditasi A</p>
      </div>

      <div class="title">LAPORAN CAPAIAN HASIL BELAJAR PESERTA DIDIK (RAPOR)</div>

      <table class="info-table">
        <tr>
          <td style="width: 18%;"><strong>Nama Peserta Didik</strong></td>
          <td style="width: 2%;">:</td>
          <td style="width: 40%;"><strong>BAGUS PERMADI</strong></td>
          <td style="width: 16%;"><strong>Kelas / Rombel</strong></td>
          <td style="width: 2%;">:</td>
          <td style="width: 22%;">XII RPL 1</td>
        </tr>
        <tr>
          <td><strong>NISN / NIS</strong></td>
          <td>:</td>
          <td>0058291042 / 241230453</td>
          <td><strong>Semester</strong></td>
          <td>:</td>
          <td>5 (Ganjil)</td>
        </tr>
        <tr>
          <td><strong>Program Keahlian</strong></td>
          <td>:</td>
          <td>Pengembangan Perangkat Lunak & Gim (PPLG)</td>
          <td><strong>Tahun Pelajaran</strong></td>
          <td>:</td>
          <td>2026/2027</td>
        </tr>
        <tr>
          <td><strong>Konsentrasi Keahlian</strong></td>
          <td>:</td>
          <td>Rekayasa Perangkat Lunak (RPL)</td>
          <td><strong>Kurikulum</strong></td>
          <td>:</td>
          <td>Kurikulum Merdeka</td>
        </tr>
      </table>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 4%;">No</th>
            <th style="width: 10%;">Kode</th>
            <th style="width: 32%;">Mata Pelajaran</th>
            <th style="width: 8%;">Formatif (NF)</th>
            <th style="width: 8%;">Sumatif (NS)</th>
            <th style="width: 8%;">Nilai Akhir</th>
            <th style="width: 6%;">Predikat</th>
            <th style="width: 24%;">Capaian Kompetensi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td class="text-center">RPL-301</td>
            <td><strong>Pemrograman Web & Perangkat Bergerak</strong></td>
            <td class="text-center">92.0</td>
            <td class="text-center">90.0</td>
            <td class="text-center"><strong>90.8</strong></td>
            <td class="text-center"><strong>A</strong></td>
            <td>Sangat Baik: Menguasai perancangan arsitektur backend REST API Laravel & responsif Tailwind CSS.</td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td class="text-center">RPL-302</td>
            <td><strong>Basis Data Terdistribusi & SQL Server</strong></td>
            <td class="text-center">88.0</td>
            <td class="text-center">85.0</td>
            <td class="text-center"><strong>86.2</strong></td>
            <td class="text-center"><strong>A-</strong></td>
            <td>Baik: Memahami optimasi query join, indexing, trigger, dan migrasi struktur tabel database.</td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td class="text-center">RPL-303</td>
            <td><strong>Pemodelan Perangkat Lunak & Sistem</strong></td>
            <td class="text-center">85.0</td>
            <td class="text-center">88.0</td>
            <td class="text-center"><strong>86.8</strong></td>
            <td class="text-center"><strong>A-</strong></td>
            <td>Baik: Mampu menyusun dokumen SRS, diagram use case, activity diagram, dan rancangan UI/UX.</td>
          </tr>
          <tr>
            <td class="text-center">4</td>
            <td class="text-center">RPL-304</td>
            <td><strong>Pemrograman Berorientasi Objek (OOP)</strong></td>
            <td class="text-center">90.0</td>
            <td class="text-center">92.0</td>
            <td class="text-center"><strong>91.2</strong></td>
            <td class="text-center"><strong>A</strong></td>
            <td>Sangat Baik: Implementasi enkapsulasi, inheritance, polimorfisme, dan interface Java teruji tuntas.</td>
          </tr>
          <tr>
            <td class="text-center">5</td>
            <td class="text-center">UMU-101</td>
            <td><strong>Matematika Terapan & Logika Komputasi</strong></td>
            <td class="text-center">84.0</td>
            <td class="text-center">82.0</td>
            <td class="text-center"><strong>82.8</strong></td>
            <td class="text-center"><strong>B+</strong></td>
            <td>Tuntas KKTP: Logika matriks, aljabar boolean, dan probabilitas algoritma diselesaikan dengan baik.</td>
          </tr>
          <tr>
            <td class="text-center">6</td>
            <td class="text-center">UMU-102</td>
            <td><strong>Bahasa Inggris Komunikasi & IT</strong></td>
            <td class="text-center">86.0</td>
            <td class="text-center">88.0</td>
            <td class="text-center"><strong>87.2</strong></td>
            <td class="text-center"><strong>A-</strong></td>
            <td>Baik: Mampu menyusun dokumentasi teknis, presentasi sprint aplikasi dalam bahasa Inggris aktif.</td>
          </tr>
          <tr>
            <td class="text-center">7</td>
            <td class="text-center">PKK-201</td>
            <td><strong>Produk Kreatif & Kewirausahaan (PKK)</strong></td>
            <td class="text-center">94.0</td>
            <td class="text-center">90.0</td>
            <td class="text-center"><strong>91.6</strong></td>
            <td class="text-center"><strong>A</strong></td>
            <td>Sangat Baik: Berhasil membuat prototype produk aplikasi software siap uji pasar dan proposal bisnis.</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-box">
        <strong>Ringkasan Capaian Akademik:</strong>
        Rata-rata Nilai Akhir (IP): <strong>88.6 (Predikat A - Sangat Memuaskan)</strong> | Kriteria Ketercapaian Tujuan Pembelajaran (KKTP): <strong>75.0</strong> | Status: <strong>LULUS TUNTAS</strong>
      </div>

      <div class="ttd-container">
        <div class="ttd-box-left">
          Mengetahui,<br>
          Orang Tua / Wali Murid<br><br><br><br>
          ( .................................................... )
        </div>
        <div class="ttd-box">
          Indonesia, 05 November 2026<br>
          Wali Kelas XII RPL 1<br><br><br><br>
          <strong>Hendro, S.Kom.</strong><br>
          NIP. 19840212 200801 1 004
        </div>
        <div class="clear"></div>
      </div>

      <div style="margin-top: 18px; text-align: center; font-size: 8pt; color: #555; border-top: 1px dashed #ccc; padding-top: 5px;">
        Dokumen ini diterbitkan secara sah dan otomatis melalui Portal Sistem Informasi Akademik Terpadu (eDupu Platform).
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Beri jeda sejenak agar rendering iframe selesai lalu panggil cetak / save as PDF
  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 400);
}

// Modal Lupa Password Controls
function openForgotPasswordModal() {
  const modal = document.getElementById('modal-forgot-password');
  if (modal) {
    modal.classList.remove('hidden');
    if (window.lucide) {
      lucide.createIcons();
    }
  }
}

function closeForgotPasswordModal() {
  const modal = document.getElementById('modal-forgot-password');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function handleForgotPasswordSubmit(e) {
  if (e) e.preventDefault();
  const contact = document.getElementById('reset-contact-input')?.value || '';
  closeForgotPasswordModal();
  if (typeof showToast === 'function') {
    showToast('Tautan atur ulang kata sandi berhasil dikirim ke ' + (contact || 'kontak Anda') + '. Silakan periksa kotak masuk / WhatsApp Anda.', 'success');
  } else {
    alert('Tautan atur ulang kata sandi berhasil dikirim ke ' + contact);
  }
}

