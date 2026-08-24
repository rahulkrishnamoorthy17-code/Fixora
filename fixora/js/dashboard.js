(function () {
  "use strict";

  var KEY = "fx-dashboard";
  var store = null;

  function uid(prefix) {
    return prefix + "-" + Math.floor(1000 + Math.random() * 9000);
  }

  function money(n) {
    return "$" + n.toFixed(2);
  }

  function defaults() {
    return {
      profile: {
        name: "Jordan Smith",
        email: "jordan.smith@example.com",
        phone: "+1 (512) 555-0177",
        plan: "Fixora Care+"
      },
      addresses: [
        { id: "adr-1", tag: "Home", line: "221B Maple Street, Apt 4", city: "Austin, TX 78702", def: true },
        { id: "adr-2", tag: "Office", line: "88 Congress Avenue, Floor 12", city: "Austin, TX 78701", def: false }
      ],
      repairs: [
        {
          id: "FX-4821", appliance: "Washing Machine", brand: "Samsung", model: "WW90T554D",
          issue: "Drum not spinning during cycle, loud humming noise.",
          address: "221B Maple Street, Apt 4, Austin, TX 78702",
          date: isoOffset(0), slot: "10 AM – 1 PM", stage: 2,
          tech: { name: "Daniel Reyes", rating: "4.9", exp: "8 yrs experience" }
        },
        {
          id: "FX-7350", appliance: "Air Conditioner", brand: "Daikin", model: "FTKF1.5T",
          issue: "Cooling weak, outdoor fan not starting reliably.",
          address: "88 Congress Avenue, Floor 12, Austin, TX 78701",
          date: isoOffset(2), slot: "2 PM – 5 PM", stage: 1,
          tech: { name: "Priya Natarajan", rating: "5.0", exp: "6 yrs experience" }
        },
        {
          id: "FX-2914", appliance: "Refrigerator", brand: "LG", model: "InstaView LFXS26",
          issue: "Freezer frosting heavily, fridge section warm.",
          address: "221B Maple Street, Apt 4, Austin, TX 78702",
          date: isoOffset(-9), slot: "11 AM – 2 PM", stage: 4,
          tech: { name: "Marcus Chen", rating: "4.8", exp: "11 yrs experience" },
          notes: "Defrost heater element had burned out and the evaporator was iced solid. Replaced heater and defrost thermostat, manually defrosted coil, verified temperatures across three cycles. Advised keeping door seals clean.",
          parts: [{ name: "Defrost heater element (OEM)", cost: 42 }, { name: "Defrost thermostat", cost: 18 }],
          labour: 89
        },
        {
          id: "FX-1187", appliance: "Microwave", brand: "Panasonic", model: "NN-SN686S",
          issue: "Sparking inside cavity during operation.",
          address: "221B Maple Street, Apt 4, Austin, TX 78702",
          date: isoOffset(-24), slot: "5 PM – 8 PM", stage: 4,
          tech: { name: "Marcus Chen", rating: "4.8", exp: "11 yrs experience" },
          notes: "Waveguide cover carbonised by grease build-up causing arcing. Replaced mica waveguide cover, deep-cleaned cavity, tested leakage levels — well within safety limits.",
          parts: [{ name: "Mica waveguide cover", cost: 12 }],
          labour: 49
        },
        {
          id: "FX-0642", appliance: "Television", brand: "Sony", model: "X90L 65\"",
          issue: "No picture, audio working, standby light blinking 6 times.",
          address: "88 Congress Avenue, Floor 12, Austin, TX 78701",
          date: isoOffset(-38), slot: "10 AM – 1 PM", stage: 4,
          tech: { name: "Priya Natarajan", rating: "5.0", exp: "6 yrs experience" },
          notes: "Blink code traced to backlight driver. Two LED strips had failed on the left array. Replaced full OEM strip set, diffusers reseated, brightness uniformity verified.",
          parts: [{ name: "LED backlight strip set (OEM)", cost: 68 }],
          labour: 79
        }
      ],
      tickets: [
        { id: "TIC-2201", subject: "Reschedule request for FX-7350", msg: "Could we move Friday's AC visit to the afternoon slot?", when: "Yesterday, 4:20 PM", reply: "Done! Moved to 2–5 PM. Confirmation SMS sent." }
      ]
    };
  }

  function isoOffset(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  function prettyDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { store = JSON.parse(raw); return; }
    } catch (e) {}
    store = defaults();
    save();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function totals(r) {
    var parts = (r.parts || []).reduce(function (s, p) { return s + p.cost; }, 0);
    var sub = (r.labour || 0) + parts;
    var tax = Math.round(sub * 8) / 100;
    return { parts: parts, sub: sub, tax: tax, total: sub + tax };
  }

  var TITLES = {
    overview: "Dashboard Overview",
    new: "New Repair Request",
    active: "Active Repairs",
    history: "Repair History",
    invoices: "Invoices",
    addresses: "Saved Addresses",
    profile: "My Profile",
    support: "Support Center"
  };

  function showSection(id) {
    if (!TITLES[id]) id = "overview";
    document.querySelectorAll(".dash-section").forEach(function (s) {
      s.classList.toggle("d-none", s.id !== "sec-" + id);
    });
    document.querySelectorAll(".dash-nav a[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === id);
    });
    var title = document.getElementById("dashTitle");
    if (title) title.textContent = TITLES[id];
    closeSidebar();
    if (id === "active") renderActive();
    if (id === "history") renderHistory();
    if (id === "invoices") renderInvoices();
    if (id === "addresses") renderAddresses();
    if (id === "overview") renderOverview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function currentSection() {
    var visible = document.querySelector(".dash-section:not(.d-none)");
    return visible ? visible.id.replace("sec-", "") : "overview";
  }

  function renderOverview() {
    var host = document.getElementById("ovNext");
    if (!host) return;
    var actives = store.repairs.filter(function (r) { return r.stage < 4; });
    var done = store.repairs.filter(function (r) { return r.stage === 4; });
    var spent = done.reduce(function (s, r) { return s + totals(r).total; }, 0);
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    set("kpiActive", actives.length);
    set("kpiDone", done.length);
    set("kpiSpent", money(spent));
    set("kpiPlan", store.profile.plan);
    var badge = document.getElementById("navActiveCount");
    if (badge) { badge.textContent = actives.length; badge.classList.toggle("d-none", !actives.length); }

    if (!actives.length) {
      host.innerHTML = '<p class="mb-3" style="color:var(--fx-muted)">No upcoming visits. Book your next repair below.</p>' +
        '<button class="btn btn-gradient" data-goto="new"><i class="bi bi-plus-circle me-2"></i>New Repair Request</button>';
    } else {
      var n = actives[0];
      host.innerHTML =
        '<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">' +
        "<div><strong>" + esc(n.appliance) + " · " + esc(n.brand) + "</strong>" +
        '<div style="font-size:.85rem;color:var(--fx-muted)">ID ' + esc(n.id) + " · " + prettyDate(n.date) + " · " + esc(n.slot) + "</div></div>" +
        FXUI.pillForStage(n.stage) + "</div>" +
        FXUI.timelineHtml(n.stage, false) +
        '<div class="tech-panel mt-3"><span class="avatar">' + initials(n.tech.name) + "</span>" +
        "<div><div class='tp-name'>" + esc(n.tech.name) + '</div><div class="tp-meta"><i class="bi bi-star-fill text-warning"></i> ' + n.tech.rating + " · " + esc(n.tech.exp) + "</div></div>" +
        '<span class="badge-soft green ms-auto"><i class="bi bi-telephone me-1"></i>Call Tech</span></div>';
    }

    var feed = document.getElementById("ovActivity");
    if (feed) {
      var items = [];
      store.repairs.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5).forEach(function (r) {
        var icon = r.stage === 4 ? "bi-check-circle-fill text-success" : "bi-arrow-repeat text-primary";
        var label = r.stage === 4 ? "completed · invoice ready" : "in progress · stage " + (r.stage + 1) + " of 5";
        items.push('<li class="d-flex gap-3 align-items-start py-2 border-bottom" style="border-color:var(--fx-border)!important">' +
          '<i class="bi ' + icon + ' mt-1"></i><div><strong style="font-size:.92rem">' + esc(r.appliance) + " (" + esc(r.id) + ")</strong>" +
          '<div style="font-size:.82rem;color:var(--fx-muted)">' + prettyDate(r.date) + " · " + label + "</div></div></li>");
      });
      feed.innerHTML = items.join("");
    }
  }

  function initials(name) {
    return String(name || "?").split(" ").map(function (w) { return w[0] || ""; }).join("").toUpperCase().slice(0, 2);
  }

  function renderActive() {
    var host = document.getElementById("activeList");
    if (!host) return;
    var actives = store.repairs.filter(function (r) { return r.stage < 4; });
    var badge = document.getElementById("navActiveCount");
    if (badge) { badge.textContent = actives.length; badge.classList.toggle("d-none", !actives.length); }
    if (!actives.length) {
      host.innerHTML = '<div class="text-center py-5"><span class="icon-box round mx-auto mb-3"><i class="bi bi-inbox"></i></span>' +
        '<h5>No Active Repairs</h5><p style="color:var(--fx-muted)">Everything you book will appear here with live tracking.</p>' +
        '<button class="btn btn-gradient" data-goto="new"><i class="bi bi-plus-circle me-2"></i>Book a Repair</button></div>';
      return;
    }
    host.innerHTML = actives.map(function (r) {
      var times = [];
      for (var i = 0; i <= r.stage; i++) times.push(i === 0 ? prettyDate(r.date) : "");
      while (times.length < 5) times.push("");
      return '<div class="dash-card mb-4">' +
        '<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">' +
        "<div><span class=\"eyebrow mb-1\">" + esc(r.id) + "</span><h5 class=\"mb-0 mt-1\">" + esc(r.appliance) + " · " + esc(r.brand) + " " + esc(r.model) + "</h5></div>" +
        FXUI.pillForStage(r.stage) + "</div>" +
        '<p style="color:var(--fx-muted);font-size:.92rem"><i class="bi bi-chat-left-text me-2 text-primary"></i>' + esc(r.issue) + "</p>" +
        FXUI.timelineHtml(r.stage, false, times) +
        '<div class="info-grid mt-3">' +
        '<div class="info-cell"><div class="ic-label">Visit Date</div><div class="ic-value">' + prettyDate(r.date) + "</div></div>" +
        '<div class="info-cell"><div class="ic-label">Window</div><div class="ic-value">' + esc(r.slot) + "</div></div>" +
        '<div class="info-cell"><div class="ic-label">Address</div><div class="ic-value">' + esc(r.address) + "</div></div>" +
        '<div class="info-cell"><div class="ic-label">Technician</div><div class="ic-value">' + esc(r.tech.name) + "</div></div>" +
        "</div>" +
        '<div class="d-flex flex-wrap gap-2 mt-3"><span class="badge-soft blue"><i class="bi bi-telephone me-1"></i>Call Technician</span>' +
        '<span class="badge-soft gray"><i class="bi bi-chat-dots me-1"></i>Message</span>' +
        '<button class="btn btn-outline-glow btn-sm ms-auto" data-cancel="' + esc(r.id) + '"><i class="bi bi-x-circle me-1"></i>Cancel Request</button></div>' +
        "</div>";
    }).join("");
  }

  function invoiceLines(r) {
    var t = totals(r);
    var rows = (r.parts || []).map(function (p) {
      return '<div class="invoice-line"><span>' + esc(p.name) + "</span><span>" + money(p.cost) + "</span></div>";
    }).join("");
    return '<div class="invoice-line"><span>Labour charge</span><span>' + money(r.labour) + "</span></div>" + rows +
      '<div class="invoice-line"><span>Tax (8%)</span><span>' + money(t.tax) + "</span></div>" +
      '<div class="invoice-line total"><span>Total Paid</span><span>' + money(t.total) + "</span></div>";
  }

  function renderHistory() {
    var host = document.getElementById("historyList");
    if (!host) return;
    var done = store.repairs.filter(function (r) { return r.stage === 4; });
    if (!done.length) {
      host.innerHTML = '<p class="mb-0" style="color:var(--fx-muted)">Completed repairs will appear here with full service reports.</p>';
      return;
    }
    host.innerHTML = done.map(function (r) {
      var rating = store.ratings && store.ratings[r.id] ? store.ratings[r.id] : 0;
      var stars = "";
      for (var i = 1; i <= 5; i++) stars += '<button type="button" data-star="' + i + '" data-rate-id="' + esc(r.id) + '" class="' + (i <= rating ? "on" : "") + '"><i class="bi bi-star-fill"></i></button>';
      return '<div class="dash-card mb-4">' +
        '<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">' +
        "<div><span class=\"eyebrow mb-1\">" + esc(r.id) + " · " + prettyDate(r.date) + "</span>" +
        '<h5 class="mb-0 mt-1">' + esc(r.appliance) + " · " + esc(r.brand) + " " + esc(r.model) + "</h5></div>" +
        '<span class="badge-soft green"><i class="bi bi-check-lg me-1"></i>Completed</span></div>' +
        '<div class="tech-panel mb-3"><span class="avatar">' + initials(r.tech.name) + "</span>" +
        "<div><div class='tp-name'>" + esc(r.tech.name) + '</div><div class="tp-meta"><i class="bi bi-star-fill text-warning"></i> ' + r.tech.rating + " · " + esc(r.tech.exp) + "</div></div></div>" +
        '<h6 class="mb-2"><i class="bi bi-journal-text me-2 text-primary"></i>Technician Notes</h6>' +
        '<p style="font-size:.93rem;color:var(--fx-text)">' + esc(r.notes) + "</p>" +
        '<h6 class="mb-2"><i class="bi bi-gear me-2 text-primary"></i>Parts Replaced</h6>' +
        ((r.parts || []).length ? '<ul class="check-list mb-3">' + r.parts.map(function (p) {
          return "<li><i class='bi bi-check-circle-fill'></i>" + esc(p.name) + " — " + money(p.cost) + "</li>";
        }).join("") + "</ul>" : '<p style="color:var(--fx-muted);font-size:.9rem">No parts replaced.</p>') +
        '<div class="review-block mb-3"><div class="rb-label">Invoice Breakdown</div>' + invoiceLines(r) + "</div>" +
        '<div class="d-flex flex-wrap align-items-center gap-2 mt-3">' +
        '<button class="btn btn-gradient btn-sm" data-print="' + esc(r.id) + '"><i class="bi bi-download me-1"></i>Download Invoice</button>' +
        '<button class="btn btn-outline-glow btn-sm" data-bookagain="' + esc(r.id) + '"><i class="bi bi-arrow-repeat me-1"></i>Book Again</button>' +
        '<div class="ms-auto d-flex align-items-center gap-2"><span style="font-size:.85rem;color:var(--fx-muted)">Rate this repair:</span>' +
        '<span class="star-rating" dir="ltr">' + stars + "</span></div></div>" +
        "</div>";
    }).join("");
  }

  function renderInvoices() {
    var host = document.getElementById("invoiceRows");
    if (!host) return;
    var done = store.repairs.filter(function (r) { return r.stage === 4; });
    if (!done.length) {
      host.innerHTML = '<tr><td colspan="5" class="text-center py-4" style="color:var(--fx-muted)">No invoices yet.</td></tr>';
      return;
    }
    host.innerHTML = done.map(function (r) {
      var t = totals(r);
      return "<tr>" +
        '<td><strong>' + esc(r.id) + "</strong></td>" +
        "<td>" + prettyDate(r.date) + "</td>" +
        "<td>" + esc(r.appliance) + " · " + esc(r.brand) + "</td>" +
        "<td><strong>" + money(t.total) + "</strong></td>" +
        '<td class="text-end"><button class="btn btn-outline-glow btn-sm me-1" data-print="' + esc(r.id) + '"><i class="bi bi-eye me-1"></i>View</button>' +
        '<button class="btn btn-gradient btn-sm" data-print="' + esc(r.id) + '"><i class="bi bi-download"></i></button></td>' +
        "</tr>";
    }).join("");
  }

  function renderAddresses() {
    var host = document.getElementById("addressGrid");
    if (!host) return;
    host.innerHTML = store.addresses.map(function (a) {
      return '<div class="col-md-6"><div class="address-card">' +
        '<span class="ac-tag badge-soft ' + (a.def ? "green" : "gray") + '">' + (a.def ? "Default" : esc(a.tag)) + "</span>" +
        "<h6><i class=\"bi " + (a.tag === "Home" ? "bi-house-heart" : a.tag === "Office" ? "bi-briefcase" : "bi-geo-alt") + " me-2 text-primary\"></i>" + esc(a.tag) + "</h6>" +
        "<p>" + esc(a.line) + "<br>" + esc(a.city) + "</p>" +
        '<div class="d-flex gap-2">' +
        (a.def ? "" : '<button class="btn btn-outline-glow btn-sm" data-setdef="' + esc(a.id) + '">Set Default</button>') +
        '<button class="btn btn-outline-glow btn-sm" data-deladdr="' + esc(a.id) + '" style="color:#ef4444;border-color:rgba(239,68,68,.4)">Delete</button>' +
        "</div></div></div>";
    }).join("") + '<div class="col-md-6"><div class="address-card d-flex flex-column justify-content-center text-center" style="border-style:dashed">' +
      '<span class="icon-box round mx-auto mb-3 cyan"><i class="bi bi-plus-lg"></i></span>' +
      "<h6>Add a New Address</h6>" +
      '<form id="addrForm" class="text-start mt-2" novalidate>' +
      '<input class="form-control-premium mb-2" id="adrTag" placeholder="Label (Home, Office…)" required>' +
      '<input class="form-control-premium mb-2" id="adrLine" placeholder="Street and number" required>' +
      '<input class="form-control-premium mb-3" id="adrCity" placeholder="City, State, ZIP" required>' +
      '<button class="btn btn-gradient w-100" type="submit"><i class="bi bi-save me-2"></i>Save Address</button>' +
      "</form></div></div>";
  }

  function renderProfile() {
    var p = store.profile;
    var setv = function (id, v) { var el = document.getElementById(id); if (el) el.value = v; };
    setv("pfName", p.name);
    setv("pfEmail", p.email);
    setv("pfPhone", p.phone);
    var ini = initials(p.name);
    var av = document.getElementById("pfAvatar");
    if (av) av.textContent = ini;
    var avBig = document.getElementById("pfAvatarBig");
    if (avBig) avBig.textContent = ini;
    var cn = document.getElementById("pfCardName");
    if (cn) cn.textContent = p.name;
    var dn = document.getElementById("duName");
    var dm = document.getElementById("duMail");
    if (dn) dn.textContent = p.name;
    if (dm) dm.textContent = p.email;
  }

  function renderSupport() {
    var host = document.getElementById("ticketList");
    if (!host) return;
    host.innerHTML = store.tickets.map(function (t) {
      return '<div class="ticket-msg"><div class="tm-head"><strong>#' + esc(t.id) + " · " + esc(t.subject) + "</strong><span>" + esc(t.when) + "</span></div>" +
        "<p>" + esc(t.msg) + "</p>" +
        (t.reply ? '<div class="ticket-msg mb-0 mt-2" style="background:rgba(46,107,255,.08)"><div class="tm-head"><strong><i class="bi bi-headset me-1"></i>Fixora Support</strong><span>Replied</span></div><p>' + esc(t.reply) + "</p></div>" : "") +
        "</div>";
    }).join("") || '<p style="color:var(--fx-muted)">No tickets yet — we usually reply within one hour.</p>';
  }

  function printInvoice(id) {
    var r = store.repairs.find(function (x) { return x.id === id; });
    if (!r) return;
    var t = totals(r);
    var area = document.getElementById("print-invoice-area");
    area.innerHTML =
      '<div style="font-family:Arial,sans-serif;padding:40px;color:#000">' +
      '<div style="display:flex;justify-content:space-between;border-bottom:3px solid #2e6bff;padding-bottom:16px;margin-bottom:24px">' +
      '<div><h2 style="margin:0;color:#2e6bff">FIXORA</h2><div style="font-size:12px">Expert Repairs. Right at Home.</div></div>' +
      '<div style="text-align:right;font-size:13px">128 Circuit Avenue, Suite 400<br>Austin, TX 78701<br>help@fixora.com</div></div>' +
      '<h3 style="margin:0 0 4px">Service Invoice</h3>' +
      '<div style="font-size:13px;margin-bottom:20px">Invoice for repair <strong>' + esc(r.id) + "</strong> · Issued " + prettyDate(r.date) + "</div>" +
      '<table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:20px">' +
      "<tr><td style='padding:6px 0;width:160px;color:#555'>Customer</td><td>" + esc(store.profile.name) + "</td></tr>" +
      "<tr><td style='padding:6px 0;color:#555'>Appliance</td><td>" + esc(r.appliance) + " · " + esc(r.brand) + " " + esc(r.model) + "</td></tr>" +
      "<tr><td style='padding:6px 0;color:#555'>Issue Reported</td><td>" + esc(r.issue) + "</td></tr>" +
      "<tr><td style='padding:6px 0;color:#555'>Service Address</td><td>" + esc(r.address) + "</td></tr>" +
      "<tr><td style='padding:6px 0;color:#555'>Technician</td><td>" + esc(r.tech.name) + " (rated " + r.tech.rating + "/5)</td></tr></table>" +
      '<table style="width:100%;font-size:13px;border-collapse:collapse">' +
      '<tr style="border-bottom:2px solid #333;text-align:left"><th style="padding:8px 0">Description</th><th style="text-align:right">Amount</th></tr>' +
      '<tr><td style="padding:8px 0;border-bottom:1px dashed #999">Labour — diagnostic + repair</td><td style="text-align:right">' + money(r.labour) + "</td></tr>" +
      (r.parts || []).map(function (p) {
        return '<tr><td style="padding:8px 0;border-bottom:1px dashed #999">' + esc(p.name) + '</td><td style="text-align:right">' + money(p.cost) + "</td></tr>";
      }).join("") +
      '<tr><td style="padding:8px 0;border-bottom:1px dashed #999">Tax (8%)</td><td style="text-align:right">' + money(t.tax) + "</td></tr>" +
      '<tr><td style="padding:10px 0;font-weight:bold;font-size:15px">Total Paid</td><td style="text-align:right;font-weight:bold;font-size:15px;color:#2e6bff">' + money(t.total) + "</td></tr></table>" +
      '<p style="font-size:11px;color:#777;margin-top:28px">Covered by Fixora\u2019s 90-day service warranty. Warranty claims: help@fixora.com · +1 (800) 555-0199. Thank you for choosing Fixora.</p></div>';
    document.body.classList.add("printing-invoice");
    var cleanup = function () {
      document.body.classList.remove("printing-invoice");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    setTimeout(cleanup, 1500);
  }

  var wiz = { step: 1, data: { appliance: "", brand: "", model: "", issue: "", address: "", date: "", slot: "" } };

  var WIZ_STEPS = ["Appliance", "Brand & Model", "Fault", "Address", "Schedule", "Review", "Submit"];

  function renderWizSteps() {
    var host = document.getElementById("wizardSteps");
    if (!host) return;
    host.innerHTML = WIZ_STEPS.map(function (label, i) {
      var n = i + 1;
      var cls = n === wiz.step ? " active" : n < wiz.step ? " done" : "";
      return '<div class="wizard-step' + cls + '"><div class="ws-dot">' + (n < wiz.step ? '<i class="bi bi-check-lg"></i>' : n) + '</div><div class="ws-label">' + label + "</div></div>";
    }).join("");
  }

  function showWizStep(n) {
    wiz.step = n;
    renderWizSteps();
    document.querySelectorAll(".wiz-pane").forEach(function (p) {
      p.classList.toggle("d-none", p.getAttribute("data-pane") !== String(n));
    });
    var back = document.getElementById("wizBack");
    var next = document.getElementById("wizNext");
    if (back) back.classList.toggle("d-none", n === 1);
    if (next) {
      next.classList.toggle("d-none", n === 7);
      next.innerHTML = n === 6 ? '<i class="bi bi-check2-circle me-2"></i>Confirm Booking' : "Continue<i class=\"bi bi-arrow-right ms-2\"></i>";
    }
    if (n === 6) fillReview();
    if (n === 7) submitWiz();
  }

  function fillReview() {
    var d = wiz.data;
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v || "—"; };
    set("rvAppliance", d.appliance);
    set("rvBrand", d.brand + (d.model ? " · " + d.model : ""));
    set("rvIssue", d.issue);
    set("rvAddress", d.address);
    set("rvWhen", (d.date ? prettyDate(d.date) : "—") + " · " + (d.slot || ""));
  }

  function validateWiz() {
    var d = wiz.data;
    var msgs = {
      1: !d.appliance && "Please choose an appliance type.",
      2: (!d.brand || !d.model.trim()) && "Please provide brand and model.",
      3: d.issue.trim().length < 8 && "Describe the issue in a few words.",
      4: !d.address && "Choose or enter a service address.",
      5: (!d.date || !d.slot) && "Pick a date and time slot."
    };
    if (msgs[wiz.step]) { FXUI.toast(msgs[wiz.step], "info"); return false; }
    return true;
  }

  function submitWiz() {
    var d = wiz.data;
    var techs = [
      { name: "Daniel Reyes", rating: "4.9", exp: "8 yrs experience" },
      { name: "Priya Natarajan", rating: "5.0", exp: "6 yrs experience" },
      { name: "Marcus Chen", rating: "4.8", exp: "11 yrs experience" }
    ];
    var r = {
      id: uid("FX"), appliance: d.appliance, brand: d.brand, model: d.model,
      issue: d.issue, address: d.address, date: d.date, slot: d.slot,
      stage: 0, tech: techs[Math.floor(Math.random() * techs.length)]
    };
    store.repairs.unshift(r);
    save();
    var box = document.getElementById("wizSuccess");
    if (box) {
      box.innerHTML = '<div class="text-center py-4">' +
        '<div class="icon-box round mx-auto mb-3" style="width:72px;height:72px;font-size:1.8rem"><i class="bi bi-check-lg"></i></div>' +
        '<h4 class="mb-2">Request Confirmed!</h4>' +
        '<p style="color:var(--fx-muted)">Your repair ID is <strong class="text-gradient">' + esc(r.id) + "</strong>. We'll assign a technician shortly.</p>" +
        '<div class="mx-auto" style="max-width:520px">' + FXUI.timelineHtml(0, false) + "</div>" +
        '<div class="d-flex gap-2 justify-content-center flex-wrap mt-4">' +
        '<button class="btn btn-outline-glow" data-goto="active"><i class="bi bi-arrow-repeat me-2"></i>Track in Active Repairs</button>' +
        '<button class="btn btn-gradient" id="wizAnother"><i class="bi bi-plus-circle me-2"></i>Book Another</button></div></div>';
    }
    FXUI.toast("Repair booked — ID " + r.id, "success");
  }

  function resetWiz() {
    wiz.data = { appliance: "", brand: "", model: "", issue: "", address: "", date: "", slot: "" };
    document.querySelectorAll("#wizForm input,#wizForm select,#wizForm textarea").forEach(function (f) { f.value = ""; });
    document.querySelectorAll(".wiz-chip").forEach(function (c) { c.classList.remove("active"); });
    showWizStep(1);
  }

  function closeSidebar() {
    var sb = document.getElementById("dashSidebar");
    var bd = document.getElementById("dashBackdrop");
    if (sb) sb.classList.remove("open");
    if (bd) bd.classList.remove("show");
  }

  function bind() {
    document.querySelectorAll(".dash-nav a[data-nav]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        location.hash = a.getAttribute("data-nav");
      });
    });

    document.addEventListener("click", function (e) {
      var goto_ = e.target.closest("[data-goto]");
      if (goto_) { e.preventDefault(); location.hash = goto_.getAttribute("data-goto"); return; }

      var cancel = e.target.closest("[data-cancel]");
      if (cancel) {
        var cid = cancel.getAttribute("data-cancel");
        store.repairs = store.repairs.filter(function (r) { return r.id !== cid; });
        save(); renderActive(); renderOverview();
        FXUI.toast("Request " + cid + " cancelled.", "success");
        return;
      }

      var pr = e.target.closest("[data-print]");
      if (pr) { printInvoice(pr.getAttribute("data-print")); return; }

      var ba = e.target.closest("[data-bookagain]");
      if (ba) {
        var src = store.repairs.find(function (r) { return r.id === ba.getAttribute("data-bookagain"); });
        if (src) {
          wiz.data = { appliance: src.appliance, brand: src.brand, model: src.model, issue: src.issue, address: src.address, date: "", slot: "" };
          syncWizChips();
        }
        location.hash = "new";
        FXUI.toast("Previous details pre-filled — pick a date.", "info");
        return;
      }

      var star = e.target.closest("[data-star]");
      if (star) {
        var rid = star.getAttribute("data-rate-id");
        var val = parseInt(star.getAttribute("data-star"), 10);
        store.ratings = store.ratings || {};
        store.ratings[rid] = val;
        save();
        star.parentElement.querySelectorAll("button").forEach(function (b) {
          b.classList.toggle("on", parseInt(b.getAttribute("data-star"), 10) <= val);
        });
        FXUI.toast("Thanks! You rated " + rid + " " + val + " star" + (val > 1 ? "s" : "") + ".", "success");
        return;
      }

      var sd = e.target.closest("[data-setdef]");
      if (sd) {
        store.addresses.forEach(function (a) { a.def = a.id === sd.getAttribute("data-setdef"); });
        save(); renderAddresses();
        FXUI.toast("Default address updated.", "success");
        return;
      }

      var del = e.target.closest("[data-deladdr]");
      if (del) {
        store.addresses = store.addresses.filter(function (a) { return a.id !== del.getAttribute("data-deladdr"); });
        save(); renderAddresses();
        FXUI.toast("Address removed.", "success");
        return;
      }

      var chip = e.target.closest(".wiz-chip");
      if (chip && chip.closest("#wizForm")) {
        var group = chip.getAttribute("data-field");
        chip.parentElement.querySelectorAll(".wiz-chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        wiz.data[group] = chip.getAttribute("data-value");
        return;
      }

      var sym = e.target.closest("[data-symptom]");
      if (sym) {
        var issue = document.getElementById("wzIssue");
        if (issue) {
          issue.value = issue.value ? issue.value + ". " + sym.getAttribute("data-symptom") : sym.getAttribute("data-symptom");
          wiz.data.issue = issue.value;
          sym.classList.add("active");
        }
        return;
      }

      var addrChip = e.target.closest("[data-addr-pick]");
      if (addrChip) {
        addrChip.closest(".list-group").querySelectorAll("[data-addr-pick]").forEach(function (x) { x.classList.remove("active"); });
        addrChip.classList.add("active");
        wiz.data.address = addrChip.getAttribute("data-addr-pick");
        var other = document.getElementById("adrOtherWrap");
        if (other) other.classList.add("d-none");
        return;
      }

      var tgl = e.target.closest("#dsToggle");
      if (tgl) {
        var sb = document.getElementById("dashSidebar");
        var bd = document.getElementById("dashBackdrop");
        if (sb && bd) { sb.classList.toggle("open"); bd.classList.toggle("show"); }
        return;
      }

      if (e.target.id === "dashBackdrop") { closeSidebar(); return; }

      if (e.target.closest("#logoutLink")) {
        e.preventDefault();
        try { localStorage.removeItem("fx-user"); } catch (err) {}
        FXUI.toast("Signed out. See you soon!", "success");
        setTimeout(function () { window.location.href = "login.html"; }, 500);
      }
    });

    var wizNext = document.getElementById("wizNext");
    var wizBack = document.getElementById("wizBack");
    if (wizNext) wizNext.addEventListener("click", function () {
      if (!validateWiz()) return;
      readWizInputs();
      showWizStep(wiz.step + 1);
    });
    if (wizBack) wizBack.addEventListener("click", function () { showWizStep(Math.max(1, wiz.step - 1)); });

    document.addEventListener("click", function (e) {
      if (e.target.id !== "wizAnother") return;
      resetWiz();
    });

    var addrForm = document.getElementById("addrFormHost");
    if (addrForm) addrForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var tag = document.getElementById("adrTag");
      var line = document.getElementById("adrLine");
      var city = document.getElementById("adrCity");
      if (!tag.value.trim() || !line.value.trim() || !city.value.trim()) {
        FXUI.toast("Fill in label, street and city.", "info");
        return;
      }
      store.addresses.push({ id: uid("adr"), tag: tag.value.trim(), line: line.value.trim(), city: city.value.trim(), def: false });
      save(); renderAddresses();
      FXUI.toast("Address saved.", "success");
    });

    var profForm = document.getElementById("profileForm");
    if (profForm) profForm.addEventListener("submit", function (e) {
      e.preventDefault();
      store.profile.name = document.getElementById("pfName").value.trim() || store.profile.name;
      store.profile.email = document.getElementById("pfEmail").value.trim() || store.profile.email;
      store.profile.phone = document.getElementById("pfPhone").value.trim();
      save(); renderProfile();
      FXUI.toast("Profile updated.", "success");
    });

    var tickForm = document.getElementById("ticketForm");
    if (tickForm) tickForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var subj = document.getElementById("tkSubject");
      var msg = document.getElementById("tkMsg");
      if (!subj.value.trim() || !msg.value.trim()) {
        FXUI.toast("Add a subject and message.", "info");
        return;
      }
      store.tickets.unshift({ id: uid("TIC"), subject: subj.value.trim(), msg: msg.value.trim(), when: "Just now", reply: "" });
      save(); renderSupport();
      subj.value = ""; msg.value = "";
      FXUI.toast("Ticket submitted — we'll reply within the hour.", "success");
    });

    var adrOther = document.getElementById("adrOther");
    if (adrOther) adrOther.addEventListener("change", function () {
      var wrap = document.getElementById("adrOtherWrap");
      if (wrap) wrap.classList.toggle("d-none", !adrOther.checked);
      if (adrOther.checked) wiz.data.address = "";
    });

    var adrOtherInput = document.getElementById("adrOtherInput");
    if (adrOtherInput) adrOtherInput.addEventListener("input", function () {
      wiz.data.address = adrOtherInput.value.trim();
    });

    var dateIn = document.getElementById("wzDate");
    if (dateIn) {
      var d = new Date();
      dateIn.min = d.toISOString().split("T")[0];
      dateIn.addEventListener("change", function () { wiz.data.date = dateIn.value; });
    }

    window.addEventListener("hashchange", function () {
      showSection(location.hash.replace("#", ""));
    });
  }

  function readWizInputs() {
    var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    if (wiz.step === 2) { wiz.data.brand = g("wzBrand"); wiz.data.model = g("wzModel"); }
    if (wiz.step === 3) wiz.data.issue = g("wzIssue");
  }

  function syncWizChips() {
    document.querySelectorAll(".wiz-chip").forEach(function (c) {
      var f = c.getAttribute("data-field");
      c.classList.toggle("active", wiz.data[f] === c.getAttribute("data-value"));
    });
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.value = v; };
    set("wzBrand", wiz.data.brand);
    set("wzModel", wiz.data.model);
    set("wzIssue", wiz.data.issue);
    set("wzDate", wiz.data.date);
  }

  function buildAddressesPicker() {
    var host = document.getElementById("adrPickList");
    if (!host) return;
    host.innerHTML = store.addresses.map(function (a) {
      return '<button type="button" class="list-group-item list-group-item-action bg-transparent' + (a.def ? " active" : "") + '" data-addr-pick="' + esc(a.line + ", " + a.city) + '">' +
        '<i class="bi ' + (a.tag === "Home" ? "bi-house-heart" : a.tag === "Office" ? "bi-briefcase" : "bi-geo-alt") + ' me-2"></i><strong>' + esc(a.tag) + "</strong> — " + esc(a.line) + ", " + esc(a.city) + "</button>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    buildAddressesPicker();
    renderProfile();
    renderSupport();
    renderOverview();
    renderActive();
    renderHistory();
    renderInvoices();
    renderAddresses();
    showWizStep(1);
    bind();
    var initial = location.hash.replace("#", "");
    showSection(TITLES[initial] ? initial : "overview");
  });
})();
