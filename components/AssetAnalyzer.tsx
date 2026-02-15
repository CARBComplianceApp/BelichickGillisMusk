import React, { useState } from 'react';
import { AssetData } from '../types';
import { analyzeAssetWithMila } from '../services/geminiService';
import { Cpu, Save, Loader2, DollarSign, Calendar, Truck } from 'lucide-react';

const AssetAnalyzer: React.FC = () => {
  const [asset, setAsset] = useState<AssetData>({
    type: 'Fleet Vehicle',
    name: '',
    cost: 0,
    weight: 0,
    monthlyRevenue: 0,
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!asset.name || asset.cost === 0) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
        const result = await analyzeAssetWithMila(asset);
        setAnalysis(result);
    } catch (e) {
        setAnalysis("Analysis failed.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">ASSET INTAKE</h2>
            <p className="text-zinc-500 text-sm">Enter asset specifications for Section 179 & ROI analysis.</p>
        </div>
        
        <div className="bg-mil-gray border border-zinc-800 p-6 rounded-xl space-y-4">
            <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase">Asset Type</label>
                <select 
                    className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 rounded focus:border-mil-accent outline-none"
                    value={asset.type}
                    onChange={(e) => setAsset({...asset, type: e.target.value as any})}
                >
                    <option>Fleet Vehicle</option>
                    <option>Real Estate</option>
                    <option>Heavy Equipment</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase">Asset Name / VIN</label>
                <div className="relative">
                    <Truck className="absolute left-3 top-3 text-zinc-600" size={16} />
                    <input 
                        type="text" 
                        className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 pl-10 rounded focus:border-mil-accent outline-none"
                        placeholder="e.g., 2026 Ford F-450 Super Duty"
                        value={asset.name}
                        onChange={(e) => setAsset({...asset, name: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase">Cost Basis ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 text-zinc-600" size={16} />
                        <input 
                            type="number" 
                            className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 pl-10 rounded focus:border-mil-accent outline-none"
                            value={asset.cost}
                            onChange={(e) => setAsset({...asset, cost: Number(e.target.value)})}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase">GVWR (Lbs)</label>
                    <input 
                        type="number" 
                        className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 rounded focus:border-mil-accent outline-none"
                        placeholder="6000+"
                        value={asset.weight}
                        onChange={(e) => setAsset({...asset, weight: Number(e.target.value)})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase">Est. Monthly Revenue</label>
                <input 
                    type="number" 
                    className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 rounded focus:border-mil-accent outline-none"
                    value={asset.monthlyRevenue}
                    onChange={(e) => setAsset({...asset, monthlyRevenue: Number(e.target.value)})}
                />
            </div>

            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-mil-accent hover:bg-emerald-400 text-black font-bold py-3 rounded flex items-center justify-center gap-2 transition-all mt-4"
            >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Cpu />}
                RUN MILA ANALYSIS
            </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="h-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Cpu size={200} />
            </div>
            
            {!analysis && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                    <Save size={48} className="mb-4 opacity-50" />
                    <p className="font-mono text-sm">Awaiting Asset Data...</p>
                </div>
            )}

            {isAnalyzing && (
                 <div className="h-full flex flex-col items-center justify-center text-mil-accent">
                    <Loader2 size={48} className="mb-4 animate-spin" />
                    <p className="font-mono text-sm animate-pulse">Running Tax Simulation...</p>
                    <p className="font-mono text-xs text-zinc-500 mt-2">Checking IRS Pub 946...</p>
                </div>
            )}

            {analysis && (
                <div className="animate-fade-in relative z-10">
                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                        <div className="w-3 h-3 bg-mil-accent rounded-full animate-pulse"></div>
                        <h3 className="text-xl font-bold text-white">ANALYSIS COMPLETE</h3>
                    </div>
                    <div className="prose prose-invert prose-emerald max-w-none font-mono text-sm whitespace-pre-line leading-relaxed">
                        {analysis}
                    </div>
                    <div className="mt-8 flex gap-4">
                         <button className="flex-1 border border-mil-accent text-mil-accent py-2 rounded font-bold hover:bg-mil-accent/10">
                            SAVE TO PORTFOLIO
                         </button>
                         <button className="flex-1 bg-zinc-800 text-white py-2 rounded font-bold hover:bg-zinc-700">
                            EXPORT PDF
                         </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AssetAnalyzer;