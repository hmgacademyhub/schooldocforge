# 🏛️ SchoolDocForge v7 — Enterprise Plus Edition

> **Free · PWA Offline · 40+ Document Types · 20+ Operations Modules · Multi-Branch · Multi-Currency · 5 Themes · No Login · No AI API · No Backend · No SMTP**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Capable-purple)](#)
[![No AI API](https://img.shields.io/badge/No%20AI%20API-100%25%20Free-success)](#)
[![Version](https://img.shields.io/badge/Version-7.0%20Enterprise%20Plus-brightgreen)](#)
[![Cost](https://img.shields.io/badge/Cost-%E2%82%A60%20%2F%20%240.00-blue)](#-cost-breakdown)

---

## 📌 Overview

**SchoolDocForge v7 Enterprise Plus** is the most complete free school operations platform you can deploy — a single static PWA with **40+ document types** and **20+ working modules** covering every aspect of school administration.

This v7 release **preserves every feature of v1–v6** and adds 23 brand-new modules and document types — all built with free, MIT-licensed libraries and browser-native APIs. No paid services. Ever.

**Total recurring cost: ₦0 / $0.00.**

---

## 🆕 What's New in v7 Enterprise Plus

| Category | v7 Additions |
|---|---|
| **Operations Modules** | 🏥 Clinic (SOAP) · 🚌 Transport · 🍱 Cafeteria · 🏠 Hostel · 📚 Homework Tracker · 🎯 Quiz Player · 📈 KPI Dashboard · 🧾 Expenses · 🗒️ Notes · 🏆 Honor Roll · 📅 Event Calendar |
| **Document Types** | 🧪 SOAP Note · 🚌 Bus Pass · 📋 Bus Roster · 🍱 Cafeteria Menu · 🎫 Meal Ticket · 📚 Homework Sheet |
| **Platform Features** | 🔍 Global Search · 📱 Device Sync (QR) · 🎨 5 Themes · 🔔 Browser Notifications · 🌍 Multi-Currency · 📧 Email Blast · 📊 Trend Line Charts · 📦 Data Bundle Export · 🎓 Interactive Tour · 🪪 Bulk QR Generator · 🔢 Auto-ID Generator · 🧮 GPA Calculator |

**Total features in v7: 60+. Total docs: 40+. Total modules: 20+.**

**Nothing was removed.** Every feature from v1–v6 (4-step wizard, watermarks, fonts, QR codes, batch ZIP, print queue, history, templates, profiles, students, staff, fees, attendance, library, inventory, exam bank, timetable, discipline, visitors, audit log, PIN lock, encrypted backup, multilingual UI, multi-branch, etc.) still works.

---

## 🗂️ File Structure

```
school-doc-forge-v7/
├── index.html                          # Single-page application shell
├── manifest.json                       # PWA manifest
├── sw.js                               # Service worker (v7-0-0 cache)
├── _config.yml                         # GitHub Pages config
├── robots.txt
├── sitemap.xml
├── .gitignore
├── LICENSE                             # MIT
├── README.md                           # This file
├── CHANGELOG.md                        # Full version history v1 → v7
├── CONTRIBUTING.md                     # Contribution guidelines
├── css/
│   └── style.css                       # Complete design system (v1–v7)
├── js/
│   ├── app.js                          # Core engine + v7 doc field extensions
│   ├── generators.js                   # HTML renderers (40+ docs)
│   ├── enterprise.js                   # v6 modules
│   └── enterprise_plus.js              # v7 modules (NEW)
├── docs/
│   ├── DEPLOYMENT.md                   # Step-by-step deployment
│   ├── FEATURES.md                     # v1–v6 feature reference
│   ├── V7_FEATURES.md                  # v7 feature reference (NEW)
│   └── USER_GUIDE.md                   # End-user guide
├── sample-data/
│   ├── students.csv
│   ├── staff.csv
│   ├── books.csv
│   ├── assets.csv
│   └── questions.csv
├── icons/
│   └── README.md
└── .github/
    └── workflows/
        └── pages.yml                   # Auto-deploy CI
```

---

## ✨ Complete Feature Matrix

### 40+ Document Types

| # | Document | Origin |
|---|---|---|
| 1 | School Letterhead | v1 |
| 2 | Certificate (6 sub-types) | v1 |
| 3 | Flyer / Banner | v1 |
| 4 | ID Card (with QR) | v1 |
| 5 | Report Card (auto-graded) | v1 |
| 6 | Official Letter | v1 |
| 7 | Exam Timetable | v1 |
| 8 | Admission Form | v1 |
| 9 | Fee Receipt | v2 |
| 10 | School Newsletter | v2 |
| 11 | Permission Slip | v2 |
| 12 | Academic Calendar | v2 |
| 13 | Staff Payslip | v3 |
| 14 | Transfer Letter | v3 |
| 15 | Lesson Note | v3 |
| 16 | Fee Voucher | v4 |
| 17 | Suspension Letter | v4 |
| 18 | Clearance Form | v4 |
| 19 | Cumulative Transcript | v6 |
| 20 | Visitor Badge | v6 |
| 21 | Exam Paper | v6 |
| 22 | Library Card | v6 |
| 23 | Asset Tag | v6 |
| 24 | Parent Notice | v6 |
| 25 | CA Sheet | v6 |
| 26 | Class Timetable | v6 |
| 27 | Staff ID Card | v6 |
| 28 | Inventory Report | v6 |
| 29 | Library Overdue Notice | v6 |
| 30 | **SOAP Note (Clinic)** | **v7** |
| 31 | **Bus Pass** | **v7** |
| 32 | **Bus Roster** | **v7** |
| 33 | **Cafeteria Menu** | **v7** |
| 34 | **Meal Ticket** | **v7** |
| 35 | **Homework Sheet** | **v7** |

### 20+ Operations Modules

| Module | v |
|---|---|
| School Profile (up to 10 per branch) | v1 |
| Student Records (CRUD + CSV + batch) | v5 |
| Staff Records (CRUD + CSV + batch) | v5 |
| Fee Management (track + receipt + report) | v5 |
| Attendance Tracker (daily, per class) | v5 |
| Templates Gallery | v4 |
| Print Queue | v4 |
| Bulk Tools (ID/Cert/Receipt → ZIP) | v1+ |
| Document History | v4 |
| **Multi-Branch** | v6 |
| **Library Management** | v6 |
| **Inventory / Assets** | v6 |
| **Exam Question Bank** | v6 |
| **Class Timetable Builder** | v6 |
| **Discipline / Merit Log** | v6 |
| **Visitor Log** | v6 |
| **Audit Log** | v6 |
| 🆕 **Health / Clinic (SOAP)** | **v7** |
| 🆕 **Transport / Bus Routes** | **v7** |
| 🆕 **Cafeteria / Menus** | **v7** |
| 🆕 **Hostel / Dormitory** | **v7** |
| 🆕 **Homework Tracker** | **v7** |
| 🆕 **Quiz Player** | **v7** |
| 🆕 **KPI Dashboard** | **v7** |
| 🆕 **Expense Tracker** | **v7** |
| 🆕 **Sticky Notes** | **v7** |
| 🆕 **Event Calendar** | **v7** |
| 🆕 **Honor Roll** | **v7** |

### Platform / UX Features

- **PWA Offline** · **Live Preview** · **4 Document Fonts** · **Watermarks** · **QR Codes** · **Bulk ZIP**
- **Dark Mode** + 🆕 **4 More Themes** (Sepia, High-Contrast, Solarized) = **5 themes total**
- **Keyboard Shortcuts** (Alt+G/S/P/D/K/Q/T/B/L/1-4)
- **Confetti** · **Social Share** · **Accessibility** · **Mobile-friendly**
- **5-Language UI** (English / Yoruba / Hausa / Igbo / French)
- **4-Digit PIN Lock** + **AES-GCM 256-bit Encrypted Backup**
- **Audit Log** + **Birthday Alerts** + **Update Prompt** + **Install Banner**
- 🆕 **Global Search** · 🆕 **Device Sync via QR** · 🆕 **Browser Notifications**
- 🆕 **Multi-Currency Display** (₦/GH₵/KSh/R/CFA/$/£/€)
- 🆕 **Email Blast** (mailto) · 🆕 **WhatsApp Blast** (wa.me) — both free, no API needed
- 🆕 **Trend Line Charts** (SVG) · 🆕 **Data Bundle Export** · 🆕 **Interactive Tour**
- 🆕 **Bulk QR Generator** · 🆕 **Auto-ID Generator** · 🆕 **GPA Calculator**

See **[docs/V7_FEATURES.md](docs/V7_FEATURES.md)** for detailed explanations of every v7 feature.

---

## 🛠️ Technology Stack

| Library | Purpose | License | Cost |
|---|---|---|---|
| jsPDF 2.5.1 | PDF generation | MIT | Free |
| html2canvas 1.4.1 | HTML→canvas snapshots | MIT | Free |
| qrcode.js 1.0.0 | QR drawing | MIT | Free |
| PapaParse 5.4.1 | CSV import/export | MIT | Free |
| JSZip 3.10.1 | ZIP packaging | MIT | Free |
| FileSaver.js 2.0.5 | File downloads | MIT | Free |
| Web Crypto API | AES-256-GCM | Browser-native | Free |
| Notification API | Desktop notifications | Browser-native | Free |
| Google Fonts | DM Serif/Outfit/etc | Free | Free |
| GitHub Pages / Cloudflare Pages / Netlify | Static hosting | Free tier | Free |

**No AI API. No backend. No database. No SMTP server. No SMS gateway. No login.**

---

## 💰 Cost Breakdown

| Item | Recurring Cost |
|---|---|
| Hosting (GitHub Pages / Cloudflare Pages / Netlify) | **₦0** |
| Libraries (all MIT-licensed via cdnjs) | **₦0** |
| Backend / Database | Not used |
| AI / LLM API | Not used (intentional) |
| SMTP / SMS Gateway | Not used (uses native `mailto:` + `wa.me`) |
| Push notification service | Not used (uses native Notification API) |
| Domain (optional) | ~₦3,500/year for `.com.ng`, $10/year for `.com` |
| **Monthly recurring total** | **₦0** |

---

## 🔐 Privacy & Security

- **100% client-side** — data never leaves the browser.
- **Branch isolation** — `localStorage` keys prefixed `sdf_<branch>_*`.
- **Optional AES-GCM 256-bit encrypted backups** (PBKDF2 with 120 000 SHA-256 rounds).
- **Optional 4-digit PIN lock** (session-scoped unlock).
- **Full audit log** of all CRUD/import/export/batch actions (last 500).
- 🆕 **Device-to-device QR sync** — transfer data offline, no cloud.
- 🆕 **Browser notifications** are local (no third-party push service).

---

## 🚀 Quick Start

```bash
# Download/unzip the project
unzip school-doc-forge-v7-enterprise-plus.zip
cd enterprise_new

# Serve locally (any of these — pick one)
python3 -m http.server 8080
# OR
npx serve .
# OR
php -S localhost:8080

# Visit http://localhost:8080
```

**On first visit:** An 8-step interactive tour walks you through the platform. Skip it any time.

For **production deployment**, see **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — step-by-step for GitHub Pages, Cloudflare Pages, Netlify, Vercel, Firebase Hosting, and self-hosted Nginx/Apache.

---

## 👤 Builder

**Adewale Samson Adeagbo** (original author, v1–v5)

| | |
|--|--|
| 📍 | Lagos, Nigeria |
| 🎓 | B.Sc.(Ed) Computer Science Education, LASU (2023) |
| 🏫 | Director, HMG Concepts · HMG Academy · HMG Technologies · HMG Media |
| 📧 | buildingmyictcareer@gmail.com |
| 📞 | +234 810 086 6322 · +234 809 448 1488 |
| 💼 | [linkedin.com/in/adewalesamsonadeagbo](https://linkedin.com/in/adewalesamsonadeagbo) |
| 💻 | [github.com/cssadewale](https://github.com/cssadewale) |
| 🌐 | [cssadewale.pages.dev](https://cssadewale.pages.dev) |
| 🏢 | [hmgconcepts.business.site](https://hmgconcepts.business.site) |
| 📺 | [youtube.com/@hmgconcepts](https://youtube.com/@hmgconcepts) |

> Data Scientist · EdTech Builder · AI-Augmented Solutions Developer · Virtual Tutor · FaithTech Builder
> *"Think clearly. Build anyway."*

**v6 Enterprise & v7 Enterprise Plus** — additive enhancement layers preserving every original feature while adding 30+ new modules, document types, and platform capabilities. All free. All offline. All MIT.

---

## 📄 License

MIT — free to use, modify, redistribute, rebrand. Attribution appreciated but not required.

*© 2025–2026 SchoolDocForge v7 Enterprise Plus · Adewale Samson Adeagbo + Enterprise Plus Layer · MIT · No AI API · No Backend · No SMTP · No Login*
