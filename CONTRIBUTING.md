# 🤝 Contributing to SchoolDocForge

Thank you for considering a contribution! This is a **free, no-AI-API, no-backend** project — please keep the spirit when proposing changes.

---

## 🧭 Ground Rules

1. **No paid services.** Every feature must work without an AI API, paid SMS gateway, or backend.
2. **No regressions.** Pre-existing features stay. The app supports v1 users to v6 users on the same codebase.
3. **Pure static.** No build step. No bundlers. Vanilla JS/HTML/CSS only.
4. **Free MIT-compatible deps only.** New dependencies must be permissively licensed and free-CDN hostable.
5. **Offline-first.** Anything you add must work with the browser disconnected (after first load).
6. **Accessible by default.** Keyboard reachable, ARIA where needed, respects `prefers-reduced-motion`.

---

## 🚧 Project Layout

| Path | Purpose |
|---|---|
| `index.html` | App shell, navigation, sections |
| `css/style.css` | One stylesheet for everything |
| `js/app.js` | Core engine: profiles, wizard, downloads, students, staff, fees, attendance, templates, queue, history, stats, backup |
| `js/generators.js` | One function per document type returning an HTML string |
| `js/enterprise.js` | v6 modules: library, inventory, timetable, discipline, visitors, exam bank, audit, birthdays, WhatsApp blast, i18n, PIN |
| `sw.js` | Service worker (cache version constant lives here) |
| `manifest.json` | PWA metadata |
| `docs/` | Markdown guides |
| `sample-data/` | Onboarding CSVs |

---

## 🛠️ Local Setup

```bash
git clone https://github.com/<you>/school-doc-forge.git
cd school-doc-forge
python3 -m http.server 8080
# open http://localhost:8080
```

That's it. No `npm install`, no `yarn`, no Webpack.

---

## ✏️ Adding a New Document Type

Three coordinated edits:

1. **`index.html`** — Add a tile in the Step 2 grid:

   ```html
   <div class="doc-type-card" onclick="selectDocType('my-doc')" data-type="my-doc" data-tags="my doc tags">
     <div class="doc-type-icon">🎯</div>
     <div class="doc-type-name">My Doc</div>
     <div class="doc-type-desc">Short description</div>
   </div>
   ```

2. **`js/app.js → DOC_FIELDS`** — Add the form schema:

   ```js
   'my-doc': [
     ['name','Recipient Name'],
     ['date','Date','date'],
     ['body','Body','textarea']
   ],
   ```

3. **`js/generators.js → RENDERERS`** — Add the HTML renderer:

   ```js
   'my-doc'(p, f){
     return header(p)
       + `<h3 style="text-align:center;">${esc(f.name||'')}</h3>`
       + `<p>${esc(f.body||'')}</p>`
       + footer(p);
   }
   ```

Test locally → commit → PR.

---

## 🧱 Adding a New Module

If you want to add (say) a Cafeteria module:

1. Add a section in `index.html` styled with `class="ent-section"`.
2. Create CRUD + render functions in `js/enterprise.js`.
3. Use `lsGet('cafeteria', [])` / `lsSet('cafeteria', list)` — they're automatically branch-scoped.
4. Add nav links in the header + mobile-nav.
5. Wire up `audit('action','entity',details)` for accountability.
6. Document the module in `docs/FEATURES.md` and `docs/USER_GUIDE.md`.

---

## 🌐 Translating

Open `js/enterprise.js`, find the `I18N` object, add your locale code:

```js
sw: { hero_title:'Jukwaa la <em>Usimamizi wa Shule</em> Bila Malipo', hero_sub:'…' },
```

Add the language to the `<select id="lang-select">` in `index.html`.

---

## 🐛 Reporting Bugs

Open a GitHub Issue with:

- Browser + OS
- Steps to reproduce
- What you expected vs what happened
- Any console errors (F12 → Console)

---

## 📦 Pull Requests

1. Fork → branch → commit → push → PR.
2. Reference an issue if applicable (`Fixes #42`).
3. Keep PRs focused — one feature or one fix.
4. Update **CHANGELOG.md** (Unreleased section).
5. If your change is user-facing, update **FEATURES.md** and **USER_GUIDE.md** too.

---

## 📜 License of Contributions

By contributing, you agree your work is released under the project's **MIT License**.

---

Thanks for helping keep African schools equipped with free, professional tools. ✨
