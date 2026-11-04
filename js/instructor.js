/**
 * eDupu / APK Learning - SMK Puger
 * DreamsLMS Style Instructor Dashboard Logic (js/instructor.js)
 */

let performanceChart, attendanceDonutChart;

document.addEventListener('DOMContentLoaded', () => {
  initInstructorCharts();
  startInstructorClock();
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
    const gradientPrimary = ctx.createLinearGradient(0, 0, 0, 260);
    gradientPrimary.addColorStop(0, 'rgba(255, 84, 33, 0.28)');
    gradientPrimary.addColorStop(1, 'rgba(255, 84, 33, 0.01)');

    const gradientBlue = ctx.createLinearGradient(0, 0, 0, 260);
    gradientBlue.addColorStop(0, 'rgba(61, 94, 225, 0.22)');
    gradientBlue.addColorStop(1, 'rgba(61, 94, 225, 0.01)');

    performanceChart = new Chart(perfCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
        datasets: [
          {
            label: 'Rata-rata Nilai Tugas & CBT',
            data: [78, 80, 84, 82, 86, 88, 85, 89, 91, 88, 92],
            borderColor: '#ff5421',
            backgroundColor: gradientPrimary,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#ff5421',
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
            titleFont: { family: 'Plus Jakarta Sans', size: 12 },
            bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
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
              font: { family: 'Plus Jakarta Sans', size: 11 },
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
              font: { family: 'Plus Jakarta Sans', size: 11 },
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

