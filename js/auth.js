/**
 * eDupu / APK Learning - SMK Puger
 * Authentication & Role Management Logic (js/auth.js)
 */

// Preset Demo Accounts
const DEMO_ACCOUNTS = {
  siswa: {
    id: 'siswa_01',
    name: 'Bagus Permadi',
    nisn: '0058291042',
    role: 'siswa',
    roleLabel: 'Siswa • XII RPL 1',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    class: 'XII Rekayasa Perangkat Lunak 1',
    defaultView: 'absensi'
  },
  guru: {
    id: 'guru_01',
    name: 'Bpk. Hendro, S.Kom',
    nisn: '198402122008011004',
    role: 'guru',
    roleLabel: 'Guru Produktif RPL',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    subject: 'Pemrograman Web & Perangkat Bergerak',
    defaultView: 'nilai'
  },
  admin: {
    id: 'admin_01',
    name: 'Ibu Siti Rahayu, S.Pd',
    nisn: '198905142014022003',
    role: 'admin',
    roleLabel: 'Admin TU & Akademik',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    department: 'Tata Usaha & Dapodik',
    defaultView: 'dashboard'
  },
  kepsek: {
    id: 'kepsek_01',
    name: 'Drs. H. Bambang Sutrisno, M.Pd',
    nisn: '196711081992031005',
    role: 'kepsek',
    roleLabel: 'Kepala Sekolah',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    department: 'Pimpinan Eksekutif',
    defaultView: 'dashboard'
  }
};

let selectedRole = 'siswa';

// Initialize Login Page if exists
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    selectRole('siswa');
  }
});

// Select Role Tabs on Login Form
function selectRole(role) {
  selectedRole = role;
  
  // Update Tab Button Styles
  document.querySelectorAll('.role-pill-btn').forEach(btn => {
    if (btn.getAttribute('data-role') === role) {
      btn.className = 'role-pill-btn active py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2';
    } else {
      btn.className = 'role-pill-btn py-2.5 px-4 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2';
    }
  });

  // Update Input Hints based on role
  const idInput = document.getElementById('login-id');
  const idLabel = document.getElementById('login-id-label');
  
  if (idInput && idLabel) {
    if (role === 'siswa') {
      idLabel.innerText = 'Nomor Induk Siswa Nasional (NISN)';
      idInput.placeholder = 'Contoh: 0058291042';
      idInput.value = '0058291042';
    } else if (role === 'guru') {
      idLabel.innerText = 'NIP / NUPTK Guru';
      idInput.placeholder = 'Contoh: 198402122008011004';
      idInput.value = '198402122008011004';
    } else if (role === 'admin') {
      idLabel.innerText = 'ID Pegawai / Username Admin';
      idInput.placeholder = 'Contoh: admin_smkpuger';
      idInput.value = 'admin_smkpuger';
    } else {
      idLabel.innerText = 'NIP Kepala Sekolah';
      idInput.placeholder = 'Contoh: 196711081992031005';
      idInput.value = '196711081992031005';
    }
  }

  const passInput = document.getElementById('login-password');
  if (passInput) passInput.value = 'password123';
}

// 1-Click Quick Demo Login
function quickLogin(role) {
  selectRole(role);
  performLogin(DEMO_ACCOUNTS[role]);
}

// Handle Form Submission
function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  
  const idInput = document.getElementById('login-id');
  const passInput = document.getElementById('login-password');

  if (!idInput.value.trim() || !passInput.value.trim()) {
    if (typeof showToast === 'function') {
      showToast('Harap masukkan ID/NISN dan Kata Sandi!', 'error');
    } else {
      alert('Harap masukkan ID/NISN dan Kata Sandi!');
    }
    return;
  }

  const account = DEMO_ACCOUNTS[selectedRole] || DEMO_ACCOUNTS.siswa;
  performLogin(account);
}

// Perform login and redirect
function performLogin(account) {
  const submitBtn = document.getElementById('btn-submit-login');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengautentikasi...';
  }

  // Save to localStorage
  localStorage.setItem('edupu_current_user', JSON.stringify(account));

  if (typeof showToast === 'function') {
    showToast(`Selamat datang, ${account.name}! Masuk sebagai ${account.roleLabel}...`, 'success');
  }

  setTimeout(() => {
    if (account.role === 'guru') {
      window.location.href = 'instructor-dashboard.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  }, 700);
}

// Check Auth on Dashboard
function getCurrentUser() {
  const saved = localStorage.getItem('edupu_current_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEMO_ACCOUNTS.admin;
    }
  }
  // Default to Admin if not logged in for easy demonstration
  return DEMO_ACCOUNTS.admin;
}

// Toggle Password visibility
function togglePasswordVisibility() {
  const input = document.getElementById('login-password');
  const icon = document.getElementById('toggle-eye-icon');
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-regular fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-regular fa-eye';
  }
}

// Logout
function logoutUser() {
  if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
    localStorage.removeItem('edupu_current_user');
    window.location.href = 'login.html';
  }
}

