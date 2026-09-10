# Stale live pages — fix on next Worker GO

Verified 2026-09-10. Do not invent new prices. Lock remains OBD $75 · OVI $199 · MH $99/$229.

## Broken / unpublished (index card or inbound link, no HTML)

| Slug | Status | Action |
|---|---|---|
| /blog/harvest-season-clean-truck-check-ag-haul | 404. Journal 8/29 claimed live. Index card appears in some crawls. Not in sitemap.xml. | Ship harvest draft on GO harvest-season-clean-truck-check-ag-haul |
| /blog/construction-concrete-clean-truck-check-northern-california | Not live. CRM 2026-03-31 Blog #1 never released. | Ship construction draft on GO construction-concrete-clean-truck-check-northern-california |

## Live pages with wrong year or wrong price

| URL | Problem | Fix |
|---|---|---|
| /what-is-clean-truck-check | OVI $250, RV $300, “annual increasing to twice yearly in 2026” | OVI $199 · MH $99/$229 · 2026 commercial = already 2× |
| /carb-penalties-deadlines | Annual-only language + 2024–2025 calendar | 2026 commercial 2×; ag + CA rec MH 1×; drop 2024 rows |
| /faqs-carb-clean-truck-check-mobile | “As low as $50” | $75 / $199 |
| /clean-truck-check-blog/your-guide-to-carbs-deadlines-and-requirements-for-2025 | Title year 2025 | Keep schedule tables; retitle 2026; add 90-day window still valid |
| /clean-truck-check-blog/clean-truck-check-info-blog | Title still “2025” | Retitle 2026 |
| /clean-truck-check-blog/clean-truck-check-what-california-fleet-owners-need-to-know-for-20242025 | Title 2024–2025 | Retitle 2026 |
| /clean-truck-check-blog/ca-ag-vehicles-clean-truck-testing-info | Correct on annual ag; no haul contrast | Add link to harvest slug after it is live |

## Correct live anchors (do not rewrite)

- /blog/obd-vs-ovi-clean-truck-check-fleets — prices and 2026 cadence correct
- /blog/2026-carb-testing-deadlines — keep; add ag/MH exception if missing
- /blog/how-mobile-carb-testing-works
- /blog/craft-so-good-they-copy-us-hotdog-clipboard — live 2026-09-08
- /blog/fleets-ovi-obd-porterville-mojave — live
- /services and /stockton-clean-truck-check — prices correct through 2026

## Location pages to cross-link from new posts

- /sacramento-carb-testing
- /sacramento-valley-foothills-carb-testing
- /butte-county-carb-testing
- /bay-area-mobile-carb
- /napa-sonoma-carb-testing
- /stockton-clean-truck-check
- /clean-truck-check-lodi
- /central-valley-sierra-carb-testing
- /areas

## Law

No auto-deploy. CONTENT-TO-SITE hopper 01-READY and 02-GO are empty. QUEUE.csv owner_approved=NO. Bryan says GO <slug>. Worker is norcal-squarespace-updates-gillis.
