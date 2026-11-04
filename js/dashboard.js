/**
 * eDupu / APK Learning - SMK Puger
 * Dashboard, Geofencing GPS, CBT Engine & Academic Logic (js/dashboard.js)
 */

// Coordinates: SMK Puger, Jember, Jawa Timur
const SMK_PUGER_COORDS = [-8.3650, 113.4750];
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
});

// Setup user data from session or demo
function setupUserSession() {
  const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : {
    name: 'Bpk. Hendro, S.Kom',
    role: 'guru',
    roleLabel: 'Guru Produktif RPL',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  };

  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-role-label');
  const avatarEl = document.getElementById('user-avatar-img');

  if (nameEl) nameEl.innerText = user.name;
  if (roleEl) roleEl.innerText = user.roleLabel;
  if (avatarEl) avatarEl.src = user.avatar;

  // Set default view based on user role
  if (user.defaultView) {
    switchView(user.defaultView);
  } else {
    switchView('dashboard');
  }
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

  // Update Sidebar Nav active state
  document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`side-${viewName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update Page Header Titles
  const titleMap = {
    dashboard: {
      title: 'Schedule & Monitoring Module',
      sub: 'SMK Puger • Sistem Informasi Pembelajaran Terintegrasi'
    },
    absensi: {
      title: 'Presensi GPS Geofencing Siswa',
      sub: 'Validasi Titik Koordinat Real-Time • Radius Batas 80 Meter'
    },
    cbt: {
      title: 'Ujian Digital CBT (Computer-Based Test)',
      sub: 'Penilaian Terstandarisasi SMK Puger • Autosave & Anti-Cheat Enabled'
    },
    nilai: {
      title: 'Rekapitulasi Nilai & Leger Siswa',
      sub: 'Manajemen Capaian Pembelajaran & Rapor Kurikulum Merdeka'
    },
    master: {
      title: 'Data Master & Konfigurasi Sistem',
      sub: 'Pengaturan Sekolah, Siswa, Guru, dan Parameter Geofence'
    }
  };

  const headerInfo = titleMap[viewName] || titleMap.dashboard;
  const hTitle = document.getElementById('module-header-title');
  const hSub = document.getElementById('module-header-subtitle');
  if (hTitle) hTitle.innerText = headerInfo.title;
  if (hSub) hSub.innerText = headerInfo.sub;

  // Invalidate Leaflet maps to adjust canvas size
  setTimeout(() => {
    if (mapSafetac) mapSafetac.invalidateSize();
    if (mapStudent) mapStudent.invalidateSize();
  }, 200);
}

// Chart.js: Attendance Statistics
function initAttendanceChart() {
  const ctx = document.getElementById('safetacBarChart');
  if (!ctx) return;

  if (attendanceChart) attendanceChart.destroy();

  attendanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['12', '13', '14', '15', '16', '17', '18'],
      datasets: [
        {
          label: 'Hadir Tepat Waktu',
          data: [26, 28, 24, 29, 27, 25, 29],
          backgroundColor: '#7c3aed',
          borderRadius: 6,
          barThickness: 10,
        },
        {
          label: 'Terlambat / Izin',
          data: [3, 2, 4, 1, 3, 2, 1],
          backgroundColor: '#ddd6fe',
          borderRadius: 6,
          barThickness: 10,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 30,
          ticks: {
            stepSize: 10,
            font: { size: 10, family: 'Inter' },
            color: '#94a3b8',
            callback: function(val) { return val * 30; }
          },
          grid: {
            color: '#f8fafc',
            borderDash: [4, 4]
          },
          border: { display: false }
        },
        x: {
          ticks: {
            font: { size: 10, family: 'Inter' },
            color: '#94a3b8'
          },
          grid: { display: false },
          border: { display: false }
        }
      }
    }
  });
}

// Leaflet GPS Setup
function initLeafletMaps() {
  // 1. Dashboard Mini Map
  const mapEl1 = document.getElementById('safetac-map');
  if (mapEl1 && !mapSafetac) {
    mapSafetac = L.map('safetac-map', { zoomControl: false }).setView(SMK_PUGER_COORDS, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      className: 'custom-map-tile'
    }).addTo(mapSafetac);

    L.circle(SMK_PUGER_COORDS, {
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
    L.marker(SMK_PUGER_COORDS, { icon: purpleIcon }).addTo(mapSafetac).bindPopup("<b>SMK Puger</b><br>Titik Gerbang Utama");
  }

  // 2. Student Absensi Portal Map
  const mapEl2 = document.getElementById('student-geofence-map');
  if (mapEl2 && !mapStudent) {
    mapStudent = L.map('student-geofence-map').setView(SMK_PUGER_COORDS, 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapStudent);

    L.circle(SMK_PUGER_COORDS, {
      color: '#7c3aed',
      fillColor: '#8b5cf6',
      fillOpacity: 0.25,
      radius: 80
    }).addTo(mapStudent).bindPopup("<b>Zona Geofence SMK Puger (Radius 80m)</b>");

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
    desc.innerText = "Anda berada dalam zona radius resmi SMK Puger (Toleransi batas: 80 meter).";
    coords.innerText = "Lat: -8.36515, Lng: 113.47518 (Akurasi: ±4m)";

    btnInside.className = "px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl shadow-xs transition";
    btnOutside.className = "px-3 py-1 bg-white text-slate-600 hover:bg-slate-100 font-bold rounded-xl border border-slate-200 transition";

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

    btnInside.className = "px-3 py-1 bg-white text-slate-600 hover:bg-slate-100 font-bold rounded-xl border border-slate-200 transition";
    btnOutside.className = "px-3 py-1 bg-rose-600 text-white font-bold rounded-xl shadow-xs transition";

    submitBtn.disabled = true;
    submitBtn.className = "w-full py-3.5 bg-slate-200 text-slate-400 font-extrabold text-xs rounded-2xl cursor-not-allowed flex items-center justify-center gap-2";
    submitBtn.innerHTML = '<i class="fa-solid fa-ban text-base"></i> DILUAR RADIUS (TIDAK DAPAT ABSEN)';
    if (logVal) logVal.innerText = "340m (Gagal)";
  }
}

// Submit Absensi Action
function submitAbsensi() {
  if (typeof showToast === 'function') {
    showToast('Presensi Masuk Berhasil! Koordinat GPS terverifikasi oleh Geofence SMK Puger.', 'success');
  } else {
    alert("Berhasil! Presensi masuk siswa telah divalidasi oleh Geofence SMK Puger.");
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

