/* ════════════════════════════════════════════════════════════
   BIG "O" MINDS  –  Interactive Script
   ══════════════════════════════════════════════════════════ */

'use strict';

// ── LOADER ────────────────────────────────────────────────
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  document.body.classList.add('loader-active');

  // Dismiss after 3 seconds
  const LOADER_DURATION = 3000;

  function dismissLoader() {
    loader.classList.add('hidden');
    document.body.classList.remove('loader-active');
    // Trigger any entrance animations
    document.querySelectorAll('.hero-eyebrow, .hero-heading, .hero-sub, .hero-audience, .hero-ctas, .hero-visual').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }

  setTimeout(dismissLoader, LOADER_DURATION);

  // Allow click/tap to skip
  loader.addEventListener('click', function () {
    clearTimeout(window._loaderTimer);
    dismissLoader();
  });
})();


// ── HEADER SCROLL ─────────────────────────────────────────
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
})();


// ── MOBILE NAVIGATION ─────────────────────────────────────
(function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('mobileNavOverlay');
  const closeBtn  = document.getElementById('mobileNavClose');
  if (!hamburger || !overlay) return;

  function openNav() {
    overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    if (spans[1]) spans[1].style.opacity = '0';
    if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  }

  function closeNav() {
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    const spans = hamburger.querySelectorAll('span');
    if (spans[0]) spans[0].style.transform = '';
    if (spans[1]) spans[1].style.opacity = '';
    if (spans[2]) spans[2].style.transform = '';
  }

  hamburger.addEventListener('click', function () {
    if (overlay.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeNav);

  // Close when a mobile nav link is clicked
  overlay.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeNav();
    }
  });
})();


// ── SMOOTH ANCHOR SCROLL ──────────────────────────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = document.getElementById('header')?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
})();


// ── SCROLL REVEAL ─────────────────────────────────────────
(function initScrollReveal() {
  // Add reveal class to key elements
  const revealSelectors = [
    '.trust-item',
    '.about-text-col',
    '.about-photo-col',
    '.service-card',
    '.outcome-card',
    '.event-card',
    '.testimonial-card',
    '.contact-text-col',
    '.contact-form-col',
  ];

  revealSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('reveal');
      if (i > 0) el.classList.add('reveal-delay-' + Math.min(i, 6));
    });
  });

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();


// ── TESTIMONIALS CAROUSEL ─────────────────────────────────
(function initCarousel() {
  const track    = document.getElementById('testimonialsTrack');
  const prevBtn  = document.getElementById('carouselPrev');
  const nextBtn  = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  if (!track || !prevBtn || !nextBtn) return;

  const cards       = Array.from(track.querySelectorAll('.testimonial-card'));
  const totalCards  = cards.length;
  let currentIndex  = 0;
  let autoplayTimer = null;
  let isDragging    = false;
  let dragStartX    = 0;
  let dragDelta     = 0;

  function getVisibleCount() {
    const width = window.innerWidth;
    if (width < 600) return 1;
    if (width < 960) return 2;
    return 3;
  }

  function updateCarousel(animate) {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, totalCards - visibleCount);
    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 24; // 1.5rem
    const offset = currentIndex * (cardWidth + gap);
    track.style.transition = animate === false ? 'none' : '';
    track.style.transform = 'translateX(-' + offset + 'px)';

    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentIndex);
        dot.setAttribute('aria-selected', String(i === currentIndex));
      });
    }

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
    prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
    nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const visibleCount = getVisibleCount();
    const dotCount = Math.max(1, totalCards - visibleCount + 1);
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', function () {
        currentIndex = i;
        updateCarousel();
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function goNext() {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, totalCards - visibleCount);
    if (currentIndex < maxIndex) {
      currentIndex++;
    } else {
      currentIndex = 0; // Loop
    }
    updateCarousel();
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
    }
    updateCarousel();
  }

  function startAutoplay() {
    autoplayTimer = setInterval(goNext, 4500);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  nextBtn.addEventListener('click', function () {
    goNext();
    resetAutoplay();
  });

  prevBtn.addEventListener('click', function () {
    goPrev();
    resetAutoplay();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    const carousel = document.getElementById('testimonialsCarousel');
    if (!carousel) return;
    const rect = carousel.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowLeft') { goPrev(); resetAutoplay(); }
      if (e.key === 'ArrowRight') { goNext(); resetAutoplay(); }
    }
  });

  // Drag/swipe
  track.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragStartX = e.clientX;
    track.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    dragDelta = e.clientX - dragStartX;
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = '';
    if (Math.abs(dragDelta) > 60) {
      if (dragDelta < 0) goNext(); else goPrev();
      resetAutoplay();
    }
    dragDelta = 0;
  });

  track.addEventListener('touchstart', function (e) {
    dragStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    const delta = e.changedTouches[0].clientX - dragStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) goNext(); else goPrev();
      resetAutoplay();
    }
  });

  // Pause on hover
  track.addEventListener('mouseenter', function () { clearInterval(autoplayTimer); });
  track.addEventListener('mouseleave', startAutoplay);

  // Init
  buildDots();
  updateCarousel();
  startAutoplay();

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      buildDots();
      updateCarousel(false);
    }, 200);
  });
})();


