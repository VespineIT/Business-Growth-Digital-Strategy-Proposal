/* =====================================================================
   VespineIT PROPOSAL — Interaction Layer
   Subtle, performant, no dependencies.
   ===================================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------------
     1. Set the proposal date in the hero
     ---------------------------------------------------------------- */
  const heroDate = document.getElementById('heroDate');
  if (heroDate) {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
    heroDate.textContent = formatted;
  }

  /* ----------------------------------------------------------------
     2. Reading progress bar
     Tracks how far the reader has scrolled through the document.
     ---------------------------------------------------------------- */
  const progressBar = document.getElementById('progressBar');
  const topnav = document.getElementById('topnav');

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }
  function updateScrollUI() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = Math.min(progress, 100) + '%';
    }

    // Add subtle border to nav once user has scrolled past hero
    if (topnav) {
      if (scrollTop > 40) {
        topnav.classList.add('is-scrolled');
      } else {
        topnav.classList.remove('is-scrolled');
      }
    }

    ticking = false;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateScrollUI();

  /* ----------------------------------------------------------------
     3. Scroll reveal — fade and rise elements as they enter view
     ---------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Stagger child reveals slightly within the same parent
          const el = entry.target;
          const siblings = Array.from(
            el.parentElement ? el.parentElement.querySelectorAll(':scope > [data-reveal]') : []
          );
          const idx = siblings.indexOf(el);
          const delay = idx >= 0 ? Math.min(idx * 70, 420) : 0;

          setTimeout(function () {
            el.classList.add('is-visible');
          }, delay);

          io.unobserve(el);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback — show everything immediately
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ----------------------------------------------------------------
     4. Active section highlighting in top navigation
     ---------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.topnav__links a');
  const navMap = {};
  navLinks.forEach(function (link) {
    const id = link.getAttribute('href');
    if (id && id.startsWith('#')) {
      navMap[id.slice(1)] = link;
    }
  });

  const sectionIds = Object.keys(navMap);
  const sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const link = navMap[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          // Clear all active states first
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, {
      root: null,
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach(function (sec) { navIO.observe(sec); });
  }

  /* ----------------------------------------------------------------
     5. Smooth scroll for in-page anchor links
     (CSS handles smooth-scroll; we just account for sticky nav offset)
     ---------------------------------------------------------------- */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = topnav ? topnav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    });
  });

  /* ----------------------------------------------------------------
     6. CTA button — gentle pulse hint when conclusion comes into view
     ---------------------------------------------------------------- */
  const ctaButton = document.getElementById('ctaButton');
  const conclusion = document.getElementById('conclusion');

  if (ctaButton && conclusion && 'IntersectionObserver' in window) {
    const ctaIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          ctaButton.animate(
            [
              { transform: 'translateY(0) scale(1)' },
              { transform: 'translateY(-3px) scale(1.02)' },
              { transform: 'translateY(0) scale(1)' }
            ],
            { duration: 900, easing: 'cubic-bezier(.2,.7,.15,1)' }
          );
          ctaIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    ctaIO.observe(conclusion);
  }

  /* ----------------------------------------------------------------
     7. Add an active-link underline persistence for nav
     (Adds a CSS class that mirrors the hover underline)
     ---------------------------------------------------------------- */
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .topnav__links a.is-active { color: var(--ink); }
    .topnav__links a.is-active::after { right: 0 !important; }
  `;
  document.head.appendChild(styleTag);

})();
