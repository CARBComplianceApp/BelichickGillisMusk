import React, { useMemo, useState } from 'react';
import {
  Globe,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Network,
  ArrowRight,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { MigrationDomain, MigrationPage, MigrationStatus } from '../types';

/**
 * Site Migration Tracker
 *
 * Single source of truth for the NorCal CARB Mobile → Silverback / GIA migration.
 *
 * - PRIMARY: pages we know exist on norcalcarbmobile.com today
 * - SISTER:  pages on the satellite / sister-site network
 * - GAP:     URLs the primary site advertises (footer, hero, sister-site references)
 *            but that DO NOT yet have a page on norcalcarbmobile.com — must be built
 * - PLANNED: new pages targeted for the migration that don't exist anywhere yet
 * - REDIRECT: pages that exist on the old site and need 301s on the new domain
 *
 * Update this catalog as pages get built, crawled, or retired.
 */

const PRIMARY_DOMAIN = 'norcalcarbmobile.com';

/** Canonical Stockton sister-site URL — use everywhere, not cleantruckcheckstockton.com */
export const STOCKTON_SISTER_URL = 'https://carbteststockton.com';

const domains: MigrationDomain[] = [
  {
    domain: 'norcalcarbmobile.com',
    label: 'NorCal CARB Mobile (Primary)',
    role: 'PRIMARY',
    description:
      'Current production site. All "LIVE" pages are confirmed indexed. "GAP" pages are advertised in nav/hero/sister-site copy but currently 404 or missing.',
    pages: [
      // ---- LIVE on norcalcarbmobile.com ----
      { path: '/', title: 'Home — Mobile CARB Testing $75 | Sacramento · Stockton · Fairfield · San Jose · Bay Area', status: 'LIVE', priority: 'P0' },
      { path: '/cart', title: 'Cart / Checkout', status: 'LIVE', priority: 'P1' },
      { path: '/carb-mobile-app', title: 'Download the CARB Compliance App', status: 'LIVE', priority: 'P1' },
      { path: '/faqs-carb-clean-truck-check-mobile', title: 'FAQ — Clean Truck Check Mobile', status: 'LIVE', priority: 'P0' },
      { path: '/clean-truck-check-rates', title: 'CARB Clean Truck Check Rates', status: 'LIVE', priority: 'P0' },
      { path: '/what-is-clean-truck-check', title: 'What Is Clean Truck Check? (HD I/M Explainer)', status: 'LIVE', priority: 'P0' },
      { path: '/service-area-sacramento-carb-testing', title: 'Service Area — Sacramento', status: 'LIVE', priority: 'P0' },
      {
        path: '/service-area-san-joaquin-county-mobile-testing',
        title: 'Service Area — Stockton / San Joaquin County',
        status: 'LIVE',
        priority: 'P0',
        notes: `Primary-site Stockton page. Sister landing: ${STOCKTON_SISTER_URL}`,
      },
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
        notes: 'GET /sitemap.xml returns 500. Search engines can\'t discover new pages until this is fixed.',
      },
    ],
  },
  {
    domain: 'carb-clean-truck-check.com',
    label: 'Sister Hub — Bay Area Marketing',
    role: 'SISTER',
    description: 'Network hub covering the SF → San Jose corridor. Routes traffic to regional sister sites.',
    pages: [
      { path: '/', title: 'Hub Home — SF · Fairfield · San Jose', status: 'SISTER', priority: 'P0' },
    ],
  },
  {
    domain: 'cleantruckcheckfairfield.com',
    label: 'Sister — Fairfield / Solano',
    role: 'SISTER',
    description: 'Regional landing site for Fairfield, Vacaville, Vallejo, Napa.',
    pages: [
      { path: '/', title: 'Mobile CARB Testing — Fairfield, CA', status: 'SISTER', priority: 'P0' },
    ],
  },
  {
    domain: 'cleantruckcheckroseville.com',
    label: 'Sister — Roseville / Placer',
    role: 'SISTER',
    description: 'Regional landing site for Roseville, Sacramento, Placer.',
    pages: [
      { path: '/', title: 'Mobile CARB Testing — Roseville', status: 'SISTER', priority: 'P1' },
    ],
  },
  {
    domain: 'carbteststockton.com',
    label: 'Sister — Stockton / Central Valley (canonical)',
    role: 'SISTER',
    description:
      'Canonical Stockton URL. Active regional site with "Stockton Special" $40/truck fleet promo. Use carbteststockton.com everywhere — not cleantruckcheckstockton.com.',
    pages: [
      {
        path: '/',
        title: 'Mobile CARB Diesel Testing — Stockton & Central Valley',
        status: 'SISTER',
        priority: 'P0',
        notes: 'If carb-clean-truck-check.com hub or legacy copy links to cleantruckcheckstockton.com, 301 redirect that domain here.',
      },
    ],
  },
  {
    domain: 'mobilecarbsmoketest.com',
    label: 'Sister — San Diego',
    role: 'SISTER',
    description: 'Regional landing site for San Diego County.',
    pages: [
      { path: '/', title: 'Mobile CARB Smoke Test — San Diego County', status: 'SISTER', priority: 'P1' },
    ],
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
        path: '/carb/areas/stockton',
        title: 'CARB — Stockton / San Joaquin County area landing',
        status: 'PLANNED',
        priority: 'P0',
        notes: `Mirror content from sister site ${STOCKTON_SISTER_URL}. Canonical external URL stays carbteststockton.com until cutover.`,
      },
      {
        path: '/carb/areas/*',
        title: 'CARB — Other per-area landers (Sac, Fairfield, Roseville, EastBay, San Jose, SD, Napa, SF, Fresno)',
        status: 'PLANNED',
        priority: 'P0',
        notes: 'Stockton uses carbteststockton.com as the live sister URL today.',
      },
      { path: '/intel', title: 'GIA Intel / Silent Partner dashboard entry', status: 'PLANNED', priority: 'P1' },
    ],
  },
];

const statusStyle: Record<MigrationStatus, { color: string; bg: string; border: string; label: string; icon: React.ComponentType<{ size?: number }> }> = {
  LIVE:     { color: 'text-emerald-400', bg: 'bg-emerald-900/15', border: 'border-emerald-900/40', label: 'LIVE',     icon: CheckCircle2 },
  SISTER:   { color: 'text-sky-400',     bg: 'bg-sky-900/15',     border: 'border-sky-900/40',     label: 'SISTER',   icon: Network },
  GAP:      { color: 'text-amber-400',   bg: 'bg-amber-900/15',   border: 'border-amber-900/40',   label: 'GAP',      icon: AlertTriangle },
  PLANNED:  { color: 'text-violet-400',  bg: 'bg-violet-900/15',  border: 'border-violet-900/40',  label: 'PLANNED',  icon: Plus },
  REDIRECT: { color: 'text-zinc-400',    bg: 'bg-zinc-800/40',    border: 'border-zinc-700',       label: 'REDIRECT', icon: ArrowRight },
};

const priorityStyle: Record<NonNullable<MigrationPage['priority']>, string> = {
  P0: 'text-red-400 border-red-900/40 bg-red-900/10',
  P1: 'text-amber-400 border-amber-900/40 bg-amber-900/10',
  P2: 'text-zinc-400 border-zinc-700 bg-zinc-900/40',
};

const FILTERS: Array<MigrationStatus | 'ALL'> = ['ALL', 'GAP', 'PLANNED', 'LIVE', 'SISTER'];

