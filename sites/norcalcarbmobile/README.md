# NorCal CARB Mobile — Cloudflare Pages Site

Static site for [norcalcarbmobile.com](https://norcalcarbmobile.com), migrated from Squarespace to Cloudflare Pages.

## Architecture

- **Static HTML** built from templates via `build.mjs`
- **Global style guide** locked in `src/css/styles.css` (Montserrat headings, Source Sans 3 body)
- **One H1 per page**, consistent heading hierarchy
- **Consolidated blog** at `/blog/` (redirects from `/clean-truck-check-blog/*`)
- **Service areas** at `/service-area/{slug}/` with LocalBusiness JSON-LD schema
- **301 redirect map** in `data/redirects.json` → `_redirects` for SEO equity preservation

## Build

```bash
cd sites/norcalcarbmobile
npm run build
npm run preview   # serves dist/ on :4321
```

## Deploy to Cloudflare Pages

1. Connect this repo to Cloudflare Pages
2. Set build configuration:
   - **Build command:** `cd sites/norcalcarbmobile && npm run build`
   - **Build output directory:** `sites/norcalcarbmobile/dist`
3. Add custom domain: `norcalcarbmobile.com`
4. Configure DNS (move from Squarespace when ready to cut over)

## Pre-Cutover Checklist

- [ ] Verify all 301 redirects with `curl -I` against staging URL
- [ ] Submit new sitemap to Google Search Console
- [ ] Configure SPF, DKIM, DMARC for `bryan@norcalcarbmobile.com` (email deliverability)
- [ ] Set up Cal.com booking at `/contact/`
- [ ] Point DNS A/CNAME records from Squarespace to Cloudflare Pages
- [ ] Monitor Search Console for 404s for 30 days post-migration

## Geographic Expansion Phases

| Phase | Areas | Status |
|-------|-------|--------|
| 1 | Sacramento, Oakland, Butte County, Fairfield, San Jose | Built |
| 2 | Fresno, Stockton | Built |
| 3 | San Diego | Built |

## Email Authentication (DNS — not in this repo)

Configure in Google Workspace / Cloudflare DNS:

- **SPF:** `v=spf1 include:_spf.google.com ~all`
- **DKIM:** Generate in Google Admin → Apps → Google Workspace → Gmail → Authenticate email
- **DMARC:** `v=DMARC1; p=quarantine; rua=mailto:bryan@norcalcarbmobile.com`
