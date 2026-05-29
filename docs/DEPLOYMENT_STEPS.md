# SchoolDocForge Deployment Steps

This project is a static website/PWA. There is no build command and no server-side runtime required.

## A. Files to upload
Upload everything inside the project folder, including:

- `index.html`
- `features.html`
- `feature-catalog.html`
- `modules.html`
- `enterprise.html`
- `guide.html`
- `brand.html`
- `about.html`
- `contact.html`
- `css/`
- `js/`
- `icons/`
- `docs/`
- `sample-data/`
- `manifest.json`
- `sw.js`
- `robots.txt`
- `sitemap.xml`

Do not upload only `index.html`; the app now has multiple pages.

## B. Deploy to GitHub repository

1. Download or unzip the enterprise package.
2. Open the extracted folder.
3. Confirm that `index.html` is at the root of the folder, not hidden inside another nested folder.
4. Go to the GitHub repository.
5. Upload all files and folders or push with Git:

```bash
git add .
git commit -m "Upgrade SchoolDocForge Enterprise free-first edition"
git push origin main
```

6. Confirm GitHub shows the new pages: `enterprise.html` and `feature-catalog.html`.

## C. Deploy to Vercel

1. Sign in to Vercel.
2. Choose **Add New Project**.
3. Import the GitHub repository.
4. Framework preset: **Other**.
5. Build command: leave empty.
6. Output directory: leave empty or use `.`.
7. Install command: leave empty.
8. Click **Deploy**.
9. After deployment, open:
   - `/`
   - `/enterprise.html`
   - `/feature-catalog.html`
   - `/manifest.json`

## D. Deploy to Netlify

1. Sign in to Netlify.
2. Choose **Add new site**.
3. Select GitHub repository or drag-and-drop the folder.
4. Build command: leave empty.
5. Publish directory: `.`
6. Deploy.
7. Test all pages after deployment.

## E. Deploy to Cloudflare Pages

1. Sign in to Cloudflare.
2. Open **Workers & Pages**.
3. Choose **Create application > Pages**.
4. Connect GitHub repository.
5. Framework preset: **None**.
6. Build command: leave empty.
7. Output directory: `/` or `.`.
8. Deploy.

## F. Deploy to GitHub Pages

1. Push all files to the repository.
2. Go to **Settings > Pages**.
3. Source: deploy from branch.
4. Branch: `main`.
5. Folder: `/root`.
6. Save.
7. Open the GitHub Pages URL after deployment completes.

## G. After deployment

1. Open the homepage.
2. Open the Enterprise page.
3. Open the Feature Catalog page.
4. Test document generation.
5. Test student/staff table display.
6. Test PWA install prompt if supported by the browser.
7. If an old version appears, hard refresh or clear service-worker cache.

## H. Service-worker update note

Because this app is a PWA, browsers can cache older files. The service-worker cache has been renamed for this release. If users still see old pages:

1. Open browser DevTools.
2. Go to Application > Service Workers.
3. Click Unregister.
4. Clear site data.
5. Reload the site.

## I. Cost note

This deployment does not require an AI API, database, backend server, SMTP server or SMS gateway. Static hosting free tiers are sufficient for normal use.
