/* ============================================================
   رواق العربية — النواة المشتركة
   ============================================================ */

(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var TRACKS = window.SITE_TRACKS || [];
  var LESSONS = window.SITE_LESSONS || [];
  var QUIZZES = window.SITE_QUIZZES || [];
  var EXAMS = window.SITE_EXAMS || [];

  var R = (window.RUWAQ = {
    cfg: CFG,
    tracks: TRACKS,
    lessons: LESSONS,
    quizzes: QUIZZES,
    exams: EXAMS,
    pages: {},
  });

  /* ---------------------------------------------------------- أدوات */
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  R.$ = $;
  R.$$ = $$;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  R.esc = esc;

  function fmt(value) {
    return esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }
  R.fmt = fmt;

  function trackOf(id) {
    for (var i = 0; i < TRACKS.length; i++) {
      if (TRACKS[i].id === id) return TRACKS[i];
    }
    return { id: id, name: id, short: id, icon: "book", desc: "" };
  }
  R.trackOf = trackOf;

  R.lessonById = function (id) {
    return LESSONS.filter(function (l) { return l.id === id; })[0] || null;
  };
  R.quizById = function (id) {
    return QUIZZES.filter(function (q) { return q.id === id; })[0] || null;
  };
  R.examById = function (id) {
    return EXAMS.filter(function (e) { return e.id === id; })[0] || null;
  };

  R.arabicNumber = function (n) {
    return String(n);
  };

  /* ---------------------------------------------------------- أيقونات */
  var ICONS = {
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5Z"/>',
    pen: '<path d="m15 5 4 4L8 20H4v-4Z"/><path d="m13 7 4 4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    nodes: '<circle cx="6" cy="6" r="2.6"/><circle cx="18" cy="6" r="2.6"/><circle cx="12" cy="18" r="2.6"/><path d="M8.2 7.4 11 16M15.8 7.4 13 16M8.6 6h6.8"/>',
    feather: '<path d="M20 4c-4 0-9 3-12 10l-2 6 6-2C18 15 20 9 20 4Z"/><path d="M6 18 16 8"/>',
    arrow: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    arrowLeft: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    check: '<path d="m5 13 4 4L19 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    star: '<path d="m12 3 2.6 6.1 6.6.6-5 4.4 1.5 6.5L12 17.4 6.3 20.6l1.5-6.5-5-4.4 6.6-.6Z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3.2 3.2 0 0 1 0 5.9M18 20c0-2.2-.8-4.2-2-5.6"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    lamp: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 1 3.5 10.9V16h-7v-2.1A6 6 0 0 1 12 3Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    heart: '<path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/>',
    bookOpen: '<path d="M12 6c-2.5-1.8-5-2-7-1.2v13c2-.8 4.5-.6 7 1.2 2.5-1.8 5-2 7-1.2v-13C17 4 14.5 4.2 12 6Z"/><path d="M12 6v13"/>',
  };
  R.icon = function (name, cls) {
    var d = ICONS[name] || ICONS.book;
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  };
  R.ICONS = ICONS;

  /* ---------------------------------------------------------- التخزين */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem("ruwaq:" + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem("ruwaq:" + key, JSON.stringify(value));
      } catch (e) { /* تجاهل */ }
    },
  };
  R.store = store;

  /* ---------------------------------------------------------- الوقت والحصص */
  var DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  function sessionDate(session, now) {
    var base = now || new Date();
    var parts = String(session.time || "20:00").split(":");
    var target = new Date(base.getFullYear(), base.getMonth(), base.getDate(), +parts[0] || 20, +parts[1] || 0, 0, 0);
    var diff = (session.day - base.getDay() + 7) % 7;
    target.setDate(target.getDate() + diff);
    if (target.getTime() <= base.getTime()) target.setDate(target.getDate() + 7);
    return target;
  }
  R.sessionDate = sessionDate;

  R.nextSession = function () {
    var now = new Date();
    var best = null;
    (CFG.sessions || []).forEach(function (s) {
      var d = sessionDate(s, now);
      if (!best || d < best.date) best = { session: s, date: d };
    });
    return best;
  };

  function pad2(n) {
    return String(n).length < 2 ? "0" + n : String(n);
  }

  function timeLabel(time) {
    var p = String(time || "20:00").split(":");
    var h = +p[0];
    var m = p[1] || "00";
    var suffix = h < 12 ? "صباحًا" : h === 12 ? "ظهرًا" : "مساءً";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + m + " " + suffix;
  }
  R.timeLabel = timeLabel;
  R.DAY_NAMES = DAY_NAMES;

  R.dateLabel = function (date) {
    return DAY_NAMES[date.getDay()] + " " + date.getDate() + " / " + (date.getMonth() + 1);
  };

  R.countdownHTML = function (date, idPrefix) {
    var p = idPrefix || "cd";
    return (
      '<div class="countdown" data-countdown="' + date.toISOString() + '" id="' + p + '">' +
      ['يوم', 'ساعة', 'دقيقة', 'ثانية']
        .map(function (label, i) {
          return (
            '<div><strong data-cd="' + i + '">00</strong><span>' + label + "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  };

  function tickCountdowns() {
    var now = Date.now();
    $$("[data-countdown]").forEach(function (node) {
      var target = new Date(node.getAttribute("data-countdown")).getTime();
      var diff = Math.max(0, target - now);
      var sec = Math.floor(diff / 1000);
      var days = Math.floor(sec / 86400);
      var hours = Math.floor((sec % 86400) / 3600);
      var mins = Math.floor((sec % 3600) / 60);
      var secs = sec % 60;
      var values = [days, hours, mins, secs];
      $$("[data-cd]", node).forEach(function (cell, i) {
        cell.textContent = pad2(values[i]);
      });
      if (diff === 0) node.classList.add("is-live");
    });
  }
  R.tickCountdowns = tickCountdowns;
  window.setInterval(tickCountdowns, 1000);

  R.joinButton = function (extraClass) {
    var link = (CFG.meetLink || "").trim();
    var cls = "btn " + (extraClass || "btn-gold");
    if (link) {
      return '<a class="' + cls + '" href="' + esc(link) + '" target="_blank" rel="noopener">' + R.icon("video") + " انضم إلى الحصة</a>";
    }
    return '<a class="' + cls + ' btn-ghost" href="about.html#contact">' + R.icon("mail") + " اطلب رابط الحصة</a>";
  };

  /* ---------------------------------------------------------- الهيكل العام */
  var NAV = [
    { page: "home", href: "index.html", label: "الرئيسية" },
    { page: "reading", href: "reading.html", label: "تعلّم القراءة" },
    { page: "lessons", href: "lessons.html", label: "الدروس" },
    { page: "exercises", href: "exercises.html", label: "التمارين" },
    { page: "tests", href: "tests.html", label: "الاختبارات" },
    { page: "live", href: "live.html", label: "الحصص المباشرة" },
    { page: "about", href: "about.html", label: "عن الموقع" },
  ];

  function brandMarkup() {
    return (
      '<a class="brand" href="index.html" aria-label="' + esc(CFG.siteName) + ' — الصفحة الرئيسية">' +
      '<img class="brand-mark" src="assets/img/logo.svg" alt="" width="46" height="46">' +
      '<span class="brand-text"><strong>' + esc(CFG.siteName) + "</strong><span>" + esc(CFG.tagline) + "</span></span>" +
      "</a>"
    );
  }

  function headerMarkup(page) {
    var next = R.nextSession();
    var topbar = "";
    if (next) {
      topbar =
        '<div class="topbar"><div class="container topbar-inner">' +
        '<span class="dot" aria-hidden="true"></span>' +
        "<span>الحصة المباشرة القادمة: <strong>" + esc(next.session.title) + "</strong> — " +
        esc(DAY_NAMES[next.date.getDay()]) + " " + esc(timeLabel(next.session.time)) +
        ' <a href="live.html">التفاصيل</a></span>' +
        "</div></div>";
    }
    var nav = NAV.map(function (item) {
      var current = item.page === page || (page === "lesson" && item.page === "lessons");
      return '<a href="' + item.href + '"' + (current ? ' aria-current="page"' : "") + ">" + esc(item.label) + "</a>";
    }).join("");

    return (
      topbar +
      '<header class="site-header"><div class="container header-inner">' +
      brandMarkup() +
      '<nav class="main-nav" id="main-nav" aria-label="التنقل الرئيسي">' + nav + "</nav>" +
      '<div class="header-actions">' +
      '<a class="btn btn-primary btn-sm" href="exercises.html">' + R.icon("spark") + " ابدأ التدريب</a>" +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="القائمة">' +
      R.icon("menu", "icon-open") + R.icon("close", "icon-close") +
      "</button></div></div></header>"
    );
  }

  function footerMarkup() {
    var cols = TRACKS.slice(0, 5).map(function (t) {
      return '<li><a href="lessons.html?track=' + encodeURIComponent(t.id) + '">' + esc(t.name) + "</a></li>";
    }).join("");
    var teacher = CFG.teacher || {};
    var contact = [];
    if (teacher.email) {
      contact.push('<li>' + R.icon("mail") + '<a href="mailto:' + esc(teacher.email) + '">' + esc(teacher.email) + "</a></li>");
    }
    if (teacher.phone) {
      contact.push('<li>' + R.icon("phone") + "<span>" + esc(teacher.phone) + "</span></li>");
    }
    if (!contact.length) {
      contact.push('<li>' + R.icon("mail") + '<a href="about.html#contact">نموذج التواصل</a></li>');
    }
    contact.push('<li>' + R.icon("video") + '<a href="live.html">حصص Google Meet</a></li>');

    return (
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand">' + brandMarkup() +
      "<p>" + esc(CFG.description) + "</p></div>" +
      '<div class="footer-col"><h3>أقسام الموقع</h3><ul>' +
      '<li><a href="lessons.html">كل الدروس</a></li>' +
      '<li><a href="reading.html">تعلّم القراءة من الصفر</a></li>' +
      '<li><a href="exercises.html">تمارين تفاعلية</a></li>' +
      '<li><a href="tests.html">اختبارات منزلية</a></li>' +
      '<li><a href="live.html">الحصص المباشرة</a></li>' +
      '<li><a href="about.html">عن الموقع</a></li>' +
      "</ul></div>" +
      '<div class="footer-col"><h3>المسارات</h3><ul>' + cols + "</ul></div>" +
      '<div class="footer-col"><h3>تواصل</h3><ul class="footer-contact">' + contact.join("") + "</ul></div>" +
      "</div>" +
      '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + " " + esc(CFG.siteName) + ". جميع الحقوق محفوظة.</span>" +
      '<span class="made">' + R.icon("heart") + " صُنع بعناية لمتعلّمي العربية</span></div>" +
      "</div></footer>"
    );
  }

  function renderShell() {
    var page = document.body.getAttribute("data-page") || "home";
    var headerHost = $("[data-header]");
    var footerHost = $("[data-footer]");
    if (headerHost) headerHost.innerHTML = headerMarkup(page);
    if (footerHost) footerHost.innerHTML = footerMarkup();

    var toggle = $(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$(".main-nav a").forEach(function (link) {
        link.addEventListener("click", function () {
          document.body.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
    var year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------- حركات الظهور */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { obs.observe(el); });
  }
  R.initReveal = initReveal;

  /* ---------------------------------------------------------- بطاقات */
  R.trackCard = function (track, index) {
    var count = LESSONS.filter(function (l) { return l.track === track.id; }).length;
    return (
      '<a class="track-card track-' + track.id + ' reveal" href="lessons.html?track=' + encodeURIComponent(track.id) + '" style="transition-delay:' + (index * 40) + 'ms">' +
      '<span class="track-icon">' + R.icon(track.icon || "book") + "</span>" +
      "<h3>" + esc(track.name) + "</h3>" +
      "<p>" + esc(track.desc) + "</p>" +
      '<div class="track-meta"><span>' + count + " دروس</span>" +
      '<span class="arrow">' + R.icon("arrow") + "</span></div></a>"
    );
  };

  R.lessonCard = function (lesson, index) {
    var track = trackOf(lesson.track);
    return (
      '<article class="lesson-card track-' + lesson.track + ' reveal" style="transition-delay:' + (index * 35) + 'ms">' +
      '<div class="lesson-card-top"><span class="track-badge">' + R.icon(track.icon || "book") + " " + esc(track.short) + "</span>" +
      '<span class="chip">' + esc(lesson.level) + "</span></div>" +
      "<h3><a href=\"lesson.html?lesson=" + encodeURIComponent(lesson.id) + "\">" + esc(lesson.title) + "</a></h3>" +
      "<p>" + esc(lesson.summary) + "</p>" +
      '<div class="lesson-card-foot"><span>' + R.icon("clock") + " " + lesson.minutes + " دقيقة</span>" +
      '<a class="read" href="lesson.html?lesson=' + encodeURIComponent(lesson.id) + '">اقرأ الدرس ' + R.icon("arrow") + "</a></div>" +
      "</article>"
    );
  };

  /* ============================================================ الرئيسية */
  function renderHome() {
    var tracksHost = $("[data-tracks]");
    if (tracksHost) {
      tracksHost.innerHTML = TRACKS.map(R.trackCard).join("");
    }

    var featured = ["fikra-asasiyya", "hamza-wasl-qat", "jumla-ismiyya-fi3liyya", "sahih-mu3tall", "tawlid-afkar", "uslub-wasfi"]
      .map(R.lessonById)
      .filter(Boolean);
    var lessonsHost = $("[data-featured-lessons]");
    if (lessonsHost) lessonsHost.innerHTML = featured.map(R.lessonCard).join("");

    var statsHost = $("[data-stats]");
    if (statsHost) {
      var questions = QUIZZES.reduce(function (n, q) { return n + q.questions.length; }, 0);
      var values = [
        { n: LESSONS.length, label: "درسًا مشروحًا" },
        { n: QUIZZES.length, label: "تمرينًا تفاعليًا" },
        { n: EXAMS.length, label: "اختبارًا منزليًا" },
        { n: questions, label: "سؤالًا مع التصحيح" },
      ];
      statsHost.innerHTML = values.map(function (v) {
        return '<div class="stat"><strong>' + R.arabicNumber(v.n) + "</strong><span>" + esc(v.label) + "</span></div>";
      }).join("");
    }

  }

  function renderNextLivePanels() {
    var next = R.nextSession();
    if (!next) return;
    $$("[data-next-live]").forEach(function (host) {
      host.innerHTML =
        '<div class="live-status"><span class="dot" aria-hidden="true"></span> الحصة القادمة</div>' +
        "<h3>" + esc(next.session.title) + "</h3>" +
        '<p class="when">' + esc(DAY_NAMES[next.date.getDay()]) + " — " + esc(timeLabel(next.session.time)) + "</p>" +
        R.countdownHTML(next.date, "next-cd") +
        R.joinButton("btn-gold");
    });
  }

  function renderDailyQuestion(host) {
    var pool = [];
    QUIZZES.forEach(function (q) {
      q.questions.forEach(function (item) {
        pool.push({ q: item, track: q.track });
      });
    });
    if (!pool.length) return;
    var start = new Date(new Date().getFullYear(), 0, 0);
    var day = Math.floor((Date.now() - start.getTime()) / 86400000);
    var entry = pool[day % pool.length];
    var track = trackOf(entry.track);
    var item = entry.q;

    host.innerHTML =
      '<div class="dq-box">' +
      '<div class="dq-track"><span class="track-badge">' + R.icon(track.icon) + " " + esc(track.short) + "</span></div>" +
      '<p class="dq-text">' + fmt(item.q) + "</p>" +
      '<div class="dq-options" role="group" aria-label="خيارات السؤال">' +
      item.options.map(function (opt, i) {
        return '<button type="button" class="dq-option" data-answer="' + i + '">' + fmt(opt) + "</button>";
      }).join("") +
      "</div>" +
      '<div class="dq-feedback" role="status" aria-live="polite"></div>' +
      "</div>";

    $$(".dq-option", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var chosen = +btn.getAttribute("data-answer");
        var correct = chosen === item.answer;
        $$(".dq-option", host).forEach(function (b, i) {
          b.disabled = true;
          if (i === item.answer) b.classList.add("is-correct");
        });
        if (!correct) btn.classList.add("is-wrong");
        var fb = $(".dq-feedback", host);
        fb.textContent = correct ? "أحسنت! " + item.explain : "ليس هذا الجواب. " + item.explain;
        fb.style.color = correct ? "var(--green-700)" : "var(--danger)";
      });
    });
  }

  /* ============================================================ الدروس */
  function renderLessonsPage() {
    var grid = $("[data-lessons-grid]");
    if (!grid) return;
    var searchInput = $("[data-lesson-search]");
    var chips = $$("[data-track-filter]");
    var countHost = $("[data-results-count]");
    var params = new URLSearchParams(window.location.search);
    var state = { track: params.get("track") || "all", query: "" };

    function apply() {
      var list = LESSONS.filter(function (lesson) {
        if (state.track !== "all" && lesson.track !== state.track) return false;
        if (!state.query) return true;
        var haystack = (lesson.title + " " + lesson.summary + " " + lesson.level + " " + trackOf(lesson.track).name).toLowerCase();
        return haystack.indexOf(state.query.toLowerCase()) !== -1;
      });
      grid.innerHTML = list.length
        ? list.map(R.lessonCard).join("")
        : '<div class="empty-state" style="grid-column:1/-1"><strong>لا توجد دروس مطابقة</strong>جرّب كلمة أخرى أو أزل التصفية.</div>';
      if (countHost) countHost.textContent = list.length + " من " + LESSONS.length + " درسًا";
      chips.forEach(function (chip) {
        var active = chip.getAttribute("data-track-filter") === state.track;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", active ? "true" : "false");
      });
      initReveal();
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.track = chip.getAttribute("data-track-filter");
        apply();
      });
    });
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.query = searchInput.value.trim();
        apply();
      });
    }
    apply();
  }

  /* ============================================================ صفحة الدرس */
  function renderBlocks(blocks) {
    return blocks.map(function (block) {
      switch (block.type) {
        case "p":
          return "<p>" + fmt(block.text) + "</p>";
        case "h3":
          return "<h3>" + fmt(block.text) + "</h3>";
        case "ul":
        case "ol": {
          var tag = block.type;
          return "<" + tag + ">" + block.items.map(function (i) { return "<li>" + fmt(i) + "</li>"; }).join("") + "</" + tag + ">";
        }
        case "reading":
          return (
            '<div class="reading-text">' +
            (block.title ? '<p class="text-title">' + esc(block.title) + "</p>" : "") +
            block.paragraphs.map(function (p) { return "<p>" + fmt(p) + "</p>"; }).join("") +
            "</div>"
          );
        case "table":
          return (
            '<div class="table-wrap"><table><thead><tr>' +
            block.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") +
            "</tr></thead><tbody>" +
            block.rows.map(function (row) {
              return "<tr>" + row.map(function (cell) { return "<td>" + fmt(cell) + "</td>"; }).join("") + "</tr>";
            }).join("") +
            "</tbody></table></div>"
          );
        case "example":
          return '<div class="example-box"><p>' + fmt(block.text) + "</p></div>";
        case "note":
          return '<div class="note-box">' + (block.title ? "<strong>" + esc(block.title) + ":</strong> " : "") + fmt(block.text) + "</div>";
        case "think":
          return '<div class="think-box"><strong>فكّر</strong><p style="margin:0">' + fmt(block.text) + "</p></div>";
        case "details":
          return block.items.map(function (item) {
            return "<details><summary>" + esc(item.q) + "</summary><div class=\"details-body\"><p>" + fmt(item.a) + "</p></div></details>";
          }).join("");
        case "keypoints":
          return (
            '<div class="key-points"><h2>خلاصة الدرس</h2><ul>' +
            block.items.map(function (i) { return "<li>" + fmt(i) + "</li>"; }).join("") +
            "</ul></div>"
          );
        default:
          return "";
      }
    }).join("");
  }

  function renderLessonPage() {
    var host = $("[data-lesson]");
    if (!host) return;
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("lesson") || window.location.hash.replace("#", "");
    var lesson = R.lessonById(slug);

    if (!lesson) {
      host.innerHTML =
        '<div class="empty-state"><strong>لم نجد هذا الدرس</strong>' +
        "قد يكون الرابط قديمًا أو مكتوبًا خطأ. <a href=\"lessons.html\">عُد إلى قائمة الدروس</a>.</div>";
      return;
    }

    var track = trackOf(lesson.track);
    var siblings = LESSONS.filter(function (l) { return l.track === lesson.track; });
    var index = siblings.indexOf(lesson);
    var prev = siblings[index - 1];
    var next = siblings[index + 1];
    var quiz = R.quizById(lesson.quiz);

    document.title = lesson.title + " — " + CFG.siteName;

    var crumb =
      '<nav class="breadcrumb" aria-label="مسار التنقل">' +
      '<a href="index.html">الرئيسية</a><span class="sep">/</span>' +
      '<a href="lessons.html">الدروس</a><span class="sep">/</span>' +
      '<a href="lessons.html?track=' + encodeURIComponent(track.id) + '">' + esc(track.name) + "</a>" +
      '<span class="sep">/</span><span>' + esc(lesson.title) + "</span></nav>";

    var objectives =
      '<div class="objectives"><h2>' + R.icon("target") + " أهداف الدرس</h2><ul>" +
      lesson.objectives.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") +
      "</ul></div>";

    var main =
      '<article class="lesson-main">' +
      '<div class="lesson-head">' + crumb +
      '<div class="lesson-meta" style="margin-bottom:14px"><span class="track-badge">' + R.icon(track.icon) + " " + esc(track.name) + "</span>" +
      '<span class="chip">' + esc(lesson.level) + "</span></div>" +
      "<h1>" + esc(lesson.title) + "</h1>" +
      '<p class="lesson-sub">' + esc(lesson.subtitle) + "</p>" +
      '<div class="lesson-meta"><span class="meta-item">' + R.icon("clock") + " " + lesson.minutes + " دقيقة قراءة</span>" +
      '<span class="meta-item">' + R.icon("bookOpen") + " " + (index + 1) + " من " + siblings.length + " في المسار</span></div>" +
      "</div>" +
      objectives +
      '<div class="lesson-section">' + renderBlocks(lesson.blocks) + "</div>" +
      '<div class="lesson-cta no-print"><div><h3>هل فهمت الدرس؟</h3><p>جرّب التمرين التفاعلي واعرف نتيجتك فورًا.</p></div>' +
      '<a class="btn btn-primary" href="exercises.html?quiz=' + encodeURIComponent(quiz ? quiz.id : "") + '">' + R.icon("spark") + " ابدأ التمرين</a></div>" +
      '<nav class="lesson-nav no-print" aria-label="التنقل بين الدروس">' +
      (prev
        ? '<a href="lesson.html?lesson=' + encodeURIComponent(prev.id) + '"><span class="ln-label">الدرس السابق</span><span class="ln-title">' + esc(prev.title) + "</span></a>"
        : "<span></span>") +
      (next
        ? '<a class="next" href="lesson.html?lesson=' + encodeURIComponent(next.id) + '"><span class="ln-label">الدرس التالي</span><span class="ln-title">' + esc(next.title) + "</span></a>"
        : "<span></span>") +
      "</nav></article>";

    var sideList = siblings.map(function (l, i) {
      var current = l.id === lesson.id;
      return (
        '<li><a href="lesson.html?lesson=' + encodeURIComponent(l.id) + '"' + (current ? ' aria-current="true"' : "") + ">" +
        '<span class="num">' + (i + 1) + "</span><span>" + esc(l.title) + "</span></a></li>"
      );
    }).join("");

    var sidebar =
      '<aside class="lesson-sidebar no-print">' +
      '<div class="side-card"><h3>' + R.icon("layers") + " دروس المسار</h3><ul class=\"side-list\">" + sideList + "</ul></div>" +
      '<div class="side-card side-cta"><h3>' + R.icon("video") + " حصة مباشرة</h3>" +
      "<p>نراجع الدرس معًا ونحلّ تمارين إضافية على Google Meet.</p>" +
      '<a class="btn btn-gold btn-sm btn-block" href="live.html">مواعيد الحصص</a></div>' +
      '<div class="side-card"><h3>' + R.icon("file") + " الاختبار المنزلي</h3>" +
      "<p style=\"font-size:.83rem;color:var(--muted);margin-bottom:12px\">نسخة Word وPDF جاهزة للطباعة، بدرجة من 10.</p>" +
      '<a class="btn btn-ghost btn-sm btn-block" href="tests.html">' + R.icon("download") + " تنزيل الاختبار</a></div>" +
      "</aside>";

    host.innerHTML = '<div class="container"><div class="lesson-layout">' + main + sidebar + "</div></div>";

    var bar = document.createElement("div");
    bar.className = "reading-progress no-print";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    window.addEventListener("scroll", function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      bar.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + "%";
    }, { passive: true });
  }

  /* ============================================================ التشغيل */
  document.addEventListener("DOMContentLoaded", function () {
    renderShell();
    renderNextLivePanels();
    $$("[data-daily]").forEach(renderDailyQuestion);
    var page = document.body.getAttribute("data-page") || "home";
    if (page === "home") renderHome();
    if (page === "lessons") renderLessonsPage();
    if (page === "lesson") renderLessonPage();
    if (R.pages[page]) R.pages[page]();
    initReveal();
    tickCountdowns();
  });
})();
