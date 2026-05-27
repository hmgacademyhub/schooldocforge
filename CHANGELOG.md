# Changelog

All notable changes to **SchoolDocForge** are documented here.
The project follows [Semantic Versioning](https://semver.org/) and the [Keep-a-Changelog](https://keepachangelog.com/) format.

---

## [7.0.0] — 2026-05-27 · "Enterprise Plus Edition"

### 🎉 Highlights
- **11 brand-new operations modules** layered on top of v6.
- **6 new document types** (40+ total).
- **12 new platform features**.
- **Zero pre-existing features removed.**

### ✨ Added — New Operations Modules
- **🏥 Health / Clinic Records** with full SOAP (Subjective/Objective/Assessment/Plan) notes.
- **🚌 Transport Module** — buses, drivers, routes, student assignments, daily rosters, bus passes.
- **🍱 Cafeteria** — editable weekly menu (auto-save), printable menu poster, batch meal-ticket generation.
- **🏠 Hostel / Dormitory** — colour-coded rooms (empty/partial/full), bed assignments with capacity enforcement.
- **📚 Homework Tracker** — assignments per class with per-student submission status (pending/submitted/late/missing).
- **🎯 Offline Quiz Player** — students answer randomly-selected questions from the Exam Bank, auto-graded.
- **📈 KPI Dashboard** — enrolment, fee collection %, attendance %, library overdues vs editable targets, with progress bars.
- **🧾 Expense Tracker** — income vs expense ledger with categories and methods.
- **🗒️ Sticky Notes Board** — quick reminders in pastel colours.
- **🏆 Honor Roll** — Top 10 students by average score with gold/silver/bronze ranks.
- **📅 Event Calendar** — month view with click-to-add events per day.

### ✨ Added — New Documents
- 🧪 **SOAP Note** · 🚌 **Bus Pass** · 📋 **Bus Roster** · 🍱 **Cafeteria Menu** · 🎫 **Meal Ticket** · 📚 **Homework Sheet**.

### ✨ Added — Platform Features
- **🔍 Global Search** — searches across students, staff, books, assets, questions, clinic, notes.
- **📱 Device Sync via QR** — transfer branch data device-to-device with no cloud.
- **🎨 5 Themes** — Light, Dark, **Sepia**, **High-Contrast**, **Solarized**.
- **🔔 Browser Notifications** — birthdays and overdue books via native Notification API.
- **🌍 Multi-Currency Display** — ₦/GH₵/KSh/R/CFA/$/£/€.
- **📧 Email Blast (mailto)** — bulk personalized emails via user's mail client.
- **📊 Trend Line Charts** — pure-SVG line chart for fees over 8 weeks.
- **📦 Data Bundle Export** — one-click ZIP of all CSVs (students, staff, books, …).
- **🎓 Interactive Tour** — 8-step first-visit walkthrough.
- **🪪 Bulk QR Generator** — up to 100 QR codes at once, downloadable as ZIP.
- **🔢 Auto-ID Generator** — sequential IDs with `{YEAR}` + `{####}` patterns.
- **🧮 GPA Calculator** — 4 scales (NG-4, NG-5, UK Honours, US).

### 🚀 Performance / Quality
- Service worker cache bumped to `sdf-v7-0-0`.
- HTML balanced: 35 sections, 655 divs.
- All 4 JS files pass `node --check`.

---

## [6.0.0] — 2026-05-27 · "Enterprise Edition"

### 🎉 Highlights
- 10+ brand-new operations modules.
- 12+ new document types.
- Multi-branch support, multilingual UI, PIN lock, encrypted backups, audit log.
- **Zero pre-existing features removed.**

### ✨ Added
- **Multi-Branch** support with per-branch data isolation (`sdf_<branch>_*` keys).
- **Library Management** module: books CRUD, borrow/return, auto-fines, history.
- **Inventory / Asset Register** with straight-line depreciation and asset-tag printing.
- **Exam Question Bank** with random paper generator (no AI).
- **Class Timetable Builder** with teacher-conflict detection.
- **Discipline / Merit Log** with parent-notice generator.
- **Visitor Log** with printable badge and daily security report.
- **Audit Log** (last 500 entries) with CSV export.
- **Birthday alerts** widget below hero.
- **WhatsApp Blast** using free `wa.me` deep-links.
- **4-digit PIN lock** with reset option.
- **AES-GCM 256-bit encrypted backups** via Web Crypto API.
- **Multilingual UI**: English · Yoruba · Hausa · Igbo · French.
- **Pure-SVG analytics** charts (Documents by Type, Asset Value by Category).
- **PWA install banner** and **update prompt**.
- **New document types:** Cumulative Transcript, Visitor Badge, Exam Paper, Library Card, Asset Tag, Parent Notice, CA Sheet, Class Timetable, Staff ID Card, Inventory Report, Library Overdue Notice.
- **Bulk Receipts** (in addition to existing Bulk ID Cards and Bulk Certificates).
- **Batch Payslips** for all staff.
- **`Alt + L`** keyboard shortcut for lock.
- GitHub Actions workflow `.github/workflows/pages.yml` for auto-deploy.
- Sample data CSVs in `sample-data/` for quick onboarding.
- Comprehensive `docs/DEPLOYMENT.md`, `docs/FEATURES.md`, `docs/USER_GUIDE.md`.
- `robots.txt` and `sitemap.xml`.

### 🛡️ Security
- Optional encrypted backup using PBKDF2 (120 000 SHA-256 rounds) + AES-GCM.
- PIN-lock overlay with session-scoped unlock.
- Audit trail of all CRUD/import/export/batch actions.

### 🌐 Internationalisation
- Static i18n dictionary for hero strings; easily extensible via `data-i18n` attributes.

### 🚀 Performance
- Service worker uses **network-first for HTML** (so updates appear quickly) and **cache-first for assets** (so offline still works).
- SVG charts instead of bringing in Chart.js (~70 KB saved).

### 🪲 Fixed
- Service worker now correctly invalidates old caches by version (`CACHE = 'sdf-v6-0-0'`).
- Mobile hamburger handler attached defensively on `DOMContentLoaded`.

---

## [5.0.0] — 2025 · "Merged Edition" *(Adewale Samson Adeagbo)*
### Added
- 6-card statistics dashboard, per-type bar chart breakdown.
- Student Records database (CRUD, CSV, search, filter, per-profile).
- Staff Records database (CRUD, CSV, search, department groups).
- Batch document generation from records.
- Report Card auto-grading (Nigerian A–F system, grand total, average).
- Number-to-words for receipt amounts.
- Sidebar dashboard, history search & filter.

---

## [4.0.0] — 2025
### Added
- Document Templates Gallery (save/load/import/export JSON).
- Print Queue (add many docs, print all in one job).
- History search & filter.
- Full Data Backup & Restore.
- Announcement Banner.
- Copy-to-clipboard, social-share buttons (Twitter/X, WhatsApp, LinkedIn, Facebook).
- Confetti celebration on generate.
- Accessibility (skip link, ARIA, reduced motion).
- Keyboard shortcuts (`Alt + G/S/P/D/K/Q/T/B/1-4`, `Esc`).
- New docs: Fee Voucher, Suspension Letter, Clearance Form.

---

## [3.0.0] — 2025
### Added
- Staff Payslip, Transfer Letter, Lesson Note documents.
- Dark mode toggle.
- Zoom controls on preview.

---

## [2.0.0] — 2025
### Added
- Fee Receipt, School Newsletter, Permission Slip, Academic Calendar documents.
- Colour presets, FAQ section.
- Progress bar.

---

## [1.0.0] — 2025 · Initial release *(Adewale Samson Adeagbo)*
### Added
- PWA offline (service worker, manifest).
- Live preview with debounce.
- 4 font families.
- Watermark (DRAFT/COPY/CONFIDENTIAL/SAMPLE + custom).
- QR codes on ID cards.
- Bulk ZIP generation via JSZip.
- Usage statistics, history notes.
- All profile fields.
- 8 document types: Letterhead, Certificate, Flyer, ID Card, Report Card, Letter, Exam Timetable, Admission Form.
