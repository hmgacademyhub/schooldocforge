# 📖 Feature Reference — SchoolDocForge v7 Enterprise Plus

A detailed, plain-English explanation of **every feature** in the system. Use this file as the canonical answer to *"What does this app actually do?"*

Features are grouped by module. Each entry covers: **what it does**, **how to use it**, **where the data lives**, and **what it costs**.

---

## 0. Architecture Overview

- **Pure static SPA** — single `index.html` + CSS + 3 JS files. No build step.
- **Storage:** browser `localStorage`. Keys are prefixed `sdf_<branch>_<key>`, giving each branch a sandboxed data space.
- **Networking:** none required after first page load. Service worker (`sw.js`) caches the shell + CDN libraries.
- **External dependencies:** all free, MIT-licensed, loaded from cdnjs. Cached locally after first visit.

---

## 1. School Profile System (v1)

**What:** Up to 10 named school profiles per branch. Each captures: name, motto, type, address, city/LGA, state, phone, email, website, accreditation, principal & vice-principal names, year founded, current session & term, bank details, brand colours, document font, and a logo image.

**How:** Step 1 of the generator → fill the form → **💾 Save**. Switch profiles with the dropdown at the top of Step 1.

**Data:** `sdf_<branch>_profiles` (object) + `sdf_<branch>_active_profile` + `sdf_<branch>_school_logo` (Data-URI of the image).

**Cost:** Free.

---

## 2. PWA Offline (v1, hardened in v6)

**What:** Once visited, the app works fully offline. Installable to home screen on Android, iOS (Add-to-Home-Screen), Windows, macOS, ChromeOS, and Linux.

**How:** Visit once over HTTPS; the service worker caches everything. In Chrome, a custom **Install App** banner appears in v6.

**v6 upgrade:** Update prompt — when a new `sw.js` is deployed, users see a toast inviting them to refresh.

**Cost:** Free.

---

## 3. Live Preview (v1)

**What:** As you fill Step 3, the document updates in a side panel. 300 ms debounce keeps typing smooth. Collapsible.

**Cost:** Free.

---

## 4. Font Selector (v1)

