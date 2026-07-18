import React, { useMemo } from 'react';
import {
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Network,
  Plus,
  ArrowRight,
  ExternalLink,
  MapPin,
  Activity,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import {
  domains,
  primaryPages,
  primaryProgressPct,
  serviceAreaPlan,
  phaseProgress,
  PRIMARY_DOMAIN,
  TARGET_DOMAIN,
} from '../data/migration';

/**
 * NorCal Progress Dashboard
 *
 * Rolls the per-URL data from `data/migration.ts` up into a single
 * "are we ready to migrate yet?" view for norcalcarbmobile.com →
 * silverbackai.agency.
 */

const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}> = ({ label, value, sub, tone = 'neutral', icon: Icon }) => {
  const toneMap = {
    neutral: 'text-white border-zinc-800 bg-zinc-900/40',
    good: 'text-emerald-300 border-emerald-900/40 bg-emerald-900/10',
    warn: 'text-amber-300 border-amber-900/40 bg-amber-900/10',
    bad: 'text-red-300 border-red-900/40 bg-red-900/10',
  } as const;
  const accent = {
    neutral: 'text-zinc-400',
    good: 'text-emerald-400',
    warn: 'text-amber-400',
    bad: 'text-red-400',
  } as const;

  return (
    <div className={`rounded-xl border p-5 ${toneMap[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</div>
          <div className="text-3xl font-bold mt-1 leading-none">{value}</div>
          {sub && <div className="text-xs text-zinc-500 mt-2">{sub}</div>}
        </div>
        {Icon && <Icon size={18} className={accent[tone]} />}
      </div>
    </div>
  );
};

const ProgressBar: React.FC<{ pct: number; tone?: 'good' | 'warn' | 'bad' }> = ({ pct, tone = 'good' }) => {
  const color =
    tone === 'good' ? 'bg-emerald-500' : tone === 'warn' ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
};

const NorcalProgress: React.FC = () => {
  const primary = useMemo(() => primaryPages(), []);
  const liveCount = primary.filter((p) => p.status === 'LIVE').length;
  const gapCount = primary.filter((p) => p.status === 'GAP').length;
  const p0Open = primary.filter((p) => p.status === 'GAP' && p.priority === 'P0').length;
  const p1Open = primary.filter((p) => p.status === 'GAP' && p.priority === 'P1').length;
  const p2Open = primary.filter((p) => p.status === 'GAP' && p.priority === 'P2').length;
  const totalPrimaryTracked = liveCount + gapCount;
  const overallPct = primaryProgressPct();

  const sister = domains.filter((d) => d.role === 'SISTER');
  const target = domains.find((d) => d.role === 'TARGET');
  const plannedCount = target ? target.pages.filter((p) => p.status === 'PLANNED').length : 0;

  const sitemapBroken = primary.some(
    (p) => p.path === '/sitemap.xml' && p.status === 'GAP'
  );

  const phases = [phaseProgress(1), phaseProgress(2), phaseProgress(3)];

  const overallTone: 'good' | 'warn' | 'bad' =
    overallPct >= 80 ? 'good' : overallPct >= 50 ? 'warn' : 'bad';

  const nextActions = primary
    .filter((p) => p.status === 'GAP')
    .sort((a, b) => (a.priority ?? 'P2').localeCompare(b.priority ?? 'P2'))
    .slice(0, 5);

  return (
    <div className="h-full flex flex-col bg-mil-black text-white">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-mil-black sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Gauge className="text-mil-accent" />
              NORCAL PROGRESS
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Migration health for{' '}
              <a
                href={`https://${PRIMARY_DOMAIN}`}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-zinc-300 hover:text-mil-accent inline-flex items-center gap-1"
              >
                {PRIMARY_DOMAIN} <ExternalLink size={11} />
              </a>{' '}
              → cutover target{' '}
              <a
                href={`https://${TARGET_DOMAIN}`}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-zinc-300 hover:text-mil-accent inline-flex items-center gap-1"
              >
                {TARGET_DOMAIN} <ExternalLink size={11} />
              </a>
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            Source: <span className="text-zinc-300">data/migration.ts</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Primary site complete"
            value={`${overallPct}%`}
            sub={
              <>
                <ProgressBar pct={overallPct} tone={overallTone} />
                <div className="mt-2 font-mono">
                  {liveCount} LIVE · {gapCount} GAP · {totalPrimaryTracked} tracked
                </div>
              </>
            }
            tone={overallTone}
            icon={Gauge}
          />
          <Stat
            label="P0 gaps (block cutover)"
            value={p0Open}
            sub="Must be LIVE on the primary before 301s point at silverbackai.agency."
            tone={p0Open === 0 ? 'good' : 'bad'}
            icon={ShieldAlert}
          />
          <Stat
            label="Sister-site coverage"
            value={sister.length}
            sub={`${sister.map((s) => s.domain).slice(0, 3).join(', ')}${sister.length > 3 ? '…' : ''}`}
            tone="neutral"
            icon={Network}
          />
          <Stat
            label="Planned on target"
            value={plannedCount}
            sub={`Pages to build on ${TARGET_DOMAIN}.`}
            tone="neutral"
            icon={Plus}
          />
        </div>

        {/* Sitemap health banner */}
        {sitemapBroken && (
          <div className="bg-red-900/15 border border-red-900/40 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="text-red-400 mt-0.5 shrink-0" size={18} />
            <div className="text-sm">
              <div className="font-bold text-red-300">Sitemap is broken</div>
              <div className="text-zinc-400 mt-0.5">
                <span className="font-mono text-zinc-300">{PRIMARY_DOMAIN}/sitemap.xml</span> is returning HTTP 500.
                Search engines can&apos;t discover any new pages you ship until this is fixed. Treat as P0.
              </div>
            </div>
          </div>
        )}

        {/* Priority breakdown */}
        <section className="bg-mil-gray border border-zinc-800 rounded-xl p-5">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Activity size={16} className="text-mil-accent" />
            Gap backlog by priority
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'P0 — Cutover blockers', count: p0Open, tone: 'bad' as const },
              { label: 'P1 — Important', count: p1Open, tone: 'warn' as const },
              { label: 'P2 — Nice to have', count: p2Open, tone: 'neutral' as const },
            ].map((b) => (
              <div
                key={b.label}
                className={`rounded-lg border p-4 ${
                  b.tone === 'bad'
                    ? 'border-red-900/40 bg-red-900/10'
                    : b.tone === 'warn'
                    ? 'border-amber-900/40 bg-amber-900/10'
                    : 'border-zinc-800 bg-zinc-900/40'
                }`}
              >
                <div className="text-xs font-mono uppercase tracking-widest text-zinc-500">{b.label}</div>
                <div
                  className={`text-3xl font-bold mt-1 ${
                    b.tone === 'bad' ? 'text-red-300' : b.tone === 'warn' ? 'text-amber-300' : 'text-zinc-200'
                  }`}
                >
                  {b.count}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">open GAP pages</div>
              </div>
            ))}
          </div>
        </section>

        {/* Phased rollout */}
        <section className="bg-mil-gray border border-zinc-800 rounded-xl p-5">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-mil-accent" />
            Phased rollout — from{' '}
            <span className="font-mono text-zinc-400 text-sm">sites/norcalcarbmobile/data/service-areas.json</span>
          </h3>

          <div className="space-y-5">
            {phases.map((p, idx) => {
              const phaseNum = (idx + 1) as 1 | 2 | 3;
              const tone: 'good' | 'warn' | 'bad' = p.pct === 100 ? 'good' : p.pct >= 50 ? 'warn' : 'bad';
              return (
                <div key={phaseNum} className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div className="font-bold text-sm text-zinc-200">
                      Phase {phaseNum}
                      <span className="text-zinc-500 font-mono text-xs ml-2">
                        ({p.shipped}/{p.total} areas shipped · {p.pct}%)
                      </span>
                    </div>
                  </div>
                  <ProgressBar pct={p.pct} tone={tone} />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {p.areas.map((a) => {
                      const shipped = a.shippedOnPrimary;
                      return (
                        <a
                          key={a.slug}
                          href={a.url ?? `https://${PRIMARY_DOMAIN}`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={`text-xs font-mono inline-flex items-center gap-1.5 px-2 py-1 rounded border transition-colors ${
                            shipped
                              ? 'border-emerald-900/40 bg-emerald-900/10 text-emerald-300 hover:border-emerald-700/60'
                              : a.hasSisterCoverage
                              ? 'border-sky-900/40 bg-sky-900/10 text-sky-300 hover:border-sky-700/60'
                              : 'border-amber-900/40 bg-amber-900/10 text-amber-300 hover:border-amber-700/60'
                          }`}
                          title={
                            shipped
                              ? 'Live on norcalcarbmobile.com'
                              : a.hasSisterCoverage
                              ? `Sister-site coverage only — primary page still missing`
                              : 'No coverage anywhere — build needed'
                          }
                        >
                          {shipped ? (
                            <CheckCircle2 size={11} />
                          ) : a.hasSisterCoverage ? (
                            <Network size={11} />
                          ) : (
                            <AlertTriangle size={11} />
                          )}
                          {a.name}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-[11px] font-mono text-zinc-500">
            <span className="inline-flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-400" /> Shipped on primary</span>
            <span className="inline-flex items-center gap-1"><Network size={11} className="text-sky-400" /> Sister-site only (gap on primary)</span>
            <span className="inline-flex items-center gap-1"><AlertTriangle size={11} className="text-amber-400" /> No coverage yet</span>
          </div>
        </section>

        {/* Next actions */}
        <section className="bg-mil-gray border border-zinc-800 rounded-xl p-5">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <ArrowRight size={16} className="text-mil-accent" />
            Next 5 to ship
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Highest-priority GAP pages on {PRIMARY_DOMAIN}. Build these first to move the % up.
          </p>
          <ol className="space-y-2">
            {nextActions.map((p, i) => (
              <li
                key={p.path}
                className="flex items-start gap-3 bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors"
              >
                <div className="text-xs font-mono text-zinc-500 w-5 shrink-0">{i + 1}.</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        p.priority === 'P0'
                          ? 'text-red-300 border-red-900/40 bg-red-900/10'
                          : p.priority === 'P1'
                          ? 'text-amber-300 border-amber-900/40 bg-amber-900/10'
                          : 'text-zinc-300 border-zinc-700 bg-zinc-900/40'
                      }`}
                    >
                      {p.priority ?? 'P2'}
                    </span>
                    <a
                      href={`https://${PRIMARY_DOMAIN}${p.path}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs font-mono text-zinc-200 hover:text-mil-accent inline-flex items-center gap-1 truncate"
                    >
                      {p.path}
                      <ExternalLink size={10} className="opacity-60" />
                    </a>
                  </div>
                  <div className="text-sm text-white mt-0.5">{p.title}</div>
                  {p.notes && <div className="text-xs text-zinc-500 mt-1">{p.notes}</div>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Sister coverage map */}
        <section className="bg-mil-gray border border-zinc-800 rounded-xl p-5">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-mil-accent" />
            Sister-site network
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sister.map((d) => (
              <a
                key={d.domain}
                href={`https://${d.domain}`}
                target="_blank"
                rel="noreferrer noopener"
                className="block bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 hover:border-sky-700/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm text-white">{d.label}</div>
                  <ExternalLink size={12} className="text-zinc-500" />
                </div>
                <div className="text-xs font-mono text-sky-300 mt-0.5">{d.domain}</div>
                <div className="text-xs text-zinc-500 mt-1 leading-relaxed">{d.description}</div>
              </a>
            ))}
          </div>
        </section>

        <div className="text-[11px] text-zinc-600 font-mono text-center pt-2 pb-8">
          % shipped = LIVE / (LIVE + GAP) on {PRIMARY_DOMAIN}. Sister and PLANNED pages are tracked separately.
          See the Site Migration tab for the full URL list.
        </div>
      </div>
    </div>
  );
};

export default NorcalProgress;
