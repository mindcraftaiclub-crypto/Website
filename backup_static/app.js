// JavaScript - Interactive Home Page Logic

document.addEventListener('DOMContentLoaded', () => {
  // --- THEME SELECTOR & LOCAL STORAGE ---
  const themeToggle = document.getElementById('theme-toggle');
  const activeTheme = localStorage.getItem('theme') || 'dark';
  
  // Set initial theme
  document.documentElement.setAttribute('data-theme', activeTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // --- HEADER SCROLL TRANSITION ---
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- MOBILE NAV MENU TOGGLE ---
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const menuToggleIcon = menuToggle.querySelector('i');
  
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    if (navMenu.classList.contains('open')) {
      menuToggleIcon.className = 'fa-solid fa-xmark';
    } else {
      menuToggleIcon.className = 'fa-solid fa-bars';
    }
  });
  
  // Close menu when clicking nav link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggleIcon.className = 'fa-solid fa-bars';
    });
  });

  // Close menu when clicking outside of nav menu
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      menuToggleIcon.className = 'fa-solid fa-bars';
    }
  });

  // --- HERO TYPEWRITER EFFECT ---
  const typewriterText = document.getElementById('typewriter-text');
  const words = ['stunning designs', 'clean, scaleable code', 'interactive spaces', 'butter-smooth UX'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;
  
  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      typewriterText.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40; // delete faster
    } else {
      typewriterText.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100; // standard typing speed
    }
    
    // Check if word completed
    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2000; // pause before deleting
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500; // brief pause before next word
    }
    
    setTimeout(type, typeSpeed);
  }
  
  // Start typewriter
  setTimeout(type, 1000);

  // --- SKILLS ANIMATION ON SCROLL ---
  const skillFills = document.querySelectorAll('.skill-level-fill');
  const aboutSection = document.getElementById('about');
  
  function animateSkills() {
    const aboutPos = aboutSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    // Check if about section is partially visible on viewport
    if (aboutPos < windowHeight - 100) {
      skillFills.forEach(fill => {
        const level = fill.getAttribute('data-level');
        fill.style.width = level;
      });
      // Remove listener after running once to keep performance optimal
      window.removeEventListener('scroll', animateSkills);
    }
  }
  
  window.addEventListener('scroll', animateSkills);
  animateSkills(); // Trigger check on load in case about is already in view

  // --- PORTFOLIO GALLERY FILTER ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      projectCards.forEach(card => {
        // Animation layout scale-out
        card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 400);
        }
      });
    });
  });

  // --- CONTACT FORM SUBMISSION MOCK ---
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formSuccessClose = document.getElementById('form-success-close');
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Basic HTML5 validation trigger
    if (contactForm.checkValidity()) {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;
      
      // Simulate sending state
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-circle-notch fa-spin"></i>';
      
      setTimeout(() => {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        
        // Show success screen
        formSuccess.classList.add('active');
        
        // Reset form inputs
        contactForm.reset();
      }, 1500);
    } else {
      // Trigger browser default reporting
      contactForm.reportValidity();
    }
  });
  
  formSuccessClose.addEventListener('click', () => {
    formSuccess.classList.remove('active');
  });

  // --- ACTIVE SCROLL LINK HIGHLIGHTING ---
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 150; // Offset for header height
    
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // --- SCROLL TO TOP BUTTON ---
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.style.opacity = '1';
      scrollTopBtn.style.pointerEvents = 'auto';
    } else {
      scrollTopBtn.style.opacity = '0';
      scrollTopBtn.style.pointerEvents = 'none';
    }
  });
  
  // Set initial scroll top state
  scrollTopBtn.style.opacity = '0';
  scrollTopBtn.style.pointerEvents = 'none';
  scrollTopBtn.style.transition = 'opacity 0.3s ease';

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
