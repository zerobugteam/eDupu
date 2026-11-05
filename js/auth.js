/**
 * eDupu / APK Learning - SMK Puger
 * Authentication & Role Management Logic (js/auth.js)
 */

// Preset Demo Accounts for 6 Roles (Sesuai Proposal Resmi SMK Puger)
const DEMO_ACCOUNTS = {
  siswa: {
    id: 'siswa_01',
    username: 'bagus',
    password: 'siswa123',
    name: 'Bagus Permadi',
    nisn: '0058291042',
    role: 'siswa',
    roleLabel: 'Siswa • XII RPL 1',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    class: 'XII Rekayasa Perangkat Lunak 1',
    defaultView: 'dashboard',
    redirectUrl: 'dashboard.html'
  },
  guru: {
    id: 'guru_01',
    username: 'guru',
    password: 'guru123',
    name: 'Bpk. Rian Hidayat, S.T.',
    nisn: '198804152011011003',
    role: 'guru',
    roleLabel: 'Guru Mata Pelajaran',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    subject: 'Pemrograman Web & Basis Data',
    defaultView: 'nilai',
    redirectUrl: 'instructor-dashboard.html'
  },
  walikelas: {
    id: 'wali_01',
    username: 'wali',
    password: 'wali123',
    name: 'Bpk. Hendro, S.Kom.',
    nisn: '198402122008011004',
    role: 'walikelas',
    roleLabel: 'Wali Kelas XII RPL 1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    classManaged: 'XII RPL 1',
    defaultView: 'dashboard',
    redirectUrl: 'instructor-dashboard.html'
  },
  admin: {
    id: 'admin_01',
    username: 'admintu',
    password: 'admin123',
    name: 'Ibu Siti Rahayu, S.Pd.',
    nisn: '198905142014022003',
    role: 'admin',
    roleLabel: 'Admin Sekolah / TU',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    department: 'Tata Usaha & Dapodik',
    defaultView: 'dashboard',
    redirectUrl: 'instructor-dashboard.html'
  },
  kepsek: {
    id: 'kepsek_01',
    username: 'kepsek',
    password: 'kepsek123',
    name: 'Drs. H. Bambang Sutrisno, M.Pd.',
    nisn: '196711081992031005',
    role: 'kepsek',
    roleLabel: 'Kepala Sekolah',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    department: 'Pimpinan Eksekutif',
    defaultView: 'dashboard',
    redirectUrl: 'instructor-dashboard.html'
  },
  superadmin: {
    id: 'super_01',
    username: 'superadmin',
    password: 'superadmin123',
    name: 'Tim IT Administrator',
    nisn: '9900112233',
    role: 'superadmin',
    roleLabel: 'Super Admin Sistem',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    school: 'SMK Puger',
    department: 'Infrastruktur & Keamanan',
    defaultView: 'dashboard',
    redirectUrl: 'instructor-dashboard.html'
  }
};

let selectedRole = 'siswa';

// Initialize Login Page if exists
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Select Role Tabs on Login Form (Fallback helper if invoked)
function selectRole(role) {
  selectedRole = role;
  
  // Update Tab Button Styles if any exist
  document.querySelectorAll('.role-pill-btn').forEach(btn => {
    if (btn.getAttribute('data-role') === role) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const idInput = document.getElementById('login-id');
  const passInput = document.getElementById('login-password');
  const acc = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.siswa;

  if (idInput && acc) {
    idInput.value = acc.username;
  }
  if (passInput && acc) {
    passInput.value = acc.password;
  }
}

// 1-Click Quick Demo Login
function quickLogin(role) {
  selectRole(role);
  performLogin(DEMO_ACCOUNTS[role]);
}

// Handle Form Submission (Single Unified Portal Login)
function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  
  const idInput = document.getElementById('login-id');
  const passInput = document.getElementById('login-password');
  const enteredId = idInput?.value.trim().toLowerCase() || '';
  const enteredPass = passInput?.value.trim() || '';

  if (!enteredId || !enteredPass) {
    if (typeof showToast === 'function') {
      showToast('Harap masukkan Username dan Kata Sandi!', 'error');
    } else {
      alert('Harap masukkan Username dan Kata Sandi!');
    }
    return;
  }

  // Cari akun yang cocok dengan username atau NISN/NIP
  let foundAccount = null;
  for (const key in DEMO_ACCOUNTS) {
    const acc = DEMO_ACCOUNTS[key];
    const usernameMatch = acc.username.toLowerCase() === enteredId;
    const nisnMatch = acc.nisn.toLowerCase() === enteredId || (acc.nisn.length >= 8 && acc.nisn.startsWith(enteredId));
    const aliasMatch = (key === 'admin' && (enteredId === 'admin' || enteredId === 'admintu')) ||
                       (key === 'walikelas' && (enteredId === 'wali' || enteredId === 'walikelas')) ||
                       (key === 'guru' && (enteredId === 'guru' || enteredId === 'gurumapel')) ||
                       (key === 'siswa' && (enteredId === 'siswa' || enteredId === 'bagus')) ||
                       (key === 'kepsek' && (enteredId === 'kepsek' || enteredId === 'kepalasekolah')) ||
                       (key === 'superadmin' && (enteredId === 'superadmin' || enteredId === 'root' || enteredId === 'it'));

    if (usernameMatch || nisnMatch || aliasMatch) {
      foundAccount = acc;
      break;
    }
  }

  if (foundAccount) {
    if (foundAccount.password === enteredPass) {
      performLogin(foundAccount);
    } else {
      const msg = 'Kata sandi tidak sesuai! Silakan periksa kembali kata sandi Anda.';
      if (typeof showToast === 'function') showToast(msg, 'error');
      else alert(msg);
    }
    return;
  }

  // Fallback demo matching jika username belum terdaftar
  if (enteredPass === 'siswa123' || enteredPass === '123456') {
    const customSiswa = {
      ...DEMO_ACCOUNTS.siswa,
      name: enteredId.charAt(0).toUpperCase() + enteredId.slice(1),
      username: enteredId
    };
    performLogin(customSiswa);
    return;
  }

  const msg = 'Username atau kata sandi tidak ditemukan! Contoh akun pengujian: bagus (siswa123), guru (guru123), wali (wali123), admin (admin123), kepsek (kepsek123), superadmin (superadmin123).';
  if (typeof showToast === 'function') {
    showToast(msg, 'error');
  } else {
    alert(msg);
  }
}

// Perform login and redirect
function performLogin(account) {
  const submitBtn = document.getElementById('btn-submit-login');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Mengautentikasi...</span>';
    if (window.lucide) lucide.createIcons();
  }

  // Save to localStorage
  localStorage.setItem('edupu_current_user', JSON.stringify(account));

  if (typeof showToast === 'function') {
    showToast(`Selamat datang, ${account.name}! Masuk sebagai ${account.roleLabel}...`, 'success');
  }

  setTimeout(() => {
    window.location.href = account.redirectUrl || (account.role === 'siswa' ? 'dashboard.html' : 'instructor-dashboard.html');
  }, 600);
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
    icon.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i>';
  }
  if (window.lucide) lucide.createIcons();
}

// Logout
function logoutUser() {
  if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
    localStorage.removeItem('edupu_current_user');
    window.location.href = 'login.html';
  }
}

