// Global Shared Logic for Club Hub (Multi-Page Architecture)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Theme Settings
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // 2. Load the Glassmorphic Sidebar
  injectSidebar();

  // 3. Initialize Collapse Sidebar States
  initSidebarCollapse();

  // 4. Initialize Mobile Menu Control
  initMobileMenu();

  // 5. Toast Notifications Manager
  setupToastContainer();

  // 6. Global Search Keyboard Event
  setupGlobalSearch();

  // 7. Re-inject sidebar whenever Firebase auth changes state
  document.addEventListener('auth_state_ready', () => {
    injectSidebar();
  });
});

// Setup Global Toast Notification Helper
function setupToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

window.showToast = function(title, message, type = 'success') {
  setupToastContainer();
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animated-entrance`;
  
  let icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'warning') icon = 'fa-triangle-exclamation';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <i class="fa-solid fa-xmark toast-close"></i>
  `;
  
  container.appendChild(toast);
  
  // Close handler
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.style.animation = 'slide-up-fade 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  });
  
  // Auto remove
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slide-up-fade 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
};

// Sidebar HTML Template & Injection
function injectSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const currentUser = window.db ? window.db.getCurrentUser() : null;
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  let menuHtml = `
    <ul class="sidebar-menu">
      <li><a href="index.html" class="sidebar-link ${currentPath === 'index.html' || currentPath === '' ? 'active' : ''}"><i class="fa-solid fa-house"></i> <span>Home</span></a></li>
      <li><a href="members.html" class="sidebar-link ${currentPath === 'members.html' ? 'active' : ''}"><i class="fa-solid fa-users"></i> <span>Members</span></a></li>
      <li><a href="projects.html" class="sidebar-link ${currentPath === 'projects.html' ? 'active' : ''}"><i class="fa-solid fa-briefcase"></i> <span>Projects</span></a></li>
      <li><a href="resources.html" class="sidebar-link ${currentPath === 'resources.html' ? 'active' : ''}"><i class="fa-solid fa-book"></i> <span>Resources</span></a></li>
      <li><a href="gallery.html" class="sidebar-link ${currentPath === 'gallery.html' ? 'active' : ''}"><i class="fa-solid fa-image"></i> <span>Gallery</span></a></li>
      <li><a href="events.html" class="sidebar-link ${currentPath === 'events.html' ? 'active' : ''}"><i class="fa-solid fa-calendar-days"></i> <span>Events</span></a></li>
      <li><a href="quiz.html" class="sidebar-link ${currentPath === 'quiz.html' ? 'active' : ''}"><i class="fa-solid fa-brain"></i> <span>Weekly Quiz</span></a></li>
      <li><a href="winners.html" class="sidebar-link ${currentPath === 'winners.html' ? 'active' : ''}"><i class="fa-solid fa-trophy"></i> <span>Weekly Winners</span></a></li>
      <li><a href="tasks.html" class="sidebar-link ${currentPath === 'tasks.html' ? 'active' : ''}"><i class="fa-solid fa-square-check"></i> <span>Weekly Tasks</span></a></li>
      <li><a href="join.html" class="sidebar-link ${currentPath === 'join.html' ? 'active' : ''}"><i class="fa-solid fa-hand-fist"></i> <span>Join Club</span></a></li>
      <li><a href="settings.html" class="sidebar-link ${currentPath === 'settings.html' ? 'active' : ''}"><i class="fa-solid fa-gear"></i> <span>Settings</span></a></li>
      <li><a href="contact.html" class="sidebar-link ${currentPath === 'contact.html' ? 'active' : ''}"><i class="fa-solid fa-phone"></i> <span>Contact</span></a></li>
  `;

  // Dynamic Admin Panel Link
  if (currentUser && currentUser.role === 'admin') {
    menuHtml += `
      <li><a href="admin.html" class="sidebar-link ${currentPath === 'admin.html' ? 'active' : ''}"><i class="fa-solid fa-crown"></i> <span>Admin Panel</span></a></li>
    `;
  }
  menuHtml += `</ul>`;

  // User Section HTML
  let userSectionHtml = '';
  if (currentUser) {
    userSectionHtml = `
      <div class="sidebar-user">
        <img class="sidebar-user-avatar" src="${currentUser.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" alt="${currentUser.name}">
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">${currentUser.name}</span>
          <span class="sidebar-user-role">${currentUser.role}</span>
        </div>
        <a href="#" id="sidebar-logout-btn" class="sidebar-user-logout" title="Logout"><i class="fa-solid fa-right-from-bracket"></i></a>
      </div>
    `;
  } else {
    userSectionHtml = `
      <div class="sidebar-user" style="justify-content: center;">
        <a href="auth.html" class="btn btn-primary btn-sm" style="border-radius: 8px; width: 100%;"><i class="fa-solid fa-right-to-bracket"></i> <span>Sign In</span></a>
      </div>
    `;
  }

  const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  const sidebarHtml = `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="app-sidebar">
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-logo">
          <span class="logo-dot"></span> <span>MINDCRAFT AI</span>
        </a>
        <button class="sidebar-toggle-btn" id="sidebar-toggle-btn">
          <i class="fa-solid ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'}"></i>
        </button>
      </div>
      ${menuHtml}
      ${userSectionHtml}
    </aside>
  `;

  container.innerHTML = sidebarHtml;

  // Logout Trigger Event
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.db) {
        window.db.logout();
        window.showToast('Logged Out', 'You have been safely logged out.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    });
  }
}

