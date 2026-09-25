# Fixora — On-Demand Home Appliance Repair Service Website

A complete, premium multi-page static website template built with **HTML5, CSS3 (custom design system), Bootstrap 5.3 and vanilla JavaScript**. No build step, no dependencies to install — open `index.html` in a browser and everything works.

## Quick Start

1. Unzip the archive.
2. Open `index.html` in any modern browser (double-click, or use a local server like VS Code Live Server).
3. That's it.

## Pages Included (28 files)

| Page | File |
|---|---|
| Home 1 – Appliance Repair | `index.html` |
| Home 2 – Smart Care Landing | `home-2.html` |
| About Us | `about.html` |
| All Services (filterable) | `services.html` |
| Washing Machine Repair | `service-washing-machine.html` |
| Refrigerator Repair | `service-refrigerator.html` |
| AC Repair | `service-ac.html` |
| Microwave Repair | `service-microwave.html` |
| Geyser / Water Heater Repair | `service-geyser.html` |
| TV Repair | `service-tv.html` |
| How It Works | `how-it-works.html` |
| Pricing (Standard/Express toggle) | `pricing.html` |
| Testimonials (filterable) | `testimonials.html` |
| Blog (search + category filter) | `blog.html` |
| Blog Articles ×6 | `blog-post-1.html` … `blog-post-6.html` |
| Contact | `contact.html` |
| Login | `login.html` |
| Register | `register.html` |
| Customer Dashboard (SPA-style) | `dashboard.html` |
| 404 Page | `404.html` |
| Coming Soon (live countdown) | `coming-soon.html` |

## Key Features

- **Light & Dark mode** — toggle in the navbar; preference persists via `localStorage`.
- **RTL support** — one click flips the whole site to Arabic RTL layout (Bootstrap RTL stylesheet swaps automatically).
- **Global booking modal** — every "Book a Repair" button opens a validated booking form with confirmation + generated repair ID.
- **Repair tracking widget** — enter a repair ID (`FX-4821`, `FX-7350`, `FX-2914` are demo IDs) on the home page or How It Works page to see a live-style status timeline.
- **Customer dashboard** (`dashboard.html`) — SPA-style sections with hash routing:
  - Overview KPIs, next appointment, activity feed
  - 7-step New Repair Request wizard
  - Active repairs with live timeline stages
  - Repair history with technician notes, parts replaced, invoice breakdowns, **printable invoices**, Book Again and star ratings
  - Invoices table, Saved Addresses CRUD, Profile editing, Support tickets
  - Data persists in `localStorage` (key: `fx-dashboard`)
- **Working demo interactivity everywhere** — testimonial slider, counters, scroll reveals, pricing Standard/Express toggle, blog/services/testimonials live filtering, FAQ accordions, newsletter forms, toast notifications.
- **Fully responsive** — tested from 360px phones to ultra-wide desktops.
- **Accessible** — semantic landmarks, aria-labels on icon buttons, keyboard-friendly navigation, reduced-motion support.

## File Structure

```
fixora/
├── index.html            … all HTML pages
├── css/
│   └── style.css         # complete design system (~1,400 lines)
├── js/
│   ├── layout.js         # shared navbar / footer / booking modal injection
│   ├── main.js           # global UI engine (FXUI namespace)
│   └── dashboard.js      # dashboard state, wizard, invoices, print
└── README.md
```

## Customisation Tips

- **Brand colors:** edit the CSS variables at the top of `css/style.css` (`--fx-primary`, `--fx-cyan`, `--fx-navy`, `--fx-grad`).
- **Navbar/footer links:** edit the `NAV` array at the top of `js/layout.js` — it drives desktop menus, mobile menus and active states.
- **Contact details:** search-and-replace the phone/email/address strings across `js/layout.js` and page files.
- **Dashboard demo data:** clear `fx-dashboard` from localStorage to restore seeded demo repairs.

## Credits

- [Bootstrap 5.3](https://getbootstrap.com) · [Bootstrap Icons](https://icons.getbootstrap.com)
- Fonts: [Sora](https://fonts.google.com/specimen/Sora) & [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- Images: inline SVG illustrations and CSS gradients only — no external image dependencies

---

© 2026 Fixora. Demo template — forms and sign-in are simulated for presentation purposes.

## Requirement coverage update
- Two service-business home pages
- About, Services and individual Service Detail pages
- Filterable/searchable Blog and six Blog Detail pages
- Contact, Pricing, How It Works and Testimonials pages
- Customer login/register and Customer Repair Dashboard
- Customer repair-request wizard, active job tracking, repair history, technician notes, invoices and ratings
- Admin Login and protected demo Admin Dashboard
- Admin Analytics, Users, Repair Orders and Messages sections
- Repair-order status flow: Booking Confirmed → Technician Assigned → Technician En Route → Repair In Progress → Completed
- 404 and Coming Soon / Maintenance pages
- Sticky responsive Bootstrap 5 navigation, mobile offcanvas menu, dark/light mode and RTL toggle
- Mobile-first responsive layouts and SEO metadata

### Admin demo access
Email: admin@fixora.com
Password: admin123

Note: Authentication and real-time tracking are front-end demo implementations using browser localStorage. Production deployments should connect these flows to a secure backend/API and database.
