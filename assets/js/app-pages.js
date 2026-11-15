/* ============================================================
   رواق العربية — صفحات التمارين والاختبارات والحصص والتعريف
   ============================================================ */

(function () {
  "use strict";

  var R = window.RUWAQ;
  if (!R) return;
  var CFG = R.cfg;
  var $ = R.$;
  var $$ = R.$$;
  var esc = R.esc;
  var icon = R.icon;
  var trackOf = R.trackOf;
  var AR = R.arabicNumber;
  var LETTERS = ["أ", "ب", "ج", "د"];

  function scrollToStage(node) {
    if (!node) return;
    window.setTimeout(function () {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  function setQuery(pair) {
    try {
      var url = new URL(window.location.href);
      Object.keys(pair).forEach(function (key) {
        if (pair[key]) url.searchParams.set(key, pair[key]);
        else url.searchParams.delete(key);
      });
      window.history.replaceState({}, "", url.toString());
    } catch (e) { /* file:// قد يمنع التعديل */ }
  }

  function scoreClass(percent) {
    if (percent >= 90) return "ممتاز";
    if (percent >= 70) return "جيد جدًا";
    if (percent >= 50) return "مقبول";
    return "يحتاج مراجعة";
  }
  function scoreMessage(percent) {
    if (percent >= 90) return "أداء رائع! أتقنت هذا المحور، جرّب محورًا آخر.";
    if (percent >= 70) return "نتيجة جيدة. راجع الأسئلة التي أخطأت فيها لتثبيت القاعدة.";
    if (percent >= 50) return "بداية طيبة. أعد قراءة الدرس ثم أعد التمرين.";
    return "لا بأس، الأخطاء جزء من التعلّم. ابدأ بدرس المسار ثم عُد للتمرين.";
  }

  /* ============================================================ التمارين */
  var quizState = null;

  function bestLabel(id) {
    var best = R.store.get("best:" + id, null);
    if (!best) return "لم تجرّبه بعد";
    return "أفضل نتيجة: " + AR(best.score) + " / " + AR(best.total);
  }

  function renderQuizCards() {
    var host = $("[data-quiz-cards]");
    if (!host) return;
    host.innerHTML = R.quizzes.map(function (quiz) {
      var track = trackOf(quiz.track);
      return (
        '<button type="button" class="quiz-card track-' + quiz.track + '" data-quiz="' + quiz.id + '">' +
        '<div class="quiz-card-top"><span class="track-badge">' + icon(track.icon) + " " + esc(track.short) + "</span>" +
        '<span class="chip">' + quiz.questions.length + " أسئلة</span></div>" +
        "<h3>" + esc(quiz.title) + "</h3>" +
        "<p>" + esc(quiz.desc) + "</p>" +
        '<div class="quiz-card-foot"><span>' + icon("clock") + " " + quiz.minutes + " دقائق</span>" +
        '<span class="best" data-best="' + quiz.id + '">' + esc(bestLabel(quiz.id)) + "</span></div>" +
        "</button>"
      );
    }).join("");

    $$("[data-quiz]", host).forEach(function (card) {
      card.addEventListener("click", function () {
        startQuiz(card.getAttribute("data-quiz"));
      });
    });
  }

  function highlightQuizCard(id) {
    $$("[data-quiz]").forEach(function (card) {
      card.classList.toggle("is-active", card.getAttribute("data-quiz") === id);
    });
  }

  function startQuiz(id) {
    var quiz = R.quizById(id);
    if (!quiz) return;
    quizState = { quiz: quiz, index: 0, answers: quiz.questions.map(function () { return null; }) };
    highlightQuizCard(id);
    setQuery({ quiz: id });
    renderQuizStage();
    scrollToStage($("[data-quiz-stage]"));
  }

  function renderQuizStage() {
    var host = $("[data-quiz-stage]");
    if (!host) return;
    if (!quizState) {
      host.innerHTML =
        '<div class="empty-state"><strong>اختر تمرينًا للبدء</strong>' +
        "كل تمرين قصير، ويصحّح إجاباتك سؤالًا بسؤال مع شرح لكل جواب.</div>";
      return;
    }
    var quiz = quizState.quiz;
    var i = quizState.index;
    var item = quiz.questions[i];
    var track = trackOf(quiz.track);
    var chosen = quizState.answers[i];
    var answered = chosen !== null;
    var percent = Math.round(((i + 1) / quiz.questions.length) * 100);

    var passage = "";
    if (quiz.passage) {
      passage =
        '<div class="reading-text" style="margin-bottom:24px">' +
        '<p class="text-title">' + esc(quiz.passage.title) + "</p>" +
        quiz.passage.paragraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
        "</div>";
    }

    var options = item.options.map(function (opt, idx) {
      var cls = "q-option";
      if (answered) {
        if (idx === item.answer) cls += " is-correct";
        else if (idx === chosen) cls += " is-wrong";
      }
      return (
        '<button type="button" class="' + cls + '" data-option="' + idx + '"' + (answered ? " disabled" : "") + ">" +
        '<span class="letter">' + LETTERS[idx] + "</span><span>" + R.fmt(opt) + "</span></button>"
      );
    }).join("");

    var feedback = "";
    if (answered) {
      var ok = chosen === item.answer;
      feedback =
        '<div class="quiz-feedback is-visible ' + (ok ? "ok" : "no") + '" role="status">' +
        "<strong>" + (ok ? "إجابة صحيحة" : "إجابة غير صحيحة") + "</strong>" +
        esc(item.explain) + "</div>";
    }

    var last = i === quiz.questions.length - 1;
    host.innerHTML =
      '<div class="quiz-panel">' +
      '<div class="quiz-top"><div><h2>' + esc(quiz.title) + "</h2>" +
      '<p class="quiz-sub">' + esc(track.name) + " · " + quiz.questions.length + " أسئلة · " + quiz.minutes + " دقائق</p></div>" +
      '<span class="chip chip-green">' + AR(i + 1) + " / " + AR(quiz.questions.length) + "</span></div>" +
      '<div class="quiz-progress" role="progressbar" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + percent + '%"></span></div>' +
      passage +
      '<div class="question-head"><span class="q-index">' + AR(i + 1) + '</span><p class="q-text">' + R.fmt(item.q) + "</p></div>" +
      '<div class="q-options">' + options + "</div>" +
      feedback +
      '<div class="quiz-actions"><span class="hint">' + (answered ? "اقرأ الشرح ثم انتقل للسؤال التالي." : "اختر إجابة واحدة.") + "</span>" +
      "<div style=\"display:flex;gap:8px;flex-wrap:wrap\">" +
      (i > 0 ? '<button type="button" class="btn btn-ghost btn-sm" data-quiz-prev>' + icon("arrowLeft") + " السابق</button>" : "") +
      '<button type="button" class="btn btn-primary btn-sm" data-quiz-next' + (answered ? "" : " disabled") + ">" +
      (last ? "عرض النتيجة" : "السؤال التالي") + " " + icon("arrow") + "</button>" +
      "</div></div></div>";

    $$("[data-option]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = +btn.getAttribute("data-option");
        quizState.answers[i] = idx;
        renderQuizStage();
      });
    });
    var prev = $("[data-quiz-prev]", host);
    if (prev) {
      prev.addEventListener("click", function () {
        quizState.index = Math.max(0, i - 1);
        renderQuizStage();
        scrollToStage(host);
      });
    }
    var next = $("[data-quiz-next]", host);
    if (next) {
      next.addEventListener("click", function () {
        if (quizState.answers[i] === null) return;
        if (last) showQuizResult();
        else {
          quizState.index = i + 1;
          renderQuizStage();
          scrollToStage(host);
        }
      });
    }
  }

  function showQuizResult() {
    var host = $("[data-quiz-stage]");
    var quiz = quizState.quiz;
    var correct = 0;
    quiz.questions.forEach(function (q, i) {
      if (quizState.answers[i] === q.answer) correct += 1;
    });
    var total = quiz.questions.length;
    var percent = Math.round((correct / total) * 100);
    var previous = R.store.get("best:" + quiz.id, null);
    if (!previous || correct > previous.score) {
      R.store.set("best:" + quiz.id, {
        score: correct,
        total: total,
        percent: percent,
        at: new Date().toISOString().slice(0, 10),
      });
    }
    var bestNode = $('[data-best="' + quiz.id + '"]');
    if (bestNode) bestNode.textContent = bestLabel(quiz.id);

    var review = quiz.questions.map(function (q, i) {
      var ok = quizState.answers[i] === q.answer;
      return (
        '<div class="review-item' + (ok ? "" : " bad") + '">' +
        '<span class="r-ico">' + (ok ? "✓" : "✕") + "</span>" +
        '<div><div class="r-q">' + (i + 1) + ". " + R.fmt(q.q) + "</div>" +
        '<div class="r-a">الإجابة الصحيحة: <strong>' + R.fmt(q.options[q.answer]) + "</strong>" +
        (ok ? "" : " — اخترت: " + R.fmt(q.options[quizState.answers[i]])) + "</div></div></div>"
      );
    }).join("");

    var nextQuiz = R.quizzes[(R.quizzes.indexOf(quiz) + 1) % R.quizzes.length];

    host.innerHTML =
      '<div class="quiz-panel result">' +
      '<div class="score-ring" style="--score:' + percent + '"><span class="score-value">' + AR(correct) + "<small>من " + AR(total) + "</small></span></div>" +
      "<h2>" + scoreClass(percent) + "</h2>" +
      "<p>" + scoreMessage(percent) + "</p>" +
      '<div class="result-actions">' +
      '<button type="button" class="btn btn-primary" data-retry>أعد التمرين</button>' +
      '<a class="btn btn-ghost" href="#quiz-picker">تمرين آخر</a>' +
      (nextQuiz ? '<button type="button" class="btn btn-ghost" data-next-quiz="' + nextQuiz.id + '">' + esc(nextQuiz.title) + "</button>" : "") +
      "</div>" +
      '<div class="review"><h3>مراجعة الإجابات</h3>' + review + "</div></div>";

    var retry = $("[data-retry]", host);
    if (retry) retry.addEventListener("click", function () { startQuiz(quiz.id); });
    var nextBtn = $("[data-next-quiz]", host);
    if (nextBtn) nextBtn.addEventListener("click", function () { startQuiz(nextBtn.getAttribute("data-next-quiz")); });
    scrollToStage(host);
  }

  function initExercises() {
    renderQuizCards();
    renderQuizStage();
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("quiz");
    if (wanted && R.quizById(wanted)) startQuiz(wanted);
  }

  /* ============================================================ الاختبارات */
  var examState = null;
  var examTimer = null;

  function renderExamCards() {
    var host = $("[data-exam-cards]");
    if (!host) return;
    host.innerHTML = R.exams.map(function (exam) {
      var track = trackOf(exam.track);
      return (
        '<article class="exam-mode track-' + exam.track + '">' +
        '<div class="meta"><span class="track-badge">' + icon(track.icon) + " " + esc(track.name) + "</span>" +
        '<span class="chip">' + exam.questions.length + " أسئلة</span></div>" +
        "<h3>" + esc(exam.title) + "</h3>" +
        "<p>" + esc(exam.desc) + "</p>" +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<button type="button" class="btn btn-primary btn-sm" data-exam="' + exam.id + '">ابدأ الاختبار</button>' +
        '<a class="btn btn-ghost btn-sm" href="#answer-key">مفتاح الإجابة</a>' +
        "</div></article>"
      );
    }).join("");

    $$("[data-exam]", host).forEach(function (btn) {
      btn.addEventListener("click", function () { startExam(btn.getAttribute("data-exam")); });
    });
  }

  function renderAnswerKeys() {
    var host = $("[data-answer-keys]");
    if (!host) return;
    host.innerHTML = R.exams.map(function (exam) {
      var rows = exam.questions.map(function (q, i) {
        return (
          "<tr><td>" + (i + 1) + "</td><td>" + R.fmt(q.q) + "</td>" +
          "<td><strong>" + R.fmt(q.options[q.answer]) + "</strong></td></tr>"
        );
      }).join("");
      return (
        "<details class=\"answer-key\"><summary>" + esc(exam.title) + " — " + exam.questions.length + " نقطة</summary>" +
        '<div class="details-body"><div class="table-wrap" style="margin-top:12px"><table>' +
        "<thead><tr><th>#</th><th>السؤال</th><th>الإجابة</th></tr></thead><tbody>" + rows + "</tbody></table></div></div></details>"
      );
    }).join("");
  }

  function startExam(id) {
    var exam = R.examById(id);
    if (!exam) return;
    if (examTimer) window.clearInterval(examTimer);
    examState = {
      exam: exam,
      index: 0,
      answers: exam.questions.map(function () { return null; }),
      deadline: Date.now() + exam.minutes * 60000,
      submitted: false,
    };
    setQuery({});
    renderExamStage();
    scrollToStage($("[data-exam-stage]"));
    examTimer = window.setInterval(function () {
      if (!examState || examState.submitted) return;
      var left = examState.deadline - Date.now();
      if (left <= 0) {
        window.clearInterval(examTimer);
        examTimer = null;
        submitExam(true);
      } else {
        var node = $("[data-exam-clock]");
        if (node) node.textContent = clockLabel(left);
      }
    }, 1000);
  }

  function clockLabel(ms) {
    var sec = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function renderExamStage() {
    var host = $("[data-exam-stage]");
    if (!host) return;
    if (!examState) {
      host.innerHTML =
        '<div class="empty-state"><strong>اختر اختبارًا</strong>' +
        "عشرة أسئلة، درجة من عشرة، ومؤقّت زمني. تُظهر النتيجة فور التسليم مع مراجعة كل سؤال.</div>";
      return;
    }
    var exam = examState.exam;
    var i = examState.index;
    var item = exam.questions[i];
    var track = trackOf(exam.track);
    var chosen = examState.answers[i];
    var left = examState.deadline - Date.now();
    var answeredCount = examState.answers.filter(function (a) { return a !== null; }).length;

    var passage = "";
    if (exam.passage) {
      passage =
        '<div class="reading-text" style="margin-bottom:22px">' +
        '<p class="text-title">' + esc(exam.passage.title) + "</p>" +
        exam.passage.paragraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
        "</div>";
    }

    var options = item.options.map(function (opt, idx) {
      return (
        '<button type="button" class="q-option' + (chosen === idx ? " is-selected" : "") + '" data-option="' + idx + '">' +
        '<span class="letter">' + LETTERS[idx] + "</span><span>" + R.fmt(opt) + "</span></button>"
      );
    }).join("");

    var palette = exam.questions.map(function (q, idx) {
      var cls = "";
      if (examState.answers[idx] !== null) cls = "is-answered";
      if (idx === i) cls += " is-current";
      return '<button type="button" class="' + cls + '" data-jump="' + idx + '" aria-label="السؤال ' + (idx + 1) + '">' + (idx + 1) + "</button>";
    }).join("");

    host.innerHTML =
      '<div class="quiz-panel">' +
      '<div class="exam-bar"><div><h2>' + esc(exam.title) + "</h2>" +
      '<p class="quiz-sub">' + esc(track.name) + " · الدرجة من 10 · لكل سؤال نقطة</p></div>" +
      '<span class="exam-timer' + (left < 60000 ? " is-low" : "") + '">' + icon("clock") + ' <span data-exam-clock>' + clockLabel(left) + "</span></span></div>" +
      '<div class="quiz-progress" role="progressbar" aria-valuenow="' + answeredCount + '" aria-valuemin="0" aria-valuemax="' + exam.questions.length + '"><span style="width:' + (answeredCount / exam.questions.length) * 100 + '%"></span></div>' +
      passage +
      '<div class="question-head"><span class="q-index">' + AR(i + 1) + '</span><p class="q-text">' + R.fmt(item.q) + "</p></div>" +
      '<div class="q-options">' + options + "</div>" +
      '<div class="exam-nav"><button type="button" class="btn btn-ghost btn-sm" data-exam-prev' + (i === 0 ? " disabled" : "") + ">" + icon("arrowLeft") + " السابق</button>" +
      '<span class="hint" style="color:var(--muted);font-size:.78rem">أجبت عن ' + AR(answeredCount) + " من " + AR(exam.questions.length) + "</span>" +
      '<button type="button" class="btn btn-primary btn-sm" data-exam-next' + (i === exam.questions.length - 1 ? " disabled" : "") + ">التالي " + icon("arrow") + "</button></div>" +
      '<div class="exam-palette" aria-label="التنقل بين الأسئلة">' + palette + "</div>" +
      '<div class="exam-nav" style="margin-top:16px"><span></span>' +
      '<button type="button" class="btn btn-gold" data-exam-submit>تسليم الاختبار</button></div>' +
      "</div>";

    $$("[data-option]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        examState.answers[i] = +btn.getAttribute("data-option");
        renderExamStage();
      });
    });
    $$("[data-jump]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        examState.index = +btn.getAttribute("data-jump");
        renderExamStage();
      });
    });
    var prev = $("[data-exam-prev]", host);
    if (prev) prev.addEventListener("click", function () {
      examState.index = Math.max(0, i - 1);
      renderExamStage();
    });
    var next = $("[data-exam-next]", host);
    if (next) next.addEventListener("click", function () {
      examState.index = Math.min(exam.questions.length - 1, i + 1);
      renderExamStage();
    });
    var submit = $("[data-exam-submit]", host);
    if (submit) submit.addEventListener("click", function () { submitExam(false); });
  }

  function submitExam(auto) {
    if (!examState || examState.submitted) return;
    var missing = examState.answers.filter(function (a) { return a === null; }).length;
    if (!auto && missing > 0) {
      var ok = window.confirm("لم تجب عن " + missing + " سؤالًا. هل تريد التسليم الآن؟");
      if (!ok) return;
    }
    examState.submitted = true;
    if (examTimer) {
      window.clearInterval(examTimer);
      examTimer = null;
    }
    var exam = examState.exam;
    var correct = 0;
    exam.questions.forEach(function (q, i) {
      if (examState.answers[i] === q.answer) correct += 1;
    });
    var total = exam.questions.length;
    var perQuestion = 10 / total;
    var score = Math.round(correct * perQuestion * 100) / 100;
    var percent = Math.round((correct / total) * 100);
    var previous = R.store.get("best:" + exam.id, null);
    if (!previous || score > previous.score) {
      R.store.set("best:" + exam.id, { score: score, total: 10, percent: percent, at: new Date().toISOString().slice(0, 10) });
    }
    var host = $("[data-exam-stage]");
    var review = exam.questions.map(function (q, i) {
      var ok = examState.answers[i] === q.answer;
      var given = examState.answers[i] === null ? "لم تُجب" : R.fmt(q.options[examState.answers[i]]);
      return (
        '<div class="review-item' + (ok ? "" : " bad") + '">' +
        '<span class="r-ico">' + (ok ? "✓" : "✕") + "</span>" +
        '<div><div class="r-q">' + (i + 1) + ". " + R.fmt(q.q) + "</div>" +
        '<div class="r-a">الإجابة الصحيحة: <strong>' + R.fmt(q.options[q.answer]) + "</strong> · إجابتك: " + given + "</div></div></div>"
      );
    }).join("");

    host.innerHTML =
      '<div class="quiz-panel result">' +
      (auto ? '<p class="chip chip-gold" style="margin-bottom:14px">انتهى الوقت — سُلّم الاختبار تلقائيًا</p>' : "") +
      '<div class="score-ring" style="--score:' + percent + '"><span class="score-value">' + AR(score) + "<small>من 10</small></span></div>" +
      "<h2>" + scoreClass(percent) + "</h2>" +
      "<p>" + scoreMessage(percent) + " · " + AR(correct) + " إجابة صحيحة من " + AR(total) + ".</p>" +
      '<div class="result-actions">' +
      '<button type="button" class="btn btn-primary" data-exam-retry>أعد الاختبار</button>' +
      '<a class="btn btn-gold" href="' + esc((CFG.downloads || {}).pdf || "#") + '" download>' + icon("download") + " نسخة PDF</a>" +
      '<a class="btn btn-ghost" href="#answer-key">مفتاح الإجابة</a>' +
      "</div>" +
      '<div class="review"><h3>مراجعة الإجابات</h3>' + review + "</div></div>";

    var retry = $("[data-exam-retry]", host);
    if (retry) retry.addEventListener("click", function () { startExam(exam.id); });
    scrollToStage(host);
  }

  function initTests() {
    renderExamCards();
    renderAnswerKeys();
    renderExamStage();
    var downloads = $("[data-downloads]");
    if (downloads) {
      var files = CFG.downloads || {};
      var items = [
        { key: "docx", label: "نسخة Word (قابلة للتعديل)", icon: "file" },
        { key: "pdf", label: "نسخة PDF (4 صفحات)", icon: "download" },
        { key: "paper1", label: "الورقة الأولى — نصّ الحضارة المغربية", icon: "file" },
        { key: "paper2", label: "الورقة الثانية — نصّ مغاربة العالم", icon: "file" },
      ];
      downloads.innerHTML = items.map(function (item) {
        var href = files[item.key];
        if (!href) return "";
        return (
          '<a class="btn btn-ghost btn-sm" href="' + esc(href) + '" download>' + icon(item.icon) + " " + esc(item.label) + "</a>"
        );
      }).join("");
    }
  }

  /* ============================================================ الحصص المباشرة */
  function calendarLink(session, date) {
    var end = new Date(date.getTime() + (session.duration || 45) * 60000);
    var fmtDate = function (d) {
      return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };
    var params = [
      "action=TEMPLATE",
      "text=" + encodeURIComponent(session.title + " — " + CFG.siteName),
      "dates=" + fmtDate(date) + "/" + fmtDate(end),
      "details=" + encodeURIComponent(session.desc),
      "location=" + encodeURIComponent(CFG.meetLink || ""),
    ];
    return "https://calendar.google.com/calendar/render?" + params.join("&");
  }

  function initLive() {
    var now = new Date();
    var next = R.nextSession();
    var hero = $("[data-live-hero]");
    if (hero && next) {
      var s = next.session;
      hero.innerHTML =
        '<div class="next-session-card">' +
        '<div class="live-status"><span class="dot" aria-hidden="true"></span> الحصة القادمة على Google Meet</div>' +
        "<h3>" + esc(s.title) + "</h3>" +
        '<p class="when">' + esc(R.DAY_NAMES[next.date.getDay()]) + " " + next.date.getDate() + " / " + (next.date.getMonth() + 1) +
        " — " + esc(R.timeLabel(s.time)) + " · " + (s.duration || 45) + " دقيقة</p>" +
        R.countdownHTML(next.date, "live-cd") +
        '<div style="display:flex;flex-direction:column;gap:8px">' + R.joinButton("btn-gold") +
        '<a class="btn btn-ghost btn-sm" style="border-color:rgba(255,255,255,.3);color:#fff" href="' + calendarLink(s, next.date) + '" target="_blank" rel="noopener">' + icon("calendar") + " أضف إلى تقويم Google</a>" +
        "</div></div>";
    }

    var grid = $("[data-schedule]");
    if (grid) {
      grid.innerHTML = (CFG.sessions || []).map(function (s) {
        var track = trackOf(s.track);
        var date = R.sessionDate(s, now);
        return (
          '<article class="session-card track-' + s.track + '">' +
          '<div class="session-day"><span class="day-badge"><strong>' + R.timeLabel(s.time).split(" ")[0] + "</strong><span>" + R.timeLabel(s.time).split(" ")[1] + "</span></span>" +
          "<div><h3>" + esc(s.title) + "</h3><span class=\"time\">" + esc(R.DAY_NAMES[s.day]) + " · " + (s.duration || 45) + " دقيقة</span></div></div>" +
          "<p>" + esc(s.desc) + "</p>" +
          '<span class="track-badge" style="align-self:flex-start;margin-bottom:10px">' + icon(track.icon) + " " + esc(track.name) + "</span>" +
          R.countdownHTML(date, "cd-" + s.id) +
          R.joinButton("btn-primary btn-sm") +
          "</article>"
        );
      }).join("");
    }

    var setup = $("[data-meet-note]");
    if (setup && !(CFG.meetLink || "").trim()) {
      setup.innerHTML =
        '<div class="note-box"><strong>ملاحظة:</strong> يُرسل رابط الغرفة قبل الحصة بوقت كافٍ إلى مجموعة الصف. ' +
        'لطلب الرابط أو الانضمام إلى القائمة، استعمل <a href="about.html#contact">صفحة التواصل</a>.</div>';
    }

    var calHost = $("[data-week-calendar]");
    if (calHost) {
      calHost.innerHTML =
        '<div class="table-wrap"><table><thead><tr><th>اليوم</th><th>الوقت</th><th>الحصة</th><th>المحور</th></tr></thead><tbody>' +
        (CFG.sessions || []).map(function (s) {
          return (
            "<tr><td>" + esc(R.DAY_NAMES[s.day]) + "</td><td>" + esc(R.timeLabel(s.time)) + "</td>" +
            "<td>" + esc(s.title) + "</td><td>" + esc(trackOf(s.track).name) + "</td></tr>"
          );
        }).join("") +
        "</tbody></table></div>";
    }
  }

  /* ============================================================ عن الموقع */
  function initAbout() {
    var teacher = CFG.teacher || {};
    var avatar = $("[data-avatar]");
    if (avatar) {
      var words = String(teacher.name || "ر")
        .replace(/^(أ\.|د\.|أبو|أبو\s)\s*/u, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      var first = words[0] || "ر";
      var second = words[1] || "";
      avatar.textContent = first.charAt(0) + (second ? " " + second.charAt(0) : "");
    }
    $$("[data-teacher-name]").forEach(function (node) {
      if (teacher.name) node.textContent = teacher.name;
    });
    var contact = $("[data-contact-list]");
    if (contact) {
      var rows = [];
      if (teacher.email) rows.push("<li>" + icon("mail") + '<a href="mailto:' + esc(teacher.email) + '">' + esc(teacher.email) + "</a></li>");
      if (teacher.phone) rows.push("<li>" + icon("phone") + "<span>" + esc(teacher.phone) + "</span></li>");
      if (teacher.whatsapp) rows.push("<li>" + icon("phone") + '<a href="https://wa.me/' + esc(String(teacher.whatsapp).replace(/\D/g, "")) + '" target="_blank" rel="noopener">واتساب</a></li>');
      if (!teacher.email && !teacher.phone && !teacher.whatsapp) {
        rows.push("<li>" + icon("mail") + '<a href="#contact">استعمل نموذج التواصل</a></li>');
      }
      rows.push("<li>" + icon("video") + '<a href="live.html">حصص Google Meet</a></li>');
      contact.innerHTML = rows.join("");
    }

    var form = $("[data-contact-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var status = $("[data-form-status]", form);
        var data = new FormData(form);
        var name = String(data.get("name") || "").trim();
        var email = String(data.get("email") || "").trim();
        var subject = String(data.get("subject") || "").trim();
        var message = String(data.get("message") || "").trim();
        if (!name || !message) {
          if (status) {
            status.className = "form-status is-visible";
            status.textContent = "اكتب اسمك ورسالتك على الأقل.";
          }
          return;
        }
        if (teacher.email) {
          var body = "الاسم: " + name + "\nالبريد: " + email + "\n\n" + message;
          var href = "mailto:" + teacher.email + "?subject=" + encodeURIComponent(subject || "رسالة من موقع " + CFG.siteName) + "&body=" + encodeURIComponent(body);
          window.location.href = href;
          if (status) {
            status.className = "form-status is-visible";
            status.innerHTML = "فتحنا تطبيق البريد لديك. إن لم يفتح، <a href=\"" + esc(href) + "\">اضغط هنا لإرسال الرسالة</a>.";
          }
        } else if (status) {
          status.className = "form-status is-visible";
          status.textContent = "لم تُضبط وسيلة تواصل مباشرة بعد. اطلب رابط الحصة من صفحة الحصص المباشرة، أو اكتب سؤالك في الدردشة أثناء الحصة.";
        }
      });
    }
  }

  R.pages.exercises = initExercises;
  R.pages.tests = initTests;
  R.pages.live = initLive;
  R.pages.about = initAbout;
})();
