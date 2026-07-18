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
import { MigrationPage, MigrationStatus } from '../types';
import { domains, PRIMARY_DOMAIN } from '../data/migration';

/**
 * Site Migration Tracker
 *
 * URL-level view of the NorCal CARB Mobile → Silverback / GIA migration.
 * Data lives in `data/migration.ts` so the NorCal Progress dashboard
 * stays in sync. Update statuses there.
 *
 * - PRIMARY: pages we know exist on norcalcarbmobile.com today
 * - SISTER:  pages on the satellite / sister-site network
 * - GAP:     URLs the primary site advertises (footer, hero, sister-site references)
 *            but that DO NOT yet have a page on norcalcarbmobile.com — must be built
 * - PLANNED: new pages targeted for the migration that don't exist anywhere yet
 * - REDIRECT: pages that exist on the old site and need 301s on the new domain
 */

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

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
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

        <div className="text-[11px] text-zinc-600 font-mono text-center pt-2 pb-8">
          Update <span className="text-zinc-400">data/migration.ts</span> as pages ship. The
          &ldquo;Copy gap list&rdquo; button outputs TSV (priority · URL · title · notes) for feeding into Mila or a
          build sprint.
        </div>
      </div>
    </div>
  );
};

export default SiteMigration;
