import type { MigrationDomain, MigrationPage, MigrationStatus } from '../types';

/**
 * Shared source of truth for the NorCal CARB Mobile → Silverback / GIA migration.
 *
 * Used by:
 *   - components/SiteMigration.tsx   (URL-level gap list)
 *   - components/NorcalProgress.tsx  (rollup progress dashboard)
 *
 * Flip a page's `status` here and BOTH views update.
 */

export const PRIMARY_DOMAIN = 'norcalcarbmobile.com';
export const TARGET_DOMAIN = 'silverbackai.agency';

export const domains: MigrationDomain[] = [
  {
    domain: 'norcalcarbmobile.com',
    label: 'NorCal CARB Mobile (Primary)',
    role: 'PRIMARY',
    description:
      'Current production site. "LIVE" pages are confirmed indexed. "GAP" pages are advertised in nav/hero/sister-site copy but currently 404 or missing.',
    pages: [
      // ---- LIVE on norcalcarbmobile.com ----
      { path: '/', title: 'Home — Mobile CARB Testing $75 | Sacramento · Stockton · Fairfield · San Jose · Bay Area', status: 'LIVE', priority: 'P0' },
      { path: '/cart', title: 'Cart / Checkout', status: 'LIVE', priority: 'P1' },
      { path: '/carb-mobile-app', title: 'Download the CARB Compliance App', status: 'LIVE', priority: 'P1' },
      { path: '/faqs-carb-clean-truck-check-mobile', title: 'FAQ — Clean Truck Check Mobile', status: 'LIVE', priority: 'P0' },
      { path: '/clean-truck-check-rates', title: 'CARB Clean Truck Check Rates', status: 'LIVE', priority: 'P0' },
      { path: '/what-is-clean-truck-check', title: 'What Is Clean Truck Check? (HD I/M Explainer)', status: 'LIVE', priority: 'P0' },
      { path: '/service-area-sacramento-carb-testing', title: 'Service Area — Sacramento', status: 'LIVE', priority: 'P0' },
      { path: '/service-area-san-joaquin-county-mobile-testing', title: 'Service Area — Stockton / San Joaquin County', status: 'LIVE', priority: 'P0' },
      { path: '/service-area-butte-county-clean-truck-check', title: 'Service Area — Butte County (Chico / Oroville / Paradise)', status: 'LIVE', priority: 'P1' },
      { path: '/east-bay-mobile-carb-testing', title: 'Service Area — East Bay (Oakland / Berkeley / Fremont)', status: 'LIVE', priority: 'P0' },
      { path: '/san-jose-mobile-carb-testing', title: 'Service Area — San Jose / South Bay', status: 'LIVE', priority: 'P0' },
      { path: '/clean-truck-check-san-diego', title: 'Service Area — San Diego County', status: 'LIVE', priority: 'P1' },

      // ---- GAP: advertised but missing on norcalcarbmobile.com ----
      {
        path: '/service-area-fairfield-clean-truck-check',
        title: 'Service Area — Fairfield / Vacaville / Solano County',
        status: 'GAP',
        priority: 'P0',
        notes:
          'Hero lists "Fairfield" but the only Fairfield page lives on cleantruckcheckfairfield.com. Build a parity page so direct traffic + internal links resolve.',
      },
      {
        path: '/service-area-roseville-clean-truck-check',
        title: 'Service Area — Roseville / Placer County',
        status: 'GAP',
        priority: 'P0',
        notes: 'Sister site cleantruckcheckroseville.com exists. No matching page on primary site.',
      },
      {
        path: '/service-area-napa-vallejo-mobile-carb',
        title: 'Service Area — Napa / Vallejo / North Bay',
        status: 'GAP',
        priority: 'P1',
        notes: 'Referenced inside cleantruckcheckfairfield.com copy ("Napa, Vallejo"). Needs dedicated landing page.',
      },
      {
        path: '/service-area-san-francisco-peninsula',
        title: 'Service Area — San Francisco / Peninsula / SFO',
        status: 'GAP',
        priority: 'P1',
        notes: 'carb-clean-truck-check.com hub advertises "Novato → San Jose" corridor and SF/SFO. No SF page on primary.',
      },
      {
        path: '/service-area-fresno-central-valley',
        title: 'Service Area — Fresno / South Central Valley',
        status: 'GAP',
        priority: 'P1',
        notes: 'Hero promises "Now the Central Valley" but only Stockton/Modesto coverage exists. Fresno gap.',
      },
      {
        path: '/service-area-sonoma-marin',
        title: 'Service Area — Sonoma / Marin (Novato → Petaluma)',
        status: 'GAP',
        priority: 'P2',
        notes: 'Hub site covers Hwy 101 from Novato. Primary has no Marin/Sonoma page.',
      },
      {
        path: '/fleet-pricing',
        title: 'Fleet Pricing & Volume Discounts',
        status: 'GAP',
        priority: 'P0',
        notes: 'Site repeatedly says "fleet discounts available" but no dedicated pricing page beyond /clean-truck-check-rates.',
      },
      {
        path: '/book',
        title: 'Online Booking / Schedule a Visit',
        status: 'GAP',
        priority: 'P0',
        notes: 'Every page CTA points to "Book online" — there is no canonical /book route. Currently a phone-only funnel.',
      },
      {
        path: '/contact',
        title: 'Contact / Quote Request',
        status: 'GAP',
        priority: 'P0',
        notes: 'No /contact route. Sister Fairfield site has a real booking form — port to primary.',
      },
      {
        path: '/about',
        title: 'About — NorCal CARB Mobile LLC',
        status: 'GAP',
        priority: 'P1',
        notes: 'Tester ID IF530523, LLC info, credentials — currently scattered across service-area pages.',
      },
      {
        path: '/credentials',
        title: 'CARB Credentials & Tester ID IF530523',
        status: 'GAP',
        priority: 'P1',
        notes: 'Build a trust page that links to ARB public tester list.',
      },
      {
        path: '/services/obd-testing',
        title: 'Service — OBD Testing ($75, 2013+ engines)',
        status: 'GAP',
        priority: 'P1',
        notes: 'No deep page for the individual test type.',
      },
      {
        path: '/services/smoke-opacity-j1667',
        title: 'Service — Smoke Opacity / SAE J1667 ($250)',
        status: 'GAP',
        priority: 'P1',
      },
      {
        path: '/services/rv-motorhome',
        title: 'Service — RV / Motorhome Testing ($300)',
        status: 'GAP',
        priority: 'P2',
      },
      {
        path: '/sitemap.xml',
        title: 'XML sitemap (currently 500 errors)',
        status: 'GAP',
        priority: 'P0',
        notes: "GET /sitemap.xml returns 500. Search engines can't discover new pages until this is fixed.",
      },
    ],
  },
  {
    domain: 'carb-clean-truck-check.com',
    label: 'Sister Hub — Bay Area Marketing',
    role: 'SISTER',
    description: 'Network hub covering the SF → San Jose corridor. Routes traffic to regional sister sites.',
    pages: [{ path: '/', title: 'Hub Home — SF · Fairfield · San Jose', status: 'SISTER', priority: 'P0' }],
  },
  {
    domain: 'cleantruckcheckfairfield.com',
    label: 'Sister — Fairfield / Solano',
    role: 'SISTER',
    description: 'Regional landing site for Fairfield, Vacaville, Vallejo, Napa. DNS already on Cloudflare.',
    pages: [{ path: '/', title: 'Mobile CARB Testing — Fairfield, CA', status: 'SISTER', priority: 'P0' }],
  },
  {
    domain: 'cleantruckcheckroseville.com',
    label: 'Sister — Roseville / Placer',
    role: 'SISTER',
    description: 'Regional landing site for Roseville, Sacramento, Placer.',
    pages: [{ path: '/', title: 'Mobile CARB Testing — Roseville', status: 'SISTER', priority: 'P1' }],
  },
  {
    domain: 'carbteststockton.com',
    label: 'Sister — Stockton (live)',
    role: 'SISTER',
    description: 'Active Stockton / Central Valley site. "Stockton Special" $40/truck fleet promo lives here. Canonical Stockton property (cleantruckcheckstockton.com is referenced in hub copy but not the canonical live site).',
    pages: [{ path: '/', title: 'Mobile CARB Diesel Testing — Stockton & Central Valley', status: 'SISTER', priority: 'P0' }],
  },
  {
    domain: 'mobilecarbsmoketest.com',
    label: 'Sister — San Diego',
    role: 'SISTER',
    description: 'Regional landing site for San Diego County.',
    pages: [{ path: '/', title: 'Mobile CARB Smoke Test — San Diego County', status: 'SISTER', priority: 'P1' }],
  },
  {
    domain: 'silverbackai.agency',
    label: 'Target — Silverback / GIA',
    role: 'TARGET',
    description:
      'New umbrella property. Migration target. Old NorCal URLs must 301 here, and the GAP pages above must be built natively.',
    pages: [
      { path: '/', title: 'Silverback / Gillis Intelligence Agency Home', status: 'PLANNED', priority: 'P0' },
      { path: '/carb', title: 'NorCal CARB Mobile (product line landing)', status: 'PLANNED', priority: 'P0' },
      { path: '/carb/book', title: 'CARB — Unified booking funnel', status: 'PLANNED', priority: 'P0' },
      { path: '/carb/fleet', title: 'CARB — Fleet / Volume program', status: 'PLANNED', priority: 'P0' },
      {
        path: '/carb/areas/*',
        title: 'CARB — Per-area landers (Sac, Stockton, Fairfield, Roseville, EastBay, San Jose, SD, Napa, SF, Fresno)',
        status: 'PLANNED',
        priority: 'P0',
        notes: 'Generated from gap list above.',
      },
      { path: '/intel', title: 'GIA Intel / Silent Partner dashboard entry', status: 'PLANNED', priority: 'P1' },
    ],
  },
];

