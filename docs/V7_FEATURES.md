# 📖 v7 Enterprise Plus — Detailed Feature Guide

This document explains **every new feature added in v7** on top of the existing v6 platform.
All v1–v6 features remain fully functional — see `docs/FEATURES.md` for those.

> **Reminder:** Everything below uses **free tools only**. No AI API. No SMTP server. No paid SMS gateway. No backend. No subscription.

---

## Table of Contents

1. [Health / Clinic Records (SOAP)](#1-health--clinic-records-soap)
2. [Transport / Bus Routes](#2-transport--bus-routes)
3. [Cafeteria / Meal Plans](#3-cafeteria--meal-plans)
4. [Hostel / Dormitory](#4-hostel--dormitory)
5. [Homework / Assignment Tracker](#5-homework--assignment-tracker)
6. [Offline Quiz Player](#6-offline-quiz-player)
7. [KPI Dashboard](#7-kpi-dashboard)
8. [Expense / Income Tracker](#8-expense--income-tracker)
9. [Sticky Notes Board](#9-sticky-notes-board)
10. [Global Search](#10-global-search)
11. [Device Sync via QR](#11-device-sync-via-qr)
12. [Event Calendar](#12-event-calendar)
13. [5 Themes](#13-5-themes)
14. [Browser Notifications](#14-browser-notifications)
15. [Multi-Currency](#15-multi-currency)
16. [Honor Roll](#16-honor-roll)
17. [Bulk QR Generator](#17-bulk-qr-generator)
18. [Auto-ID Generator](#18-auto-id-generator)
19. [GPA / CGPA Calculator](#19-gpa--cgpa-calculator)
20. [Email Blast (mailto)](#20-email-blast-mailto)
21. [Trend Line Charts](#21-trend-line-charts)
22. [Data Bundle Export](#22-data-bundle-export)
23. [Interactive Tour](#23-interactive-tour)
24. [New Document Types](#24-new-document-types)

---

## 1. Health / Clinic Records (SOAP)

**What it is:** A structured medical record system per student following the international **S-O-A-P** convention (Subjective, Objective, Assessment, Plan).

**Fields captured per record:**
- Date, Student, Type (Visit / Vaccination / Allergy / Injury / Medication)
- Vital signs: Temperature, Blood pressure
- **S**ubjective — what the student reports (e.g. "headache since morning")
- **O**bjective — what the nurse observes (e.g. "temp 38.2°C, normal BP")
- **A**ssessment — diagnosis (e.g. "viral fever")
- **P**lan — treatment (e.g. "paracetamol 500mg, rest, monitor")
- Nurse/officer name

**How to use:**
1. Navigate to **Clinic** in the top nav.
2. Click **+ New Record** → fill the form → save.
3. To print a formal SOAP note for a parent/doctor referral → click **🧪 SOAP** on any row.

**Where data lives:** `localStorage` key `sdf_<branch>_clinic`. Branch-isolated.

**Cost:** ₦0.

---

## 2. Transport / Bus Routes

**What it is:** A bus fleet & student-assignment system. Track buses, their drivers, routes, capacity, and which students ride which bus.

**Capabilities:**
- **Add/edit buses** with plate number, route description, driver name+phone, capacity, list of pickup stops.
- **Visual occupancy** (e.g. "Capacity: 18/30").
- **Assign / unassign students** to a bus.
- **Print daily roster** — auto-fills the Bus Roster document with all assigned students for sign-in/sign-out.
- **Print bus pass** — printable laminate-able pass with QR code (encodes the plate number).

**How to use:**
1. **Transport** section → **+ Add Bus** → enter details.
2. Use the **Assign Student to Bus** card at the bottom → pick bus + student → **Assign**.
3. On any bus card → **🧾 Roster** to print the day's passenger list, or **🎫 Pass** for an individual student pass.

**Data:** `sdf_<branch>_buses`, `sdf_<branch>_bus_assignments` (map of student ID → bus ID).

**Cost:** ₦0.

---

## 3. Cafeteria / Meal Plans

**What it is:** A simple weekly menu manager + batch meal-ticket printer.

**Capabilities:**
- **Editable weekly menu** grid (Mon–Fri × Breakfast/Lunch/Snack). Auto-saves on input.
- **Print weekly menu** as a poster.
- **Batch meal tickets** — generate one printable meal ticket per student for a chosen date (ZIP).

**Why no allergen API?** Allergies and dietary preferences live on the student record itself (a free field you can add via the Student modal or by editing the student JSON).

**Data:** `sdf_<branch>_cafe_menu`.

**Cost:** ₦0.

---

## 4. Hostel / Dormitory

**What it is:** Manage boarding rooms and assign students to beds.

**Capabilities:**
- **Add rooms** with: room number, block/wing, type (Male/Female/Staff), bed capacity, notes.
- **Visual grid** — rooms colour-coded:
  - 🟩 Green = empty
  - 🟨 Yellow = partial occupancy
  - 🟥 Red = full
- **Click any room** to view current occupants, remove them, or assign a new student from the unassigned pool.
- **Capacity enforcement** — cannot assign beyond the bed count.

**Data:** `sdf_<branch>_rooms`, `sdf_<branch>_hostel_assignments`.

**Cost:** ₦0.

---

## 5. Homework / Assignment Tracker

**What it is:** Per-class assignment tracking with per-student submission status.

**Workflow:**
1. Teacher creates an assignment: title, class, subject, teacher, assigned date, due date, description.
2. App lists every student in that class against the assignment.
3. Per student, mark status: Pending / Submitted / Late / Missing.
4. Overdue assignments highlighted in red.

**Data:** `sdf_<branch>_homework`. Each homework object includes a `submissions: { studentId: status }` map.

**Cost:** ₦0.

---

## 6. Offline Quiz Player

**What it is:** A browser-based quiz where students answer randomly-chosen questions from the **Exam Question Bank** module (built in v6).

**How it works:**
1. Choose Subject + Class + number of questions.
2. App picks N random questions (Fisher–Yates shuffle).
3. Student types answer per question, clicks Submit, advances.
4. At the end: score (out of marked questions only — questions without an answer key are reported separately), time taken, detailed answer review.

**Why no AI grading?** Questions you've added to the bank already have an "Answer" field (optional). Auto-grading compares the student's answer (case-insensitive, trimmed) to the stored answer key. For theory/essay questions, the answer is shown unmarked for manual review.

**Cost:** ₦0.

---

## 7. KPI Dashboard

**What it is:** A live dashboard of 4 key school operations metrics against editable targets.

**Default KPIs:**
| KPI | Source | Default Target |
|---|---|---|
| Enrolment | Count of `students` | 300 |
| Fee Collection % | Σ paid ÷ Σ fees | 90% |
| Avg Attendance % | Across all saved `att_*` keys | 85% |
| Library Overdue (max) | Count of loans past due | 5 (inverse — lower = better) |

**Each KPI shows:** current value, target, progress bar (green ≥80%, amber ≥50%, red <50%).

**Edit target:** Click "edit" link on any KPI card → enter new target.

**Trend chart:** Below the KPI cards, a pure-SVG line chart shows fees collected per week over the last 8 weeks.

**Data:** `sdf_<branch>_kpi_targets` (object with custom targets).

**Cost:** ₦0.

---

## 8. Expense / Income Tracker

**What it is:** Simple double-entry-style accounting beyond the existing Fee Management.

**Fields per entry:** Date, Type (Income / Expense), Category, Amount, Description, Payment Method, Reference.

**Summary line:** Total Income · Total Expense · Net.

**Use cases:**
- Track utility bills, salaries paid, donations received, equipment repairs.
- Generate CSV for the accountant at month-end.

**Currency:** Displays using the currently-selected currency from the global Currency Switcher (₦ NGN by default).

**Data:** `sdf_<branch>_expenses`.

**Cost:** ₦0.

---

## 9. Sticky Notes Board

**What it is:** Quick reminders board for admin staff — like Post-it notes pinned to the principal's office wall.

**Capabilities:**
- Add note → random pastel colour (yellow, blue, green, pink, purple).
- Notes show creation timestamp.
- Click ✕ to delete.

**Data:** `sdf_<branch>_notes`.

**Cost:** ₦0.

---

## 10. Global Search

**What it is:** A search box in the top bar that searches across **all** modules at once.

**Searches:** Students, Staff, Books, Assets, Questions, Clinic records, Notes — simultaneously.

**Behaviour:**
- Type to filter instantly.
- Results grouped by category with a count per category.
- Click any result to jump to that section.
- Click outside the search box to close.

**Cost:** ₦0.

---

## 11. Device Sync via QR

**What it is:** Transfer all branch data from one device to another using a **QR code** — no cloud, no email, no USB needed.

**How it works:**
1. On Device A → top bar **📱 Sync** button → QR code appears containing all data (JSON).
2. On Device B → scan the QR with any QR scanner app → copy the text.
3. On Device B → top bar **📱 Sync** → **📥 Import data here** → paste the JSON → confirm.

**Limitation:** QR can hold ~1.5 KB. For larger datasets (typical), the app suggests using file-based backup instead.

**Alternative for large data:** Use **🗄️ Backup** to produce a `.json` (or `.enc` encrypted) file → transfer via email / WhatsApp / USB → **🔄 Restore** on the other device.

**Cost:** ₦0.

---

## 12. Event Calendar

**What it is:** A month-view calendar to track school events (sports day, parent-teacher meetings, holidays, etc.).

**Capabilities:**
- Navigate by month with ← Prev / Next →.
- Today's date highlighted.
- Days with events show a teal dot.
- Click any day → modal lists existing events + form to add a new one.

**Data:** `sdf_<branch>_cal_events`.

**Cost:** ₦0.

---

## 13. 5 Themes

**Theme options:**

| Theme | Use Case |
|---|---|
| ☀️ **Light** | Default — best for office printing |
| 🌙 **Dark** | Low-light, evenings, OLED screens |
| 📜 **Sepia** | Soft, vintage look — easier on eyes for long sessions |
| 🔲 **High-Contrast** | Accessibility — for users with low vision |
| 🌅 **Solarized** | Comfortable parchment background |

**How:** Top bar → **Theme** dropdown.

**Cost:** ₦0. Implemented with CSS filters and body classes — no external assets.

---

## 14. Browser Notifications

**What it is:** Desktop/mobile notifications via the free **Notification API** (no push service required, no Firebase).

**Triggers:**
- 🎂 **Today's birthdays** (students or staff)
- 📚 **Overdue library books**

**Setup:**
1. Top bar → **🔔** button → grant permission when prompted.
2. Notifications fire automatically on next page load.

**Privacy:** Notifications are local — they only appear on the device where you granted permission.

**Cost:** ₦0.

---

## 15. Multi-Currency

**What it is:** Display amounts in your local currency throughout the app.

**Supported (display only — no conversion):**
- ₦ NGN — Nigerian Naira
- GH₵ GHS — Ghanaian Cedi
- KSh KES — Kenyan Shilling
- R ZAR — South African Rand
- CFA XOF — West African CFA
- $ USD, £ GBP, € EUR

**How:** Top bar → **Currency** dropdown.

**Note:** This is a display change only. The app does NOT convert exchange rates (would require a paid API). All historical amounts remain as entered.

**Cost:** ₦0.

---

## 16. Honor Roll

**What it is:** Top 10 students by average score, with gold/silver/bronze ranking colours.

**How to populate:**
1. **Honor Roll** section → **+ Set Score** → pick student → enter their average score.
2. Or run report cards (in the Generator) — future enhancement could auto-populate from there.

**Cost:** ₦0.

---

## 17. Bulk QR Generator

**What it is:** Generate up to 100 QR codes at once from a list (one per line).

**Use cases:**
- QR codes for every classroom door (encoding the timetable URL).
- QR codes for every asset (encoding asset tags).
- QR codes for every event registration link.

**Output:** Inline grid preview + **📦 Download ZIP** button for all PNGs.

**Cost:** ₦0. Powered by `qrcode.js` (already used elsewhere in the app).

---

## 18. Auto-ID Generator

**What it is:** Generate sequential IDs / admission numbers following a pattern.

**Pattern syntax:**
- `{YEAR}` → current year
- `{####}` → zero-padded sequence number (number of `#` = pad width)

**Examples:**
- `GA/{YEAR}/{####}` → `GA/2026/0001`, `GA/2026/0002`, …
- `STAFF-{##}` → `STAFF-01`, `STAFF-02`, …

**Output:** Plain text list — copy to clipboard or paste into the CSV importer.

**Cost:** ₦0.

---

## 19. GPA / CGPA Calculator

**What it is:** Calculate GPA across 4 grading scales.

**Supported scales:**
| Scale | Description |
|---|---|
| **NG 4.0** | Nigerian 4-point system (A=4.0, B=3.0, C=2.0, D=1.0, F=0) |
| **NG 5.0** | Nigerian 5-point university system (A=5.0, B=4.0, C=3.0, D=2.0, E=1.0, F=0) |
| **UK Honours** | 1st (≥70), 2:1 (60-69), 2:2 (50-59), 3rd (40-49), Fail |
| **US** | A (90+), B (80+), C (70+), D (60+), F |

**Input format** (one course per line): `Course Name, Credits, Score`

**Output:** Per-course breakdown + final GPA + total credits + total points.

**Cost:** ₦0.

---

## 20. Email Blast (mailto)

**What it is:** Bulk-personalized emails via per-recipient `mailto:` links.

**How it works:**
- App generates one `mailto:user@example.com?subject=...&body=...` link per recipient.
- Click each link → opens your default mail client (Outlook, Gmail in browser, Apple Mail, etc.) with the email pre-filled.
- You click Send in the mail client.

**Templating:** Use `{name}`, `{class}`, `{balance}` in the body — substituted per recipient.

**Why per-link instead of SMTP?** SMTP servers either cost money or require credentials and rate limits. The user's own mail client is already paid for and trusted by recipients.

**Cost:** ₦0.

---

## 21. Trend Line Charts

**What it is:** Pure-SVG line chart showing **fees collected per week** over the last 8 weeks.

**Why no Chart.js?** Chart.js is ~70 KB and overkill for one line chart. The SVG version is ~30 lines of code, scales perfectly, and never breaks offline.

**Where:** Bottom of the KPI Dashboard section.

**Extensible:** The `renderSVGLine(series)` helper can render any time series. Examples: attendance over time, enrolment over years.

**Cost:** ₦0.

---

## 22. Data Bundle Export

**What it is:** One-click export of **every CSV** in the system into a single ZIP.

**Contents of the ZIP:**
- `students.csv`, `staff.csv`, `books.csv`, `loans.csv`, `loan_history.csv`
- `assets.csv`, `questions.csv`, `discipline.csv`, `visitors.csv`
- `clinic.csv`, `buses.csv`, `expenses.csv`, `homework.csv`, `payments.csv`
- `cal_events.csv`, `notes.csv`, `audit-log.csv`
- `README.txt` — timestamp + branch info

**Use cases:**
- Annual archival.
- Migrating to a different system (any database can import CSV).
- Sharing with auditors / accountants.
- Backup before major upgrades.

**Cost:** ₦0.

---

## 23. Interactive Tour

**What it is:** A first-visit walkthrough that highlights each major section of the app with a tooltip explanation.

**Triggers:** Automatically on first load (if `sdf_tour_done` flag is not set). Re-runnable any time by clearing the flag in browser console:

```js
localStorage.removeItem('sdf_tour_done'); location.reload();
```

**8 tour steps:** Hero → Branch Bar → Features → Generator → Students → Library → KPI → Done.

**Cost:** ₦0.

---

## 24. New Document Types

| Doc Type | Purpose |
|---|---|
| 🧪 **SOAP Note** | Formal clinic record for parent/doctor referral |
| 🚌 **Bus Pass** | Printable laminate-able transport pass with QR |
| 📋 **Bus Roster** | Daily passenger list for sign-in/sign-out |
| 🍱 **Cafeteria Menu** | Weekly menu poster for cafeteria wall |
| 🎫 **Meal Ticket** | Individual meal voucher |
| 📚 **Homework Sheet** | Printable assignment handout for parents |

Total document types in v7: **40+** (was 30+ in v6).

---

## 📋 Cost Summary

| Item | Cost |
|---|---|
| All v7 features above | **₦0 / $0.00** |
| Notification API | Browser-native — free |
| Web Crypto API (encryption) | Browser-native — free |
| QR generation (`qrcode.js`) | MIT — free |
| SVG charts | Hand-rolled — free |
| `mailto:` email blasts | Uses user's own mail client — free |
| `wa.me` WhatsApp blasts (v6) | Free WhatsApp deep-links |
| Hosting (GitHub Pages / Cloudflare Pages / Netlify) | Free tier |
| AI API | Not used (intentional) |
| SMTP server | Not used |
| SMS gateway | Not used |
| Backend / Database | Not used |

**Bottom line:** The entire v7 platform is free to run forever.
