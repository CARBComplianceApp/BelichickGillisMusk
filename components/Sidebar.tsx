import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, MessageSquare, PieChart, FileText, Zap, Mic, Image as ImageIcon, MapPin, Database, Globe, Gauge } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Command Center', icon: LayoutDashboard },
    { id: ViewState.MILA_CHAT, label: 'Mila (Chief of Staff)', icon: MessageSquare },
    { id: ViewState.LEAD_DATABASE, label: 'Lead Database', icon: Database },
    { id: ViewState.KESHA_VOICE, label: 'Kesha (Voice Agent)', icon: Mic },
    { id: ViewState.CREATIVE_LAB, label: 'Creative Lab', icon: ImageIcon },
    { id: ViewState.ASSET_ANALYZER, label: 'Asset Strategy', icon: PieChart },
    { id: ViewState.MAPS_GROUNDING, label: 'Maps Search', icon: MapPin },
    { id: ViewState.NORCAL_PROGRESS, label: 'NorCal Progress', icon: Gauge },
    { id: ViewState.SITE_MIGRATION, label: 'Site Migration', icon: Globe },
    { id: ViewState.DOCUMENTS, label: 'Intel / Deployment', icon: FileText },
  ];

  return (
    <div className="w-64 bg-mil-gray border-r border-zinc-800 flex flex-col h-full fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
            <Zap className="text-mil-accent w-6 h-6" />
            <span className="text-xl font-bold tracking-tighter text-white">SILENT<span className="text-mil-accent">PARTNER</span></span>
        </div>
        <div className="text-xs text-zinc-500 mt-1 font-mono">v.2.0.5 [SACRAMENTO ALPHA]</div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-800 text-mil-accent border border-zinc-700 shadow-lg shadow-emerald-900/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900/50 rounded p-3 border border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase font-mono mb-1">System Status</div>
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Online (Latency: 12ms)
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