**What:** Choose the typeface for the *document body* (separate from the app's UI font). Options: Georgia, Merriweather, Lato, Playfair Display. Loaded from Google Fonts (free, cached by SW).

**Cost:** Free.

---

## 5. Watermark (v1)

**What:** Overlay DRAFT / COPY / CONFIDENTIAL / SAMPLE — or any custom text — diagonally across any document. Configurable opacity (Light/Medium/Heavy) and colour.

**Use:** Step 3 → 💧 Watermark bar above the live preview.

**Cost:** Free.

---

## 6. QR Codes (v1)

**What:** ID Cards, Library Cards, and Asset Tags embed a QR code via `qrcode.js`. Encodes whatever text you supply (URL, ID number, asset tag).

**Cost:** Free.

---

## 7. Bulk Tools — CSV → ZIP (v1)

**What:** Upload a CSV (download the template first), and the app renders one document per row, packages them all into a ZIP via JSZip.

**Modules:** Bulk ID Cards, Bulk Certificates, Bulk Receipts (v6 added).

**Cost:** Free.

---

## 8. Keyboard Shortcuts (v1, expanded v6)

| Combo | Action |
|---|---|
| `Alt + D` | Toggle dark mode |
| `Alt + K` | Show shortcuts panel |
| `Alt + G` | Jump to Generator |
| `Alt + S` | Save current profile |
| `Alt + P` | Print current preview |
| `Alt + Q` | Add current doc to print queue |
| `Alt + T` | Save current customisation as template |
| `Alt + B` | Run full backup |
| `Alt + L` | **(v6)** Lock app with PIN |
| `Alt + 1–4` | Jump to wizard step 1–4 |
| `Esc` | Close modals/panels |

---

## 9. Templates Gallery (v4)

**What:** After customising a doc in Step 3, **💾 Save** the field values + watermark settings as a named template. Reload from the Templates Gallery section any time. Export/import as JSON.

**Data:** `sdf_<branch>_templates`.

**Cost:** Free.

---

## 10. Print Queue (v4)

**What:** While generating individual docs, click **➕ Queue** on Step 4. The queue accumulates docs. Hit **🖨️ Print All** to send all queued docs to the printer in a single job (each on its own page, page-break automatic).

**Data:** `sdf_<branch>_pqueue`.

**Cost:** Free.

---

## 11. Document History (v4)

**What:** Every doc you generate is logged (last 200 entries kept, oldest auto-pruned). Real-time keyword search + type filter.

**Data:** `sdf_<branch>_history`.

**Cost:** Free.

---

## 12. Full Backup & Restore (v4, v6 encryption)

**What:** Export ALL app data (profiles, students, staff, fees, attendance, library, inventory, etc.) as a single JSON file. Restore the same way.

**v6 upgrade:** Tick **"Encrypt backup"** → enter a password → the export is encrypted via AES-GCM 256-bit (PBKDF2-derived key, 120 000 iterations). File extension is `.enc`.

**Use:** Step 1 → 🗄️ Backup / 🔄 Restore buttons.

**Cost:** Free (uses native Web Crypto API).

---

## 13. Announcement Banner (v4)

**What:** A dismissible info bar at the top of the page (e.g. "New Term starts Sept 15"). Sticks across visits until the user dismisses it (or you clear it).

**Use:** Step 1 → 📢 Banner bar.

**Cost:** Free.

---

## 14. Confetti Celebration (v4)

**What:** When you click **Generate**, a canvas-based particle burst rewards you. No external library.

**Cost:** Free.

---

## 15. Social Share (v4)

**What:** About section → share buttons → Twitter/X, WhatsApp, LinkedIn. Uses each network's free share URL.

**Cost:** Free.

---

## 16. Accessibility (v4)

- Skip-to-content link (visible on Tab).
- ARIA roles on tabs, modals, toasts.
- `tabindex="-1"` step headings so focus moves with the user.
- `prefers-reduced-motion` respected in CSS.

**Cost:** Free.

---

## 17. Student Records (v5)

**What:** Full CRUD per branch. Fields: name, class, admission number, gender, DOB, phone, guardian, guardian phone, address, total fees, paid amount.

**Operations:** Add, edit, delete, search, CSV import, CSV export, download template, **promote all** (auto-bump every student to the next class).

**Batch Generate:** Tick **⚡ Batch Generate** to produce ID cards / report cards / fee receipts / library cards for ALL students in a single ZIP.

**Data:** `sdf_<branch>_students`.

**Cost:** Free.

---

## 18. Staff Records (v5)

**What:** Full CRUD. Fields: name, position, department, phone, email, DOB, salary, status (Active/Leave/Inactive).

**Operations:** Add, edit, delete, search, CSV import/export. **Batch ID Cards** and **Batch Payslips** for the entire staff list with one click.

**Data:** `sdf_<branch>_staff`.

**Cost:** Free.

---

## 19. Fee Management (v5)

**What:** Per-student fee tracking. Record payments individually or in bulk via CSV. View Total Collected vs Outstanding, status badges (Paid / Partial / Unpaid).

**Use:** Fees section → **+ Record Payment** → choose student, amount, method, purpose.

**Reports:** **📤 Export Report** as CSV.

**Data:** `sdf_<branch>_students` (each student carries `fees`/`paid`) + `sdf_<branch>_payments` (audit-style payment history).

**Cost:** Free.

---

## 20. Attendance Tracker (v5)

**What:** Daily attendance per class. Mark each student Present / Absent / Late / —. **All Present** shortcut. Save → stats appear below the table. CSV export per day.

**Data:** `sdf_<branch>_att_<class>_<YYYY-MM-DD>` (one key per class-day).

**Cost:** Free.

---

## 21. Multi-Branch Support 🆕 v6

**What:** Each school chain or campus has its own isolated dataset. Switch via the top bar.

**How:**
1. Top bar → **+ Add** → enter "Ikeja Annex" → creates branch `ikeja-annex`.
2. Dropdown → select the new branch. Profiles, students, staff, fees, library, inventory, audit log — **everything reloads** scoped to that branch.

**Data isolation:** Storage keys are prefixed `sdf_<branch>_…`, so the `main` branch never sees `ikeja-annex` data and vice versa.

**Cost:** Free.

---

## 22. Library Management 🆕 v6

**What:** Catalog books, issue them to students, track returns, auto-fine overdue books.

**Tabs:**
- **📚 Books** — CRUD (title, author, ISBN, category, copies, shelf location), CSV import/export.
- **🔄 Active Loans** — issue a book to a student for N days; the table shows days-left and accrued fine (₦50/day default, edit in `enterprise.js`).
- **📜 History** — returned loans with fines paid.

**Returns:** Click **↩️ Return** on a loan → if overdue, app asks the fine amount → moves the loan to history.

**Overdue notice:** Click **📨 Notice** on any active loan → pre-fills a "Library Overdue Notice" document for printing.

**Data:** `sdf_<branch>_books`, `sdf_<branch>_loans`, `sdf_<branch>_loan_history`.

**Cost:** Free.

---

## 23. Inventory / Asset Register 🆕 v6

**What:** Track every physical asset (laptops, desks, generators, lab equipment). Per asset: name, tag number, category, custodian, acquisition date, cost, useful life, current condition.

**Depreciation:** Computed automatically via straight-line method (`net = cost − cost ÷ life × yearsHeld`).

**Tools:**
- **🏷️ Print Asset Tag** button on each row → opens the generator pre-filled, with a QR code of the tag number.
- **Category bar chart** at the bottom shows total value per category (pure SVG).
- CSV import/export.

**Data:** `sdf_<branch>_assets`.

**Cost:** Free.

---

## 24. Exam Question Bank 🆕 v6

**What:** Store a pool of questions per Subject + Class + Type + Difficulty. The Paper Generator picks **N random questions** matching your filters (Fisher–Yates shuffle).

**Tabs:**
- **📥 Bank** — Add/import questions. CSV columns: `subj, cls, type, diff, text, ans`.
- **📝 Generate Paper** — choose subject, class, # of questions, duration → click **🎲 Generate Random Paper**. Preview shows on the page. Click **⬇️ Send to Generator** to convert it to a printable PDF in the regular doc generator.

**Why no AI?** Randomized selection from a teacher-curated bank is pedagogically sound, completely free, deterministic, and offline-friendly. AI would cost money per request and could hallucinate wrong questions.

**Data:** `sdf_<branch>_questions`.

**Cost:** Free.

---

## 25. Class Timetable Builder 🆕 v6

**What:** A 5-day × 8-period grid for each class. Click any cell → enter `Subject / Teacher` → save. Cells where the same teacher is double-booked across classes appear **red**.

**Use:** Timetable section → pick a class → click cells. **🖨️ Print** opens the printable "Class Timetable" doc pre-filled.

**Data:** `sdf_<branch>_tt_<class>` (one key per class).

**Cost:** Free.

---

## 26. Discipline / Merit Log 🆕 v6

**What:** Track both negative incidents and positive merits per student, with points, descriptions, and actions taken.

**Use:**
- **+ Log Incident / Merit** → pick student → type (Incident/Merit) → points (±) → description → action.
- **📨 Notice** on any entry → opens a pre-filled Parent Notice ready to print.
- Filter by type, search across all fields, CSV export.

**Data:** `sdf_<branch>_discipline`.

**Cost:** Free.

---

## 27. Visitor Log 🆕 v6

**What:** Sign in / sign out school visitors with name, phone, purpose, host. Auto-timestamps. Optional **printable badge** on sign-in.

**Use:** Visitors section → **+ Sign In Visitor** → fill → confirm → optionally print badge. Click **Sign Out** when they leave.

**Filter by date → 📤 Export Day Report** for security audits.

**Data:** `sdf_<branch>_visitors`.

**Cost:** Free.

---

## 28. Audit Log 🆕 v6

**What:** Every create / update / delete / import / export / payment / batch action is logged with timestamp, action type, entity, details, and branch. Last 500 entries kept; oldest auto-pruned.

**Use:** Audit Log section → browse, export CSV, or clear.

**Why local-only?** Keeps the app 100% free and private. For multi-admin auditing, regularly **📤 Export CSV** and archive externally.

**Data:** `sdf_audit` (global — intentionally NOT branch-prefixed, so the log records cross-branch switches too).

**Cost:** Free.

---

## 29. WhatsApp Blast 🆕 v6

**What:** Bulk message students or staff. The app builds one `https://wa.me/<phone>?text=...` link per recipient. Click each to open WhatsApp Web/App and send.

**Why per-link instead of API?** Official WhatsApp Business API costs money per message. `wa.me` is free and works without registration.

**Templating:** Use `{name}`, `{class}`, `{balance}` placeholders in your message — they are replaced per-recipient.

**Use:** Students or Staff section → **📲 WhatsApp Blast** button.

**Cost:** Free.

---

## 30. PIN Lock 🆕 v6

**What:** A 4-digit PIN gate for shared devices (e.g. the front-desk laptop). When set, the app overlays a number-pad on every load until the correct PIN is entered.

**Use:** Top bar → **🔒 Lock** → set PIN on first use → app locks.

**Reset:** "Reset PIN" link on the lock screen → wipes the PIN (does NOT delete app data).

**Storage:** `localStorage` (the PIN itself) + `sessionStorage` (unlocked flag, cleared on browser close).

**Limitations:** This is a *deterrent*, not military-grade security. For real protection, use Encrypted Backup + a strong PIN + don't store the only copy of sensitive data in localStorage.

**Cost:** Free.

---

## 31. Encrypted Backup 🆕 v6

**What:** AES-GCM 256-bit encryption via the browser's **Web Crypto API**. PBKDF2 with 120 000 iterations of SHA-256 derives the key from your password.

**Use:** Step 1 → tick **"Encrypt backup"** → click **🗄️ Backup** → enter a password. File extension is `.enc`. To restore, the **🔄 Restore** button auto-detects `.enc` and prompts for the password.

**Algorithm details:** Random 16-byte salt + random 12-byte IV per file. Output is base64 of `salt || IV || ciphertext`.

**Cost:** Free (native browser API).

---

## 32. Multilingual UI 🆕 v6

**What:** Switch hero text between **English · Yoruba · Hausa · Igbo · French**. Top bar → 🌐 language selector.

**Extending:** Add more keys to the `I18N` object in `js/enterprise.js`. Mark up new HTML elements with `data-i18n="key_name"`.

**Why static, not Google Translate?** Google Translate API costs $20/million chars and breaks offline. A small static dictionary is free, instant, and works in airplane mode.

**Cost:** Free.

---

## 33. SVG Analytics 🆕 v6

**What:** Pure-SVG horizontal bar charts for:
- Documents by type (Stats section).
- Asset value by category (Inventory section).
- (Extensible — add your own; see `chart-bar-h` CSS class.)

**Why no Chart.js?** Chart.js is great but ~70 KB. Our SVG bars are ~1 KB CSS + 5 lines of HTML per bar, render instantly, and never break offline.

**Cost:** Free.

---

## 34. Birthday Alerts 🆕 v6

**What:** On page load, the app scans students + staff DOBs. If anyone has a birthday in the next 7 days, a pink "🎂 Birthdays this week" widget appears below the hero.

**Cost:** Free.

---

## 35. Install Banner 🆕 v6

**What:** A custom prompt at the bottom-right inviting users to install the PWA. Surfaced when Chrome fires `beforeinstallprompt` (i.e. when the install criteria are met).

**Cost:** Free.

---

## 36. Update Prompt 🆕 v6

**What:** When you deploy a new `sw.js`, the service worker's `updatefound` event triggers an in-app banner: *"A new version is available. Refresh."*

**How to use:** Always bump the `CACHE` constant in `sw.js` when you ship new code (e.g. `sdf-v6-0-0` → `sdf-v6-0-1`).

**Cost:** Free.

---

## Cost Summary

| Feature | Recurring Cost |
|---|---|
| Every single feature listed above | **₦0 / $0.00** |
| Hosting (GitHub Pages / Cloudflare Pages / Netlify) | **₦0** |
| Libraries (jsPDF, html2canvas, etc.) | **₦0** (MIT licensed) |
| AI API | **₦0** (not used — intentionally) |
| SMS API | **₦0** (uses free wa.me deep-links) |
| Database / Backend | **₦0** (browser localStorage only) |

---

**Bottom line:** A small school can run its entire document and operations workflow on this app indefinitely for free. A large school can run hundreds of branches by simply adding more branch entries.

*Last updated: 2026 · License: MIT*