/* ---------------- Stats helpers ---------------- */

export type StatusTotals = Record<MigrationStatus, number>;

export const emptyTotals = (): StatusTotals => ({
  LIVE: 0,
  SISTER: 0,
  GAP: 0,
  PLANNED: 0,
  REDIRECT: 0,
});

export const tallyTotals = (pages: MigrationPage[]): StatusTotals => {
  const t = emptyTotals();
  pages.forEach((p) => {
    t[p.status] += 1;
  });
  return t;
};

export const allPages = (): Array<MigrationPage & { domain: string }> =>
  domains.flatMap((d) => d.pages.map((p) => ({ ...p, domain: d.domain })));

export const primaryPages = (): MigrationPage[] => {
  const primary = domains.find((d) => d.domain === PRIMARY_DOMAIN);
  return primary ? primary.pages : [];
};

/**
 * Migration completion % — counts LIVE pages on the primary domain
 * relative to (LIVE + GAP) on the primary domain. Sister and PLANNED
 * pages are intentionally excluded because they don't measure the
 * health of norcalcarbmobile.com itself.
 */
export const primaryProgressPct = (): number => {
  const pages = primaryPages();
  const live = pages.filter((p) => p.status === 'LIVE').length;
  const denom = pages.filter((p) => p.status === 'LIVE' || p.status === 'GAP').length;
  if (denom === 0) return 0;
  return Math.round((live / denom) * 100);
};