const SiteMigration: React.FC = () => {
  const [filter, setFilter] = useState<MigrationStatus | 'ALL'>('GAP');
  const [copied, setCopied] = useState<string | null>(null);

  const totals = useMemo(() => {
    const t: Record<MigrationStatus, number> = { LIVE: 0, SISTER: 0, GAP: 0, PLANNED: 0, REDIRECT: 0 };
    domains.forEach((d) => d.pages.forEach((p) => (t[p.status] += 1)));
    return t;
  }, []);

  const gapList = useMemo(
    () =>
      domains
        .flatMap((d) => d.pages.map((p) => ({ ...p, domain: d.domain })))
        .filter((p) => p.status === 'GAP' || p.status === 'PLANNED')
        .sort((a, b) => (a.priority ?? 'P2').localeCompare(b.priority ?? 'P2')),
    []
  );

  const copyAll = () => {
    const text = gapList
      .map((p) => `${p.priority ?? 'P2'}\thttps://${p.domain}${p.path}\t${p.title}${p.notes ? `\t// ${p.notes}` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied('all');
    setTimeout(() => setCopied(null), 1800);
  };

  const copyOne = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="h-full flex flex-col bg-mil-black text-white">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-mil-black sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Globe className="text-mil-accent" />
              SITE MIGRATION
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Pages that aren&apos;t on{' '}
              <span className="font-mono text-zinc-300">{PRIMARY_DOMAIN}</span> yet — the gap-list that drives the
              Silverback / GIA cutover.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              ['LIVE', totals.LIVE],
              ['GAP', totals.GAP],
              ['PLANNED', totals.PLANNED],
              ['SISTER', totals.SISTER],
            ] as Array<[MigrationStatus, number]>).map(([s, n]) => {
              const st = statusStyle[s];
              return (
                <div
                  key={s}
                  className={`px-3 py-1.5 rounded border ${st.border} ${st.bg} ${st.color} text-xs font-mono flex items-center gap-2`}
                >
                  <st.icon size={12} />
                  {st.label}: <span className="text-white font-bold">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters + copy */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-zinc-500" />
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all border ${
                    active
                      ? 'bg-zinc-800 text-mil-accent border-zinc-700'
                      : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <button
            onClick={copyAll}
            className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white border border-zinc-700 hover:bg-zinc-800 flex items-center gap-2"
            title="Copy all GAP + PLANNED URLs as TSV"
          >
            {copied === 'all' ? <Check size={14} /> : <Copy size={14} />}
            Copy gap list ({gapList.length})
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quick "to-build" callout */}
        <div className="bg-amber-900/10 border border-amber-900/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-400 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider">
                Pages to bring up before migration cutover
              </h3>
              <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                These URLs are advertised in nav, hero, footer, or sister-site copy but currently 404 / missing on{' '}
                <span className="font-mono text-zinc-200">{PRIMARY_DOMAIN}</span>. Build them on the primary first
                (for SEO equity), then mirror as <span className="font-mono text-zinc-200">silverbackai.agency/carb/*</span>{' '}
                and 301 the old URLs.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {gapList
                  .filter((p) => p.status === 'GAP' && p.priority === 'P0')
                  .map((p) => {
                    const url = `https://${p.domain}${p.path}`;
                    return (
                      <button
                        key={url}
                        onClick={() => copyOne(url)}
                        className="text-left bg-zinc-900/60 border border-zinc-800 hover:border-amber-700/50 rounded-md px-3 py-2 flex items-center justify-between gap-3 group"
                        title="Click to copy URL"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-mono text-amber-300 truncate">{p.path}</div>
                          <div className="text-xs text-zinc-500 truncate">{p.title}</div>
                        </div>
                        <span className="text-zinc-600 group-hover:text-zinc-300 shrink-0">
                          {copied === url ? <Check size={14} /> : <Copy size={14} />}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Per-domain breakdown */}
        {domains.map((domain) => {
          const pages =
            filter === 'ALL' ? domain.pages : domain.pages.filter((p) => p.status === filter);
          if (pages.length === 0 && filter !== 'ALL') return null;

          return (
            <section
              key={`${domain.domain}-${domain.label}`}
              className="bg-mil-gray border border-zinc-800 rounded-xl overflow-hidden"
            >
              <header className="p-5 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-lg text-white truncate">{domain.label}</h3>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        domain.role === 'PRIMARY'
                          ? 'text-emerald-400 border-emerald-900/40 bg-emerald-900/10'
                          : domain.role === 'TARGET'
                          ? 'text-violet-400 border-violet-900/40 bg-violet-900/10'
                          : 'text-sky-400 border-sky-900/40 bg-sky-900/10'
                      }`}
                    >
                      {domain.role}
                    </span>
                  </div>
                  <a
                    href={`https://${domain.domain}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs font-mono text-zinc-400 hover:text-mil-accent inline-flex items-center gap-1 mt-1"
                  >
                    {domain.domain}
                    <ExternalLink size={11} />
                  </a>
                  <p className="text-zinc-500 text-xs mt-2 leading-relaxed">{domain.description}</p>
                </div>
                <div className="text-xs font-mono text-zinc-500 whitespace-nowrap">
                  {pages.length} / {domain.pages.length} pages
                </div>
              </header>

              {pages.length === 0 ? (
                <div className="p-5 text-zinc-600 text-sm italic">No pages catalogued yet.</div>
              ) : (
                <ul className="divide-y divide-zinc-800/60">
                  {pages.map((p) => {
                    const st = statusStyle[p.status];
                    const url = `https://${domain.domain}${p.path}`;
                    return (
                      <li
                        key={`${domain.domain}${p.path}-${p.title}`}
                        className="p-4 hover:bg-zinc-900/40 transition-colors flex flex-col md:flex-row md:items-start gap-3"
                      >
                        <div className="flex items-center gap-2 md:w-32 shrink-0">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border inline-flex items-center gap-1 ${st.color} ${st.border} ${st.bg}`}
                          >
                            <st.icon size={10} />
                            {st.label}
                          </span>
                          {p.priority && (
                            <span
                              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${priorityStyle[p.priority]}`}
                            >
                              {p.priority}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="text-sm font-mono text-zinc-200 hover:text-mil-accent truncate inline-flex items-center gap-1"
                            >
                              {p.path}
                              <ExternalLink size={11} className="opacity-60" />
                            </a>
                            <button
                              onClick={() => copyOne(url)}
                              className="text-zinc-500 hover:text-white"
                              title="Copy URL"
                            >
                              {copied === url ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                          <div className="text-sm text-white mt-0.5">{p.title}</div>
                          {p.notes && (
                            <div className="text-xs text-zinc-500 mt-1 leading-relaxed">{p.notes}</div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}

        {/* Footer note */}
        <div className="text-[11px] text-zinc-600 font-mono text-center pt-2 pb-8">
          Update <span className="text-zinc-400">components/SiteMigration.tsx</span> as pages ship. The
          &ldquo;Copy gap list&rdquo; button outputs TSV (priority · URL · title · notes) for feeding into Mila or a
          build sprint.
        </div>
      </div>
    </div>
  );
};

export default SiteMigration;
