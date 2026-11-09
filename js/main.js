/**
 * eDupu Platform - Modern School Learning System
 * Global Utilities & Common Helpers (js/main.js)
 */

// Toast Notification System
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = '<i class="fa-solid fa-circle-info text-indigo-500"></i>';
  if (type === 'success') {
    icon = '<i class="fa-solid fa-circle-check text-emerald-500 text-base"></i>';
  } else if (type === 'error') {
    icon = '<i class="fa-solid fa-triangle-exclamation text-rose-500 text-base"></i>';
  }

  toast.innerHTML = `
    ${icon}
    <div class="flex-1">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 text-xs ml-2">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px) scale(0.92)';
    toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Mobile Menu Toggle for Landing Page
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// FAQ Accordion Handler
function toggleFaq(element) {
  const item = element.closest('.faq-item');
  if (!item) return;

  const isOpen = item.classList.contains('open');

  // Close other open faqs
  document.querySelectorAll('.faq-item').forEach(el => {
    if (el !== item) el.classList.remove('open');
  });

  if (isOpen) {
    item.classList.remove('open');
  } else {
    item.classList.add('open');
  }
}

// Active link highlighting on scroll (Landing Page)
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 120;
    const sectionId = current.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

    if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('text-primary-600', 'font-bold'));
      navLink.classList.add('text-primary-600', 'font-bold');
    }
  });

  // Update Top Scroll Progress Bar
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
  const bar = document.getElementById('scroll-progress-bar');
  if (bar) bar.style.width = scrolled + '%';
});

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 850,
      easing: 'ease-out-cubic',
      once: false,
      offset: 50,
      mirror: true
    });
  }
});

