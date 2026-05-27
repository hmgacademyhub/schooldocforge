# 🚀 Deployment Guide — SchoolDocForge v7 Enterprise Plus

This guide walks you through deploying SchoolDocForge v7 Enterprise Plus to the web. Every option listed below is **100% free** for the project's needs.

> **Prerequisite reminder:** This project is **pure static HTML/CSS/JS**. There is no build step, no Node, no server-side runtime. You upload the files, and the browser does the rest.

---

## 📋 Table of Contents

1. [Pre-flight Checklist](#0-pre-flight-checklist)
2. [Option A — GitHub Pages (recommended)](#option-a--github-pages-recommended)
3. [Option B — Cloudflare Pages](#option-b--cloudflare-pages)
4. [Option C — Netlify (drag-and-drop in 2 minutes)](#option-c--netlify-drag-and-drop)
5. [Option D — Vercel](#option-d--vercel)
6. [Option E — Firebase Hosting](#option-e--firebase-hosting)
7. [Option F — Self-hosted Nginx / Apache](#option-f--self-hosted-nginxapache)
8. [Custom domain](#custom-domain)
9. [Post-deploy smoke test](#post-deploy-smoke-test)
10. [Updating / re-deploying](#updating--re-deploying)
11. [Troubleshooting](#troubleshooting)

---

## 0. Pre-flight Checklist

Before any deployment:

- [ ] You have the **complete `enterprise/` folder** (extracted from the ZIP).
- [ ] `index.html`, `manifest.json`, `sw.js`, `css/style.css`, `js/app.js`, `js/generators.js`, `js/enterprise.js` are all present.
- [ ] You have a free **GitHub account** (sign up at https://github.com/signup if needed).
- [ ] Optional: a custom domain.

**Test locally first** (highly recommended):

```bash
cd enterprise
python3 -m http.server 8080
# OR
npx serve .
```

Open `http://localhost:8080` — the app should load, PWA should register, and you should see no console errors (press F12 in the browser).

---

## Option A — GitHub Pages (recommended)

**Why:** Free forever, automatic HTTPS, custom domain support, ships from a Git repo, includes a CI workflow we already wrote for you.

### A.1 Create the repository

1. Go to https://github.com/new
2. **Repository name:** `school-doc-forge` (or anything you like)
3. **Description:** "Free PWA for school document generation and operations management"
4. **Visibility:** **Public** (required for free GitHub Pages on personal accounts)
5. **Do NOT** tick "Add a README" — we already have one.
6. Click **Create repository**.

### A.2 Push the files (Git CLI method)

```bash
cd /path/to/enterprise                       # the unzipped folder
git init
git add .
git commit -m "feat: SchoolDocForge v7 Enterprise Plus initial commit"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/school-doc-forge.git
git push -u origin main
```

> If you've never used Git, install it from https://git-scm.com/downloads first.

### A.2 alt — Upload via the web UI (no Git required)

1. On the new repo page, click **uploading an existing file**.
2. Drag the **contents** of the `enterprise/` folder (not the folder itself — its files) into the upload area.
3. Wait until all files show in the file list (especially `js/app.js`, `css/style.css`, `sw.js`).
4. Scroll down → **Commit changes** → **Commit directly to the main branch**.

### A.3 Turn on GitHub Pages

1. In the repo, click **Settings** (top-right tab).
2. In the sidebar, click **Pages**.
3. Under **Build and deployment**:
   - **Source:** *Deploy from a branch*
   - **Branch:** `main` · **Folder:** `/ (root)` → click **Save**.
4. Wait **60–120 seconds**. Refresh the page; it will show:
   > Your site is live at `https://<YOUR_USERNAME>.github.io/school-doc-forge/`

That URL is your production URL. 🎉

### A.4 (Already done for you) Automated deploys via GitHub Actions

We've included `.github/workflows/pages.yml`. After the first push, the workflow runs automatically on every commit to `main`, so you don't have to redeploy by hand.

To monitor: repo → **Actions** tab.

---

## Option B — Cloudflare Pages

**Why:** Faster global CDN than GitHub Pages, unlimited builds on the free tier, free SSL.

### B.1 Prerequisites

- A Cloudflare account (free) — https://dash.cloudflare.com/sign-up.
- Your code already pushed to a GitHub or GitLab repo (do **Option A.1 + A.2** first).

### B.2 Steps

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorise Cloudflare to access your GitHub account.
3. Select the `school-doc-forge` repository.
4. **Project name:** `school-doc-forge`
5. **Production branch:** `main`
6. **Build settings:**
   - **Framework preset:** *None*
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (a single forward slash)
7. Click **Save and Deploy**.

After ~30 seconds, your site is live at `https://school-doc-forge.pages.dev`.

---

## Option C — Netlify (drag-and-drop)

**Why:** Easiest possible deploy. No Git required.

1. Go to https://app.netlify.com/drop
2. **Drag the entire `enterprise/` folder** onto the drop zone.
3. Wait ~10 seconds — you'll get a URL like `https://chic-mochi-12345.netlify.app`.
4. (Optional) Sign up → claim the site → rename it under **Site settings → Change site name**.

To redeploy: drag the folder again on the same site.

---

## Option D — Vercel

1. Sign up at https://vercel.com (use GitHub login).
2. **Add New… → Project** → import your `school-doc-forge` repo.
3. **Framework Preset:** Other.
4. **Root Directory:** `/`
5. Leave build commands empty.
6. **Deploy**.

Live URL: `https://school-doc-forge.vercel.app`.

---

## Option E — Firebase Hosting

```bash
# 1. Install Firebase CLI (one-time)
npm install -g firebase-tools

# 2. Login (opens browser)
firebase login

# 3. Initialise hosting (run from the enterprise/ folder)
cd /path/to/enterprise
firebase init hosting
#   - Use an existing project or create one (free Spark plan is fine)
#   - Public directory: . (a single dot — the current folder)
#   - Single-page app: No
#   - Set up automatic builds with GitHub: optional
#   - Overwrite index.html: NO

# 4. Deploy
firebase deploy --only hosting
```

Live URL: `https://<your-project>.web.app`.

---

## Option F — Self-hosted Nginx/Apache

Copy the contents of `enterprise/` to your web root (e.g. `/var/www/html/sdf/`).

### Nginx snippet (recommended)

```nginx
server {
  listen 80;
  server_name sdf.example.com;
  root /var/www/html/sdf;
  index index.html;

  # Correct MIME for the service worker
  location = /sw.js {
    add_header Cache-Control "no-cache";
    add_header Service-Worker-Allowed "/";
  }

  # SPA-style fallback (so deep links still work)
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Long cache for assets, short for HTML
  location ~* \.(css|js|png|jpg|svg|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

Reload Nginx: `sudo nginx -s reload`. Add HTTPS with Let's Encrypt: `sudo certbot --nginx -d sdf.example.com`.

### Apache snippet

Drop a `.htaccess` into the same folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^sw\.js$ - [E=NO-CACHE:1]
</IfModule>
<IfModule mod_headers.c>
  Header set Service-Worker-Allowed "/" env=NO-CACHE
  Header set Cache-Control "no-cache" env=NO-CACHE
</IfModule>
```

---

## Custom domain

After any of the options above, you can point a custom domain:

### GitHub Pages
1. Settings → Pages → **Custom domain** → enter `sdf.yourschool.com` → Save.
2. In your DNS provider, add a **CNAME** record:
   - `sdf` → `<YOUR_USERNAME>.github.io`
3. Tick **Enforce HTTPS** (allow 10 minutes for the cert).

### Cloudflare Pages / Netlify / Vercel
Each has a **Custom domains** tab in the dashboard with copy-paste-ready DNS instructions.

### Naija-specific cheap domains
- `.com.ng` from https://nira.org.ng/ registrars (≈ ₦3,500/year)
- `.com` from Namecheap, Porkbun, Cloudflare Registrar (~$10/year)

---

## Post-deploy smoke test

After deployment, visit your live URL and run this 60-second checklist:

1. **Page loads** — header, hero, all sections render.
2. **PWA registers** — open browser DevTools → **Application** tab → **Service Workers** → confirm `sw.js` is *activated*.
3. **Offline test** — DevTools → **Network** → check "Offline" → reload. App should still render.
4. **Install prompt** — Chrome address bar shows an install icon, or wait for the in-app banner.
5. **Generate a doc** — Pick "Letterhead" → fill some fields → **Generate → PDF**. PDF downloads.
6. **Add a student** — Students section → **+ Add Student** → save. Row appears in the table.
7. **Multi-branch** — Top bar → **+ Add** branch → switch → confirm data is empty for the new branch (isolation works).
8. **Dark mode** — `Alt + D` → background goes dark.
9. **PIN lock** — Top bar → 🔒 Lock → set a PIN → reload → confirm overlay blocks the app.

If any of these fail, see **Troubleshooting**.

---

## Updating / re-deploying

### GitHub Pages / Cloudflare Pages / Vercel (Git-based)

```bash
cd /path/to/enterprise
# Make your edits to index.html / js/ / css/ …

# Important: bump the cache version so users get the new files
# Open sw.js → change   const CACHE = 'sdf-v7-0-0';
# to e.g.                const CACHE = 'sdf-v7-0-1';

git add .
git commit -m "fix: <describe what changed>"
git push
```

The deploy happens automatically (1–2 minutes). Users will see the in-app **"A new version is available"** prompt on next visit.

### Netlify drag-and-drop

Open the site dashboard → **Deploys** → drag the updated folder onto the page.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| **Blank page on GitHub Pages, console says 404 for `js/app.js`** | Your repo is under `<user>.github.io/<repo>/`, so paths must be relative. We already use `./` paths — but if you moved files, ensure they sit at the repo root. |
| **Service worker not registering** | (a) Must be served over HTTPS (or `localhost`). `file://` won't work. (b) Hard-refresh with `Ctrl+Shift+R`. |
| **"Install App" banner never appears** | Chrome requires a valid `manifest.json` + HTTPS + at least 1 visit ≥ 30 sec. Try **Menu → Install app** manually. |
| **PDF/PNG download is blank** | Some browsers block `html2canvas` on cross-origin images. Use a logo uploaded directly (data-URI, which the app does automatically), not an external URL. |
| **Old version still shows after update** | Bump `CACHE` version in `sw.js` (see Updating section). Then in DevTools → Application → **Unregister** the old worker once. |
| **localStorage full / "Storage quota exceeded"** | Most browsers cap localStorage at ~5 MB per origin. Use **🗄️ Backup** (`Alt + B`) and clear old records, or split data across branches. |
| **WhatsApp blast links open the wrong country code** | The blast assumes Nigerian numbers (0 → 234). For other countries, edit the `tel` derivation in `js/enterprise.js → openWhatsAppBlast()`. |
| **Forgot the PIN** | On the PIN lock screen, click **Reset PIN** at the bottom — it removes the lock (it does not delete data). |

If you hit something not listed here, open an issue on the GitHub repo.

---

**Last updated:** 2026 · License: MIT
