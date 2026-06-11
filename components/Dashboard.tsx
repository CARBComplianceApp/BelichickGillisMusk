import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, Activity, Truck, RefreshCcw } from 'lucide-react';

const INITIAL_DATA = [
  { name: 'Jan', revenue: 4000, efficiency: 2400 },
  { name: 'Feb', revenue: 3000, efficiency: 1398 },
  { name: 'Mar', revenue: 2000, efficiency: 9800 },
  { name: 'Apr', revenue: 2780, efficiency: 3908 },
  { name: 'May', revenue: 1890, efficiency: 4800 },
  { name: 'Jun', revenue: 2390, efficiency: 3800 },
  { name: 'Jul', revenue: 3490, efficiency: 4300 },
];

const INITIAL_TAX_DATA = [
  { name: 'Q1', savings: 12000 },
  { name: 'Q2', savings: 19000 },
  { name: 'Q3', savings: 15000 },
  { name: 'Q4', savings: 32000 },
];

const KPICard = ({ title, value, change, icon: Icon, isWarning = false }: any) => (
  <div className="bg-mil-gray border border-zinc-800 p-6 rounded-xl hover:border-zinc-700 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${isWarning ? 'bg-amber-900/20 text-amber-500' : 'bg-emerald-900/20 text-emerald-500'}`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {change > 0 ? '+' : ''}{change}%
      </span>
      <span className="text-zinc-600 text-xs">vs last month</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState(INITIAL_DATA);
  const [taxShieldData, setTaxShieldData] = useState(INITIAL_TAX_DATA);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate data jitter for real-time feel
    setTimeout(() => {
      setRevenueData(prev => prev.map(item => ({
        ...item,
        revenue: Math.floor(item.revenue * (0.95 + Math.random() * 0.1)),
        efficiency: Math.floor(item.efficiency * (0.98 + Math.random() * 0.04))
      })));

      setTaxShieldData(prev => prev.map(item => ({
        ...item,
        savings: Math.floor(item.savings * (0.99 + Math.random() * 0.02))
      })));

      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex justify-between items-start md:items-center">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">COMMAND CENTER</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
              <p className="text-zinc-500">Operational Overview. Date: <span className="font-mono text-mil-accent">FEB 14 2026</span></p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">
                <RefreshCcw size={10} className={`${isRefreshing ? 'animate-spin text-mil-accent' : ''}`} />
                LAST SYNC: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={refreshData}
              disabled={isRefreshing}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm font-medium border border-zinc-700 transition-colors disabled:opacity-50"
            >
              <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Manual Refresh
            </button>
            <button className="px-4 py-2 bg-mil-accent hover:bg-emerald-400 text-black rounded text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all">Init Audit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Projected Revenue" value={`$${(revenueData.reduce((acc, curr) => acc + curr.revenue, 0) / 10).toFixed(1)}k`} change={12.5} icon={DollarSign} />
        <KPICard title="Tax Liability Est." value={`$${(14.2 * (0.98 + Math.random() * 0.04)).toFixed(1)}k`} change={-8.4} icon={AlertTriangle} isWarning />
        <KPICard title="Efficiency Rate" value="94.2%" change={2.1} icon={Activity} />
        <KPICard title="Fleet Active" value="18/20" change={0} icon={Truck} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-mil-gray border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-mil-accent" />
              Revenue vs. Operational Cost
            </h3>
            <div className="flex gap-4 text-[10px] font-mono uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-sm"></div> Revenue</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-zinc-600 rounded-sm"></div> Efficiency</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#27272a', color: '#fff' }} 
                    itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="efficiency" fill="#3f3f46" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-mil-gray border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Tax Shield Performance</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taxShieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#27272a', color: '#fff' }} 
                />
                <Line type="monotone" dataKey="savings" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b'}} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-amber-900/10 border border-amber-900/30 rounded text-xs text-amber-200 font-mono">
            WARNING: Q4 depreciation targets require 2 more asset acquisitions &gt;6000lbs.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;