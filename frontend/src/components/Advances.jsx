import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Landmark, History, PlusCircle, Search, User } from 'lucide-react';

const Advances = () => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get('https://dairy-erp-backend.onrender.com/api/farmers').then(res => setFarmers(res.data));
  }, []);

  const handleGiveAdvance = async (e) => {
    e.preventDefault();
    if(!selectedFarmer) return alert("Select a farmer");
    await axios.post('https://dairy-erp-backend.onrender.com/api/advances', {
        farmerId: selectedFarmer.id,
        amount,
        description: desc
    });
    alert("Advance Recorded!");
    setAmount(''); setDesc('');
    fetchHistory(selectedFarmer.id);
  };

  const fetchHistory = async (id) => {
    const res = await axios.get(`https://dairy-erp-backend.onrender.com/api/advances/${id}`);
    setHistory(res.data);
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-200">
          <Landmark className="text-white w-6 h-6"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Farmer Advances</h1>
          <p className="text-sm text-slate-500 font-medium">Manage loans and debt tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Farmer Selector */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Recipient</h3>
          <div className="space-y-2">
            {farmers.map(f => (
                <div 
                  key={f.id} onClick={() => {setSelectedFarmer(f); fetchHistory(f.id);}}
                  className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedFarmer?.id === f.id ? 'bg-orange-600 border-orange-600 text-white' : 'bg-slate-50 border-transparent hover:border-orange-200'}`}
                >
                    <div className="font-bold">{f.name}</div>
                    <div className={`text-[10px] font-bold uppercase ${selectedFarmer?.id === f.id ? 'text-orange-100' : 'text-slate-400'}`}>Code: {f.farmerCode}</div>
                </div>
            ))}
          </div>
        </div>

        {/* Action Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Record New Advance</h3>
            {selectedFarmer ? (
                <form onSubmit={handleGiveAdvance} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Amount (₹)</label>
                        <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Reason/Description</label>
                        <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold" placeholder="e.g. For Cow Feed" />
                    </div>
                    <button type="submit" className="md:col-span-2 bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        <PlusCircle size={20}/> GIVE ADVANCE TO {selectedFarmer.name.toUpperCase()}
                    </button>
                </form>
            ) : (
                <div className="text-center py-10 text-slate-400 italic font-bold">Please select a farmer to give an advance</div>
            )}
          </div>

          {/* History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b flex items-center gap-2">
                <History size={16} className="text-orange-600" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase">Advance History</h3>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] text-slate-400 uppercase border-b bg-slate-50/50">
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {history.map(h => (
                        <tr key={h.id}>
                            <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(h.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{h.description || 'N/A'}</td>
                            <td className="px-6 py-4 text-right font-black text-red-600">₹{h.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advances;