// Collapsible logic
function initSidebarCollapse() {
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebar_collapsed', isCollapsed);
    
    // Toggle Icon class
    const icon = toggleBtn.querySelector('i');
    if (isCollapsed) {
      icon.className = 'fa-solid fa-angles-right';
    } else {
      icon.className = 'fa-solid fa-angles-left';
    }
  });
}

// Mobile sidebar drawer
function initMobileMenu() {
  const container = document.getElementById('sidebar-container');
  // Inject mobile header
  const mHeader = document.createElement('header');
  mHeader.className = 'mobile-header';
  mHeader.innerHTML = `
    <a href="index.html" class="sidebar-logo">
      <span class="logo-dot"></span> <span>MINDCRAFT AI</span>
    </a>
    <button class="mobile-menu-btn" id="mobile-menu-toggle">
      <i class="fa-solid fa-bars"></i>
    </button>
  `;
  
  // Insert mobile header at beginning of body
  document.body.insertBefore(mHeader, document.body.firstChild);
  
  const mToggle = document.getElementById('mobile-menu-toggle');
  
  if (mToggle) {
    mToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('mobile-open');
        const icon = mToggle.querySelector('i');
        if (sidebar.classList.contains('mobile-open')) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      }
    });
  }

  // Close sidebar on click outside
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      if (!sidebar.contains(e.target) && !e.target.closest('#mobile-menu-toggle')) {
        sidebar.classList.remove('mobile-open');
        const icon = document.querySelector('#mobile-menu-toggle i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    }
  });
}

// Topbar Global Search Redirection
function setupGlobalSearch() {
  const searchInput = document.querySelector('.global-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `members.html?search=${encodeURIComponent(query)}`;
      }
    }
  });
}

// Render Top Bar dynamically inside layouts
window.injectTopBar = function(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const sunIconStyle = currentTheme === 'light' ? 'display: block;' : 'display: none;';
  const moonIconStyle = currentTheme === 'dark' ? 'display: block;' : 'display: none;';

  container.innerHTML = `
    <div class="top-bar">
      <div class="global-search-container">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" class="global-search-input" placeholder="Search members, skills, projects...">
      </div>
      <div class="top-bar-actions">
        <button class="theme-btn" id="global-theme-toggle" aria-label="Toggle theme" style="margin-right: 0.5rem;">
          <i class="fa-solid fa-moon" style="${moonIconStyle}"></i>
          <i class="fa-solid fa-sun" style="${sunIconStyle}"></i>
        </button>
        <div class="notification-bell">
          <i class="fa-solid fa-bell"></i>
          <div class="notification-badge" id="global-notif-badge" style="display: none;"></div>
        </div>
      </div>
    </div>
  `;

  // Add theme toggle event
  const themeBtn = document.getElementById('global-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      
      const moon = themeBtn.querySelector('.fa-moon');
      const sun = themeBtn.querySelector('.fa-sun');
      if (nextTheme === 'dark') {
        moon.style.display = 'block';
        sun.style.display = 'none';
      } else {
        moon.style.display = 'none';
        sun.style.display = 'block';
      }
    });
  }

  // Pre-fill search query if present in URL
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get('search');
  if (searchQuery) {
    const input = container.querySelector('.global-search-input');
    if (input) input.value = searchQuery;
  }

  // Hook up notifications badge checks
  updateNotificationsBadge();
};

async function updateNotificationsBadge() {
  if (!window.db) return;
  const joinReqs = await window.db.find('JoinRequests');
  const pendingCount = joinReqs.filter(r => r.status === 'Pending').length;
  const badge = document.getElementById('global-notif-badge');
  if (badge) {
    if (pendingCount > 0) {
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Global Auth Route Guards
window.requireAuth = function(roleRequired = null) {
  if (!window.db) return;
  const user = window.db.getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  if (roleRequired && user.role !== roleRequired) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
};
