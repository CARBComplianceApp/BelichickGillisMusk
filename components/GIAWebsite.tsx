import React, { useEffect } from 'react';
import { ArrowRight, Shield, TrendingUp, Zap, Lock } from 'lucide-react';

const GIAWebsite: React.FC = () => {
  useEffect(() => {
    // SEO & Metadata Management
    const originalTitle = document.title;
    document.title = "Gillis Intelligence Agency | The Silent Partner";

    const metaTags = [
      { name: 'description', content: 'Gillis Intelligence Agency (GIA) installs operational AI infrastructure for NorCal Owner-Operators. We automate tax strategy (IRS § 179), dispatch, and compliance.' },
      { name: 'keywords', content: 'AI Operations, Fleet Management, Tax Strategy, NorCal Trucking, Business Automation, Section 179, Bonus Depreciation, Operational Efficiency' },
      { property: 'og:title', content: 'Gillis Intelligence Agency | The Silent Partner' },
      { property: 'og:description', content: 'We don\'t sell software. We sell profit. Upgrade your business with military-grade operational AI.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://silverbackai.agency' },
      { property: 'og:image', content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80' }, // High-tech dashboard/data image
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Gillis Intelligence Agency | The Silent Partner' },
      { name: 'twitter:description', content: 'Operational AI for the modern industrialist. Scale your fleet, protect your profit.' },
    ];

    // Inject Meta Tags
    const createdTags: HTMLMetaElement[] = [];
    metaTags.forEach(tagData => {
      const meta = document.createElement('meta');
      Object.entries(tagData).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      document.head.appendChild(meta);
      createdTags.push(meta);
    });

    return () => {
      // Cleanup on unmount
      document.title = originalTitle;
      createdTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, []);

  return (
    <div className="bg-black text-white font-sans min-h-screen border-l border-zinc-800 overflow-y-auto">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-900 sticky top-0 bg-black/90 backdrop-blur z-50">
        <div className="text-xl font-bold tracking-tighter">
          GILLIS<span className="text-emerald-500">INTELLIGENCE</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Protocol</a>
          <a href="#" className="hover:text-white transition-colors">Solutions</a>
          <a href="#" className="hover:text-white transition-colors">Results</a>
        </div>
        <button className="bg-white text-black px-5 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">
          Client Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-24 md:py-32 max-w-6xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-500 text-xs font-mono mb-8">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          ACCEPTING NEW PARTNERS Q1 2026
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-8">
          We don't sell software.<br />
          <span className="text-zinc-500">We sell </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-700">profit.</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12">
          The "Silent Partner" Doctrine. We install operational AI infrastructure into your business. 
          You get the output of a 10-person team for the cost of a single retainer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded text-sm font-bold flex items-center justify-center gap-2 transition-all">
            INITIATE AUDIT <ArrowRight size={16} />
          </button>
          <button className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 px-8 py-4 rounded text-sm font-bold transition-all">
            VIEW CASE STUDIES
          </button>
        </div>
      </section>

      {/* Value Props */}
      <section className="px-8 py-24 bg-zinc-900/30 border-y border-zinc-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-emerald-500 mb-4 border border-zinc-800">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold">Tax Fortress</h3>
            <p className="text-zinc-500 leading-relaxed">
              Our algorithms monitor your asset depreciation in real-time. We flag IRS § 179 opportunities before your CPA even wakes up.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-emerald-500 mb-4 border border-zinc-800">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold">Operational Speed</h3>
            <p className="text-zinc-500 leading-relaxed">
              We replace administrative bloat with autonomous agents. Invoicing, dispatch, and compliance happen instantly.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-emerald-500 mb-4 border border-zinc-800">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold">The "Alpha" Yield</h3>
            <p className="text-zinc-500 leading-relaxed">
              We analyze your fleet and real estate to unlock hidden equity. Typical partners see a 24% increase in net margin within 90 days.
            </p>
          </div>
        </div>
      </section>

      {/* The Lock */}
      <section className="px-8 py-32 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center justify-center p-4 bg-zinc-900 rounded-full mb-8">
          <Lock size={32} className="text-zinc-500" />
        </div>
        <h2 className="text-3xl font-bold mb-6">This is a Closed Network.</h2>
        <p className="text-zinc-400 mb-8">
          We work exclusively with Owner-Operators and Real Estate Principals in Northern California.
          Access to the GIA Dashboard is by invitation only.
        </p>
        <div className="flex justify-center">
          <input 
            type="password" 
            placeholder="ENTER ACCESS CODE" 
            className="bg-zinc-900 border border-zinc-800 text-center text-white px-6 py-3 rounded-l w-64 focus:outline-none focus:border-emerald-500 font-mono tracking-widest"
          />
          <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-r font-bold text-sm border-y border-r border-zinc-800">
            AUTHENTICATE
          </button>
        </div>
      </section>

      <footer className="px-8 py-12 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">
          © 2026 Gillis Intelligence Agency. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default GIAWebsite;