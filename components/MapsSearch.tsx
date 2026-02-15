import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MapPin, Search, Navigation, ExternalLink, Loader2, Map as MapIcon, Layers } from 'lucide-react';

const MapsSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [explanation, setExplanation] = useState('');

  const handleSearch = async () => {
    if (!query) return;
    setIsSearching(true);
    setResults([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Get current location if available
      let latLng = { latitude: 37.7749, longitude: -122.4194 }; // Default SF
      try {
        const pos: any = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        latLng = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (e) { console.warn("Geolocation failed, using default."); }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: { latLng: latLng }
          }
        }
      });

      setExplanation(response.text || '');
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const mapResults = chunks.filter((c: any) => c.maps).map((c: any) => c.maps);
      setResults(mapResults);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-mil-black text-white p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="border-b border-zinc-800 pb-6">
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <MapPin className="text-mil-accent" />
            OPERATIONAL MAPS
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Grounding Intelligence. Real-time location & competitor analysis.</p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-4 text-zinc-500" size={20} />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for 'Italian restaurants nearby' or 'Fleet maintenance centers in San Jose'..."
              className="w-full bg-mil-gray border border-zinc-700 p-4 pl-12 rounded-xl focus:border-mil-accent outline-none text-white shadow-lg transition-all"
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={isSearching || !query}
            className="bg-mil-accent hover:bg-emerald-400 text-black px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="animate-spin" /> : <Navigation size={18} />}
            EXECUTE
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} /> Grounding Chunks
            </h3>
            
            {isSearching && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl animate-pulse">
                    <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-zinc-800 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {!isSearching && results.length === 0 && (
              <div className="text-zinc-700 font-mono text-xs italic">Awaiting query...</div>
            )}

            <div className="space-y-4">
              {results.map((place, idx) => (
                <div key={idx} className="bg-mil-gray border border-zinc-800 p-4 rounded-xl hover:border-emerald-500/50 transition-all group">
                  <h4 className="font-bold text-white group-hover:text-mil-accent transition-colors">{place.title}</h4>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {place.address || 'Address on Map'}
                  </div>
                  <a 
                    href={place.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase bg-emerald-900/10 px-2 py-1 rounded hover:bg-emerald-900/20"
                  >
                    View on Maps <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-[500px] flex flex-col relative overflow-hidden">
               <div className="p-6 border-b border-zinc-800 bg-zinc-800/50 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-zinc-400">ANALYSIS OUTPUT</span>
                <MapIcon size={14} className="text-zinc-600" />
               </div>
               
               <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-emerald max-w-none font-mono text-sm leading-relaxed">
                  {isSearching ? (
                    <div className="h-full flex flex-col items-center justify-center text-mil-accent animate-pulse">
                      <Navigation size={48} className="mb-4" />
                      <p>Triangulating coordinates...</p>
                    </div>
                  ) : explanation ? (
                    explanation
                  ) : (
                    <div className="h-full flex items-center justify-center text-zinc-700 italic">
                      Neural link idle. Enter query to begin spatial analysis.
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapsSearch;