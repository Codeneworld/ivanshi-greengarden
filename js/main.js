/*
  Nav toggle fix: 
  - Ensure you have a button or element with class "nav-toggle" in your HTML.
  - Your nav/menu should be styled to show/hide based on a class (e.g., .nav-open on body).
*/
document.addEventListener('DOMContentLoaded', function () {
  // Utility: set year in footer
  document.querySelectorAll('[id^="year"]').forEach(el => el.textContent = new Date().getFullYear());

  /* ----- Responsive nav toggle (works on all pages) ----- */
  (function () {
    const BREAKPOINT = 900; // matches your CSS media query
    const navToggles = document.querySelectorAll('.nav-toggle');

    navToggles.forEach(btn => {
      const header = btn.closest('.site-header');
      const nav = header ? header.querySelector('.nav') : null;

      if (!nav) return;

      // Ensure nav has an id for aria-controls
      if (!nav.id) nav.id = 'nav-' + Math.random().toString(36).substr(2, 6);
      btn.setAttribute('aria-controls', nav.id);
      btn.setAttribute('aria-expanded', 'false');

      function closeNav() {
        nav.style.display = '';
        nav.style.position = '';
        nav.style.top = '';
        nav.style.right = '';
        nav.style.background = '';
        nav.style.padding = '';
        nav.style.boxShadow = '';
        nav.style.borderRadius = '';
        btn.setAttribute('aria-expanded', 'false');
        header.classList.remove('nav-open');
      }

      function openNav() {
        const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 64;
        nav.style.display = 'block';
        nav.style.position = 'absolute';
        nav.style.top = headerHeight + 'px';
        nav.style.right = '16px';
        nav.style.background = 'white';
        nav.style.padding = '0.8rem 1rem';
        nav.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)';
        nav.style.borderRadius = '10px';
        btn.setAttribute('aria-expanded', 'true');
        header.classList.add('nav-open');
      }

      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (window.innerWidth > BREAKPOINT) return;
        const open = header.classList.contains('nav-open') || nav.style.display === 'block';
        if (open) closeNav();
        else openNav();
      });

      // Close when clicking outside
      document.addEventListener('click', e => {
        if (window.innerWidth > BREAKPOINT) return;
        if (!header.contains(e.target) && header.classList.contains('nav-open')) {
          closeNav();
        }
      });

      // Reset if resizing back to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > BREAKPOINT) closeNav();
      });
    });
  })();

  // SLIDER FUNCTION (works for #home-slider and #gallery-slider)
  function initSlider(selector, interval = 4000) {
    const slider = document.querySelector(selector);
    if (!slider) return;
    const slides = slider.querySelector('.slides');
    const imgs = slides.querySelectorAll('img');
    let idx = 0;
    let width = slider.offsetWidth;

    function show(i) {
      slides.style.transform = `translateX(-${i * width}px)`;
    }
    // Resize handler
    window.addEventListener('resize', () => {
      width = slider.offsetWidth;
      show(idx);
    });

    let timer = setInterval(() => {
      idx = (idx + 1) % imgs.length;
      show(idx);
    }, interval);

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => {
      timer = setInterval(() => {
        idx = (idx + 1) % imgs.length;
        show(idx);
      }, interval);
    });

    // ensure images fill container on load
    window.addEventListener('load', () => {
      width = slider.offsetWidth;
      show(idx);
    });
  }
  initSlider('#home-slider', 4500);
  initSlider('#gallery-slider', 3500);

  // Gallery grid lightbox
  const galleryGrid = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (galleryGrid && lightbox && lightboxImg) {
    galleryGrid.addEventListener('click', e => {
      if (e.target.tagName === 'IMG') {
        lightbox.style.display = 'flex';
        lightboxImg.src = e.target.src;
      }
    });
    function closeLightbox() { lightbox.style.display = 'none'; lightboxImg.src = ''; }
    lightboxClose && lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }

  // EmailJS booking forms (works across pages, multiple forms)
  // TODO: Replace with your EmailJS user ID + service/template IDs
  const EMAILJS_USER_ID = 'YOUR_EMAILJS_USER_ID';
  const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

  if (window.emailjs && EMAILJS_USER_ID && EMAILJS_USER_ID !== 'YOUR_EMAILJS_USER_ID') {
    emailjs.init(EMAILJS_USER_ID);
  }

  function bindEmailForm(formSelector, statusSelector) {
    const form = document.querySelector(formSelector);
    const status = document.querySelector(statusSelector);
    if (!form) return;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!window.emailjs || EMAILJS_USER_ID === 'YOUR_EMAILJS_USER_ID') {
        status.textContent = 'Form not configured — replace EmailJS IDs in js/main.js';
        status.style.color = 'crimson';
        return;
      }
      status.textContent = 'Sending…';
      const formData = new FormData(form);
      const templateParams = {};
      formData.forEach((v, k) => templateParams[k] = v);

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function () {
          status.textContent = 'Thanks — we received your request. We will contact you soon.';
          status.style.color = 'green';
          form.reset();
        }, function (err) {
          console.error('EmailJS error:', err);
          status.textContent = 'Oops — there was an error sending your request.';
          status.style.color = 'crimson';
        });
    });
  }

  // Bind forms: page-specific IDs used in HTML
  bindEmailForm('#booking-form', '#form-status');
  bindEmailForm('#booking-form-2', '#form-status-2');
  bindEmailForm('#booking-form-3', '#form-status-3');

  // Small fade-in animation on scroll
  const observers = document.querySelectorAll('.section-light, .section-secondary, .service-card, .service-item, .slider, .gallery-grid img');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.style.opacity = 1; en.target.style.transform = 'translateY(0)'; io.unobserve(en.target) }
    });
  }, { threshold: 0.12 });
  observers.forEach(el => {
    el.style.opacity = 0; el.style.transform = 'translateY(18px)'; el.style.transition = 'opacity .7s ease, transform .7s ease';
    io.observe(el);
  });

});
/* ===== Robust page-scoped nav toggle (DROP-IN) =====
   Paste this at the END of js/main.js and save.
   This will:
   - remove old toggle listeners by cloning the buttons,
   - scope toggles to their own header/nav,
   - force inline styles with !important so CSS doesn't block them,
   - handle outside clicks, Escape key, and resize cleanup.
*/
(function () {
  // Run after DOM ready just in case
  function initNavToggles() {
    const BREAKPOINT = 900; // must match your CSS responsive breakpoint

    // 1) Replace each .nav-toggle with a clone to remove previously attached listeners
    const originalToggles = Array.from(document.querySelectorAll('.nav-toggle'));
    originalToggles.forEach(btn => {
      try {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
      } catch (err) {
        // ignore if something odd happens
        console.warn('Failed to clone nav-toggle:', err);
      }
    });

    // 2) Re-select toggles (fresh elements with no prior listeners)
    const toggles = Array.from(document.querySelectorAll('.nav-toggle'));
    console.log('[nav-fix] nav-toggle count:', toggles.length);

    toggles.forEach(btn => {
      // find the header that contains this button (fallback to first .site-header)
      const header = btn.closest('.site-header') || document.querySelector('.site-header');
      if (!header) {
        console.warn('[nav-fix] no .site-header found for toggle', btn);
        return;
      }

      // Prefer the .nav inside the same header. If not found, fall back to any .nav.
      let nav = header.querySelector('.nav') || document.querySelector('.nav');
      if (!nav) {
        console.warn('[nav-fix] no .nav found for header', header);
        return;
      }

      // Ensure unique id for aria-controls
      if (!nav.id) nav.id = 'nav-' + Math.random().toString(36).slice(2, 8);
      btn.setAttribute('aria-controls', nav.id);
      btn.setAttribute('aria-expanded', 'false');

      // Helper to open & close using inline styles with priority
      function openNav() {
        nav.style.setProperty('display', 'block', 'important');
        nav.style.setProperty('position', 'absolute');
        nav.style.setProperty('top', Math.ceil(header.getBoundingClientRect().height) + 'px');
        nav.style.setProperty('right', '16px');
        nav.style.setProperty('background', 'white');
        nav.style.setProperty('padding', '0.8rem 1rem');
        nav.style.setProperty('box-shadow', '0 12px 30px rgba(0,0,0,0.08)');
        nav.style.setProperty('border-radius', '10px');
        header.classList.add('nav-open');
        btn.setAttribute('aria-expanded', 'true');
      }
      function closeNav() {
        // remove properties we set (removes !important too)
        nav.style.removeProperty('display');
        nav.style.removeProperty('position');
        nav.style.removeProperty('top');
        nav.style.removeProperty('right');
        nav.style.removeProperty('background');
        nav.style.removeProperty('padding');
        nav.style.removeProperty('box-shadow');
        nav.style.removeProperty('border-radius');
        header.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
      }

      // Click handler on this toggle
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        // do nothing on desktop (CSS handles nav)
        if (window.innerWidth > BREAKPOINT) return;
        const isOpen = header.classList.contains('nav-open');
        if (isOpen) closeNav(); else openNav();
      });

      // Clicking outside the header closes the nav (mobile only)
      document.addEventListener('click', function (e) {
        if (window.innerWidth > BREAKPOINT) return;
        if (!header.classList.contains('nav-open')) return;
        if (!header.contains(e.target)) {
          closeNav();
        }
      });

      // Escape key closes
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeNav();
      });

      // Remove inline styles and close when resizing to desktop
      window.addEventListener('resize', function () {
        if (window.innerWidth > BREAKPOINT) {
          if (header.classList.contains('nav-open')) closeNav();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavToggles);
  } else {
    initNavToggles();
  }
})();