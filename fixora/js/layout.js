(function () {
  "use strict";

  var BS_CSS = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
  var BS_CSS_RTL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css";

  function page() {
    var p = location.pathname.split("/").pop() || "index.html";
    return p.toLowerCase();
  }

  function isActive(f) { return page() === f ? " active" : ""; }

  var NAV = [
    { label: "Home", icon: "bi-house-door", children: [
      { file: "index.html", label: "1. Home – General Repair", icon: "bi-house-door" },
      { file: "home-2.html", label: "2. Home – Service Business", icon: "bi-stars" }
    ]},
    { file: "about.html", label: "About", icon: "bi-info-circle" },
    { file: "services.html", label: "Services", icon: "bi-tools" },
    { file: "pricing.html", label: "Pricing", icon: "bi-tags" },
    { file: "blog.html", label: "Blog", icon: "bi-journal-text" },
    { file: "contact.html", label: "Contact", icon: "bi-headset" }
  ];

  function getUser() {
    try { return JSON.parse(localStorage.getItem("fx-user") || "null"); } catch (e) { return null; }
  }

  function dropdownHtml(item) {
    var id = "dd-" + item.label.toLowerCase().replace(/[^a-z]/g, "");
    var items = item.children.map(function (c) {
      return '<li><a class="dropdown-item' + (page() === c.file ? " active" : "") + '" href="' + c.file + '"><i class="bi ' + c.icon + '"></i>' + c.label + "</a></li>";
    }).join("");
    var parentActive = item.children.some(function (c) { return page() === c.file; });
    return '<li class="nav-item dropdown"><a class="nav-link dropdown-toggle-nocaret' + (parentActive ? " active" : "") + '" href="#" id="' + id + '" role="button" data-bs-toggle="dropdown" aria-expanded="false">' + item.label + ' <i class="bi bi-chevron-down ms-1" style="font-size:.65rem"></i></a><ul class="dropdown-menu" aria-labelledby="' + id + '">' + items + '</ul></li>';
  }

  function navLinksHtml() {
    return NAV.map(function (item) {
      if (item.children) return dropdownHtml(item);
      return '<li class="nav-item"><a class="nav-link' + isActive(item.file) + '" href="' + item.file + '">' + item.label + "</a></li>";
    }).join("");
  }

  function mobileAccordion(item, idx) {
    var inner = item.children.map(function (c) { return '<a href="' + c.file + '" class="' + (page() === c.file ? "active" : "") + '"><i class="bi ' + c.icon + '"></i>' + c.label + "</a>"; }).join("");
    return '<div class="accordion-item border-0"><h2 class="accordion-header"><button class="accordion-button collapsed px-3" type="button" data-bs-toggle="collapse" data-bs-target="#macc' + idx + '"><i class="bi ' + item.icon + ' me-2 text-primary"></i>' + item.label + '</button></h2><div id="macc' + idx + '" class="accordion-collapse collapse" data-bs-parent="#mobileMenuAcc"><div class="accordion-body p-2">' + inner + '</div></div></div>';
  }

  function profileDesktop(user) {
    var initial = ((user && user.name) || (user && user.email) || "U").trim().charAt(0).toUpperCase();
    return '<div class="dropdown d-none d-xxl-block"><button class="btn profile-nav-btn dropdown-toggle-nocaret" type="button" data-bs-toggle="dropdown" aria-expanded="false"><span class="profile-avatar">' + initial + '</span><span class="profile-name">' + ((user && user.name) || "My Profile") + '</span><i class="bi bi-chevron-down"></i></button><ul class="dropdown-menu dropdown-menu-end profile-menu"><li class="px-3 py-2"><div class="fw-bold">' + ((user && user.name) || "Fixora Customer") + '</div><small>' + ((user && user.email) || "Signed in") + '</small></li><li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-grid-1x2"></i>My Dashboard</a></li><li><a class="dropdown-item" href="dashboard.html#history"><i class="bi bi-clock-history"></i>Repair History</a></li><li><a class="dropdown-item" href="dashboard.html#profile"><i class="bi bi-person-gear"></i>Account Settings</a></li><li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="#" data-signout><i class="bi bi-box-arrow-right"></i>Sign Out</a></li></ul></div>';
  }

  function authDesktop(user) {
    if (user) return profileDesktop(user);
    return '<a href="login.html" class="btn btn-nav-account d-none d-xxl-inline-flex align-items-center gap-1"><i class="bi bi-box-arrow-in-right"></i>Sign In</a><a href="register.html" class="btn btn-gradient d-none d-xxl-inline-flex align-items-center gap-1"><i class="bi bi-person-plus"></i>Sign Up</a>';
  }

  function authMobile(user) {
    if (user) {
      return '<div class="mobile-profile-card"><div class="d-flex align-items-center gap-3"><span class="profile-avatar">' + (((user.name || user.email || "U").trim().charAt(0) || "U").toUpperCase()) + '</span><div><strong>' + (user.name || "Fixora Customer") + '</strong><small class="d-block">' + (user.email || "Signed in") + '</small></div></div><div class="d-grid gap-2 mt-3"><a href="dashboard.html" class="btn btn-gradient"><i class="bi bi-grid-1x2 me-2"></i>My Dashboard</a><a href="dashboard.html#profile" class="btn btn-outline-glow"><i class="bi bi-person-gear me-2"></i>Account Settings</a><a href="#" class="btn btn-outline-glow" data-signout><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></div></div>';
    }
    return '<div class="row g-2"><div class="col-6"><a href="login.html" class="btn btn-outline-glow w-100"><i class="bi bi-box-arrow-in-right me-1"></i>Sign In</a></div><div class="col-6"><a href="register.html" class="btn btn-gradient w-100"><i class="bi bi-person-plus me-1"></i>Sign Up</a></div></div>';
  }

  function headerHtml() {
    var user = getUser();
    var mobileTop = NAV.filter(function (n) { return !n.children; }).map(function (n) {
      return '<li class="nav-item"><a class="nav-link' + isActive(n.file) + '" href="' + n.file + '"><i class="bi ' + n.icon + '"></i>' + n.label + "</a></li>";
    }).join("");
    var mobileAcc = NAV.filter(function (n) { return n.children; }).map(mobileAccordion).join("");
    return '<nav class="navbar navbar-expand-xxl navbar-fixora sticky-top" id="mainNav"><div class="container d-flex flex-nowrap align-items-center justify-content-between"><a class="navbar-brand me-0" href="index.html"><span class="brand-mark"><i class="bi bi-wrench-adjustable"></i></span><span class="d-none d-sm-inline-block ms-2">Fixora</span></a><div class="d-flex flex-nowrap align-items-center gap-1 gap-sm-2 order-xxl-3"><button class="btn-icon" id="themeToggle" type="button" aria-label="Toggle theme" title="Light / Dark mode"><i class="bi bi-moon-stars"></i></button><button class="btn-icon direction-toggle" id="rtlToggle" type="button" aria-label="Switch text direction" title="Switch RTL/LTR"><i class="bi bi-text-right direction-icon"></i><span id="rtlLabel" class="d-none d-sm-inline-block">RTL</span></button>' + authDesktop(user) + '<button class="btn-icon d-xxl-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenu" aria-label="Open menu"><i class="bi bi-list fs-5"></i></button></div><div class="collapse navbar-collapse order-xxl-2 justify-content-center d-none d-xxl-flex"><ul class="navbar-nav gap-1">' + navLinksHtml() + '</ul></div></div></nav>' +
      '<div class="offcanvas offcanvas-end fixora-mobile" tabindex="-1" id="mobileMenu" aria-label="Mobile menu"><div class="offcanvas-header border-bottom" style="border-color:var(--fx-border)!important"><a class="navbar-brand" href="index.html" style="color:var(--fx-text)"><span class="brand-mark"><i class="bi bi-wrench-adjustable"></i></span>Fixora</a><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body d-flex flex-column"><div class="accordion accordion-flush" id="mobileMenuAcc">' + mobileAcc + '</div><ul class="navbar-nav mb-2">' + mobileTop + '</ul><div class="mt-auto pt-4 d-grid gap-2"><a href="#" class="btn btn-gradient book-open-btn"><i class="bi bi-calendar2-check me-2"></i>Book a Repair</a>' + authMobile(user) + '<div class="d-flex gap-2 justify-content-center mt-2"><button class="btn-icon" data-theme-toggle aria-label="Toggle theme"><i class="bi bi-moon-stars"></i></button><button class="btn-icon direction-toggle" data-rtl-toggle aria-label="Switch text direction"><i class="bi bi-text-right direction-icon"></i><span>RTL</span></button></div></div></div></div>';
  }

  function footerHtml() {
    return '' +
      '<footer class="footer">' +
      '<div class="container">' +
      '<div class="row g-4 g-lg-5">' +
      '<div class="col-lg-4 col-md-6">' +
      '<a class="navbar-brand mb-3 d-inline-flex" href="index.html" style="color:#fff"><span class="brand-mark"><i class="bi bi-wrench-adjustable"></i></span>Fixora</a>' +
      '<p style="max-width:320px">Expert Repairs. Right at Home. Certified technicians, genuine parts and a 90-day service warranty — for every appliance in your home.</p>' +
      '<form class="newsletter-form mt-3 fx-newsletter" novalidate>' +
      '<input type="email" placeholder="Your email address" required aria-label="Email address">' +
      '<button class="btn btn-gradient px-3" type="submit" aria-label="Subscribe"><i class="bi bi-send"></i></button></form>' +
      '<div class="social-btns mt-4">' +
      '<a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="bi bi-facebook"></i></a>' +
      '<a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="bi bi-instagram"></i></a>' +
      '<a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="bi bi-twitter-x"></i></a>' +
      '<a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="bi bi-youtube"></i></a>' +
      '<a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>' +
      '</div></div>' +
      '<div class="col-lg-2 col-md-6 col-6">' +
      '<h6 class="footer-title">Company</h6>' +
      '<ul class="list-unstyled footer-links">' +
      '<li><a href="index.html"><i class="bi bi-chevron-right"></i>Home</a></li>' +
      '<li><a href="about.html"><i class="bi bi-chevron-right"></i>About</a></li>' +
      '<li><a href="services.html"><i class="bi bi-chevron-right"></i>Services</a></li>' +
      '</ul></div>' +
      '<div class="col-lg-3 col-md-6 col-6">' +
      '<h6 class="footer-title">Explore Us</h6>' +
      '<ul class="list-unstyled footer-links">' +
      '<li><a href="pricing.html"><i class="bi bi-chevron-right"></i>Pricing</a></li>' +
      '<li><a href="blog.html"><i class="bi bi-chevron-right"></i>Blog</a></li>' +
      '<li><a href="contact.html"><i class="bi bi-chevron-right"></i>Contact</a></li>' +
      '</ul></div>' +
      '<div class="col-lg-3 col-md-6">' +
      '<h6 class="footer-title">Get In Touch</h6>' +
      '<ul class="list-unstyled f-contact">' +
      '<li><i class="bi bi-geo-alt-fill"></i><span>128 Circuit Avenue, Suite 400<br>Austin, TX 78701</span></li>' +
      '<li><i class="bi bi-telephone-fill"></i><span>+1 (800) 555-0199<br>+1 (800) 555-0140 (Emergency)</span></li>' +
      '<li><i class="bi bi-envelope-fill"></i><span>help@fixora.com</span></li>' +
      '<li><i class="bi bi-clock-fill"></i><span>Mon–Sat: 8:00 AM – 9:00 PM<br>Sunday: Emergency only</span></li>' +
      '</ul></div>' +
      '</div>' +
      '<div class="footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">' +
      '<span>© <span class="fx-year"></span> Fixora. All rights reserved.</span>' +
      '<div class="d-flex gap-3 flex-wrap"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Warranty Policy</a></div>' +
      '</div></div></footer>';
  }

  function modalHtml() {
    var BRANDS = ["Samsung","LG","Whirlpool","Bosch","IFB","Godrej","Haier","Voltas","Daikin","Panasonic","Sony","Philips","Blue Star","Other"];
    return '' +
      '<div class="modal fade" id="bookingModal" tabindex="-1" aria-hidden="true">' +
      '<div class="modal-dialog modal-dialog-centered modal-lg"><div class="modal-content fx-modal">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title"><i class="bi bi-calendar2-check text-primary me-2"></i>Book a Repair</h5>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
      '</div>' +
      '<div class="modal-body p-4">' +

      /* Step indicators */
      '<div class="d-flex align-items-center gap-2 mb-4" id="bkStepBar">' +
      ["Appliance","Contact","Address","Schedule","Issue","Review","Done"].map(function(s,i){
        return '<div class="d-flex align-items-center gap-1"><span class="bk-step-dot" data-step="'+(i+1)+'" style="width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;background:var(--fx-surface-2);border:1.5px solid var(--fx-border);color:var(--fx-muted);transition:all .25s ease">'+(i+1)+'</span>' +
          (i<6 ? '<div style="flex:1;min-width:10px;height:2px;background:var(--fx-border)"></div>' : '') + '</div>';
      }).join('') +
      '</div>' +

      '<form id="bookingForm" novalidate>' +

      /* Step 1 – Appliance */
      '<div class="bk-panel" data-panel="1">' +
      '<p class="fw-semibold mb-3" id="bkApplianceLabel" style="color:var(--fx-text)">Which appliance needs fixing?</p>' +
      '<div class="d-flex flex-wrap gap-2" id="bkApplianceGrid">' +
      [{icon:'bi-arrow-repeat',name:'Washing Machine'},{icon:'bi-snow',name:'Refrigerator'},{icon:'bi-wind',name:'Air Conditioner'},{icon:'bi-lightning-charge',name:'Microwave'},{icon:'bi-thermometer-half',name:'Geyser'},{icon:'bi-tv',name:'Television'},{icon:'bi-three-dots',name:'Other'}].map(function(a){
        return '<button type="button" class="wiz-chip bk-app-btn" data-app="'+a.name+'"><i class="bi '+a.icon+'"></i>'+a.name+'</button>';
      }).join('') +
      '</div>' +
      '<input type="hidden" id="bkAppliance" required>' +
      '<div class="mt-3"><label class="form-label-premium" for="bkBrand">Brand</label>' +
      '<select class="form-select-premium" id="bkBrand"><option value="">Select brand…</option>' +
      BRANDS.map(function(b){return '<option>'+b+'</option>';}).join('') +
      '</select></div>' +
      '<div class="mt-3"><label class="form-label-premium" for="bkModel">Model / Size (optional)</label>' +
      '<input type="text" class="form-control-premium" id="bkModel" placeholder="e.g. Samsung WW90T, 1.5 ton"></div>' +
      '</div>' +

      /* Step 2 – Contact */
      '<div class="bk-panel d-none" data-panel="2">' +
      '<div class="row g-3">' +
      '<div class="col-12"><label class="form-label-premium" for="bkName">Full Name *</label><input type="text" class="form-control-premium" id="bkName" placeholder="e.g. Alex Morgan" required></div>' +
      '<div class="col-md-6"><label class="form-label-premium" for="bkPhone">Phone Number *</label><input type="tel" class="form-control-premium" id="bkPhone" placeholder="+1 (555) 000-0000" required></div>' +
      '<div class="col-md-6"><label class="form-label-premium" for="bkEmail">Email Address</label><input type="email" class="form-control-premium" id="bkEmail" placeholder="you@example.com"></div>' +
      '</div></div>' +

      /* Step 3 – Address */
      '<div class="bk-panel d-none" data-panel="3">' +
      '<div class="row g-3">' +
      '<div class="col-12"><label class="form-label-premium" for="bkAddress">Street Address *</label><input type="text" class="form-control-premium" id="bkAddress" placeholder="123 Main Street" required></div>' +
      '<div class="col-md-6"><label class="form-label-premium" for="bkCity">City *</label><input type="text" class="form-control-premium" id="bkCity" placeholder="Austin" required></div>' +
      '<div class="col-md-6"><label class="form-label-premium" for="bkZip">ZIP Code *</label><input type="text" class="form-control-premium" id="bkZip" placeholder="78701" required></div>' +
      '<div class="col-12"><label class="form-label-premium" for="bkLandmark">Landmark (optional)</label><input type="text" class="form-control-premium" id="bkLandmark" placeholder="e.g. Near the park"></div>' +
      '</div></div>' +

      /* Step 4 – Schedule */
      '<div class="bk-panel d-none" data-panel="4">' +
      '<div class="row g-3">' +
      '<div class="col-md-6"><label class="form-label-premium" for="bkDate">Preferred Date *</label><input type="date" class="form-control-premium" id="bkDate" required></div>' +
      '<div class="col-md-6"><label class="form-label-premium" for="bkSlot">Time Slot *</label>' +
      '<select class="form-select-premium" id="bkSlot" required><option value="">Select slot…</option>' +
      '<option>8:00 AM – 11:00 AM</option><option>11:00 AM – 2:00 PM</option><option>2:00 PM – 5:00 PM</option><option>5:00 PM – 8:00 PM</option>' +
      '</select></div>' +
      '<div class="col-12">' +
      '<div class="d-flex flex-wrap gap-2">' +
      ['Standard Visit','Express (90 min)','Emergency (1 hr)'].map(function(t,i){
        return '<button type="button" class="wiz-chip bk-type-btn'+(i===0?' active':'')+'" data-type="'+t+'">'+t+'</button>';
      }).join('') +
      '</div>' +
      '<input type="hidden" id="bkType" value="Standard Visit">' +
      '</div></div></div>' +

      /* Step 5 – Issue */
      '<div class="bk-panel d-none" data-panel="5">' +
      '<label class="form-label-premium" for="bkIssue">Describe the Issue *</label>' +
      '<textarea class="form-control-premium" id="bkIssue" rows="4" placeholder="e.g. Drum not spinning, makes loud noise during spin cycle, error code E2…" required></textarea>' +
      '<div class="mt-3">' +
      '<p class="form-label-premium mb-2">Common Issues (click to add):</p>' +
      '<div class="d-flex flex-wrap gap-2" id="bkQuickIssues">' +
      ['Not powering on','Unusual noise','Not heating/cooling','Leaking water','Error code on display','Takes too long','Vibrating excessively'].map(function(qi){
        return '<button type="button" class="chip bk-quick-issue" style="font-size:.8rem;padding:.38rem .8rem">'+qi+'</button>';
      }).join('') +
      '</div></div></div>' +

      /* Step 6 – Review */
      '<div class="bk-panel d-none" data-panel="6">' +
      '<p class="fw-semibold mb-3" style="color:var(--fx-text)">Review your booking details:</p>' +
      '<div class="row g-2" id="bkReview"></div>' +
      '<div class="tip-box mt-3 mb-0"><i class="bi bi-shield-check"></i><p>$39 inspection fee applies and is fully waived when you proceed with the repair. Payment only after the repair is complete and tested.</p></div>' +
      '</div>' +

      /* Step 7 – Done */
      '<div class="bk-panel d-none" data-panel="7" id="bkDonePanel">' +
      '<div class="text-center py-3">' +
      '<div class="icon-box round mx-auto mb-3" style="width:72px;height:72px;font-size:1.8rem"><i class="bi bi-check-lg"></i></div>' +
      '<h5 class="mb-1">Booking Confirmed!</h5>' +
      '<p class="mb-3">Your repair ID is <strong class="text-gradient" id="bkConfirmId"></strong>. A confirmation SMS is on its way.</p>' +
      '<div class="d-flex gap-2 justify-content-center flex-wrap">' +
      '<button type="button" class="btn btn-outline-glow" data-bs-dismiss="modal">Close</button>' +
      '<a href="login.html" class="btn btn-gradient">Sign In to Track Repair</a>' +
      '</div></div></div>' +

      '</form></div>' +

      '<div class="modal-footer p-4 pt-0 border-0" id="bookingFooter">' +
      '<button type="button" class="btn btn-outline-glow d-none" id="bkPrev"><i class="bi bi-arrow-left me-1"></i>Back</button>' +
      '<div class="ms-auto d-flex gap-2">' +
      '<button type="button" class="btn btn-outline-glow" data-bs-dismiss="modal">Cancel</button>' +
      '<button type="button" class="btn btn-gradient px-4" id="bkNext">Next <i class="bi bi-arrow-right ms-1"></i></button>' +
      '</div></div>' +

      "</div></div></div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var headerHost = document.getElementById("site-header");
    var footerHost = document.getElementById("site-footer");
    if (headerHost) headerHost.outerHTML = headerHtml();
    if (footerHost) footerHost.outerHTML = footerHtml();

    if (!document.getElementById("bookingModal") && !document.body.hasAttribute("data-no-booking")) {
      document.body.insertAdjacentHTML("beforeend", modalHtml());
    }
    if (!document.querySelector(".fx-toast-container")) {
      document.body.insertAdjacentHTML("beforeend",
        '<div class="toast-container position-fixed top-0 start-50 translate-middle-x p-3 fx-toast-container" style="margin-top:90px"></div>');
    }

    var bsLink = document.getElementById("bs-css");
    var dir = document.documentElement.getAttribute("dir") || "ltr";
    if (bsLink && dir === "rtl") bsLink.href = BS_CSS_RTL;

    var yearEl = document.querySelector(".fx-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    document.addEventListener("click", function (e) {
      var bookBtn = e.target.closest(".book-open-btn");
      if (bookBtn) {
        e.preventDefault();
        var modalEl = document.getElementById("bookingModal");
        if (modalEl) {
          // close offcanvas if open
          var off = document.getElementById("mobileMenu");
          if (off && off.classList.contains("show")) {
            var bsOff = bootstrap.Offcanvas.getInstance(off) || new bootstrap.Offcanvas(off);
            if (bsOff) bsOff.hide();
          }
          
          if (window.location.pathname.includes("service-")) {
            var bc = document.querySelector(".breadcrumb-fx .current");
            var serviceName = bc ? bc.innerText.replace(" Repair", "").trim() : "Appliance";
            var lbl = document.getElementById("bkApplianceLabel");
            var grid = document.getElementById("bkApplianceGrid");
            var hiddenApp = document.getElementById("bkAppliance");
            if (lbl) lbl.innerText = "Selected Service: " + serviceName;
            if (grid) grid.classList.add("d-none");
            if (hiddenApp) hiddenApp.value = serviceName;
          } else {
            var activeChip = document.querySelector(".app-chip.active");
            var lbl = document.getElementById("bkApplianceLabel");
            var grid = document.getElementById("bkApplianceGrid");
            var hiddenApp = document.getElementById("bkAppliance");
            
            if (activeChip && activeChip.dataset.appliance && e.target.closest('.book-open-btn').closest('.appliance-selector')) {
              var serviceName = activeChip.dataset.appliance;
              if (lbl) lbl.innerText = "Selected Service: " + serviceName;
              if (grid) grid.classList.add("d-none");
              if (hiddenApp) hiddenApp.value = serviceName;
            } else {
              if (lbl) lbl.innerText = "Which appliance needs fixing?";
              if (grid) grid.classList.remove("d-none");
              if (hiddenApp) hiddenApp.value = "";
              document.querySelectorAll(".bk-app-btn").forEach(function(btn) { btn.classList.remove("active"); });
            }
          }

          var bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          bsModal.show();
        }
      }
      var tBtn = e.target.closest("#themeToggle, [data-theme-toggle]");
      if (tBtn && window.FXUI) FXUI.toggleTheme();
      var rBtn = e.target.closest("#rtlToggle, [data-rtl-toggle]");
      if (rBtn && window.FXUI) FXUI.toggleRTL();
      var outBtn = e.target.closest("[data-signout]");
      if (outBtn) { e.preventDefault(); try { localStorage.removeItem("fx-user"); } catch (err) {} window.location.href = "index.html"; }

      var trackAuthLink = e.target.closest(".track-auth-link");
      if (trackAuthLink) {
        e.preventDefault();
        var user = getUser();
        if (user) {
          window.location.href = "dashboard.html#history";
        } else {
          window.location.href = "login.html?redirect=dashboard.html%23history";
        }
      }
    });

    document.dispatchEvent(new CustomEvent("fx:layout-ready"));
  });

  window.FIXORA_LAYOUT = { BS_CSS: BS_CSS, BS_CSS_RTL: BS_CSS_RTL };
})();
