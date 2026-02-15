import React, { useState } from 'react';
import { Database, Search, Filter, ExternalLink, Phone, MapPin, Star, Clock, CheckCircle2 } from 'lucide-react';
import { Lead } from '../types';

const SACRAMENTO_LEADS: Lead[] = [
  {
    id: '29',
    name: 'Chevron West',
    category: 'Tow Truck Equipment',
    website: 'https://www.chevronwest.com/locations/sacramento-ca',
    phone: '(916) 371-7188',
    address: '3030 Power Inn Road, Sacramento, CA 95826',
    priority: 'HIGH',
    notes: 'Tow truck sales/service, commercial vehicles, M-F 7am-4pm',
    status: 'Not Contacted'
  },
  {
    id: '30',
    name: 'Sac Truck Depot',
    category: 'Commercial Truck Dealer',
    website: 'https://www.sactruckdepot.com/',
    phone: '(916) 488-1100',
    address: '3324 Fulton Ave, Sacramento, CA 95821',
    priority: 'HIGH',
    notes: 'Specializes in clean late model diesel pickups, established 1985',
    status: 'Not Contacted'
  },
  {
    id: '31',
    name: 'Jackson Properties',
    category: 'Commercial Real Estate',
    website: 'https://www.jacksonprop.com/available-properties/',
    address: 'Power Inn Road Area, Sacramento, CA',
    priority: 'MEDIUM',
    notes: 'Properties near Power Inn Road, warehouse/commercial spaces',
    status: 'Not Contacted'
  },
  {
    id: '32',
    name: 'Western Truck Center',
    category: 'Truck Dealer',
    phone: '(916) 375-3040',
    address: '1925 Enterprise Boulevard, West Sacramento, CA 95691',
    priority: 'HIGH',
    notes: 'Commercial truck dealer, 5-star rating, near the corridor',
    status: 'Not Contacted'
  },
  {
    id: '33',
    name: "B J's Gears & Truck Sales",
    category: 'Truck Dealer',
    phone: '(916) 372-3518',
    address: '501 Glide Ave, West Sacramento, CA 95691',
    priority: 'HIGH',
    notes: 'Commercial truck dealer, opens 8am',
    status: 'Not Contacted'
  },
  {
    id: '20',
    name: 'Sac Valley Diesel',
    category: 'Diesel Repair',
    website: 'https://sacvalleydiesel.com/',
    phone: '(916) 514-1717',
    address: '5630 Roseville Rd, Sacramento, CA',
    priority: 'MEDIUM',
    notes: 'ASE/CAT/Cummins certified, Ford PowerStroke specialist',
    status: 'Not Contacted'
  },
  {
    id: '21',
    name: 'Truck Parking Sacramento',
    category: 'Parking',
    website: 'https://truckparkingsacramento.com/',
    phone: '(916) 304-5022',
    address: 'Sacramento, CA',
    priority: 'HIGH',
    notes: 'Gated/secured, cameras, easy freeway access, caters to truckers',
    status: 'Not Contacted'
  }
];

const LeadDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState<Lead[]>(SACRAMENTO_LEADS);

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-mil-black text-white p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Database className="text-mil-accent" />
              PARTNERSHIP OUTREACH
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Sacramento Area Target Companies (40 Mile Radius)</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="w-full bg-zinc-900 border border-zinc-700 pl-10 pr-4 py-2 rounded-lg text-sm focus:border-mil-accent outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-zinc-800 p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-mil-gray border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all flex flex-col">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{lead.category}</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{lead.name}</h3>
                  </div>
                  <div className={`flex gap-0.5 ${lead.priority === 'HIGH' ? 'text-mil-warn' : 'text-zinc-600'}`}>
                    <Star size={14} fill={lead.priority === 'HIGH' ? 'currentColor' : 'none'} />
                    <Star size={14} fill={lead.priority === 'HIGH' ? 'currentColor' : 'none'} />
                    {lead.priority === 'HIGH' && <Star size={14} fill="currentColor" />}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-zinc-600" />
                    {lead.address}
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-zinc-600" />
                      {lead.phone}
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-zinc-600 mt-0.5 shrink-0" />
                    <span className="leading-relaxed italic">"{lead.notes}"</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{lead.status}</span>
                </div>
                <div className="flex gap-2">
                  {lead.website && (
                    <a href={lead.website} target="_blank" rel="noreferrer" className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button className="px-3 py-1 bg-mil-accent/10 text-mil-accent border border-mil-accent/20 rounded text-[10px] font-bold uppercase hover:bg-mil-accent/20 transition-all">
                    Initiate Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-emerald-900/10 border border-emerald-900/30 p-6 rounded-2xl flex items-start gap-5">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-mil-accent shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-bold text-emerald-400">Immediate Action Plan: Q1 SACRAMENTO</h4>
            <p className="text-zinc-500 text-sm leading-relaxed mt-1">
              Bryan, focus on <span className="text-white font-bold">High Priority</span> targets in the Power Inn Road corridor first. 
              Objective: Secure 2-3 solid referral partnerships within the first 7 days to scale NorCal CARB Mobile flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDatabase;