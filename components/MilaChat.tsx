import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { sendMessageToMila } from '../services/geminiService';
import { ChatMessage } from '../types';

const MilaChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Mila Musk online. I've reviewed the daily logs. Revenue is efficient, but tax exposure on the new fleet assets needs review. What are your orders, Bryan?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for the service
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessageToMila(input, history);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-mil-black text-white">
      <div className="p-6 border-b border-zinc-800 bg-mil-black sticky top-0 z-10">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <Bot className="text-mil-accent" />
          MILA COMM LINK
        </h2>
        <p className="text-zinc-500 text-sm mt-1">Direct line to Chief of Staff. Encrypted.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 font-mono text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-emerald-900/10 text-emerald-100 border border-emerald-900/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 text-xs opacity-50 uppercase font-bold">
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                {msg.role === 'user' ? 'Silverback Leader' : 'Mila Musk'}
                <span className="ml-auto">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <Loader2 className="animate-spin text-mil-accent w-5 h-5" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-mil-gray">
        <div className="flex gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Issue a directive..."
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white p-3 rounded-lg focus:outline-none focus:border-mil-accent focus:ring-1 focus:ring-mil-accent resize-none font-mono text-sm"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-mil-accent hover:bg-emerald-400 text-black font-bold px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilaChat;