
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
// Added Activity to imports to fix "Cannot find name 'Activity'" error
import { ImageIcon, Sparkles, Wand2, Film, Download, Loader2, Maximize, AlertCircle, Activity } from 'lucide-react';

const CreativeLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [mode, setMode] = useState<'GENERATE' | 'EDIT' | 'VIDEO'>('GENERATE');
  const [statusMsg, setStatusMsg] = useState('');

  const generateImage = async () => {
    if (!prompt) return;

    // MANDATORY: Check for API key selection for Gemini 3 and Veo models as per guidelines
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsGenerating(true);
    setStatusMsg('Drafting neural patterns...');
    try {
      // Re-initializing GoogleGenAI to pick up the potentially new API key from selection dialog
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { aspectRatio: "1:1", imageSize: imageSize }
        }
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      
      if (imageUrl) setGeneratedResult({ url: imageUrl, type: 'image' });
    } catch (err) {
      console.error(err);
      setStatusMsg('Generation failed. Check logs.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (!prompt) return;

    // MANDATORY: Check for API key selection for Gemini 3 and Veo models as per guidelines
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsGenerating(true);
    setStatusMsg('Synthesizing frames (this may take 1-2 mins)...');
    try {
      // Re-initializing GoogleGenAI to pick up the potentially new API key from selection dialog
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });

      while (!operation.done) {
        setStatusMsg(`Kesha is rendering... (${new Date().toLocaleTimeString()})`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        // Using correct API call without unnecessary casting
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);
      setGeneratedResult({ url: videoUrl, type: 'video' });
    } catch (err) {
      console.error(err);
      setStatusMsg('Video synthesis failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-mil-black text-white p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Sparkles className="text-mil-accent" />
              CREATIVE LAB
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Industrial Asset Visualization & Content Engine.</p>
          </div>
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button 
              onClick={() => setMode('GENERATE')}
              className={`px-4 py-2 rounded text-xs font-bold transition-all ${mode === 'GENERATE' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
            >
              IMAGEN 4
            </button>
            <button 
              onClick={() => setMode('EDIT')}
              className={`px-4 py-2 rounded text-xs font-bold transition-all ${mode === 'EDIT' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
            >
              NANO BANANA
            </button>
            <button 
              onClick={() => setMode('VIDEO')}
              className={`px-4 py-2 rounded text-xs font-bold transition-all ${mode === 'VIDEO' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
            >
              VEO 3.1
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-mil-gray border border-zinc-800 p-6 rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-500">Parameters</h3>
              
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase">Prompt Directive</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'GENERATE' ? "e.g., A futuristic fleet of electric trucks driving through a rainy San Francisco at night, cinematic lighting, 8k" : "Describe the transformation..."}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white p-3 rounded focus:border-mil-accent outline-none font-mono text-sm min-h-[120px]"
                />
              </div>

              {mode !== 'VIDEO' && (
                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase">Target Resolution</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1K', '2K', '4K'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size as any)}
                        className={`py-2 rounded border text-xs font-bold transition-all ${imageSize === size ? 'bg-emerald-900/20 border-mil-accent text-mil-accent' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={mode === 'VIDEO' ? generateVideo : generateImage}
                disabled={isGenerating || !prompt}
                className="w-full bg-mil-accent hover:bg-emerald-400 text-black font-bold py-4 rounded flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : mode === 'VIDEO' ? <Film size={18} /> : <Wand2 size={18} />}
                {isGenerating ? 'PROCESSING...' : `INITIATE ${mode}`}
              </button>

              {statusMsg && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 bg-amber-900/10 p-2 rounded">
                  <Activity size={12} className="animate-pulse" />
                  {statusMsg}
                </div>
              )}
            </div>

            <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-xl flex items-start gap-4">
              <AlertCircle className="text-blue-400 mt-1" size={20} />
              <p className="text-zinc-500 text-xs leading-relaxed">
                Generations are limited to 50 units/hr per client project. For high-volume 4K rendering, contact GIA Engineering.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl h-[600px] flex items-center justify-center relative group overflow-hidden">
              {!generatedResult && !isGenerating && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-600">
                    {mode === 'VIDEO' ? <Film /> : <ImageIcon />}
                  </div>
                  <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">Awaiting Command Input</p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center space-y-6 relative z-10">
                   <div className="w-24 h-24 border-4 border-mil-accent/20 border-t-mil-accent rounded-full animate-spin mx-auto"></div>
                   <div className="space-y-2">
                    <h3 className="text-mil-accent font-bold animate-pulse uppercase tracking-widest">Neural Synthesis Active</h3>
                    <p className="text-zinc-500 text-xs font-mono">{statusMsg}</p>
                   </div>
                </div>
              )}

              {generatedResult && (
                <div className="w-full h-full relative animate-fade-in">
                  {generatedResult.type === 'image' ? (
                    <img src={generatedResult.url} alt="Generated" className="w-full h-full object-contain" />
                  ) : (
                    <video src={generatedResult.url} controls autoPlay className="w-full h-full object-contain" />
                  )}
                  
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-black/80 rounded-full hover:bg-emerald-500 transition-colors text-white">
                      <Download size={20} />
                    </button>
                    <button className="p-2 bg-black/80 rounded-full hover:bg-emerald-500 transition-colors text-white">
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeLab;
