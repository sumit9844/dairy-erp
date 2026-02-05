import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, Users, Droplets, IndianRupee, 
  Package, ArrowUpRight, Activity, PieChart as PieIcon
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://dairy-erp-backend.onrender.com/api/dashboard/stats')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="p-10 text-center font-bold text-slate-400">Loading Business Intelligence...</div>;

  const netProfit = data.finance.revenue - (data.milk.totalCost + data.finance.expenses);

  return (
    <div className="w-full animate-in fade-in duration-700 space-y-8">
      
      {/* 1. TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Volume" value={`${data.milk.totalLiters.toFixed(1)} L`} icon={<Droplets />} color="blue" />
        <MetricCard title="Milk Cost" value={`₹${data.milk.totalCost.toLocaleString()}`} icon={<IndianRupee />} color="orange" />
        <MetricCard title="Total Revenue" value={`₹${data.finance.revenue.toLocaleString()}`} icon={<TrendingUp />} color="indigo" />
        <MetricCard title="Net Profit" value={`₹${netProfit.toLocaleString()}`} icon={<Activity />} color={netProfit >= 0 ? "emerald" : "red"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. COLLECTION TREND CHART (Big visual) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">7-Day Milk Collection Trend</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">LITERS / DAY</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trends}>
                <defs>
                  <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="liters" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLiters)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. STOCK LEVELS BAR CHART */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8">Inventory Stock</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.inventory}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
                        <Bar dataKey="stock" radius={[10, 10, 10, 10]} barSize={30}>
                            {data.inventory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.stock > 10 ? '#10b981' : '#f43f5e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 4. MILK TYPE DISTRIBUTION */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8">Milk Composition</h3>
            <div className="flex items-center gap-10">
                <div className="flex-1 space-y-6">
                    <MilkBar label="Cow Milk" qty={data.milk.cowLiters} total={data.milk.totalLiters} color="bg-orange-400" />
                    <MilkBar label="Buffalo Milk" qty={data.milk.buffaloLiters} total={data.milk.totalLiters} color="bg-indigo-600" />
                </div>
                <div className="w-32 h-32 bg-slate-50 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-inner">
                    <PieIcon className="text-slate-300 mb-1" size={20} />
                    <span className="text-xl font-black text-slate-700">{data.milk.totalLiters.toFixed(0)}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Total Ltrs</span>
                </div>
            </div>
        </div>

        {/* 5. SYSTEM STATUS & QUICK INFO */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Farmer Network</p>
                    <h4 className="text-4xl font-black">{data.milk.farmerCount} <span className="text-sm font-bold text-slate-500">Active Suppliers</span></h4>
                </div>
                <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl border border-emerald-500/20">
                    <Users size={24} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Avg. Purchase Rate</p>
                    <p className="text-lg font-black text-blue-400">₹{data.milk.avgRate.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Operational Expense</p>
                    <p className="text-lg font-black text-red-400">₹{data.finance.expenses}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// UI Components
const MetricCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: "text-blue-600 bg-blue-50",
        orange: "text-orange-600 bg-orange-50",
        indigo: "text-indigo-600 bg-indigo-50",
        emerald: "text-emerald-600 bg-emerald-50",
        red: "text-red-600 bg-red-50"
    };
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-4`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h2>
        </div>
    );
};

const MilkBar = ({ label, qty, total, color }) => {
    const pct = total > 0 ? (qty / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-800">{qty.toFixed(1)} L ({pct.toFixed(0)}%)</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

export default Dashboard;