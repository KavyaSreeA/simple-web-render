/* ════════════════════════════════════════════════════════════
   TURNING POINT  –  Guided Journey App (Firebase-powered)
   ══════════════════════════════════════════════════════════ */

'use strict';

(function initTurningPoint() {

  /* ── STATE ──────────────────────────────────────────────── */
  var state = { step: 0, goal: null, format: null, level: null };

  /* ── JOURNEY MAP (36 unique paths) ──────────────────────── */
  var journeyMap = {
    "Self-awareness-Workshop-Beginner":       { title: "Awakening Circle",              description: "A gentle group experience designed to help you begin noticing your thoughts, emotions, and patterns — in a safe, supportive space." },
    "Self-awareness-Workshop-Intermediate":   { title: "Mirror Within",                 description: "Go deeper into self-reflection through guided exercises, partner dialogues, and mindful awareness practices." },
    "Self-awareness-Workshop-Advanced":       { title: "The Transparent Self",           description: "An intensive workshop for those ready to confront blind spots and cultivate radical self-honesty." },
    "Self-awareness-Coaching-Beginner":       { title: "First Light Coaching",           description: "Personalized 1:1 sessions to gently illuminate who you are beneath the surface — no judgment, just curiosity." },
    "Self-awareness-Coaching-Intermediate":   { title: "Clarity Compass",               description: "Structured coaching to help you align your inner values with your outer actions and decisions." },
    "Self-awareness-Coaching-Advanced":       { title: "Deep Current Mastery",           description: "Advanced coaching for profound self-integration, working with your shadow and highest potential." },
    "Self-awareness-Assessment-Beginner":     { title: "Self Discovery Starter",         description: "A gentle introduction to understanding yourself through reflection and guided insights." },
    "Self-awareness-Assessment-Intermediate": { title: "Pattern Decoder",               description: "MBTI and FIRO assessments to reveal your communication style, needs, and relational patterns." },
    "Self-awareness-Assessment-Advanced":     { title: "Full Spectrum Profile",          description: "Comprehensive personality assessment with deep-dive interpretation and a personalized growth roadmap." },
    "Parenting-Workshop-Beginner":            { title: "Connected Parenting Circle",     description: "A warm workshop for parents beginning to explore conscious, empathetic parenting practices." },
    "Parenting-Workshop-Intermediate":        { title: "Family Harmony Lab",             description: "Interactive sessions for parents who want to deepen family bonds through shared awareness activities." },
    "Parenting-Workshop-Advanced":            { title: "Legacy of Awareness",            description: "For experienced parents ready to model self-awareness and emotional intelligence as a family legacy." },
    "Parenting-Coaching-Beginner":            { title: "Gentle Guidance",                description: "1:1 coaching to help you navigate the early challenges of conscious parenting with confidence." },
    "Parenting-Coaching-Intermediate":        { title: "Empathic Parent Path",           description: "Coaching focused on building deeper emotional connections and understanding your child's inner world." },
    "Parenting-Coaching-Advanced":            { title: "Transformative Parenting",       description: "Advanced coaching for parents who want to break generational patterns and create new family dynamics." },
    "Parenting-Assessment-Beginner":          { title: "Parenting Style Snapshot",       description: "A quick assessment to understand your natural parenting tendencies and how they affect your family." },
    "Parenting-Assessment-Intermediate":      { title: "Family Dynamics Insight",        description: "In-depth assessment of family communication patterns, attachment styles, and growth opportunities." },
    "Parenting-Assessment-Advanced":          { title: "Generational Awareness Map",     description: "Comprehensive assessment exploring deep family patterns, values transmission, and conscious evolution." },
    "Leadership-Workshop-Beginner":           { title: "Lead from Within",               description: "Discover the foundations of self-aware leadership through collaborative exercises and reflection." },
    "Leadership-Workshop-Intermediate":       { title: "Conscious Leader Lab",           description: "Build your leadership presence by understanding team dynamics, communication styles, and influence." },
    "Leadership-Workshop-Advanced":           { title: "Visionary Leadership Intensive", description: "An advanced workshop for leaders ready to create transformative cultures and inspire through authenticity." },
    "Leadership-Coaching-Beginner":           { title: "Leader's First Steps",           description: "1:1 coaching to help emerging leaders find their voice and lead with genuine confidence." },
    "Leadership-Coaching-Intermediate":       { title: "Strategic Awareness Coaching",   description: "Coaching for mid-level leaders who want to align their leadership style with organizational impact." },
    "Leadership-Coaching-Advanced":           { title: "Executive Transformation",       description: "Deep executive coaching for senior leaders seeking to create lasting change through self-mastery." },
    "Leadership-Assessment-Beginner":         { title: "Leadership Style Starter",       description: "Discover your natural leadership tendencies and how they shape your interactions with others." },
    "Leadership-Assessment-Intermediate":     { title: "Leadership 360 Insight",         description: "A comprehensive leadership assessment combining self-reflection with team feedback for holistic growth." },
    "Leadership-Assessment-Advanced":         { title: "Executive Mastery Profile",      description: "Advanced assessment suite for senior leaders, including MBTI, FIRO, and custom leadership matrices." },
    "Personal Growth-Workshop-Beginner":      { title: "Seeds of Change",                description: "A nurturing workshop to plant the first seeds of intentional personal development and self-discovery." },
    "Personal Growth-Workshop-Intermediate":  { title: "Growth Momentum",                description: "Build on your growth journey with practices for resilience, purpose-finding, and meaningful change." },
    "Personal Growth-Workshop-Advanced":      { title: "Becoming Infinite",              description: "An immersive experience for those ready to break through limitations and step into their fullest potential." },
    "Personal Growth-Coaching-Beginner":      { title: "Spark Within",                   description: "Gentle 1:1 coaching to help you identify what matters most and take your first steps toward change." },
    "Personal Growth-Coaching-Intermediate":  { title: "Momentum Builder",               description: "Focused coaching to help you overcome plateaus and build sustainable habits for lasting transformation." },
    "Personal Growth-Coaching-Advanced":      { title: "Mastery & Purpose",              description: "Advanced coaching for individuals ready to align their life with deep purpose and create extraordinary impact." },
    "Personal Growth-Assessment-Beginner":    { title: "Growth Readiness Check",         description: "A thoughtful assessment to understand where you are and what's ready to shift in your life." },
    "Personal Growth-Assessment-Intermediate":{ title: "Life Alignment Compass",         description: "Comprehensive assessment of your values, strengths, and growth edges to create a personalized roadmap." },
    "Personal Growth-Assessment-Advanced":    { title: "Total Transformation Blueprint", description: "Full-spectrum assessment and interpretation to architect your most aligned, purposeful life path." },
  };

  /* ── DOM ────────────────────────────────────────────────── */
  var steps        = document.querySelectorAll('.tp-step');
  var progressDots = document.querySelectorAll('.tp-progress-dot');
  var progressFills= document.querySelectorAll('.tp-progress-fill');
  var backBtn      = document.getElementById('tpBack');
  var beginBtn     = document.getElementById('tpBeginBtn');
  var restartBtn   = document.getElementById('tpRestart');

  /* ── NAVIGATION ─────────────────────────────────────────── */
  function goToStep(n) {
    var prev = state.step;
    state.step = n;

    steps.forEach(function(s, i) {
      s.classList.remove('active', 'tp-exit-left', 'tp-exit-right');
      if (i === n) {
        s.classList.add('active');
      } else if (i === prev && prev < n) {
        s.classList.add('tp-exit-left');
      } else if (i === prev && prev > n) {
        s.classList.add('tp-exit-right');
      }
    });

    progressDots.forEach(function(dot, i) {
      dot.classList.toggle('active', i <= n);
      dot.classList.toggle('completed', i < n);
    });

    progressFills.forEach(function(fill, i) {
      fill.style.width = (i < n) ? '100%' : '0%';
    });

    backBtn.style.display = (n > 0 && n < 4) ? '' : 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectOption(group, value) {
    var container = document.getElementById(group + 'Options');
    if (!container) return;
    container.querySelectorAll('.tp-option').forEach(function(opt) {
      opt.classList.toggle('selected', opt.dataset.value === value);
    });
  }

  /* ── EVENTS ─────────────────────────────────────────────── */
  if (beginBtn) {
    beginBtn.addEventListener('click', function() { goToStep(1); });
  }

  document.getElementById('goalOptions').addEventListener('click', function(e) {
    var opt = e.target.closest('.tp-option');
    if (!opt) return;
    state.goal = opt.dataset.value;
    selectOption('goal', state.goal);
    setTimeout(function() { goToStep(2); }, 400);
  });

  document.getElementById('formatOptions').addEventListener('click', function(e) {
    var opt = e.target.closest('.tp-option');
    if (!opt) return;
    state.format = opt.dataset.value;
    selectOption('format', state.format);
    setTimeout(function() { goToStep(3); }, 400);
  });

  document.getElementById('levelOptions').addEventListener('click', function(e) {
    var opt = e.target.closest('.tp-option');
    if (!opt) return;
    state.level = opt.dataset.value;
    selectOption('level', state.level);
    setTimeout(function() { showResult(); }, 400);
  });

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      if (state.step > 0) goToStep(state.step - 1);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      state.goal = null;
      state.format = null;
      state.level = null;
      document.querySelectorAll('.tp-option').forEach(function(o) { o.classList.remove('selected'); });
      goToStep(0);
    });
  }

  /* ── RESULT ─────────────────────────────────────────────── */
  function showResult() {
    var key = state.goal + '-' + state.format + '-' + state.level;
    var journey = journeyMap[key] || {
      title: "Your Unique Path",
      description: "A personalized journey crafted around your selections. Reach out to us and we'll design the perfect experience for you."
    };

    document.querySelector('.tp-result-title').textContent = journey.title;
    document.querySelector('.tp-result-desc').textContent = journey.description;
    document.getElementById('summaryGoal').textContent = state.goal;
    document.getElementById('summaryFormat').textContent = state.format;
    document.getElementById('summaryLevel').textContent = state.level;

    goToStep(4);
    saveJourney(state.goal, state.format, state.level, journey.title);
  }

  /* ── SAVE TO FIREBASE ───────────────────────────────────── */
  function saveJourney(goal, format, level, title) {
    var data = {
      goal: goal,
      format: format,
      level: level,
      journeyTitle: title,
      createdAt: isFirebaseConfigured() ? serverTimestamp() : new Date().toISOString(),
      userAgent: navigator.userAgent.slice(0, 100),
    };

    if (isFirebaseConfigured()) {
      DB.journeys.add(data)
        .then(function(docRef) {
          console.log('Journey saved:', docRef.id);
        })
        .catch(function(err) {
          console.error('Error saving journey:', err);
        });
    } else {
      // Fallback to localStorage in dev mode
      try {
        var saved = JSON.parse(localStorage.getItem('bo_journeys') || '[]');
        data.id = generateId('j');
        data.createdAt = new Date().toISOString();
        saved.push(data);
        localStorage.setItem('bo_journeys', JSON.stringify(saved));
      } catch(e) { /* silent */ }
    }
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
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeNav();
    });
  })();

})();
