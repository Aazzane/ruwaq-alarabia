/* ============================================================
   رواق العربية — برنامج تعلّم القراءة من الصفر
   ============================================================ */

(function () {
  "use strict";

  var R = window.RUWAQ;
  if (!R) return;

  var $ = R.$;
  var $$ = R.$$;
  var esc = R.esc;
  var fmt = R.fmt;
  var icon = R.icon;
  var store = R.store;

  var STAGES = window.READING_STAGES || [];
  var QUIZ = window.READING_QUIZ || {};

  var F = "\u064E"; // فتحة
  var K = "\u0650"; // كسرة
  var D = "\u064F"; // ضمة
  var HARAKA = {
    fatha: { mark: F, label: "الفتحة", sound: "أَ" },
    kasra: { mark: K, label: "الكسرة", sound: "إِ" },
    damma: { mark: D, label: "الضمة", sound: "أُ" },
  };

  var LETTER_NAMES = {
    "ب": "باء", "ت": "تاء", "ث": "ثاء", "ج": "جيم", "ح": "حاء", "خ": "خاء",
    "د": "دال", "ذ": "ذال", "ر": "راء", "ز": "زاي", "س": "سين", "ش": "شين",
    "ص": "صاد", "ض": "ضاد", "ط": "طاء", "ظ": "ظاء", "ع": "عين", "غ": "غين",
    "ف": "فاء", "ق": "قاف", "ك": "كاف", "ل": "لام", "م": "ميم", "ن": "نون",
    "ه": "هاء", "و": "واو", "ي": "ياء",
  };

  /* -------------------------------------------------------- التخزين */
  var progress = store.get("reading", {});
  if (!progress || typeof progress !== "object") progress = {};

  function stageState(id) {
    if (!progress[id] || typeof progress[id] !== "object") progress[id] = { done: [], quiz: null };
    if (!Array.isArray(progress[id].done)) progress[id].done = [];
    return progress[id];
  }

  function save() {
    store.set("reading", progress);
  }

  function cardsOf(stage) {
    if (stage.letters) {
      var h = HARAKA[stage.haraka] || HARAKA.fatha;
      return stage.letters.split("").map(function (letter) {
        return {
          text: letter + h.mark,
          sub: LETTER_NAMES[letter] || letter,
          kind: "letter",
        };
      });
    }
    return (stage.words || []).map(function (w) {
      return { text: w.text, split: w.split || [], kind: "word" };
    });
  }

  function stageDone(stage) {
    var st = progress[stage.id];
    var done = st && Array.isArray(st.done) ? st.done : [];
    var best = st && typeof st.quiz === "number" ? st.quiz : null;
    var cards = cardsOf(stage);
    var quiz = QUIZ[stage.id] || [];
    var allCards = cards.every(function (c) { return done.indexOf(c.text) !== -1; });
    var quizOK = quiz.length ? best !== null && best >= quiz.length - 1 : true;
    return allCards && quizOK;
  }

  /* -------------------------------------------------------- الصوت */
  var tts = {
    ready: false,
    voice: null,
    init: function () {
      if (!("speechSynthesis" in window)) return;
      var self = this;
      var load = function () {
        var vs = window.speechSynthesis.getVoices() || [];
        var ar = vs.filter(function (v) { return /^ar/i.test(v.lang); });
        self.voice = ar[0] || null;
        self.ready = !!self.voice;
        document.body.classList.toggle("has-tts", self.ready);
      };
      load();
      if (window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener("voiceschanged", load);
      } else {
        window.speechSynthesis.onvoiceschanged = load;
      }
    },
    say: function (text) {
      if (!this.ready) return false;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = this.voice.lang || "ar-SA";
        u.voice = this.voice;
        u.rate = 0.75;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  /* -------------------------------------------------------- عرض الكتل */
  function renderBlocks(blocks) {
    return (blocks || []).map(function (b) {
      switch (b.type) {
        case "p": return "<p>" + fmt(b.text) + "</p>";
        case "h3": return "<h3>" + fmt(b.text) + "</h3>";
        case "ul":
        case "ol":
          return "<" + b.type + ">" + b.items.map(function (i) { return "<li>" + fmt(i) + "</li>"; }).join("") + "</" + b.type + ">";
        case "table":
          return (
            '<div class="table-wrap"><table><thead><tr>' +
            b.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") +
            "</tr></thead><tbody>" +
            b.rows.map(function (row) {
              return "<tr>" + row.map(function (c) { return "<td>" + fmt(c) + "</td>"; }).join("") + "</tr>";
            }).join("") +
            "</tbody></table></div>"
          );
        case "note":
          return '<div class="note-box">' + (b.title ? "<strong>" + esc(b.title) + ":</strong> " : "") + fmt(b.text) + "</div>";
        case "example":
          return '<div class="example-box"><p>' + fmt(b.text) + "</p></div>";
        default:
          return "";
      }
    }).join("");
  }

  /* -------------------------------------------------------- الحالة */
  var view = { index: 0 };
  var quizState = {};

  function stageIndexById(id) {
    for (var i = 0; i < STAGES.length; i++) {
      if (STAGES[i].id === id) return i;
    }
    return -1;
  }

  function readHash() {
    var m = /stage=([\w-]+)/.exec(window.location.hash || "");
    return m ? m[1] : null;
  }

  function setHash(id) {
    try {
      window.history.replaceState({}, "", "#stage=" + id);
    } catch (e) { /* تجاهل */ }
  }

  /* -------------------------------------------------------- الملخّص */
  function renderSummary() {
    var host = $("[data-read-progress]");
    if (!host) return;
    var done = STAGES.filter(stageDone).length;
    var percent = STAGES.length ? Math.round((done / STAGES.length) * 100) : 0;
    host.innerHTML =
      '<div class="rp-text"><strong>أتممت ' + done + " من " + STAGES.length + " مراحل</strong>" +
      "<span>" + (done === STAGES.length ? "ما شاء الله، أكملت البرنامج كاملًا." : "أكمل البطاقات وأسئلة المرحلة لتُحتسب لك.") + "</span></div>" +
      '<div class="rp-bar" role="progressbar" aria-label="تقدّم البرنامج" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + percent + '%"></span></div>' +
      '<div class="rp-num">' + percent + "%</div>";
  }

  /* -------------------------------------------------------- شريط المراحل */
  function renderSteps() {
    var host = $("[data-read-steps]");
    if (!host) return;
    host.innerHTML = STAGES.map(function (stage, i) {
      var done = stageDone(stage);
      var cls = "step-pill" + (i === view.index ? " is-active" : "") + (done ? " is-done" : "");
      return (
        '<button type="button" class="' + cls + '" data-step="' + i + '" aria-current="' + (i === view.index ? "true" : "false") + '">' +
        '<span class="n">' + (done ? "✓" : i + 1) + "</span>" +
        "<span>" + esc(stage.title) + "</span></button>"
      );
    }).join("");

    $$("[data-step]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        view.index = +btn.getAttribute("data-step");
        renderStage();
        renderSteps();
        renderSummary();
        setHash(STAGES[view.index].id);
        scrollToPanel();
      });
    });
  }

  function scrollToPanel() {
    var panel = $("[data-read-stage]");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* -------------------------------------------------------- المرحلة */
  function renderStage() {
    var host = $("[data-read-stage]");
    if (!host || !STAGES.length) return;
    var stage = STAGES[view.index];
    var st = stageState(stage.id);
    var cards = cardsOf(stage);
    var questions = QUIZ[stage.id] || [];
    var isWord = cards.length && cards[0].kind === "word";

    var head =
      '<div class="stage-head">' +
      '<span class="eyebrow">المرحلة ' + (view.index + 1) + " من " + STAGES.length + "</span>" +
      "<h2>" + esc(stage.title) + "</h2>" +
      '<p class="stage-sub">' + esc(stage.subtitle) + "</p>" +
      '<div class="goal-box"><strong>' + icon("target") + " هدف المرحلة</strong><p>" + esc(stage.goal) + "</p></div>" +
      "</div>";

    var concept =
      '<div class="stage-section">' +
      '<h3 class="stage-section-title">' + icon("bookOpen") + " نشرح ونفهم</h3>" +
      renderBlocks(stage.concept) +
      "</div>";

    var cardList = cards.map(function (card) {
      var done = st.done.indexOf(card.text) !== -1;
      var inner =
        "<b>" + esc(card.text) + "</b>" +
        (card.kind === "letter"
          ? '<small class="card-sub">' + esc(card.sub) + "</small>"
          : '<small class="card-split">اقرأ ثم اضغط للتحقّق</small>');

      return (
        '<div class="read-card' + (done ? " is-done" : "") + '" data-card="' + esc(card.text) + '">' +
        '<button type="button" class="rc-main" data-read="' + esc(card.text) + '">' + inner + "</button>" +
        '<button type="button" class="rc-mark" data-mark="' + esc(card.text) + '" aria-pressed="' + (done ? "true" : "false") + '" aria-label="أتقنت ' + esc(card.text) + '">✓</button>' +
        "</div>"
      );
    }).join("");

    var doneCount = cards.filter(function (c) { return st.done.indexOf(c.text) !== -1; }).length;

    var drill =
      '<div class="stage-section" data-drill>' +
      '<div class="drill-head"><h3 class="stage-section-title">' + icon("lamp") + " تدريب القراءة</h3>" +
      '<span class="drill-count"><strong data-done-count>' + doneCount + "</strong> / " + cards.length + "</span></div>" +
      '<p class="drill-hint">' +
      (isWord
        ? "اقرأ الكلمة بصوت مسموع، ثم اضغط عليها لتظهر طريقة التقطيع. وإذا أتقنتها اضغط ✓."
        : "اقرأ الحرف بحركته بصوت مسموع، ثم اضغط ✓ إذا أتقنت نطقه.") +
      "</p>" +
      '<div class="read-grid' + (isWord ? " is-words" : "") + '" data-cards>' + cardList + "</div>" +
      '<div class="drill-actions">' +
      '<button type="button" class="btn btn-ghost btn-sm" data-mark-all>أتقنتها كلها</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-reset-cards>إعادة التدريب</button>' +
      (tts.ready ? '<span class="tts-note">' + icon("volume") + " اضغط على البطاقة لتسمع النطق</span>" : '<span class="tts-note">' + icon("info") + " لا يوجد صوت عربي في هذا المتصفح — اقرأ بصوتك أنت</span>") +
      "</div></div>";

    var quiz =
      questions.length
        ? '<div class="stage-section" data-stage-quiz>' +
          '<div class="drill-head"><h3 class="stage-section-title">' + icon("check") + " اختبر نفسك</h3>" +
          '<span class="drill-count">' + questions.length + " أسئلة</span></div>" +
          '<p class="drill-hint">أجب عن الأسئلة. تظهر الإجابة الصحيحة مع سببها بعد كل اختيار.</p>' +
          '<div class="quiz-list" data-quiz-list></div>' +
          '<div class="stage-quiz-result" data-quiz-result></div>' +
          "</div>"
        : "";

    var prev = view.index > 0 ? STAGES[view.index - 1] : null;
    var next = view.index < STAGES.length - 1 ? STAGES[view.index + 1] : null;

    var foot =
      '<div class="stage-foot">' +
      (prev
        ? '<button type="button" class="btn btn-ghost" data-goto="' + (view.index - 1) + '">' + icon("arrowLeft") + " " + esc(prev.title) + "</button>"
        : "<span></span>") +
      (next
        ? '<button type="button" class="btn btn-primary" data-goto="' + (view.index + 1) + '">' + esc(next.title) + " " + icon("arrow") + "</button>"
        : '<a class="btn btn-gold" href="exercises.html">' + icon("spark") + " انتقل إلى التمارين</a>") +
      "</div>";

    host.innerHTML = head + concept + drill + quiz + foot;

    bindCards(stage, cards);
    bindQuiz(stage, questions);
    $$("[data-goto]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        view.index = +btn.getAttribute("data-goto");
        renderStage();
        renderSteps();
        renderSummary();
        setHash(STAGES[view.index].id);
        scrollToPanel();
      });
    });
  }

  function bindCards(stage, cards) {
    var st = stageState(stage.id);
    var host = $("[data-cards]");
    if (!host) return;

    function refresh() {
      var doneCount = cards.filter(function (c) { return st.done.indexOf(c.text) !== -1; }).length;
      var counter = $("[data-done-count]");
      if (counter) counter.textContent = doneCount;
      save();
      renderSteps();
      renderSummary();
    }

    $$("[data-read]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-read");
        var card = btn.closest(".read-card");
        var cardData = cards.filter(function (c) { return c.text === text; })[0];
        var spoken = tts.say(text);
        if (cardData && cardData.kind === "word" && card) {
          var split = $(".card-split", btn);
          if (split) {
            if (card.classList.toggle("is-open")) {
              split.textContent = cardData.split.join(" — ");
            } else {
              split.textContent = "اقرأ ثم اضغط للتحقّق";
            }
          }
        }
        if (!spoken && !tts.ready) btn.classList.add("is-pulse");
        window.setTimeout(function () { btn.classList.remove("is-pulse"); }, 600);
      });
    });

    $$("[data-mark]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-mark");
        var card = btn.closest(".read-card");
        var i = st.done.indexOf(text);
        if (i === -1) {
          st.done.push(text);
          card.classList.add("is-done");
          btn.setAttribute("aria-pressed", "true");
        } else {
          st.done.splice(i, 1);
          card.classList.remove("is-done");
          btn.setAttribute("aria-pressed", "false");
        }
        refresh();
      });
    });

    var all = $("[data-mark-all]", host.parentNode);
    if (all) {
      all.addEventListener("click", function () {
        cards.forEach(function (c) {
          if (st.done.indexOf(c.text) === -1) st.done.push(c.text);
        });
        $$(".read-card", host).forEach(function (card) { card.classList.add("is-done"); });
        $$("[data-mark]", host).forEach(function (b) { b.setAttribute("aria-pressed", "true"); });
        refresh();
      });
    }

    var reset = $("[data-reset-cards]", host.parentNode);
    if (reset) {
      reset.addEventListener("click", function () {
        st.done = [];
        $$(".read-card", host).forEach(function (card) { card.classList.remove("is-done", "is-open"); });
        $$("[data-mark]", host).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        $$(".card-split", host).forEach(function (s) { s.textContent = "اقرأ ثم اضغط للتحقّق"; });
        refresh();
      });
    }
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function bindQuiz(stage, questions) {
    var host = $("[data-quiz-list]");
    if (!host || !questions.length) return;
    var st = stageState(stage.id);
    var total = questions.length;
    var answers = questions.map(function () { return null; });
    var order = questions.map(function (q) { return shuffle(q.options); });

    host.innerHTML = questions.map(function (q, qi) {
      return (
        '<div class="quiz-q" data-q="' + qi + '">' +
        '<div class="qq-head"><span class="qq-num">' + (qi + 1) + '</span><p class="qq-text">' + fmt(q.q) + "</p></div>" +
        '<div class="q-options">' +
        order[qi].map(function (opt, oi) {
          return '<button type="button" class="q-option" data-opt="' + oi + '"><span class="letter">' +
            ["أ", "ب", "ج", "د"][oi] + "</span><span>" + fmt(opt) + "</span></button>";
        }).join("") +
        "</div>" +
        '<div class="quiz-feedback" role="status"></div>' +
        "</div>"
      );
    }).join("");

    var result = $("[data-quiz-result]");

    function finish() {
      var correct = 0;
      questions.forEach(function (q, i) { if (answers[i] === true) correct += 1; });
      var pass = correct >= total - 1;
      if (st.quiz === null || correct > st.quiz) {
        st.quiz = correct;
        save();
      }
      if (result) {
        result.className = "stage-quiz-result is-visible" + (pass ? " ok" : "");
        result.innerHTML =
          "<strong>" + (pass ? "أحسنت، أتممت المرحلة" : "راجع ثم أعد المحاولة") + "</strong>" +
          "<span>نتيجتك: " + correct + " من " + total + (pass ? "" : " — تحتاج " + (total - 1) + " إجابات صحيحة على الأقل.") + "</span>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-retry-quiz>أعد الأسئلة</button>';
        var retry = $("[data-retry-quiz]", result);
        if (retry) {
          retry.addEventListener("click", function () {
            renderStage();
            renderSteps();
            renderSummary();
          });
        }
      }
      retryRefresh();
    }

    function retryRefresh() {
      renderSteps();
      renderSummary();
    }

    $$("[data-q]", host).forEach(function (block) {
      var qi = +block.getAttribute("data-q");
      var q = questions[qi];
      $$("[data-opt]", block).forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (answers[qi] !== null) return;
          var chosen = order[qi][+btn.getAttribute("data-opt")];
          var ok = chosen === q.options[q.answer];
          answers[qi] = ok;

          $$("[data-opt]", block).forEach(function (b) {
            b.disabled = true;
            var val = order[qi][+b.getAttribute("data-opt")];
            if (val === q.options[q.answer]) b.classList.add("is-correct");
          });
          if (!ok) btn.classList.add("is-wrong");

          var fb = $(".quiz-feedback", block);
          fb.className = "quiz-feedback is-visible " + (ok ? "ok" : "no");
          fb.innerHTML = "<strong>" + (ok ? "إجابة صحيحة" : "إجابة غير صحيحة") + "</strong>" + esc(q.explain);

          if (answers.every(function (a) { return a !== null; })) finish();
        });
      });
    });
  }

  /* -------------------------------------------------------- التشغيل */
  function initReading() {
    R.ICONS.volume = '<path d="M4 9h3l4-4v14l-4-4H4Z"/><path d="M16 8a5 5 0 0 1 0 8"/>';
    tts.init();

    var fromHash = readHash();
    var idx = fromHash ? stageIndexById(fromHash) : -1;
    view.index = idx >= 0 ? idx : 0;

    renderSummary();
    renderSteps();
    renderStage();
  }

  R.pages.reading = initReading;
})();
