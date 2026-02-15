import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MilaChat from './components/MilaChat';
import AssetAnalyzer from './components/AssetAnalyzer';
import DeploymentConsole from './components/DeploymentConsole';
import KeshaVoice from './components/KeshaVoice';
import CreativeLab from './components/CreativeLab';
import MapsSearch from './components/MapsSearch';
import LeadDatabase from './components/LeadDatabase';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.MILA_CHAT:
        return <MilaChat />;
      case ViewState.LEAD_DATABASE:
        return <LeadDatabase />;
      case ViewState.KESHA_VOICE:
        return <KeshaVoice />;
      case ViewState.CREATIVE_LAB:
        return <CreativeLab />;
      case ViewState.ASSET_ANALYZER:
        return <AssetAnalyzer />;
      case ViewState.MAPS_GROUNDING:
        return <MapsSearch />;
      case ViewState.DOCUMENTS:
        return <DeploymentConsole />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-mil-black text-white font-sans overflow-hidden selection:bg-mil-accent selection:text-black">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 ml-64 overflow-y-auto relative bg-grid-pattern h-full">
        {renderView()}
      </main>
      
      {/* Visual Flair: Grid Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             marginLeft: '16rem'
           }}
      />
    </div>
  );
};

export default App;