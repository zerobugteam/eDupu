/**
 * eDupu / APK Learning - SMK Puger
 * DreamsLMS Style Instructor Dashboard Logic (js/instructor.js)
 */

let performanceChart, attendanceDonutChart;

document.addEventListener('DOMContentLoaded', () => {
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
    showToast('Mengunduh Rekap_Presensi_SMK_Puger_November_2026.xlsx...', 'success');
  }
}