/* ---------------- Phased rollout (from sites/norcalcarbmobile/data/service-areas.json) ---------------- */

export interface ServiceAreaPlan {
  slug: string;
  name: string;
  phase: 1 | 2 | 3;
  cities: string[];
  /** True once the corresponding norcalcarbmobile.com page is LIVE. */
  shippedOnPrimary: boolean;
  /** True if any sister site covers this area. */
  hasSisterCoverage: boolean;
  /** Live URL (primary preferred, otherwise sister). */
  url?: string;
}

/**
 * Phased rollout plan for the new norcalcarbmobile.com static build
 * (sites/norcalcarbmobile/data/service-areas.json). Phase 1 ships first.
 *
 * Mirrored as a typed constant so the dashboard doesn't need JSON imports.
 */
export const serviceAreaPlan: ServiceAreaPlan[] = [
  { slug: 'sacramento',   name: 'Sacramento',                 phase: 1, cities: ['Sacramento', 'Elk Grove', 'Rancho Cordova', 'Folsom', 'Citrus Heights', 'West Sacramento'], shippedOnPrimary: true,  hasSisterCoverage: false, url: 'https://norcalcarbmobile.com/service-area-sacramento-carb-testing' },
  { slug: 'oakland',      name: 'Oakland & East Bay',         phase: 1, cities: ['Oakland', 'Hayward', 'Fremont', 'Berkeley', 'San Leandro'],                                  shippedOnPrimary: true,  hasSisterCoverage: false, url: 'https://norcalcarbmobile.com/east-bay-mobile-carb-testing' },
  { slug: 'butte-county', name: 'Butte County',               phase: 1, cities: ['Chico', 'Oroville', 'Paradise', 'Gridley'],                                                  shippedOnPrimary: true,  hasSisterCoverage: false, url: 'https://norcalcarbmobile.com/service-area-butte-county-clean-truck-check' },
  { slug: 'fairfield',    name: 'Fairfield & Solano County',  phase: 1, cities: ['Fairfield', 'Vacaville', 'Vallejo', 'Suisun City', 'Benicia'],                               shippedOnPrimary: false, hasSisterCoverage: true,  url: 'https://cleantruckcheckfairfield.com' },
  { slug: 'san-jose',     name: 'San Jose & South Bay',       phase: 1, cities: ['San Jose', 'Santa Clara', 'Sunnyvale', 'Milpitas'],                                          shippedOnPrimary: true,  hasSisterCoverage: false, url: 'https://norcalcarbmobile.com/san-jose-mobile-carb-testing' },
  { slug: 'fresno',       name: 'Fresno',                     phase: 2, cities: ['Fresno', 'Clovis', 'Selma', 'Reedley'],                                                       shippedOnPrimary: false, hasSisterCoverage: false },
  { slug: 'stockton',     name: 'Stockton & San Joaquin',     phase: 2, cities: ['Stockton', 'Tracy', 'Lodi', 'Manteca'],                                                       shippedOnPrimary: true,  hasSisterCoverage: true,  url: 'https://norcalcarbmobile.com/service-area-san-joaquin-county-mobile-testing' },
  { slug: 'roseville',    name: 'Roseville & Placer County',  phase: 2, cities: ['Roseville', 'Rocklin', 'Lincoln', 'Auburn'],                                                  shippedOnPrimary: false, hasSisterCoverage: true,  url: 'https://cleantruckcheckroseville.com' },
  { slug: 'san-diego',    name: 'San Diego County',           phase: 3, cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido'],                                         shippedOnPrimary: true,  hasSisterCoverage: true,  url: 'https://norcalcarbmobile.com/clean-truck-check-san-diego' },
];

export const phaseProgress = (
  phase: 1 | 2 | 3
): { shipped: number; total: number; pct: number; areas: ServiceAreaPlan[] } => {
  const areas = serviceAreaPlan.filter((a) => a.phase === phase);
  const shipped = areas.filter((a) => a.shippedOnPrimary).length;
  const total = areas.length;
  return { shipped, total, pct: total === 0 ? 0 : Math.round((shipped / total) * 100), areas };
};
