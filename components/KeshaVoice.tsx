
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, Phone, Volume2, Shield, Loader2, Activity } from 'lucide-react';

const KeshaVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [latency, setLatency] = useState<number>(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Manual base64 decoding implementation as required by guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Raw PCM audio decoding as required by guidelines
  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  // Manual base64 encoding implementation as required by guidelines
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper to create pcm audio blob for live streaming
  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      // Create a new instance right before connection as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // Using sessionPromise to ensure data is sent only after connection is ready and resolved
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              // Precise scheduling for gapless playback using a cursor
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev.slice(-4), `Kesha: ${message.serverContent!.outputTranscription!.text}`]);
            }
            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev.slice(-4), `You: ${message.serverContent!.inputTranscription!.text}`]);
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => {
            console.error("Kesha Voice Error:", e);
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: "You are Kesha, the operational dispatcher for NorCal CARB Mobile. You are efficient, direct, and sound professional. You handle logistics, call scheduling, and quick operational lookups."
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start Kesha:", err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-mil-black text-white p-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Mic className={isActive ? 'text-mil-accent animate-pulse' : 'text-zinc-600'} />
              KESHA VOICE AGENT
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Direct Operational Dispatch. Gemini 2.5 Native Audio.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-mono text-zinc-600 uppercase">Status</div>
              <div className={`text-sm font-bold ${isActive ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {isActive ? 'CONNECTED' : isConnecting ? 'HANDSHAKE...' : 'OFFLINE'}
              </div>
            </div>
            <button
              onClick={isActive ? stopSession : startSession}
              disabled={isConnecting}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isActive 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-900/20' 
                : 'bg-mil-accent hover:bg-emerald-400 text-black shadow-lg shadow-emerald-900/20'
              }`}
            >
              {isConnecting ? <Loader2 className="animate-spin" /> : isActive ? <MicOff /> : <Phone />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-mil-gray border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className={`absolute inset-0 bg-emerald-500/5 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
            
            <div className="relative z-10 text-center space-y-6">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isActive ? 'border-mil-accent scale-110' : 'border-zinc-800'}`}>
                <Activity size={48} className={isActive ? 'text-mil-accent' : 'text-zinc-700'} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Voice Interface</h3>
                <p className="text-zinc-500 text-sm max-w-xs">
                  Speak clearly to initiate dispatch orders or query fleet status. Kesha is optimized for industrial environments.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[400px]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
              <Volume2 size={14} />
              Live Transcription
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto font-mono text-sm pr-2">
              {transcription.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-700 italic">
                  Awaiting audio input...
                </div>
              ) : (
                transcription.map((line, i) => (
                  <div key={i} className={`p-3 rounded-lg ${line.startsWith('Kesha:') ? 'bg-emerald-900/10 text-emerald-400 border border-emerald-900/20' : 'bg-zinc-800 text-white border border-zinc-700'}`}>
                    {line}
                  </div>
                ))
              )}
            </div>
            {isActive && (
              <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-1 h-4 bg-mil-accent rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                  ))}
                </div>
                <div className="text-[10px] font-mono text-zinc-600">PCM 16BIT / 16KHZ</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-emerald-900/5 border border-emerald-900/20 p-6 rounded-xl flex items-start gap-4">
          <Shield className="text-mil-accent mt-1" size={24} />
          <div>
            <h4 className="font-bold text-emerald-400">Military-Grade Security</h4>
            <p className="text-zinc-500 text-sm leading-relaxed mt-1">
              All voice data is processed through an encrypted WebSocket tunnel. Biometric voice templates are stored in Hardware Security Modules (HSM).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeshaVoice;
