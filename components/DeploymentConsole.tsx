import React, { useState } from 'react';
import { Copy, Check, Server, Play, Trash2, Zap, ExternalLink } from 'lucide-react';

type DeployScript = 'cloudflare' | 'gcp';

const DeploymentConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INTEL' | 'TERMINAL' | 'PREVIEW' | 'MAKE'>('INTEL');
  const [terminalScript, setTerminalScript] = useState<DeployScript>('cloudflare');
  const [copied, setCopied] = useState(false);

  const assets = [
    {
      name: 'norcalcarbmobile.com',
      status: 'STAGED',
      color: 'text-amber-400',
      desc: 'Primary site. Squarespace → Cloudflare Pages. 27 pages, 47×301 redirects, same fonts/CSS. AI + Google search-friendly static HTML.',
      script: 'cloudflare' as DeployScript,
    },
    {
      name: 'Mila (Chief of Staff Agent)',
      status: 'ACTIVE',
      color: 'text-emerald-500',
      desc: 'Gemini agent in Google AI Studio / Google Cloud. Not hosted on any site platform.',
      script: 'gcp' as DeployScript,
    },
    {
      name: 'Kesha (Voice Agent)',
      status: 'ACTIVE',
      color: 'text-blue-400',
      desc: 'Live voice dispatcher. Runs on Google Cloud (Gemini Live API).',
      script: 'gcp' as DeployScript,
    },
    {
      name: 'Gmail API (Cloud Functions)',
      status: 'STAGED',
      color: 'text-amber-400',
      desc: 'Outbound mail for bryan@norcalcarbmobile.com. Deploy api/ to Google Cloud Functions.',
      script: 'gcp' as DeployScript,
    },
    {
      name: 'Make Automation',
      status: 'LEGACY_DETECTED',
      color: 'text-mil-danger',
      desc: 'Legacy lead sync on Make.com. Purge and rebuild with agent webhooks after site cutover.',
      script: null,
    },
    {
      name: 'cleantruckcheckfairfield.com',
      status: 'LIVE',
      color: 'text-emerald-500',
      desc: 'DNS on Cloudflare. Operational funnel for Fairfield service area.',
      script: 'cloudflare' as DeployScript,
    },
  ];

  const cloudflareScript = `
# =========================================================
# CLOUDFLARE PAGES: norcalcarbmobile.com
# Architecture: static HTML, SEO + AI-search friendly
# =========================================================

# 1. BUILD (from repo root)
npm run build:norcal
# Output: sites/norcalcarbmobile/dist/ (27 pages + _redirects + sitemap)

# 2. LOCAL PREVIEW
cd sites/norcalcarbmobile && npm run preview
# Opens dist/ on http://localhost:4321

# 3. DEPLOY — Cloudflare Dashboard
#    Connect repo → Build command: cd sites/norcalcarbmobile && npm run build
#    Output directory: sites/norcalcarbmobile/dist
#    Custom domain: norcalcarbmobile.com

# 4. DEPLOY — Wrangler CLI (optional)
cd sites/norcalcarbmobile
npm run build
npx wrangler pages deploy dist --project-name=norcalcarbmobile

# 5. PRE-CUTOVER: verify 301 redirects on staging
curl -I https://<preview>.pages.dev/service-area-sacramento-carb-testing
# Expect: 301 → /service-area/sacramento/

# 6. DNS CUTOVER
# Point norcalcarbmobile.com CNAME → <project>.pages.dev
# Remove Squarespace DNS records

# 7. POST-MIGRATION
# Submit sitemap.xml to Google Search Console
# SPF/DKIM/DMARC for bryan@norcalcarbmobile.com
# Monitor 404s for 30 days
`;

  const gcpScript = `
# =========================================================
# GOOGLE CLOUD: Agents + API (NOT Cloudflare, NOT Vercel)
# =========================================================

# AGENTS (Mila, Kesha)
# - Primary UI: Google AI Studio
#   https://aistudio.google.com/apps/a0beac81-ff66-46e9-9e6a-95a65ce56137
# - Production agents: deploy on Google Cloud (Cloud Run / Vertex AI Agent Builder)
# - Secrets: GEMINI_API_KEY in Google Secret Manager

# GMAIL API (api/gmail/send.ts, api/health.ts)
# 1. Enable Gmail API in Google Cloud Console
# 2. Create service account + domain-wide delegation (Workspace)
# 3. Deploy as Cloud Functions (gen2):
#    gcloud functions deploy norcal-gmail-send \\
#      --gen2 --runtime=nodejs20 --region=us-west1 \\
#      --source=./api --entry-point=send \\
#      --trigger-http --allow-unauthenticated
# 4. Set env vars / secrets:
#    GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_IMPERSONATE_USER=bryan@norcalcarbmobile.com

# HEALTH CHECK
# GET /health after deploy — reports Gmail + Gemini credential status
`;

  const makeProtocol = `
# =========================================================
# MAKE.COM PURGE & REMAKE
# OWNER: bryan@norcalcarbmobile.com
# =========================================================

1. PURGE legacy scenarios:
   - DELETE: "Legacy_Lead_Sync"
   - DELETE: "Old_CRM_Hook"
   - Deactivate all attached webhooks

2. REMAKE with agentic modules:
   - CREATE: "NorCal_Mila_Orchestrator_v3"
   - CREATE: "NorCal_Kesha_Voice_Bridge_v3"

3. WEBHOOK HANDSHAKE:
   - Point norcalcarbmobile.com contact form to new Make webhook
   - Test with "Execute Once"

4. VERIFY:
   - Confirm lead rows in Google Sheets "Project: clean-truck"
`;

  const activeScript = terminalScript === 'cloudflare' ? cloudflareScript : gcpScript;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-mil-black text-white">
      <div className="p-6 border-b border-zinc-800 bg-mil-black sticky top-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Server className="text-mil-accent" />
            DEPLOYMENT
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Sites → Cloudflare Pages &nbsp;·&nbsp; Agents → Google Cloud
          </p>
        </div>
        <div className="flex bg-zinc-900 rounded p-1 border border-zinc-800 self-start md:self-auto overflow-x-auto max-w-full">
          {(['INTEL', 'TERMINAL', 'MAKE', 'PREVIEW'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? tab === 'MAKE'
                    ? 'bg-zinc-800 text-amber-500'
                    : 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'INTEL' && 'ASSETS'}
              {tab === 'TERMINAL' && 'DEPLOY CMD'}
              {tab === 'MAKE' && 'MAKE.COM'}
              {tab === 'PREVIEW' && 'NORCAL SITE'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'INTEL' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto h-full animate-fade-in">
            {assets.map((asset, idx) => (
              <div key={idx} className="bg-mil-gray border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{asset.name}</h3>
                  <span className={`text-xs font-mono px-2 py-1 rounded bg-zinc-900 border border-zinc-800 ${asset.color}`}>
                    {asset.status}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm">{asset.desc}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      if (asset.name.includes('Make')) setActiveTab('MAKE');
                      else if (asset.script) {
                        setTerminalScript(asset.script);
                        setActiveTab('TERMINAL');
                      } else if (asset.name.includes('norcalcarbmobile')) {
                        setActiveTab('PREVIEW');
                      }
                    }}
                    className={`w-full py-2 ${
                      asset.color === 'text-mil-danger'
                        ? 'bg-red-900/20 text-red-500 border-red-900/50'
                        : 'bg-zinc-800 text-white border-zinc-700'
                    } border rounded text-xs font-bold uppercase hover:opacity-80 flex items-center justify-center gap-2`}
                  >
                    {asset.color === 'text-mil-danger' ? <Trash2 size={14} /> : <Play size={14} />}
                    {asset.color === 'text-mil-danger'
                      ? 'EXECUTE PURGE'
                      : asset.name.includes('norcalcarbmobile')
                        ? 'Preview Site'
                        : 'Deploy Commands'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'TERMINAL' && (
          <div className="h-full flex flex-col p-8 animate-fade-in">
            <div className="flex gap-2 mb-4 max-w-4xl mx-auto w-full">
              <button
                onClick={() => setTerminalScript('cloudflare')}
                className={`px-3 py-1.5 rounded text-xs font-bold ${terminalScript === 'cloudflare' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500'}`}
              >
                Cloudflare (Sites)
              </button>
              <button
                onClick={() => setTerminalScript('gcp')}
                className={`px-3 py-1.5 rounded text-xs font-bold ${terminalScript === 'gcp' ? 'bg-zinc-800 text-mil-accent' : 'text-zinc-500'}`}
              >
                Google Cloud (Agents + API)
              </button>
            </div>
            <div className="bg-[#1e1e1e] border border-zinc-700 rounded-lg overflow-hidden flex flex-col max-w-4xl mx-auto w-full shadow-2xl">
              <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-black/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-zinc-400 text-xs font-mono">
                  {terminalScript === 'cloudflare' ? 'deploy@cloudflare:~/norcalcarbmobile' : 'deploy@gcp:~/agents'}
                </div>
                <button onClick={() => copyToClipboard(activeScript)} className="text-zinc-400 hover:text-white transition-colors">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="p-6 font-mono text-sm overflow-y-auto text-emerald-400 max-h-[500px]">
                <pre className="whitespace-pre-wrap">{activeScript}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'MAKE' && (
          <div className="h-full flex flex-col p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto w-full space-y-6">
              <div className="bg-red-900/10 border border-red-900/30 p-6 rounded-2xl flex items-start gap-4">
                <Trash2 className="text-mil-danger mt-1" size={24} />
                <div>
                  <h3 className="text-mil-danger font-bold text-lg uppercase tracking-tight">Legacy Make.com cleanup</h3>
                  <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                    Delete old scenarios for <span className="text-white font-mono">bryan@norcalcarbmobile.com</span> before wiring new agent webhooks to the Cloudflare site.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => copyToClipboard(makeProtocol)} className="px-4 py-2 bg-zinc-800 text-white font-bold rounded text-xs uppercase border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                      <Zap size={14} /> Copy Protocol
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-zinc-800 px-6 py-3 border-b border-zinc-700">
                  <span className="font-mono text-xs text-zinc-300 font-bold">MAKE_REMAKE_DIRECTIVE.TXT</span>
                </div>
                <div className="p-6 font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {makeProtocol}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PREVIEW' && (
          <div className="h-full overflow-y-auto p-8 animate-fade-in">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-mil-gray border border-zinc-800 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-2">NorCal CARB Mobile</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Static site migration from Squarespace. Same Montserrat + Source Sans 3 fonts and CSS. Built for Google Search and AI crawlers.
                </p>
                <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <dt className="text-zinc-500">Domain</dt>
                    <dd className="text-white font-mono">norcalcarbmobile.com</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Pages</dt>
                    <dd className="text-white">27 static HTML</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Redirects</dt>
                    <dd className="text-white">47 × 301</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Host</dt>
                    <dd className="text-amber-400">Cloudflare Pages</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => copyToClipboard('npm run build:norcal && cd sites/norcalcarbmobile && npm run preview')}
                    className="px-4 py-2 bg-mil-accent text-black font-bold rounded text-xs uppercase flex items-center gap-2"
                  >
                    <Copy size={14} /> Copy Preview Command
                  </button>
                  <a
                    href="https://norcalcarbmobile.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-zinc-800 text-white font-bold rounded text-xs uppercase border border-zinc-700 flex items-center gap-2 hover:bg-zinc-700"
                  >
                    <ExternalLink size={14} /> Live Site (Squarespace)
                  </a>
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 font-mono text-xs text-zinc-400">
                <p className="text-zinc-300 font-bold mb-2">Local preview</p>
                <pre className="whitespace-pre-wrap text-emerald-400">{`npm run build:norcal
cd sites/norcalcarbmobile && npm run preview
# → http://localhost:4321`}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentConsole;