// ── AUDIENCE CHIP FILTER (HERO) ───────────────────────────
(function initAudienceChips() {
  const chips = document.querySelectorAll('.audience-chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      // Highlight relevant service cards
      const target = chip.dataset.target;
      const serviceCards = document.querySelectorAll('.service-card');

      serviceCards.forEach(function(card) {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        if (!target) {
          card.style.opacity = '1';
          card.style.transform = '';
          return;
        }

        const tagEl = card.querySelector('.service-tag');
        const tagText = tagEl ? tagEl.textContent.toLowerCase() : '';
        const serviceId = card.id || '';

        let relevant = false;
        if (target === 'individuals') relevant = tagText.includes('individual');
        if (target === 'organizations') relevant = tagText.includes('organization');
        if (target === 'families') relevant = serviceId.includes('family');

        if (relevant) {
          card.style.opacity = '1';
          card.style.transform = 'scale(1.02)';
        } else {
          card.style.opacity = '0.4';
          card.style.transform = '';
        }
      });

      // Auto-scroll to services
      setTimeout(function() {
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
          const headerHeight = document.getElementById('header')?.offsetHeight || 80;
          const top = servicesSection.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 300);
    });
  });

  // Reset on no target chip
  chips.forEach(function(chip) {
    chip.addEventListener('dblclick', function() {
      chips.forEach(c => c.classList.remove('active'));
      document.querySelectorAll('.service-card').forEach(function(card) {
        card.style.opacity = '';
        card.style.transform = '';
      });
    });
  });
})();


// ── CONTACT FORM ──────────────────────────────────────────
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic validation
    const name    = document.getElementById('contactName');
    const email   = document.getElementById('contactEmail');
    const interest= document.getElementById('contactInterest');
    let valid = true;

    [name, email, interest].forEach(function(field) {
      if (!field) return;
      if (!field.value.trim() || (field.tagName === 'SELECT' && !field.value)) {
        field.style.borderColor = '#c0392b';
        field.classList.add('field-error');
        valid = false;
        field.addEventListener('input', function() {
          field.style.borderColor = '';
          field.classList.remove('field-error');
        }, { once: true });
      }
    });

    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#c0392b';
      valid = false;
    }

    if (!valid) return;

    // Simulate form submission
    const submitBtn = form.querySelector('#contactSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Sending…';
    }

    setTimeout(function () {
      form.style.display = 'none';
      if (success) success.style.display = 'block';
      // Analytics event placeholder
      if (window.gtag) {
        window.gtag('event', 'form_submit', {
          'event_category': 'Contact',
          'event_label': document.getElementById('contactInterest')?.value || 'general'
        });
      }
    }, 1200);
  });
})();


// ── ACTIVE NAV HIGHLIGHT (scroll spy) ────────────────────
(function initScrollSpy() {
  const sections = ['home','about','services','outcomes','events','testimonials','contact'];
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let current = '';
    sections.forEach(function(id) {
      const el = document.getElementById(id);
      if (!el) return;
      if (window.scrollY >= el.offsetTop - 120) {
        current = id;
      }
    });

    navLinks.forEach(function(link) {
      const href = link.getAttribute('href')?.slice(1);
      if (href === current) {
        link.style.color = 'var(--clr-blue-dk)';
        link.style.background = 'var(--clr-blue-bg)';
      } else if (!link.classList.contains('nav-cta')) {
        link.style.color = '';
        link.style.background = '';
      }
    });
  }

  let scrollTick = false;
  window.addEventListener('scroll', function() {
    if (!scrollTick) {
      requestAnimationFrame(function() {
        updateActiveNav();
        scrollTick = false;
      });
      scrollTick = true;
    }
  }, { passive: true });

  updateActiveNav();
})();


