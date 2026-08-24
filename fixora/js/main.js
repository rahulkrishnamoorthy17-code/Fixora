(function () {
  "use strict";

  var FXUI = {};

  FXUI.toast = function (message, type) {
    var host = document.querySelector(".fx-toast-container");
    if (!host) return;
    var icon = type === "success" ? "bi-check-circle-fill" : "bi-info-circle-fill";
    var el = document.createElement("div");
    el.className = "toast fx-toast " + (type || "info") + " align-items-center";
    el.setAttribute("role", "alert");
    el.innerHTML = '<div class="toast-body"><i class="bi ' + icon + '"></i>' + message + "</div>";
    host.appendChild(el);
    var t = new bootstrap.Toast(el, { delay: 3200 });
    t.show();
    el.addEventListener("hidden.bs.toast", function () { el.remove(); });
  };

  FXUI.toggleTheme = function () {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    document.documentElement.setAttribute("data-bs-theme", cur);
    try { localStorage.setItem("fx-theme", cur); } catch (e) {}
    syncThemeIcons();
  };

  FXUI.toggleRTL = function () {
    var cur = document.documentElement.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
    document.documentElement.setAttribute("dir", cur);
    try { localStorage.setItem("fx-dir", cur); } catch (e) {}
    var bsLink = document.getElementById("bs-css");
    if (bsLink && window.FIXORA_LAYOUT) {
      bsLink.href = cur === "rtl" ? FIXORA_LAYOUT.BS_CSS_RTL : FIXORA_LAYOUT.BS_CSS;
    }
    syncRtlLabel();
  };

  function syncThemeIcons() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll("#themeToggle i, [data-theme-toggle] i").forEach(function (i) {
      i.className = dark ? "bi bi-sun" : "bi bi-moon-stars";
    });
  }

  function syncRtlLabel() {
    var rtl = document.documentElement.getAttribute("dir") === "rtl";
    document.querySelectorAll("#rtlLabel, [data-rtl-toggle] span").forEach(function (s) { s.textContent = rtl ? "LTR" : "RTL"; });
    document.querySelectorAll("[data-rtl-toggle] .direction-icon, #rtlToggle .direction-icon").forEach(function (i) {
      i.className = "bi direction-icon " + (rtl ? "bi-text-left" : "bi-text-right");
    });
  }

  FXUI.reveal = function () {
    var els = document.querySelectorAll(".reveal:not(.revealed)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("revealed"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  };

  FXUI.counters = function () {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1800;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  };

  var STAGES = [
    { key: "confirmed", label: "Booking Confirmed", icon: "bi-check2" },
    { key: "assigned", label: "Technician Assigned", icon: "bi-person-check" },
    { key: "enroute", label: "Technician En Route", icon: "bi-scooter" },
    { key: "progress", label: "Repair In Progress", icon: "bi-wrench-adjustable" },
    { key: "done", label: "Completed", icon: "bi-emoji-smile" }
  ];

  FXUI.timelineHtml = function (stageIndex, horizontal, times) {
    var cls = horizontal ? "timeline tl-horizontal" : "timeline";
    return '<div class="' + cls + '">' + STAGES.map(function (s, i) {
      var state = i < stageIndex ? " done" : i === stageIndex ? " current" : " pending";
      var time = times && times[i] ? '<div class="tl-time">' + times[i] + "</div>" : "";
      return '<div class="tl-item' + state + '">' +
        '<div class="tl-dot"><i class="bi ' + s.icon + '"></i></div>' +
        '<div class="tl-title">' + s.label + "</div>" + time + "</div>";
    }).join("") + "</div>";
  };

  FXUI.pillForStage = function (stageIndex) {
    var map = ["confirmed", "assigned", "enroute", "progress", "done"];
    var labels = ["Booking Confirmed", "Technician Assigned", "En Route", "In Progress", "Completed"];
    return '<span class="status-pill ' + map[stageIndex] + '">' + labels[stageIndex] + "</span>";
  };

  FXUI.trackRepair = function (rawId, resultHost) {
    var id = (rawId || "").trim().toUpperCase();
    if (!id) {
      FXUI.toast("Please enter your repair ID.", "info");
      return false;
    }
    if (!/^FX-/i.test(id)) id = "FX-" + id.replace(/^#/, "");
    var seed = 0;
    for (var i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) >>> 0;
    var stage = seed % 5;
    var techs = [
      { name: "Daniel Reyes", exp: "8 yrs experience", rating: "4.9" },
      { name: "Marcus Chen", exp: "11 yrs experience", rating: "4.8" },
      { name: "Priya Natarajan", exp: "6 yrs experience", rating: "5.0" }
    ];
    var tech = techs[seed % techs.length];
    var appliances = ["Washing Machine • Samsung WW90T", "Refrigerator • LG InstaView", "AC Split Unit • Daikin 1.5T"];
    var app = appliances[seed % appliances.length];
    var eta = stage >= 4 ? "Completed" : stage === 2 ? "Arriving in ~25 min" : stage === 3 ? "On-site now" : "Scheduled visit window";
    var timesPool = ["Today, 9:12 AM", "Today, 9:40 AM", "Today, 10:15 AM", "Today, 10:48 AM", stage >= 4 ? "Today, 12:05 PM" : "Est. 12:05 PM"];
    var times = timesPool.slice(0, stage + 1);
    while (times.length < 5) times.push("");

    resultHost.innerHTML =
      '<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">' +
      '<div><span class="eyebrow mb-2">Repair ID: ' + id + "</span>" +
      '<h5 class="mb-0 mt-2">' + app + "</h5></div>" + FXUI.pillForStage(stage) + "</div>" +
      FXUI.timelineHtml(stage, false, times) +
      '<hr style="border-color:var(--fx-border)">' +
      '<div class="tech-panel mb-3">' +
      '<span class="avatar">' + tech.name.split(" ").map(function (w) { return w[0]; }).join("") + "</span>" +
      "<div><div class='tp-name'>" + tech.name + '</div><div class="tp-meta"><i class="bi bi-star-fill text-warning"></i> ' + tech.rating + " · " + tech.exp + " · Certified Pro</div></div>" +
      '<div class="ms-auto text-end d-none d-sm-block"><span class="badge-soft blue"><i class="bi bi-telephone me-1"></i>Call Tech</span></div></div>' +
      '<div class="info-grid">' +
      '<div class="info-cell"><div class="ic-label">Visit Window</div><div class="ic-value">10 AM – 1 PM</div></div>' +
      '<div class="info-cell"><div class="ic-label">ETA</div><div class="ic-value">' + eta + "</div></div>" +
      '<div class="info-cell"><div class="ic-label">Address</div><div class="ic-value">221B Maple Street, Austin</div></div>' +
      '<div class="info-cell"><div class="ic-label">Issue</div><div class="ic-value">Not powering on</div></div>' +
      "</div>" +
      (stage === 4
        ? '<div class="mt-3 d-flex flex-wrap gap-2"><a href="dashboard.html#history" class="btn btn-gradient btn-sm"><i class="bi bi-receipt me-1"></i>View Invoice</a><a href="#" class="btn btn-outline-glow btn-sm book-open-btn"><i class="bi bi-arrow-repeat me-1"></i>Book Again</a></div>'
        : "") ;
    return true;
  };

  FXUI.bindTrackForms = function () {
    document.querySelectorAll(".track-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input");
        var section = form.closest(".track-widget") || form.parentElement;
        var result = section.querySelector(".track-result");
        if (FXUI.trackRepair(input.value, result)) {
          input.value = "";
          result.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });
    document.querySelectorAll(".track-hint code").forEach(function (c) {
      c.addEventListener("click", function () {
        var form = c.closest(".track-widget")?.querySelector(".track-form") || document.querySelector(".track-form");
        if (form) {
          form.querySelector("input").value = c.textContent;
          form.dispatchEvent(new Event("submit", { cancelable: true }));
        }
      });
    });
  };

  FXUI.bindFakeForms = function () {
    document.querySelectorAll("form[data-demo-submit]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          FXUI.toast("Please fill in all required fields.", "info");
          return;
        }
        var msg = form.getAttribute("data-demo-submit") || form.getAttribute("data-success") || "Submitted successfully!";
        FXUI.toast(msg, "success");
        if (form.hasAttribute("data-reset-on-send")) form.reset();
        form.classList.remove("was-validated");
        var target = form.getAttribute("data-demo-redirect");

        var urlParams = new URLSearchParams(window.location.search);
        var redirectParam = urlParams.get("redirect");
        if (redirectParam) {
           target = redirectParam;
        }

        if (target) {
          if (target.indexOf("dashboard.html") !== -1) {
            var emailEl = form.querySelector('input[type="email"]');
            var firstEl = form.querySelector('#regFirst');
            var lastEl = form.querySelector('#regLast');
            var name = [firstEl && firstEl.value, lastEl && lastEl.value].filter(Boolean).join(" ").trim();
            var email = emailEl ? emailEl.value.trim() : "";
            if (!name && email) name = email.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,function(c){return c.toUpperCase();});
            try { localStorage.setItem("fx-user", JSON.stringify({name:name || "Fixora Customer", email:email || "customer@fixora.com"})); } catch (err) {}
          }
          setTimeout(function () { window.location.href = target; }, 700);
          return;
        }
        var doneSel = form.getAttribute("data-show-after");
        if (doneSel) {
          var done = document.querySelector(doneSel);
          if (done) {
            done.classList.remove("d-none");
            done.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
    });

    document.querySelectorAll(".fx-newsletter").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input[type=email]");
        if (!input.value || !/^\S+@\S+\.\S+$/.test(input.value)) {
          FXUI.toast("Enter a valid email address.", "info");
          return;
        }
        FXUI.toast("Subscribed! Welcome to the Fixora newsletter.", "success");
        input.value = "";
      });
    });
  };

  FXUI.initBookingModal = function () {
    var bm = document.getElementById("bookingModal");
    if (!bm) return;

    var currentStep = 1;
    var totalSteps = 7;

    function getVal(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }

    function updateStepUI() {
      bm.querySelectorAll(".bk-panel").forEach(function(p) {
        var s = parseInt(p.getAttribute("data-panel"));
        p.classList.toggle("d-none", s !== currentStep);
        p.classList.toggle("active", s === currentStep);
      });
      bm.querySelectorAll(".bk-step-dot").forEach(function(dot) {
        var s = parseInt(dot.getAttribute("data-step"));
        if (s < currentStep) {
          dot.style.background = "rgba(16,185,129,.15)";
          dot.style.borderColor = "#10b981";
          dot.style.color = "#10b981";
          dot.innerHTML = '<i class="bi bi-check" style="font-size:.7rem"></i>';
        } else if (s === currentStep) {
          dot.style.background = "linear-gradient(135deg,#2e6bff,#00d4ff)";
          dot.style.borderColor = "transparent";
          dot.style.color = "#fff";
          dot.textContent = s;
        } else {
          dot.style.background = "var(--fx-surface-2)";
          dot.style.borderColor = "var(--fx-border)";
          dot.style.color = "var(--fx-muted)";
          dot.textContent = s;
        }
      });
      var prevBtn = document.getElementById("bkPrev");
      var nextBtn = document.getElementById("bkNext");
      if (prevBtn) prevBtn.classList.toggle("d-none", currentStep <= 1 || currentStep === 7);
      if (nextBtn) {
        if (currentStep === 6) nextBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Confirm Booking';
        else if (currentStep === 7) nextBtn.classList.add("d-none");
        else nextBtn.innerHTML = 'Next <i class="bi bi-arrow-right ms-1"></i>';
        nextBtn.classList.toggle("d-none", currentStep === 7);
      }

      if (currentStep === 6) buildReview();
    }

    function buildReview() {
      var host = document.getElementById("bkReview");
      if (!host) return;
      var fields = [
        {label: "Appliance", val: getVal("bkAppliance")},
        {label: "Brand", val: getVal("bkBrand") || "Not specified"},
        {label: "Name", val: getVal("bkName")},
        {label: "Phone", val: getVal("bkPhone")},
        {label: "Address", val: [getVal("bkAddress"), getVal("bkCity"), getVal("bkZip")].filter(Boolean).join(", ")},
        {label: "Date", val: getVal("bkDate")},
        {label: "Time Slot", val: getVal("bkSlot")},
        {label: "Visit Type", val: getVal("bkType")},
        {label: "Issue", val: getVal("bkIssue") || "Not described"}
      ];
      host.innerHTML = fields.map(function(f) {
        return '<div class="col-md-6"><div class="review-block"><div class="rb-label">' + f.label + '</div><div class="rb-value">' + (f.val || '—') + '</div></div></div>';
      }).join("");
    }

    function validateStep(step) {
      if (step === 1) {
        if (!getVal("bkAppliance")) { FXUI.toast("Please select an appliance.", "info"); return false; }
      } else if (step === 2) {
        if (!getVal("bkName")) { FXUI.toast("Please enter your name.", "info"); return false; }
        if (!getVal("bkPhone")) { FXUI.toast("Please enter a phone number.", "info"); return false; }
      } else if (step === 3) {
        if (!getVal("bkAddress") || !getVal("bkCity")) { FXUI.toast("Please enter a complete address.", "info"); return false; }
      } else if (step === 4) {
        if (!getVal("bkDate") || !getVal("bkSlot")) { FXUI.toast("Please select a date and time slot.", "info"); return false; }
      } else if (step === 5) {
        if (!getVal("bkIssue")) { FXUI.toast("Please describe the issue.", "info"); return false; }
      }
      return true;
    }

    function confirmBooking() {
      var id = "FX-" + Math.floor(1000 + Math.random() * 9000);
      var el = document.getElementById("bkConfirmId");
      if (el) el.textContent = id;
      currentStep = 7;
      updateStepUI();
      FXUI.toast("Repair booked — ID " + id, "success");
    }

    document.addEventListener("click", function(e) {
      /* Appliance chip buttons */
      var appBtn = e.target.closest(".bk-app-btn");
      if (appBtn) {
        bm.querySelectorAll(".bk-app-btn").forEach(function(b) { b.classList.remove("active"); });
        appBtn.classList.add("active");
        var inp = document.getElementById("bkAppliance");
        if (inp) inp.value = appBtn.getAttribute("data-app");
        /* also sync homepage appliance selector */
        var info = document.querySelector(".app-chip-info");
        if (info) info.innerHTML = '<i class="bi bi-info-circle text-primary"></i><strong>' + appBtn.getAttribute("data-app") + '</strong>';
      }

      /* Homepage appliance chips */
      var homeChip = e.target.closest(".app-chip[data-appliance]");
      if (homeChip) {
        document.querySelectorAll(".app-chip").forEach(function(c) { c.classList.remove("active"); });
        homeChip.classList.add("active");
        var sel = document.getElementById("bkAppliance");
        if (sel) sel.value = homeChip.getAttribute("data-appliance");
        var inf = document.querySelector(".app-chip-info");
        if (inf) inf.innerHTML = homeChip.getAttribute("data-info") || "";
      }

      /* Visit type buttons */
      var typeBtn = e.target.closest(".bk-type-btn");
      if (typeBtn && bm.contains(typeBtn)) {
        bm.querySelectorAll(".bk-type-btn").forEach(function(b) { b.classList.remove("active"); });
        typeBtn.classList.add("active");
        var ti = document.getElementById("bkType");
        if (ti) ti.value = typeBtn.getAttribute("data-type");
      }

      /* Quick issue chips */
      var qi = e.target.closest(".bk-quick-issue");
      if (qi) {
        var ta = document.getElementById("bkIssue");
        if (ta) ta.value = ta.value ? ta.value + ". " + qi.textContent : qi.textContent;
      }

      /* Next button */
      if (e.target.id === "bkNext" || e.target.closest("#bkNext")) {
        if (currentStep < 6) {
          if (!validateStep(currentStep)) return;
          currentStep++;
          updateStepUI();
        } else if (currentStep === 6) {
          confirmBooking();
        }
      }

      /* Prev button */
      if (e.target.id === "bkPrev" || e.target.closest("#bkPrev")) {
        if (currentStep > 1) { currentStep--; updateStepUI(); }
      }
    });

    /* Set date min */
    bm.addEventListener("shown.bs.modal", function() {
      var d = document.getElementById("bkDate");
      if (d) {
        var now = new Date();
        d.min = now.toISOString().split("T")[0];
        now.setDate(now.getDate() + 30);
        d.max = now.toISOString().split("T")[0];
      }
    });

    /* Reset on close */
    bm.addEventListener("hidden.bs.modal", function() {
      currentStep = 1;
      var form = document.getElementById("bookingForm");
      if (form) form.reset();
      bm.querySelectorAll(".bk-app-btn, .bk-type-btn").forEach(function(b) { b.classList.remove("active"); });
      var firstTypeBtn = bm.querySelector(".bk-type-btn[data-type='Standard Visit']");
      if (firstTypeBtn) firstTypeBtn.classList.add("active");
      updateStepUI();
    });

    updateStepUI();
  };

  FXUI.initTestimonialSlider = function () {
    document.querySelectorAll("[data-slider]").forEach(function (root) {
      var track = root.querySelector(".slider-track");
      var slides = root.querySelectorAll(".slider-slide");
      var dotsHost = root.querySelector(".slider-dots");
      if (!track || !slides.length) return;
      var perView = window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1;
      var pages = Math.ceil(slides.length / perView);
      var current = 0;

      function render() {
        perView = window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        pages = Math.ceil(slides.length / perView);
        if (current >= pages) current = pages - 1;
        var w = 100 / perView;
        slides.forEach(function (s) {
          s.style.flex = "0 0 " + w + "%";
          s.style.maxWidth = w + "%";
        });
        if (dotsHost) {
          dotsHost.innerHTML = "";
          for (var i = 0; i < pages; i++) {
            var b = document.createElement("button");
            b.type = "button";
            b.setAttribute("aria-label", "Slide " + (i + 1));
            if (i === current) b.classList.add("active");
            b.addEventListener("click", (function (idx) { return function () { go(idx); }; })(i));
            dotsHost.appendChild(b);
          }
        }
        go(current, true);
      }

      function go(idx, silent) {
        current = idx;
        var container = root.querySelector(".slider-viewport");
        var offset = container ? container.offsetWidth * idx : 0;
        track.style.transition = silent ? "none" : "transform .55s cubic-bezier(.22,.61,.36,1)";
        track.style.transform = "translateX(-" + offset + "px)";
        if (dotsHost) dotsHost.querySelectorAll("button").forEach(function (b, i) {
          b.classList.toggle("active", i === idx);
        });
      }

      window.addEventListener("resize", render);
      render();

      var prev = root.querySelector("[data-prev]");
      var next = root.querySelector("[data-next]");
      if (prev) prev.addEventListener("click", function () { go((current - 1 + pages) % pages); });
      if (next) next.addEventListener("click", function () { go((current + 1) % pages); });
    });
  };

  FXUI.initBlogFilter = function () {
    var search = document.getElementById("blogSearch");
    var chips = document.querySelectorAll(".blog-filter .chip");
    if (!search && !chips.length) return;
    var cards = document.querySelectorAll("[data-blog-card]");
    var activeCat = "all";

    function apply() {
      var q = (search ? search.value : "").toLowerCase().trim();
      var shown = 0;
      var grid = cards.length ? cards[0].parentElement : null;
      
      if (grid) {
        grid.style.transition = "opacity 0.3s ease";
        grid.style.opacity = "0";
      }

      setTimeout(function() {
        cards.forEach(function (card) {
          var cat = card.getAttribute("data-cat") || "";
          var text = card.textContent.toLowerCase();
          var match = (activeCat === "all" || cat === activeCat) && (!q || text.indexOf(q) !== -1);
          card.classList.toggle("d-none", !match);
          if (match) shown++;
        });
        
        var empty = document.getElementById("blogEmpty");
        if (empty) empty.classList.toggle("d-none", shown > 0);
        
        if (grid) {
          grid.style.opacity = "1";
        }
      }, grid ? 300 : 0);
    }

    if (search) search.addEventListener("input", apply);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        activeCat = chip.getAttribute("data-cat");
        apply();
      });
    });
  };

  FXUI.initPricingToggle = function () {
    var toggle = document.getElementById("priceModeToggle");
    if (!toggle) return;
    toggle.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        toggle.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var express = btn.getAttribute("data-mode") === "express";
        document.querySelectorAll("[data-price-standard]").forEach(function (el) {
          var std = el.getAttribute("data-std") || el.textContent;
          var exp = el.getAttribute("data-exp") || std;
          el.textContent = express ? exp : std;
        });
        document.querySelectorAll("[data-inspection]").forEach(function (el) {
          var std = el.getAttribute("data-insp-std") || el.textContent;
          var exp = el.getAttribute("data-insp-exp") || std;
          el.textContent = express ? exp : std;
        });
        var note = document.getElementById("pricingModeNote");
        if (note) note.textContent = express
          ? "Express mode: priority dispatch, technician within 90 minutes (+30%)."
          : "Standard mode: same-day or next-day visits at regular rates.";
      });
    });
  };

  FXUI.initStarWidgets = function () {
    document.querySelectorAll(".star-rating[data-target-input]").forEach(function (widget) {
      var buttons = widget.querySelectorAll("button");
      var input = document.getElementById(widget.getAttribute("data-target-input"));
      buttons.forEach(function (btn, i) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b, j) { b.classList.toggle("on", j <= i); });
          if (input) input.value = i + 1;
        });
      });
    });
  };

  FXUI.initBackToTop = function () {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      btn.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  };

  FXUI.initNavScroll = function () {
    var nav = document.getElementById("mainNav");
    if (!nav) return;
    var update = function () { nav.classList.toggle("scrolled", window.scrollY > 24); };
    window.addEventListener("scroll", update, { passive: true });
    update();
  };

  FXUI.initCountdown = function () {
    var root = document.getElementById("countdown");
    if (!root) return;
    var target = new Date();
    target.setDate(target.getDate() + 21);
    target.setHours(9, 0, 0, 0);
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    function tick() {
      var diff = Math.max(0, target - new Date());
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff % 86400000 / 3600000);
      var m = Math.floor(diff % 3600000 / 60000);
      var s = Math.floor(diff % 60000 / 1000);
      var set = function (id, v) { var el = root.querySelector(id); if (el) el.textContent = pad(v); };
      set(".cu-days", d); set(".cu-hours", h); set(".cu-mins", m); set(".cu-secs", s);
    }
    tick();
    setInterval(tick, 1000);
  };

  document.addEventListener("DOMContentLoaded", function () {
    syncThemeIcons();
    syncRtlLabel();
    FXUI.initNavScroll();
    FXUI.reveal();
    FXUI.counters();
    FXUI.bindTrackForms();
    FXUI.bindFakeForms();
    FXUI.initBookingModal();
    FXUI.initTestimonialSlider();
    FXUI.initBlogFilter();
    FXUI.initPricingToggle();
    FXUI.initStarWidgets();
    FXUI.initBackToTop();
    FXUI.initCountdown();
  });

  window.FXUI = FXUI;
})();
