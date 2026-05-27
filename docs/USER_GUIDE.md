# 👤 User Guide — SchoolDocForge v7 Enterprise Plus

A practical, click-by-click guide for the people who will use this app every day: head teachers, bursars, secretaries, librarians, and class teachers.

---

## ⏱️ 60-Second Quickstart

1. Open the app (your `https://…` URL).
2. Step 1 → fill **School Name + Address + Phone** → **💾 Save** profile.
3. Step 2 → click **Letterhead**.
4. Step 3 → fill recipient + subject + body. Watch the preview update.
5. Step 4 → click **⬇️ PDF**. Done.

---

## 🧭 Navigation

The top header has links to every module. The bottom-right has a back-to-top button. Mobile users get a ☰ hamburger menu.

The **top bar** (above the header) has:
- 🏢 **Branch selector + "Add"** — switch or create branches.
- 🌐 **Language selector** — 5 languages.
- 🔒 **Lock** — set / activate PIN lock.

---

## 📋 1. School Profile

Fill once, reuse forever. Save up to 10 profiles per branch.

- ✅ Required: School Name, Address, Phone.
- 🎨 Brand colours feed every document.
- 🖼️ Upload your logo (PNG/JPG/SVG, max 2 MB) — it persists across sessions.
- 💾 **Save** → 📋 **Duplicate** for a sister school → 📤 **Export** profile as JSON for sharing.
- 🗄️ **Backup** (Alt + B) saves everything (profiles + students + library + etc.) as one file. Tick **"Encrypt backup"** for AES protection.

---

## 📑 2. Generate a Document (4-Step Wizard)

### Step 1 — Profile
Confirm the active profile.

### Step 2 — Choose Type
Click any of the 30+ tiles. Use the 🔍 search to filter. Click **Customise →**.

### Step 3 — Customise
- Each doc type has its own form.
- The **Live Preview** panel updates as you type.
- Use **💧 Watermark** to mark drafts, copies, etc.
- Use **📁 Templates** to save the current set of fields for re-use.

### Step 4 — Download
- **⬇️ PDF** — A4 PDF (auto-orientation).
- **🖼️ PNG / 📷 JPG** — image exports.
- **➕ Queue** — adds to the print queue for batch printing later.
- **🖨️ Print** — direct browser print.
- **📲 WhatsApp** / **🔗 Copy** — share.

---

## 👨‍🎓 3. Student Records

### Add one student
**+ Add Student** → fill the modal → save.

### Add many students
1. Click **⬇️ Template** → opens a sample CSV.
2. Edit in Excel / LibreOffice / Google Sheets. Don't change column headers.
3. **📥 Import CSV** → choose your file.

### Promote at end of session
**📈 Promote All** moves everyone up one class (e.g. JSS1 → JSS2). SSS3 becomes "Graduated".

### Generate documents for many students
**⚡ Batch Generate** → pick doc type → produces a ZIP with one document per student.

---

## 💰 4. Fee Management

1. First, ensure every student has a **Total Fees** value (in the Students module).
2. Fees section → **+ Record Payment** → pick student, amount, method.
3. **Status badges** auto-update: Paid · Partial · Unpaid.
4. **📤 Export Report** for the bursar's records.

To set the same fee for everyone in a class, prepare a CSV `class,fees` and click **📥 Import Fee Structure**.

---

## 📅 5. Attendance

1. Pick **Class** + **Date** → **📋 Load Students**.
2. Mark each student. **✅ All Present** is your friend.
3. **💾 Save Attendance** → totals appear below.
4. **📤 Export** as CSV for end-of-week reports.

---

## 📚 6. Library

### Day-one setup
**📥 Import CSV** the sample `books.csv` (or your own).

### Daily flow
1. Switch to **🔄 Active Loans** tab.
2. **+ Issue Book** → pick book + borrower + days.
3. When returned → click **↩️ Return**. If late, the app calculates the fine at ₦50/day; enter how much was actually paid; it moves to History.

### Sending overdue notices
**📨 Notice** on any active loan → opens the doc generator pre-filled. Print or WhatsApp it.

---

## 📦 7. Inventory / Asset Register

1. **+ Add Asset** → fill name, tag, category, cost, useful life.
2. The table auto-computes **Net Value** (straight-line depreciation).
3. **🏷️** prints a physical Asset Tag (with QR code of the tag number).
4. Filter by category to audit one section at a time.
5. Use the **Asset value by category** chart for quarterly reports.

---

## 📝 8. Exam Question Bank

### Build the bank
- Teachers add questions one by one (**+ Add Question**) or bulk via CSV (`subj, cls, type, diff, text, ans`).
- Tag each question with Subject, Class, Type, Difficulty.

### Generate a paper
1. Switch to **📝 Generate Paper** tab.
2. Choose subject, class, # of questions, duration, title.
3. **🎲 Generate Random Paper** → preview appears.
4. **⬇️ Send to Generator** → produces a printable PDF.

**Tip:** Build the bank gradually over a term — by Term 2 you'll have a goldmine.

---

## 🗓️ 9. Class Timetable Builder