// ── "O" CURSOR GLOW ───────────────────────────────────────
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch devices

  const glow = document.createElement('div');
  glow.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:9998',
    'width:300px',
    'height:300px',
    'border-radius:50%',
    'background:radial-gradient(circle, rgba(123,167,188,0.05) 0%, transparent 70%)',
    'transform:translate(-50%,-50%)',
    'transition:opacity 0.3s',
    'top:0',
    'left:0',
  ].join(';');
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }

  animateGlow();

  document.addEventListener('mouseleave', function() { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', function() { glow.style.opacity = '1'; });
})();


// ── CIRCLE OF AWARENESS INTERACTIVITY ────────────────────
(function initCoA() {
  const stageButtons = document.querySelectorAll('.coa-stage-btn');
  const diagramNodes = document.querySelectorAll('.coa-node');
  if (!stageButtons.length || !diagramNodes.length) return;

  let autoCycleTimer = null;
  const stages = ['awareness', 'discovery', 'growth', 'transform'];
  let currentStageIdx = 0;

  function setActiveStage(stage) {
    // Update buttons
    stageButtons.forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.stage === stage);
    });

    // Update diagram nodes
    diagramNodes.forEach(function(node) {
      node.classList.toggle('node-active', node.dataset.stage === stage);
    });
  }

  function startAutoCycle() {
    autoCycleTimer = setInterval(function() {
      currentStageIdx = (currentStageIdx + 1) % stages.length;
      setActiveStage(stages[currentStageIdx]);
    }, 2800);
  }

  function stopAutoCycle() {
    clearInterval(autoCycleTimer);
  }

  // Button clicks
  stageButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const stage = btn.dataset.stage;
      currentStageIdx = stages.indexOf(stage);
      setActiveStage(stage);
      stopAutoCycle();
      // Restart after delay
      clearTimeout(window._coaRestartTimer);
      window._coaRestartTimer = setTimeout(startAutoCycle, 6000);
    });
  });

  // Diagram node clicks mirror button state
  diagramNodes.forEach(function(node) {
    node.addEventListener('click', function() {
      const stage = node.dataset.stage;
      currentStageIdx = stages.indexOf(stage);
      setActiveStage(stage);
      stopAutoCycle();
      clearTimeout(window._coaRestartTimer);
      window._coaRestartTimer = setTimeout(startAutoCycle, 6000);
    });
  });

  // Pause auto-cycle when hovering the diagram or stage list
  const diagram = document.getElementById('coaDiagram');
  const stageList = document.getElementById('coaStages');

  [diagram, stageList].forEach(function(el) {
    if (!el) return;
    el.addEventListener('mouseenter', stopAutoCycle);
    el.addEventListener('mouseleave', startAutoCycle);
  });

  // Init
  setActiveStage('awareness');
  startAutoCycle();
})();


// ── ANALYTICS TRACKING PLACEHOLDERS ──────────────────────
(function initAnalytics() {
  // Track "Book a Session" clicks
  document.querySelectorAll('[id$="Btn"],[id$="Cta"],[id$="Link"]').forEach(function(el) {
    el.addEventListener('click', function() {
      if (window.gtag) {
        window.gtag('event', 'click', {
          'event_category': 'CTA',
          'event_label': el.id || el.textContent.trim().slice(0, 40)
        });
      }
    });
  });

  // Track loader completion
  const loader = document.getElementById('loader');
  if (loader) {
    const loaderObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.target.classList.contains('hidden')) {
          if (window.gtag) {
            window.gtag('event', 'loader_completed', { 'event_category': 'Engagement' });
          }
          loaderObserver.disconnect();
        }
      });
    });
    loaderObserver.observe(loader, { attributes: true, attributeFilter: ['class'] });
  }
})();
