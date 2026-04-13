/* ════════════════════════════════════════════════════════════
   EVENTS PAGE  –  Firebase + Razorpay + EmailJS
   ══════════════════════════════════════════════════════════ */

'use strict';

(function initEventsPage() {

  var events = [];
  var currentEvent = null;
  var regData = {};

  /* ── FALLBACK EVENTS (shown when Firestore is empty/not configured) ── */
  var defaultEvents = [
    {
      id: 'evt-default-1',
      title: 'Mom-Dad-Kid Together',
      description: 'A 3-hour journey of soulful entertainment, storytelling, and self-discovery activities designed to deepen family bonds and create joyful memories.',
      date: '2025-08-15T10:00:00',
      location: 'Grand Ballroom, Taj Hotel, Mumbai',
      price: 2500,
      type: 'Family Workshop',
      emoji: '👨‍👩‍👧',
      featured: true
    },
    {
      id: 'evt-default-2',
      title: 'Team Awareness Discovery',
      description: 'A half-day MBTI/FIRO team workshop to uncover team dynamics, communication styles, and build stronger interpersonal connections at work.',
      date: '2025-09-05T09:30:00',
      location: 'Virtual / In-Person',
      price: 5000,
      type: 'Corporate Program',
      emoji: '🏢',
      featured: false
    },
    {
      id: 'evt-default-3',
      title: 'Personal Growth Intensive',
      description: 'A structured 3-month coaching journey for individuals ready to make meaningful changes. ICF-certified sessions with accountability and deep support.',
      date: '2025-09-20T11:00:00',
      location: 'Online (Zoom)',
      price: 15000,
      type: 'Individual Coaching',
      emoji: '🌱',
      featured: false
    },
    {
      id: 'evt-default-4',
      title: 'Circle of Awareness Workshop',
      description: 'An experiential workshop exploring all four stages of awareness — Discovery, Growth, and Transformation — through guided activities and group reflection.',
      date: '2025-10-10T10:00:00',
      location: 'Community Hall, Bangalore',
      price: 3000,
      type: 'Open Workshop',
      emoji: '◎',
      featured: true
    }
  ];

  /* ── LOAD EVENTS FROM FIRESTORE ─────────────────────────── */
  function loadEvents() {
    if (!isFirebaseConfigured()) {
      events = defaultEvents;
      renderEvents();
      return;
    }

    DB.events.orderBy('date', 'asc').get()
      .then(function(snapshot) {
        events = [];
        snapshot.forEach(function(doc) {
          var data = doc.data();
          data.id = doc.id;
          events.push(data);
        });
        if (!events.length) events = defaultEvents;
        renderEvents();
      })
      .catch(function(err) {
        console.error('Error loading events:', err);
        events = defaultEvents;
        renderEvents();
      });
  }

  /* ── RENDER EVENTS GRID ─────────────────────────────────── */
  function renderEvents() {
    var grid = document.getElementById('evGrid');
    var empty = document.getElementById('evEmpty');
    if (!grid) return;

    if (!events.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = events.map(function(ev) {
      var d = new Date(ev.date);
      var dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      var timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return '<div class="event-card ' + (ev.featured ? 'featured-event' : '') + '" data-id="' + ev.id + '">' +
        (ev.featured ? '<div class="event-badge">Featured</div>' : '') +
        '<div class="event-header-row">' +
          '<div class="event-emoji">' + (ev.emoji || '◎') + '</div>' +
          '<div class="event-type">' + (ev.type || 'Event') + '</div>' +
        '</div>' +
        '<h3 class="event-title">' + ev.title + '</h3>' +
        '<p class="event-desc">' + ev.description.slice(0, 120) + (ev.description.length > 120 ? '…' : '') + '</p>' +
        '<div class="event-meta">' +
          '<div class="event-meta-item"><span class="meta-label">Date</span><span class="meta-val">' + dateStr + '</span></div>' +
          '<div class="event-meta-item"><span class="meta-label">Time</span><span class="meta-val">' + timeStr + '</span></div>' +
          '<div class="event-meta-item"><span class="meta-label">Location</span><span class="meta-val">' + ev.location + '</span></div>' +
          '<div class="event-meta-item"><span class="meta-label">Price</span><span class="meta-val">₹' + Number(ev.price).toLocaleString('en-IN') + '</span></div>' +
        '</div>' +
        '<button class="btn btn-primary event-btn ev-view-btn" data-id="' + ev.id + '">View Details</button>' +
      '</div>';
    }).join('');

    grid.querySelectorAll('.ev-view-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        showDetail(btn.dataset.id);
      });
    });

    grid.querySelectorAll('.event-card').forEach(function(card) {
      card.addEventListener('click', function() { showDetail(card.dataset.id); });
      card.style.cursor = 'pointer';
    });
  }

  /* ── EVENT DETAIL ───────────────────────────────────────── */
  function showDetail(id) {
    currentEvent = events.find(function(ev) { return ev.id === id; });
    if (!currentEvent) return;

    var d = new Date(currentEvent.date);
    var dateStr = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    var detail = document.getElementById('evDetail');
    detail.innerHTML =
      '<div class="ev-detail-hero">' +
        '<div class="ev-detail-circle" aria-hidden="true"><span>' + (currentEvent.emoji || '◎') + '</span></div>' +
        '<div class="ev-detail-type">' + (currentEvent.type || 'Event') + '</div>' +
        '<h2 class="ev-detail-title">' + currentEvent.title + '</h2>' +
      '</div>' +
      '<div class="ev-detail-body">' +
        '<p class="ev-detail-desc">' + currentEvent.description + '</p>' +
        '<div class="ev-detail-info">' +
          '<div class="ev-info-item"><div class="ev-info-icon">📅</div><div><strong>Date</strong><span>' + dateStr + '</span></div></div>' +
          '<div class="ev-info-item"><div class="ev-info-icon">⏰</div><div><strong>Time</strong><span>' + timeStr + '</span></div></div>' +
          '<div class="ev-info-item"><div class="ev-info-icon">📍</div><div><strong>Location</strong><span>' + currentEvent.location + '</span></div></div>' +
          '<div class="ev-info-item"><div class="ev-info-icon">💰</div><div><strong>Price</strong><span>₹' + Number(currentEvent.price).toLocaleString('en-IN') + '</span></div></div>' +
        '</div>' +
        '<button class="btn btn-primary ev-register-btn" id="evRegisterBtn">Register Now</button>' +
      '</div>';

    document.getElementById('evListView').style.display = 'none';
    document.getElementById('evDetailView').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('evRegisterBtn').addEventListener('click', openModal);
  }

  document.getElementById('evBackBtn').addEventListener('click', function() {
    document.getElementById('evDetailView').style.display = 'none';
    document.getElementById('evListView').style.display = 'block';
  });

  /* ── MODAL ──────────────────────────────────────────────── */
  function openModal() {
    var overlay = document.getElementById('evModalOverlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('evModalEventName').textContent = currentEvent.title;
    document.getElementById('evRegisterForm').style.display = 'block';
    document.getElementById('evPaymentView').style.display = 'none';
    document.getElementById('evSuccessView').style.display = 'none';
    setTimeout(function() { overlay.classList.add('open'); }, 10);
  }

  function closeModal() {
    var overlay = document.getElementById('evModalOverlay');
    overlay.classList.remove('open');
    setTimeout(function() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  document.getElementById('evModalClose').addEventListener('click', closeModal);
  document.getElementById('evModalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  /* ── REGISTRATION FORM ──────────────────────────────────── */
  document.getElementById('evForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var name  = document.getElementById('regName');
    var email = document.getElementById('regEmail');
    var phone = document.getElementById('regPhone');
    var valid = true;

    [name, email, phone].forEach(function(f) {
      f.style.borderColor = '';
      if (!f.value.trim()) { f.style.borderColor = '#c0392b'; valid = false; }
    });

    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#c0392b'; valid = false;
    }
    if (phone.value && !/^[+\d\s()-]{7,15}$/.test(phone.value.trim())) {
      phone.style.borderColor = '#c0392b'; valid = false;
    }

    if (!valid) return;

    regData = { name: name.value.trim(), email: email.value.trim(), phone: phone.value.trim() };

    // Show payment step
    document.getElementById('evRegisterForm').style.display = 'none';
    document.getElementById('evPaymentView').style.display = 'block';
    document.getElementById('payEventName').textContent = currentEvent.title;
    document.getElementById('payAmount').textContent = '₹' + Number(currentEvent.price).toLocaleString('en-IN');
    document.getElementById('payName').textContent = regData.name;
    document.getElementById('evPaymentAmount').textContent = '₹' + Number(currentEvent.price).toLocaleString('en-IN');
  });

  /* ── PAYMENT (Razorpay or Mock) ─────────────────────────── */
  document.getElementById('evPayBtn').addEventListener('click', function() {
    var btn = this;
    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Processing…';

    initiatePayment({
      amount: currentEvent.price,
      eventTitle: currentEvent.title,
      name: regData.name,
      email: regData.email,
      phone: regData.phone,
      onSuccess: function(paymentResponse) {
        var confirmationId = generateId('CONF');

        var registration = {
          eventId: currentEvent.id,
          eventTitle: currentEvent.title,
          name: regData.name,
          email: regData.email,
          phone: regData.phone,
          amount: currentEvent.price,
          paymentStatus: 'completed',
          paymentId: paymentResponse.razorpay_payment_id || paymentResponse.status || 'mock',
          confirmationId: confirmationId,
          createdAt: isFirebaseConfigured() ? serverTimestamp() : new Date().toISOString(),
        };

        // Save to Firebase
        if (isFirebaseConfigured()) {
          DB.registrations.add(registration)
            .then(function() { console.log('Registration saved to Firestore'); })
            .catch(function(err) { console.error('Error saving registration:', err); });
        } else {
          try {
            var saved = JSON.parse(localStorage.getItem('bo_registrations') || '[]');
            registration.createdAt = new Date().toISOString();
            saved.push(registration);
            localStorage.setItem('bo_registrations', JSON.stringify(saved));
          } catch(ex) { /* silent */ }
        }

        // Send confirmation email
        var d = new Date(currentEvent.date);
        sendConfirmationEmail({
          name: regData.name,
          email: regData.email,
          eventTitle: currentEvent.title,
          eventDate: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
          eventLocation: currentEvent.location,
          amount: currentEvent.price,
          confirmationId: confirmationId,
        }).then(function() {
          console.log('Confirmation email sent');
        }).catch(function(err) {
          console.log('Email not sent:', err);
        });

        // Show success
        document.getElementById('evPaymentView').style.display = 'none';
        document.getElementById('evSuccessView').style.display = 'block';
        document.getElementById('evSuccessEmail').textContent = regData.email;

        document.getElementById('evConfirmationCard').innerHTML =
          '<div class="ev-confirm-row"><span>Confirmation</span><strong>' + confirmationId + '</strong></div>' +
          '<div class="ev-confirm-row"><span>Event</span><strong>' + currentEvent.title + '</strong></div>' +
          '<div class="ev-confirm-row"><span>Date</span><strong>' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) + '</strong></div>' +
          '<div class="ev-confirm-row"><span>Location</span><strong>' + currentEvent.location + '</strong></div>' +
          '<div class="ev-confirm-row"><span>Registered</span><strong>' + regData.name + '</strong></div>' +
          '<div class="ev-confirm-row"><span>Amount Paid</span><strong>₹' + Number(currentEvent.price).toLocaleString('en-IN') + '</strong></div>';

        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Complete Payment';
      },
      onFailure: function(err) {
        btn.disabled = false;
        btn.querySelector('.btn-text').textContent = 'Complete Payment';
        console.log('Payment failed:', err);
      }
    });
  });

  document.getElementById('evSuccessDone').addEventListener('click', function() {
    closeModal();
    document.getElementById('evDetailView').style.display = 'none';
    document.getElementById('evListView').style.display = 'block';
    document.getElementById('evForm').reset();
  });

  /* ── MOBILE NAV ─────────────────────────────────────────── */
  (function initMobileNav() {
    var hamburger = document.getElementById('hamburger');
    var overlay = document.getElementById('mobileNavOverlay');
    var closeBtn = document.getElementById('mobileNavClose');
    if (!hamburger || !overlay) return;

    function openNav() {
      overlay.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeNav() {
      overlay.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function() {
      overlay.classList.contains('open') ? closeNav() : openNav();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    overlay.querySelectorAll('.mobile-nav-link').forEach(function(link) {
      link.addEventListener('click', closeNav);
    });
  })();

  /* ── INIT ───────────────────────────────────────────────── */
  loadEvents();

})();
