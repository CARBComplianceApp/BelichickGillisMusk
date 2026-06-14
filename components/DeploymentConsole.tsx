import React, { useState } from 'react';
import { Terminal, Copy, Check, Server, Globe, FileCode, Play, FileText, AlertCircle, Mic, ShieldCheck, Mail, Trash2, Zap } from 'lucide-react';
import GIAWebsite from './GIAWebsite';

const DeploymentConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INTEL' | 'TERMINAL' | 'PREVIEW' | 'PROTOCOLS' | 'MAKE'>('INTEL');
  const [copied, setCopied] = useState(false);

  const assets = [
    { name: 'GIA Website (2026-02-13)', status: 'STAGED', color: 'text-emerald-500', desc: 'The Face. Agency landing page. Optimized for Vercel edge deployment.' },
    { name: 'Kesha (Voice Agent)', status: 'DEPLOYING', color: 'text-blue-400', desc: 'The Communicator. Live API enabled. Deployment to Vercel Edge active.' },
    { name: 'Make Automation (GIA)', status: 'LEGACY_DETECTED', color: 'text-mil-danger', desc: 'The Backend. Lead syncing & CRM automation via Make.com. REQUIRES PURGE.' },
    { name: 'Silverback AI App (AI Studio)', status: 'ACTIVE', color: 'text-emerald-500', desc: 'CARBComplianceApp/Silverback-Ai-App on main. Live at aistudio.google.com.' },
    { name: 'silverbackai.agency', status: 'REDIRECT_PENDING', color: 'text-amber-500', desc: 'DNS on Cloudflare. Redirect to AI Studio app preview URL.' },
    { name: 'NorCal CARB Mobile', status: 'ACTIVE', color: 'text-emerald-500', desc: 'Mobile CARB Compliance project: clean-truck.' },
    { name: 'cleantruckcheckfairfield.com', status: 'LIVE', color: 'text-emerald-500', desc: 'DNS active on Cloudflare. Mapping to operational funnel.' },
  ];

  const deploymentScript = `
# =========================================================
# CLOUDFLARE REDIRECT: silverbackai.agency -> AI Studio
# APP: CARBComplianceApp/Silverback-Ai-App (main)
# =========================================================

# Option A — Cloudflare Dashboard (recommended)
# 1. Log in to Cloudflare > silverbackai.agency
# 2. Rules > Redirect Rules > Create rule
# 3. Match: hostname equals silverbackai.agency (and www.silverbackai.agency)
# 4. Action: Static redirect (301) to:
#    https://aistudio.google.com/apps/a0beac81-ff66-46e9-9e6a-95a65ce56137?showPreview=true&showAssistant=true&project=gen-lang-client-0013150741
# 5. Save and deploy. Remove any conflicting Page Rules or Workers.

# Option B — Cloudflare API (requires CF_API_TOKEN + ZONE_ID)
# curl -X POST "https://api.cloudflare.com/client/v4/zones/\$ZONE_ID/rulesets/phases/http_request_dynamic_redirect/entrypoint" \\
#   -H "Authorization: Bearer \$CF_API_TOKEN" \\
#   -H "Content-Type: application/json" \\
#   --data '{"rules":[{"expression":"(http.host eq \\"silverbackai.agency\\") or (http.host eq \\"www.silverbackai.agency\\")","action":"redirect","action_parameters":{"from_value":{"status_code":301,"target_url":{"expression":"\\"https://aistudio.google.com/apps/a0beac81-ff66-46e9-9e6a-95a65ce56137?showPreview=true&showAssistant=true&project=gen-lang-client-0013150741\\""}}}}]}'

# =========================================================
# VERCEL DEPLOYMENT PROTOCOL (optional custom hosting)
# TARGET: silverbackai.agency -> AI Studio redirect
# AI Studio: https://aistudio.google.com/apps/a0beac81-ff66-46e9-9e6a-95a65ce56137
# =========================================================

# 1. AUTHENTICATE & LINK
vercel login
vercel link --project gia-website-2026-02-13

# 2. CONFIGURE ENVIRONMENT VARIABLES
vercel env add API_KEY production
vercel env add MILA_AGENT_ID production "mila-v2-09"
vercel env add KESHA_VOICE_SECRET production "encrypted_voice_k_99"
vercel env add NODE_ENV production

# 3. DEPLOY FRONTEND APPLICATION
vercel --prod --confirm
`;

  const makeProtocol = `
# =========================================================
# MAKE.COM "PURGE & REMAKE" PROTOCOL
# OWNER: bryan@norcalcarbmobile.com
# STATUS: CRITICAL - SYSTEM UPGRADE REQUIRED
# =========================================================

1. PHASE ONE: THE PURGE (DELETE OLD LOGIC)
   - Login to Make.com: bryan@norcalcarbmobile.com
   - Navigate to Scenarios.
   - DELETE: "Legacy_Lead_Sync"
   - DELETE: "Old_CRM_Hook"
   - [ACTION]: Ensure all webhooks attached to these scenarios are deactivated.

2. PHASE TWO: THE REMAKE (MODULAR AGENTIC DESIGN)
   - CREATE NEW SCENARIO: "GIA_Mila_Orchestrator_v3"
   - CREATE NEW SCENARIO: "GIA_Kesha_Voice_Bridge_v3"
   - IMPORT BLUEPRINT: "GIA_Master_Blueprint_2026.json"

3. NEW AGENTIC LOGIC:
   - Use the "Mila Router" module to classify inbound leads via Gemini 3 API.
   - Replace legacy array splitting with JSON-parsing modules.
   - NEW MAPPING: 
     Lead Category: {{1.parsed_json.category}}
     Urgency Score: {{1.parsed_json.urgency}}

4. WEBHOOK HANDSHAKE:
   - Update your GIA Website "INITIATE AUDIT" form with the NEW Webhook URL.
   - Test using "Execute Once" in Make.com.

5. VERIFICATION:
   - Check Google Sheets "Project: clean-truck" for successful row insertion.
`;

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
            INTEL & DEPLOYMENT
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Classified Assets. Deployment Protocols.</p>
        </div>
        <div className="flex bg-zinc-900 rounded p-1 border border-zinc-800 self-start md:self-auto overflow-x-auto max-w-full">
            <button 
                onClick={() => setActiveTab('INTEL')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'INTEL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                ASSET LIST
            </button>
            <button 
                onClick={() => setActiveTab('TERMINAL')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'TERMINAL' ? 'bg-zinc-800 text-mil-accent' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                VERCEL CMD
            </button>
            <button 
                onClick={() => setActiveTab('MAKE')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'MAKE' ? 'bg-zinc-800 text-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                MAKE.COM
            </button>
            <button 
                onClick={() => setActiveTab('PREVIEW')}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'PREVIEW' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                SITE PREVIEW
            </button>
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
                                onClick={() => asset.name.includes('Make') ? setActiveTab('MAKE') : setActiveTab('TERMINAL')}
                                className={`w-full py-2 ${asset.color === 'text-mil-danger' ? 'bg-red-900/20 text-red-500 border-red-900/50' : 'bg-zinc-800 text-white border-zinc-700'} border rounded text-xs font-bold uppercase hover:opacity-80 flex items-center justify-center gap-2`}
                            >
                                {asset.color === 'text-mil-danger' ? <Trash2 size={14} /> : <Play size={14} />}
                                {asset.color === 'text-mil-danger' ? 'EXECUTE PURGE' : 'Configure Deployment'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'TERMINAL' && (
            <div className="h-full flex flex-col p-8 animate-fade-in">
                <div className="bg-[#1e1e1e] border border-zinc-700 rounded-lg overflow-hidden flex flex-col max-w-4xl mx-auto w-full shadow-2xl">
                    <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-black/50">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-zinc-400 text-xs font-mono">silverback@terminal:~/vercel</div>
                        <button onClick={() => copyToClipboard(deploymentScript)} className="text-zinc-400 hover:text-white transition-colors">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                    <div className="p-6 font-mono text-sm overflow-y-auto text-emerald-400 max-h-[500px]">
                        <pre className="whitespace-pre-wrap">{deploymentScript}</pre>
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
                            <h3 className="text-mil-danger font-bold text-lg uppercase tracking-tight">DESTRUCTIVE UPDATE REQUIRED</h3>
                            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                                Legacy logic detected in Make.com scenarios. You MUST delete the existing scenarios for <span className="text-white font-mono">bryan@norcalcarbmobile.com</span> before remaking them with the new Agentic Modular Logic.
                            </p>
                            <div className="mt-4 flex gap-2">
                                <button className="px-4 py-2 bg-mil-danger text-white font-bold rounded text-xs uppercase hover:bg-red-600 transition-all flex items-center gap-2">
                                    <Trash2 size={14} /> Acknowledge Purge
                                </button>
                                <button onClick={() => copyToClipboard(makeProtocol)} className="px-4 py-2 bg-zinc-800 text-white font-bold rounded text-xs uppercase border border-zinc-700 hover:bg-zinc-700 transition-all flex items-center gap-2">
                                    <Zap size={14} /> Copy Remake Protocol
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="bg-zinc-800 px-6 py-3 border-b border-zinc-700 flex justify-between items-center">
                            <span className="font-mono text-xs text-zinc-300 font-bold">MAKE_REMAKE_DIRECTIVE.TXT</span>
                        </div>
                        <div className="p-6 font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed border-t border-zinc-800">
                            {makeProtocol}
                        </div>
                    </div>
                </div>
             </div>
        )}

        {activeTab === 'PREVIEW' && (
            <div className="h-full w-full bg-white relative animate-fade-in overflow-y-auto">
                <GIAWebsite />
            </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentConsole;