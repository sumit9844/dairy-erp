import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatBS } from '../utils/dateHelper';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, Users, Droplets, IndianRupee, 
  Package, ArrowUpRight, ArrowDownRight, Activity, Calendar, Wallet, FlaskConical, AlertTriangle, RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // Track error state
  const [timeRange, setTimeRange] = useState('today');
  const [customDate, setCustomDate] = useState(''); 

  useEffect(() => {
    fetchData();
  }, [timeRange, customDate]);

  const fetchData = async () => {
    setLoading(true);
    setError(false);

    // 1. Safety Timeout: If backend takes > 15s, show Retry button
    const timeoutId = setTimeout(() => {
        setLoading(false);
        setError(true);
    }, 15000);

    try {
      // 2. Build URL based on environment (Local vs Cloud)
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://dairy-erp-backend.onrender.com';

      let url = `${baseUrl}/api/dashboard/stats?range=${timeRange}`;
      if (customDate) {
        url = `${baseUrl}/api/dashboard/stats?customDate=${customDate}`;
      }
      
      const res = await axios.get(url);
      clearTimeout(timeoutId); // Success! Stop the timer.
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeClick = (range) => {
    setCustomDate('');
    setTimeRange(range);
  };

  const handleDateChange = (e) => {
    setCustomDate(e.target.value);
    setTimeRange('custom');
  };

  // --- LOADING VIEW ---
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
            <p className="text-slate-800 font-black text-xl tracking-tight">ANALYZING DATA...</p>
            <p className="text-slate-400 text-sm font-bold mt-1">Waking up secure server...</p>
        </div>
    </div>
  );

  // --- ERROR / TIMEOUT VIEW ---
  if (error || !data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in zoom-in">
        <div className="bg-red-50 p-6 rounded-full border border-red-100 shadow-sm">
            <AlertTriangle size={48} className="text-red-500" />
        </div>
        <div className="text-center max-w-md">
            <h3 className="text-2xl font-black text-slate-800">Connection Delayed</h3>
            <p className="text-slate-500 mt-2 font-medium">
                The free cloud server is "waking up". Please click below to try again.
            </p>
        </div>
        <button 
            onClick={() => fetchData()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
            <RefreshCw size={20} /> RETRY CONNECTION
        </button>
    </div>
  );

  // --- MAIN DASHBOARD ---
  const chartData = data.trends?.map(item => ({
    ...item,
    bsDate: formatBS(item.date),
    displayDate: formatBS(item.date)?.split('-').slice(1).join('/')
  })) || [];

  return (
    <div className="w-full animate-in fade-in duration-700 space-y-8 pb-10">
      
      {/* 1. HEADER & FILTERS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">System Overview</h1>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mt-1">
             <Calendar size={16} className="text-blue-500" />
             <span>{formatBS(new Date())} (BS)</span>
             <span className="text-slate-300">|</span>
             <span>{new Date().toLocaleDateString('en-GB')} (AD)</span>
          </div>
        </div>

        {/* TIME CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex bg-slate-50 rounded-2xl p-1">
                {['today', 'week', 'month', 'year'].map((range) => (
                    <button key={range} onClick={() => handleRangeClick(range)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeRange === range && !customDate ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                        {range}
                    </button>
                ))}
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <div className="relative flex items-center px-4">
                <span className="text-[10px] font-black text-slate-400 uppercase mr-3">Pick Date:</span>
                <input 
                    type="date" 
                    value={customDate} 
                    onChange={handleDateChange}
                    className="bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                />
            </div>
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <MetricCard title={`Collection (${customDate ? 'Day' : timeRange})`} value={`${(data.milk.totalLiters ?? 0).toFixed(1)} L`} icon={<Droplets />} color="blue" />
        <MetricCard title="Procurement Cost" value={`₹${(data.milk.totalCost ?? 0).toLocaleString()}`} icon={<IndianRupee />} color="orange" />
        <MetricCard title="Total Revenue" value={`₹${(data.finance.revenue ?? 0).toLocaleString()}`} icon={<TrendingUp />} color="indigo" />
        <MetricCard title="Net Profit" value={`₹${(data.finance.netProfit ?? 0).toLocaleString()}`} icon={<Activity />} color={(data.finance.netProfit ?? 0) >= 0 ? "emerald" : "red"} isProfit={true} />
        <MetricCard title="Avg Quality" value={`F:${(data.milk.avgFat ?? 0).toFixed(1)} / S:${(data.milk.avgSnf ?? 0).toFixed(1)}`} icon={<FlaskConical />} color="purple" />
      </div>

      {/* 3. TRENDS & FINANCIAL SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Collection Trend</h3>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">LITERS</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelFormatter={(label, payload) => payload[0]?.payload?.bsDate || label} />
                <Area type="monotone" dataKey="liters" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorLiters)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* P&L STATEMENT */}
        <div className="bg-[#1e293b] rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col justify-between">
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">P&L ({customDate || timeRange})</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-slate-700">
                        <span className="text-sm font-bold text-slate-400">Total Sales</span>
                        <span className="font-black text-emerald-400">+ ₹{(data.finance.revenue ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-slate-700">
                        <span className="text-sm font-bold text-slate-400">Milk Purchase</span>
                        <span className="font-black text-red-400">- ₹{(data.milk.totalCost ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-slate-700">
                        <span className="text-sm font-bold text-slate-400">Op. Expenses</span>
                        <span className="font-black text-red-400">- ₹{(data.finance.expenses ?? 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Net Business Profit</p>
                <h4 className={`text-4xl font-black ${(data.finance.netProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                    ₹{(data.finance.netProfit ?? 0).toLocaleString()}
                </h4>
            </div>
        </div>
      </div>

      {/* 4. INVENTORY & MILK TYPE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8">Milk Source Split</h3>
            <div className="space-y-8">
                <MilkBar label="Cow Milk" qty={data.milk.cowLiters ?? 0} total={data.milk.totalLiters ?? 0} color="bg-orange-400" icon="🐄" />
                <MilkBar label="Buffalo Milk" qty={data.milk.buffaloLiters ?? 0} total={data.milk.totalLiters ?? 0} color="bg-indigo-600" icon="🐃" />
            </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                <Package size={16}/> Inventory
            </h3>
            <div className="grid grid-cols-3 gap-4">
                {data.inventory?.map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase truncate mb-1">{item.name}</p>
                        <p className={`text-lg font-black ${item.stock > 0 ? 'text-slate-800' : 'text-red-400'}`}>
                            {item.stock} <span className="text-[9px] opacity-50">{item.unit}</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

// UI Components
const MetricCard = ({ title, value, icon, color, isProfit }) => {
    const colors = { blue: "bg-blue-50 text-blue-600", orange: "bg-orange-50 text-orange-600", indigo: "bg-indigo-50 text-indigo-600", emerald: "bg-emerald-50 text-emerald-600", red: "bg-red-50 text-red-600", purple: "bg-purple-50 text-purple-600" };
    return (
        <div className={`p-6 rounded-[2rem] shadow-sm border transition-all hover:shadow-lg ${isProfit ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-4`}>{React.cloneElement(icon, { size: 24 })}</div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isProfit ? 'text-slate-500' : 'text-slate-400'}`}>{title}</p>
            <h2 className={`text-3xl font-black tracking-tight ${isProfit ? 'text-white' : 'text-slate-800'}`}>{value}</h2>
        </div>
    );
};

const MilkBar = ({ label, qty, total, color, icon }) => {
    const pct = total > 0 ? (qty / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                <span className="text-slate-500 flex items-center gap-2 text-lg">{icon} {label}</span>
                <span className="text-slate-800">{qty.toFixed(1)} L ({pct.toFixed(0)}%)</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

export default Dashboard;