1. Pick a class.
2. Click any cell → enter `Subject / Teacher` (e.g. `Mathematics / Mr. Obi`).
3. Cells where the same teacher is double-booked across classes turn **red**.
4. **🖨️ Print** → produces the printable Class Timetable doc.

---

## ⚖️ 10. Discipline & Merits

1. **+ Log Incident / Merit** → choose student, type, points (use negative for incidents), description, action taken.
2. Filter to see only incidents or only merits.
3. **📨 Notice** → generates a Parent Notice ready to print or WhatsApp.

---

## 🚪 11. Visitor Log

Best run on the front-desk computer.

1. Visitor arrives → **+ Sign In Visitor** → fill in → confirm → ✅ optionally **Print Badge** (auto pre-fills the Visitor Badge document with the visitor's initial as the photo).
2. Visitor leaves → **Sign Out** on their row → timestamp recorded.
3. Daily report: pick date → **📤 Export Day Report**.

---

## 📲 12. WhatsApp Blast

For sending messages to many parents/staff cheaply:

1. Students or Staff section → **📲 WhatsApp Blast**.
2. Edit the message template. Use placeholders:
   - `{name}` → recipient's name
   - `{class}` → student's class
   - `{balance}` → outstanding fees (₦)
3. Click **Build links** → one "Send" button per recipient → click each to send via WhatsApp.

**Note:** Each click sends one message via your own WhatsApp account. There is no "blast everyone in one click" — that's intentional, both for cost reasons (zero) and to comply with WhatsApp's anti-spam rules.

---

## 🔒 13. PIN Lock

For shared devices:

1. Top bar → **🔒 Lock** → set a 4-digit PIN (you'll be prompted the first time).
2. The app immediately locks. To unlock, enter the PIN.
3. Closing the browser locks the app again on next open.
4. Forgot the PIN? On the lock screen, click **"Reset PIN"** at the bottom — removes the lock (does **not** delete data).

---

## 🗄️ 14. Backup & Restore

**Critical habit:** Back up weekly.

- **Plain backup** → 🗄️ Backup → `.json` file. Save to Google Drive / Dropbox / email it to yourself.
- **Encrypted backup** → tick the checkbox → choose a strong password → `.enc` file. Cannot be opened without the password.

To restore: 🔄 Restore → choose the file → (if `.enc`, enter the password). The app reloads with restored data.

---

## ⌨️ 15. Keyboard Shortcuts

Power-user tips:

- `Alt + S` saves the active profile.
- `Alt + Q` queues the current preview for batch printing.
- `Alt + B` runs a backup.
- `Alt + 1–4` jumps wizard steps.
- `Esc` closes any modal / panel.

---

## 🛡️ 16. Security Hygiene

- The app is **client-only**. If your device is lost, anyone with browser access could see the data.
- For shared devices: use **PIN Lock** + clear browser storage when an employee leaves.
- For sensitive backups: use **Encrypted Backup**.
- Use **Audit Log** + periodic CSV exports for accountability across multiple admins.

---

## ❓ FAQ

**Q: Can I use this on multiple devices?**
A: Yes, but data does NOT auto-sync (no backend). Workflow: export a backup from device A, import it on device B.

**Q: What happens if I clear my browser cache?**
A: The **app** survives (PWA cache), but **your data** is lost. Always keep a recent backup.

**Q: Can two admins edit simultaneously?**
A: Not in real time. Each admin works on their own device's data. Use audit-log exports to reconcile.

**Q: Can I customise the look?**
A: Yes — Step 1 → set Primary Colour, Accent Colour, Document Font, Logo. Affects every document.

**Q: Why ₦50/day library fine? Where do I change it?**
A: Hard-coded in `js/enterprise.js` → search for `const fine = 50;`.

**Q: I want a new document type — how?**
A: Add an entry to `DOC_FIELDS` (in `app.js`) and a matching function in `RENDERERS` (in `generators.js`). Then add a card in Step 2 of `index.html`. PRs welcome.

---

Need more help? See **[FEATURES.md](FEATURES.md)** for the technical reference or open an issue on the repo.

---

## 🆕 v7 Modules Quick Reference

For the 11 new v7 modules (Clinic, Transport, Cafeteria, Hostel, Homework, Quiz, KPI, Expenses, Notes, Calendar, Honor Roll) and 12 new platform features (Global Search, QR Sync, Themes, Notifications, Currency, Email Blast, Tour, etc.), see the comprehensive **[V7_FEATURES.md](V7_FEATURES.md)** document.

### Top-bar quick reference (v7)

| Control | Function |
|---|---|
| 🏢 Branch dropdown | Switch campus / add new branch |
| 🌐 Language dropdown | EN / YO / HA / IG / FR |
| 🔒 Lock | Set/activate 4-digit PIN |
| 🔍 Global search | Search students, staff, books, assets, questions, clinic, notes |
| 🎨 Theme dropdown | Light / Dark / Sepia / High-Contrast / Solarized |
| 🌍 Currency dropdown | ₦ NGN / GHS / KES / ZAR / XOF / USD / GBP / EUR |
| 🔔 Notifications | Enable browser notifications |
| 📱 Sync | QR-based device-to-device data transfer |
