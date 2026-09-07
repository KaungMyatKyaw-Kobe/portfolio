/* =========================================================
   Kaung Myat Kyaw (Kobe) — Portfolio Scripts
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Theme toggle (light/dark) ---------- */
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    function syncToggleLabel() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    syncToggleLabel();

    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private browsing, ignore */ }
      syncToggleLabel();
    });
  }

  /* ---------- Navbar scroll state ---------- */
  var navbar = document.getElementById('mainNav');
  function handleNavScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  handleNavScroll();
  window.addEventListener('scroll', handleNavScroll, { passive: true });

  /* ---------- Auto-close mobile nav on link click ---------- */
  var navLinks = document.querySelectorAll('#navContent .nav-link, #navContent .btn');
  var navContent = document.getElementById('navContent');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navContent.classList.contains('show')) {
        var collapse = bootstrap.Collapse.getOrCreateInstance(navContent);
        collapse.hide();
      }
    });
  });

  /* ---------- Move the active nav indicator to the clicked section immediately ---------- */
  var sectionNavLinks = document.querySelectorAll('#navContent .nav-link[href^="#"]');
  sectionNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      sectionNavLinks.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  });

  /* ---------- Typewriter effect ---------- */
  var roles = [
    'Data Engineer',
    'Data Analyst',
    'Analytics Engineer',
    'BI Developer'
  ];
  var typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    var roleIndex = 0, charIndex = 0, deleting = false;

    function typeLoop() {
      var current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        typewriterEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1600);
          return;
        }
      } else {
        charIndex--;
        typewriterEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(typeLoop, deleting ? 40 : 80);
    }
    typeLoop();
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, (i % 6) * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated stat counters ---------- */
  var statNumbers = document.querySelectorAll('.stat-number');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1200;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && statNumbers.length) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNumbers.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---------- Back to top button ---------- */
  var backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  }
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Contact form (Formspree) ---------- */
  // Create a free form at https://formspree.io, verify your email, then
  // replace YOUR_FORM_ID below with the endpoint ID it gives you
  // (e.g. "https://formspree.io/f/abcdwxyz").
  var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzebjpvy';

  var contactForm = document.getElementById('contactForm');
  var formNote = document.getElementById('formNote');
  var contactSubmit = document.getElementById('contactSubmit');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (FORMSPREE_ENDPOINT.indexOf('YOUR_FORM_ID') !== -1) {
        formNote.textContent = 'Contact form is not configured yet — see js/script.js.';
        formNote.style.color = '#f87171';
        return;
      }

      contactSubmit.disabled = true;
      formNote.style.color = '';
      formNote.textContent = 'Sending...';

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      })
        .then(function (response) {
          if (response.ok) {
            formNote.textContent = 'Message sent — thank you! I\'ll get back to you soon.';
            contactForm.reset();
          } else {
            return response.json().then(function (data) {
              var errorMsg = (data && data.errors && data.errors.length)
                ? data.errors.map(function (err) { return err.message; }).join(', ')
                : 'Something went wrong. Please try again.';
              throw new Error(errorMsg);
            });
          }
        })
        .catch(function (err) {
          formNote.style.color = '#f87171';
          formNote.textContent = err.message || 'Something went wrong. Please email me directly instead.';
        })
        .finally(function () {
          contactSubmit.disabled = false;
          setTimeout(function () {
            formNote.textContent = '';
            formNote.style.color = '';
          }, 6000);
        });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
