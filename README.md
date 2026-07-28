# Alexandre Bueno — static site (Cloudflare Pages build)

Plain HTML + Bootstrap 5.3.3. No build step, no framework, **no third-party requests at runtime.**

## Deploy

Cloudflare Pages → Create project → Direct Upload, and upload this folder.
Or connect a Git repo and set:

- **Build command:** *(leave empty)*
- **Build output directory:** `/` (or whatever folder holds `index.html`)

That's it — Pages serves the files as-is.

## Routes

| URL | File |
| --- | --- |
| `/` | `index.html` |
| `/products` | `products.html` |
| `/milling` | `milling.html` |
| `/contacts` | `contacts.html` |
| any 404 | `404.html` (Pages picks this up automatically) |

Pages serves `/products` for `products.html` and 301-redirects `/products.html` → `/products`. The
in-page links point at `products.html` so they also work from `file://` and any other host; if you'd
rather skip that one redirect hop, change the `href`s to `/products` etc. after deploying.

## Why nothing loads from a CDN

The earlier version pulled Bootstrap from `cdn.jsdelivr.net` and fonts from `fonts.googleapis.com` /
`fonts.gstatic.com`. Cloudflare doesn't block those — but the *visitor's* network can, and often does:

- corporate proxies and school firewalls commonly blocklist public CDNs
- `fonts.googleapis.com` and `cdn.jsdelivr.net` are unreachable or unreliable in mainland China
- Google Fonts is a GDPR problem in the EU (a German court ruled the IP transfer unlawful in 2022)
- any CSP you add has to allowlist each origin, and CDN outages take your styling with them

So everything is vendored into `assets/`:

- `assets/css/bootstrap.min.css`, `assets/js/bootstrap.bundle.min.js` — Bootstrap 5.3.3 (MIT)
- `assets/fonts/*.woff2` — Fraunces, Inter, JetBrains Mono, latin subset, only the weights used (OFL/MIT)
- Bootstrap Icons are inlined as SVG, so the icon webfont is gone entirely

Total deploy: ~564 KB across 18 files.

## Content-Security-Policy

`_headers` ships a same-origin CSP with **no `unsafe-inline`**:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self';
frame-ancestors 'none'; upgrade-insecure-requests
```

For that to hold, the pages contain no `<style>` blocks, no `style="..."` attributes and no inline
`<script>`. Swatch colours are utility classes (`.sw-prussian`, `.sw-madder`, …) in `site.css`, and all
behaviour lives in `assets/js/site.js`. **If you add an inline style or script later, the browser will
silently drop it** — add a class or put the JS in `site.js` instead.

`img-src` keeps `data:` because Bootstrap's own CSS uses `data:` SVG URIs for form controls and the
navbar toggler.

## Cloudflare settings worth checking

- **Rocket Loader** — rewrites `<script>` tags and will trip the CSP. Leave it off, or add its hash.
- **Web Analytics / Zaraz** — both inject a script from a Cloudflare origin. If you enable either,
  add that origin to `script-src`, or the beacon won't run.
- **Auto Minify** is retired and no longer touches your assets.
- The long `Cache-Control` on `/assets/*` is safe only while filenames don't change. If you upgrade
  Bootstrap, either rename the file (`bootstrap.min.5.3.4.css`) or purge the cache.

## Local check

```bash
python3 -m http.server 8000
```

Open http://localhost:8000. Serving over HTTP (not double-clicking the file) is worth doing — it's the
only way to confirm the font paths and the CSP behave the way they will in production.

## The contact form

Client-side validation only, then it hands the note to the visitor's mail app via `mailto:`. Nothing is
stored or sent server-side. For real submissions, add a Pages Function at `functions/api/order.js`,
POST to it from `site.js`, and add `connect-src 'self'` to the CSP.
