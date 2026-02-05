import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Droplets, Landmark, History, Calendar, FileText } from 'lucide-react';

const FarmerProfile = ({ farmer, onBack }) => {
  const [milkData, setMilkData] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [activeTab, setActiveTab] = useState('milk');

  useEffect(() => {
    if (farmer) {
      // Fetch Farmer specific records
      axios.get(`https://dairy-erp-backend.onrender.com/api/settlements/statement?farmerId=${farmer.id}&startDate=2024-01-01&endDate=2026-12-31`)
        .then(res => setMilkData(res.data.transactions));
      axios.get(`https://dairy-erp-backend.onrender.com/api/advances/${farmer.id}`)
        .then(res => setAdvanceData(res.data));
    }
  }, [farmer]);

  return (
    <div className="w-full animate-in slide-in-from-right-10 duration-500">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight underline decoration-blue-500 decoration-4 underline-offset-8">{farmer.name}</h1>
          <p className="text-sm text-slate-400 font-bold uppercase mt-2">Member ID: {farmer.farmerCode} • {farmer.milkType} Supplier</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Stats */}
        <div className="lg:col-span-3 space-y-6">
            <QuickStat label="Total Volume" value={`${milkData.reduce((a,c) => a+c.quantity, 0).toFixed(1)} L`} icon={<Droplets className="text-blue-500"/>} />
            <QuickStat label="Total Earnings" value={`₹${milkData.reduce((a,c) => a+c.totalAmount, 0).toLocaleString()}`} icon={<Landmark className="text-emerald-500"/>} />
            <QuickStat label="Net Advance" value={`₹${advanceData.reduce((a,c) => a+c.amount, 0).toLocaleString()}`} icon={<History className="text-orange-500"/>} />
        </div>

        {/* Right: Detailed Tabs */}
        <div className="lg:col-span-9 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="flex border-b">
                <TabBtn active={activeTab === 'milk'} onClick={() => setActiveTab('milk')} label="Milk Records" icon={<Droplets size={16}/>} />
                <TabBtn active={activeTab === 'advances'} onClick={() => setActiveTab('advances')} label="Advance History" icon={<History size={16}/>} />
            </div>

            <div className="p-8">
                {activeTab === 'milk' ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <th className="py-4">Date</th>
                                <th className="py-4 text-center">Shift</th>
                                <th className="py-4 text-center">Qty</th>
                                <th className="py-4 text-center">Fat/SNF</th>
                                <th className="py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {milkData.map(m => (
                                <tr key={m.id} className="text-sm font-bold text-slate-700">
                                    <td className="py-4">{new Date(m.date).toLocaleDateString()}</td>
                                    <td className="py-4 text-center text-xs opacity-50 uppercase">{m.shift}</td>
                                    <td className="py-4 text-center text-blue-600 font-black">{m.quantity} L</td>
                                    <td className="py-4 text-center text-xs text-slate-400">{m.fat} / {m.snf}</td>
                                    <td className="py-4 text-right font-black">₹{m.totalAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                <th className="py-4">Date</th>
                                <th className="py-4">Description</th>
                                <th className="py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {advanceData.map(a => (
                                <tr key={a.id} className="text-sm font-bold text-slate-700">
                                    <td className="py-4">{new Date(a.date).toLocaleDateString()}</td>
                                    <td className="py-4 text-slate-500">{a.description || 'General Advance'}</td>
                                    <td className="py-4 text-right text-red-600 font-black">₹{a.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Internal Helper Components
const QuickStat = ({ label, value, icon }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
);

const TabBtn = ({ active, onClick, label, icon }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-5 font-black uppercase tracking-tighter text-xs transition-all ${active ? 'bg-blue-600 text-white shadow-inner' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
        {icon} {label}
    </button>
);

export default FarmerProfile;