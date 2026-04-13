/* ════════════════════════════════════════════════════════════
   ADMIN PANEL  –  Firebase Auth + Firestore CRUD
   ══════════════════════════════════════════════════════════ */

'use strict';

(function initAdmin() {

  /* ── AUTH STATE ──────────────────────────────────────────── */
  var isAuthenticated = false;

  function showDashboard() {
    document.getElementById('adminAuth').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    isAuthenticated = true;
    loadAllData();
  }

  function showAuth() {
    document.getElementById('adminAuth').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
    isAuthenticated = false;
  }

  /* ── FIREBASE AUTH LISTENER ─────────────────────────────── */
  if (isFirebaseConfigured()) {
    auth.onAuthStateChanged(function(user) {
      if (user) {
        showDashboard();
      } else {
        showAuth();
      }
    });
  }

  /* ── LOGIN ──────────────────────────────────────────────── */
  document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('adminUser').value.trim();
    var pass  = document.getElementById('adminPass').value;
    var errEl = document.getElementById('adminError');
    errEl.style.display = 'none';

    if (isFirebaseConfigured()) {
      auth.signInWithEmailAndPassword(email, pass)
        .then(function() {
          showDashboard();
        })
        .catch(function(err) {
          errEl.textContent = err.message || 'Invalid credentials.';
          errEl.style.display = 'block';
        });
    } else {
      // Fallback for development (no Firebase)
      if (email === 'admin' && pass === 'bigominds') {
        showDashboard();
      } else {
        errEl.textContent = 'Invalid credentials. Use admin / bigominds in dev mode.';
        errEl.style.display = 'block';
      }
    }
  });

  /* ── LOGOUT ─────────────────────────────────────────────── */
  document.getElementById('adminLogout').addEventListener('click', function() {
    if (isFirebaseConfigured()) {
      auth.signOut().then(showAuth);
    } else {
      showAuth();
    }
  });

  /* ── TABS ───────────────────────────────────────────────── */
  var tabs = document.querySelectorAll('.admin-tab');
  var panels = document.querySelectorAll('.admin-panel');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      panels.forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById('panel' + capitalize(tab.dataset.tab));
      if (panel) panel.classList.add('active');
    });
  });

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ── LOAD ALL DATA ──────────────────────────────────────── */
  function loadAllData() {
    loadEvents();
    loadJourneys();
    loadRegistrations();
  }

  /* ══════════════════════════════════════════════════════════
     EVENTS CRUD
     ══════════════════════════════════════════════════════════ */

  var adminEvents = [];

  function loadEvents() {
    if (isFirebaseConfigured()) {
      DB.events.orderBy('date', 'asc').get()
        .then(function(snapshot) {
          adminEvents = [];
          snapshot.forEach(function(doc) {
            var data = doc.data();
            data.id = doc.id;
            adminEvents.push(data);
          });
          renderEventsTable();
        })
        .catch(function(err) {
          console.error('Error loading events:', err);
          adminEvents = getLocalEvents();
          renderEventsTable();
        });
    } else {
      adminEvents = getLocalEvents();
      renderEventsTable();
    }
  }

  function getLocalEvents() {
    try { return JSON.parse(localStorage.getItem('bo_admin_events') || '[]'); }
    catch(e) { return []; }
  }

  function saveLocalEvents(evts) {
    localStorage.setItem('bo_admin_events', JSON.stringify(evts));
  }

  function renderEventsTable() {
    var wrap = document.getElementById('adminEventsTable');
    if (!adminEvents.length) {
      wrap.innerHTML = '<div class="admin-empty"><p>No events yet. Create your first event.</p></div>';
      return;
    }

    wrap.innerHTML =
      '<table class="admin-table">' +
      '<thead><tr><th>Title</th><th>Date</th><th>Location</th><th>Price</th><th>Featured</th><th>Actions</th></tr></thead>' +
      '<tbody>' +
      adminEvents.map(function(ev) {
        var d = ev.date ? new Date(ev.date.seconds ? ev.date.seconds * 1000 : ev.date) : new Date();
        return '<tr data-id="' + ev.id + '">' +
          '<td><strong>' + ev.title + '</strong></td>' +
          '<td>' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '</td>' +
          '<td>' + (ev.location || '—') + '</td>' +
          '<td>₹' + (ev.price || 0).toLocaleString('en-IN') + '</td>' +
          '<td>' + (ev.featured ? '★' : '—') + '</td>' +
          '<td class="admin-actions">' +
            '<button class="admin-btn-edit" data-id="' + ev.id + '">Edit</button>' +
            '<button class="admin-btn-delete" data-id="' + ev.id + '">Delete</button>' +
          '</td>' +
        '</tr>';
      }).join('') +
      '</tbody></table>';

    wrap.querySelectorAll('.admin-btn-edit').forEach(function(btn) {
      btn.addEventListener('click', function() { editEvent(btn.dataset.id); });
    });
    wrap.querySelectorAll('.admin-btn-delete').forEach(function(btn) {
      btn.addEventListener('click', function() { deleteEvent(btn.dataset.id); });
    });
  }

  /* ── CREATE / UPDATE EVENT ──────────────────────────────── */
  function openEventModal(ev) {
    var modal = document.getElementById('adminEventModal');
    var title = document.getElementById('adminEventFormTitle');
    var submitBtn = document.getElementById('aeSubmitBtn');

    if (ev) {
      title.textContent = 'Edit Event';
      submitBtn.querySelector('.btn-text').textContent = 'Update Event';
      document.getElementById('aeId').value = ev.id;
      document.getElementById('aeTitle').value = ev.title;
      document.getElementById('aeDesc').value = ev.description || '';
      var d = ev.date ? new Date(ev.date.seconds ? ev.date.seconds * 1000 : ev.date) : new Date();
      var local = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') + 'T' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
      document.getElementById('aeDate').value = local;
      document.getElementById('aePrice').value = ev.price || 0;
      document.getElementById('aeLocation').value = ev.location || '';
      document.getElementById('aeType').value = ev.type || '';
      document.getElementById('aeEmoji').value = ev.emoji || '';
      document.getElementById('aeFeatured').checked = ev.featured || false;
    } else {
      title.textContent = 'Create Event';
      submitBtn.querySelector('.btn-text').textContent = 'Create Event';
      document.getElementById('adminEventForm').reset();
      document.getElementById('aeId').value = '';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setTimeout(function() { modal.classList.add('open'); }, 10);
  }

  function closeEventModal() {
    var modal = document.getElementById('adminEventModal');
    modal.classList.remove('open');
    setTimeout(function() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  document.getElementById('adminAddEvent').addEventListener('click', function() {
    openEventModal(null);
  });
  document.getElementById('adminEventModalClose').addEventListener('click', closeEventModal);
  document.getElementById('adminEventModal').addEventListener('click', function(e) {
    if (e.target === this) closeEventModal();
  });

  document.getElementById('adminEventForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var id = document.getElementById('aeId').value;

    var evData = {
      title:       document.getElementById('aeTitle').value.trim(),
      description: document.getElementById('aeDesc').value.trim(),
      date:        document.getElementById('aeDate').value,
      price:       parseInt(document.getElementById('aePrice').value) || 0,
      location:    document.getElementById('aeLocation').value.trim(),
      type:        document.getElementById('aeType').value.trim() || 'Event',
      emoji:       document.getElementById('aeEmoji').value.trim() || '◎',
      featured:    document.getElementById('aeFeatured').checked,
    };

    var submitBtn = document.getElementById('aeSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Saving…';

    if (isFirebaseConfigured()) {
      if (id) {
        // Update existing
        DB.events.doc(id).update(evData)
          .then(function() {
            submitBtn.disabled = false;
            closeEventModal();
            loadEvents();
          })
          .catch(function(err) {
            console.error('Error updating:', err);
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'Update Event';
          });
      } else {
        // Create new
        evData.createdAt = serverTimestamp();
        DB.events.add(evData)
          .then(function() {
            submitBtn.disabled = false;
            closeEventModal();
            loadEvents();
          })
          .catch(function(err) {
            console.error('Error creating:', err);
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'Create Event';
          });
      }
    } else {
      // Local storage fallback
      if (id) {
        var idx = adminEvents.findIndex(function(ev) { return ev.id === id; });
        if (idx >= 0) { evData.id = id; adminEvents[idx] = evData; }
      } else {
        evData.id = generateId('evt');
        adminEvents.push(evData);
      }
      saveLocalEvents(adminEvents);
      submitBtn.disabled = false;
      closeEventModal();
      renderEventsTable();
    }
  });

  function editEvent(id) {
    var ev = adminEvents.find(function(e) { return e.id === id; });
    if (ev) openEventModal(ev);
  }

  function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    if (isFirebaseConfigured()) {
      DB.events.doc(id).delete()
        .then(function() { loadEvents(); })
        .catch(function(err) { console.error('Error deleting:', err); });
    } else {
      adminEvents = adminEvents.filter(function(e) { return e.id !== id; });
      saveLocalEvents(adminEvents);
      renderEventsTable();
    }
  }

  /* ══════════════════════════════════════════════════════════
     JOURNEYS (Read-only)
     ══════════════════════════════════════════════════════════ */

  function loadJourneys() {
    if (isFirebaseConfigured()) {
      DB.journeys.orderBy('createdAt', 'desc').limit(100).get()
        .then(function(snapshot) {
          var journeys = [];
          snapshot.forEach(function(doc) {
            var data = doc.data();
            data.id = doc.id;
            journeys.push(data);
          });
          renderJourneysTable(journeys);
        })
        .catch(function(err) {
          console.error('Error loading journeys:', err);
          renderJourneysTable(getLocalJourneys());
        });
    } else {
      renderJourneysTable(getLocalJourneys());
    }
  }

  function getLocalJourneys() {
    try { return JSON.parse(localStorage.getItem('bo_journeys') || '[]'); }
    catch(e) { return []; }
  }

  function renderJourneysTable(journeys) {
    var wrap = document.getElementById('adminJourneysTable');
    if (!journeys.length) {
      wrap.innerHTML = '<div class="admin-empty"><p>No user journeys recorded yet.</p></div>';
      return;
    }

    wrap.innerHTML =
      '<table class="admin-table">' +
      '<thead><tr><th>Journey Title</th><th>Goal</th><th>Format</th><th>Level</th><th>Date</th></tr></thead>' +
      '<tbody>' +
      journeys.map(function(j) {
        var d = j.createdAt ? new Date(j.createdAt.seconds ? j.createdAt.seconds * 1000 : j.createdAt) : null;
        return '<tr>' +
          '<td><strong>' + (j.journeyTitle || 'Custom') + '</strong></td>' +
          '<td><span class="admin-chip">' + (j.goal || '—') + '</span></td>' +
          '<td><span class="admin-chip">' + (j.format || '—') + '</span></td>' +
          '<td><span class="admin-chip">' + (j.level || '—') + '</span></td>' +
          '<td>' + (d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—') + '</td>' +
        '</tr>';
      }).join('') +
      '</tbody></table>';
  }

  /* ══════════════════════════════════════════════════════════
     REGISTRATIONS (Read-only)
     ══════════════════════════════════════════════════════════ */

  function loadRegistrations() {
    if (isFirebaseConfigured()) {
      DB.registrations.orderBy('createdAt', 'desc').limit(100).get()
        .then(function(snapshot) {
          var regs = [];
          snapshot.forEach(function(doc) {
            var data = doc.data();
            data.id = doc.id;
            regs.push(data);
          });
          renderRegsTable(regs);
        })
        .catch(function(err) {
          console.error('Error loading registrations:', err);
          renderRegsTable(getLocalRegs());
        });
    } else {
      renderRegsTable(getLocalRegs());
    }
  }

  function getLocalRegs() {
    try { return JSON.parse(localStorage.getItem('bo_registrations') || '[]'); }
    catch(e) { return []; }
  }

  function renderRegsTable(regs) {
    var wrap = document.getElementById('adminRegsTable');
    if (!regs.length) {
      wrap.innerHTML = '<div class="admin-empty"><p>No registrations yet.</p></div>';
      return;
    }

    wrap.innerHTML =
      '<table class="admin-table">' +
      '<thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Event</th><th>Amount</th><th>Payment ID</th><th>Status</th></tr></thead>' +
      '<tbody>' +
      regs.map(function(r) {
        return '<tr>' +
          '<td><strong>' + r.name + '</strong></td>' +
          '<td>' + r.email + '</td>' +
          '<td>' + (r.phone || '—') + '</td>' +
          '<td>' + (r.eventTitle || '—') + '</td>' +
          '<td>₹' + (r.amount || 0).toLocaleString('en-IN') + '</td>' +
          '<td style="font-size:0.75rem;color:var(--clr-slate)">' + (r.paymentId || '—') + '</td>' +
          '<td><span class="admin-status-badge status-' + (r.paymentStatus || 'pending') + '">' + (r.paymentStatus || 'pending') + '</span></td>' +
        '</tr>';
      }).join('') +
      '</tbody></table>';
  }

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

  /* ── INIT (check auth on load if not using Firebase) ────── */
  if (!isFirebaseConfigured()) {
    showAuth();
  }

})();
