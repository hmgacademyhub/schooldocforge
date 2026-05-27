# Icons

The PWA `manifest.json` references inline data-URI SVG icons by default — so this folder is optional.

If you want crisper Android home-screen icons, drop PNGs here named:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

Then edit `manifest.json` → `icons` array to point to `./icons/icon-192.png` and `./icons/icon-512.png`.

You can generate icons free at:

- https://realfavicongenerator.net (no signup)
- https://maskable.app (for adaptive Android icons)
