import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, Search, Save, History, 
  User, CheckCircle, Info, Beaker
} from 'lucide-react';

const MilkCollection = () => {
  const [farmers, setFarmers] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [formData, setFormData] = useState({
    quantity: '', fat: '', snf: '', shift: 'MORNING'
  });

  const [liveCalc, setLiveCalc] = useState({ rate: 0, total: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [farmersRes, entriesRes] = await Promise.all([
        axios.get('https://dairy-erp-backend.onrender.com/api/farmers'),
        axios.get('https://dairy-erp-backend.onrender.com/api/collections')
      ]);
      setFarmers(farmersRes.data);
      setRecentEntries(entriesRes.data);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Live Calculation
  useEffect(() => {
    if (selectedFarmer && formData.quantity) {
      const qty = parseFloat(formData.quantity) || 0;
      const fat = parseFloat(formData.fat) || 0;
      const snf = parseFloat(formData.snf) || 0;
      
      let rate = 0;
      if (selectedFarmer.rateType === 'FAT_SNF') {
        rate = (fat * selectedFarmer.fatRate) + (snf * selectedFarmer.snfRate);
      } else if (selectedFarmer.rateType === 'FAT_ONLY') {
        rate = (fat * selectedFarmer.fatRate);
      } else {
        rate = selectedFarmer.fixedRate;
      }
      
      setLiveCalc({ 
        rate: rate.toFixed(2), 
        total: (rate * qty).toFixed(2) 
      });
    } else {
      setLiveCalc({ rate: 0, total: 0 });
    }
  }, [formData, selectedFarmer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarmer) return alert("Select a farmer first!");
    
    try {
      await axios.post('https://dairy-erp-backend.onrender.com/api/collections', {
        farmerId: selectedFarmer.id,
        quantity: parseFloat(formData.quantity) || 0,
        // Send 0 if the field is hidden by the RateType logic
        fat: selectedFarmer.rateType !== 'FIXED' ? (parseFloat(formData.fat) || 0) : 0,
        snf: selectedFarmer.rateType === 'FAT_SNF' ? (parseFloat(formData.snf) || 0) : 0,
        shift: formData.shift
      });
      
      setFormData({ quantity: '', fat: '', snf: '', shift: formData.shift });
      setSelectedFarmer(null);
      
      // Refresh Recent Logs
      const res = await axios.get('https://dairy-erp-backend.onrender.com/api/collections');
      setRecentEntries(res.data);
      alert("Milk Transaction Recorded!");
    } catch (err) {
      alert("Error saving transaction.");
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.farmerCode.includes(searchTerm)
  );

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
          <ClipboardList className="text-white w-6 h-6"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Milk Collection</h1>
          <p className="text-sm text-slate-500 font-medium">Capture daily intake and automate payments</p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: FARMER SELECTION */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">1. Identify Farmer</h3>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Type name or code..." 
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[400px]">
              {filteredFarmers.map(f => (
                <div 
                  key={f.id}
                  onClick={() => {
                    setSelectedFarmer(f);
                    setFormData({ ...formData, fat: '', snf: '', quantity: '' }); // Clear inputs on new selection
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    selectedFarmer?.id === f.id 
                    ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-200 -translate-y-1' 
                    : 'bg-white border-slate-50 hover:border-blue-100 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex justify-between items-center text-gray-800">
                    <div>
                        <div className={`font-black ${selectedFarmer?.id === f.id ? 'text-white' : 'text-slate-800'}`}>
                            {f.farmerCode} — {f.name}
                        </div>
                        <div className={`text-[10px] font-black mt-1 flex gap-2 ${selectedFarmer?.id === f.id ? 'text-blue-100' : 'text-slate-400'}`}>
                            <span className="bg-black/10 px-1.5 py-0.5 rounded">{f.milkType}</span>
                            <span className="bg-black/10 px-1.5 py-0.5 rounded uppercase">{f.rateType.replace('_', '+')}</span>
                        </div>
                    </div>
                    {selectedFarmer?.id === f.id && <CheckCircle className="text-white animate-pulse" size={20} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: ENTRY FORM */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2. Capture Quality & Weight</h3>
              
              {/* Shift Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setFormData({...formData, shift: 'MORNING'})}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${formData.shift === 'MORNING' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >MORNING</button>
                <button 
                  onClick={() => setFormData({...formData, shift: 'EVENING'})}
                  className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${formData.shift === 'EVENING' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >EVENING</button>
              </div>
            </div>

            {selectedFarmer ? (
              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Billing Info Tag */}
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 w-fit animate-in slide-in-from-left-4 duration-500">
                    <Info size={16} />
                    <span className="text-xs font-black uppercase tracking-tight">
                        Active Profile: {selectedFarmer.name} — Mode: {selectedFarmer.rateType.replace('_', ' ')}
                    </span>
                </div>

                {/* ADAPTIVE INPUT GRID */}
                <div className={`grid gap-8 ${
                    selectedFarmer.rateType === 'FIXED' ? 'grid-cols-1' : 
                    selectedFarmer.rateType === 'FAT_ONLY' ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                    {/* QUANTITY - ALWAYS VISIBLE */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Milk Quantity (Ltrs)</label>
                        <input 
                            type="number" step="0.01" required value={formData.quantity}
                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-4xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all placeholder:text-slate-200" 
                            placeholder="0.00" autoFocus
                        />
                    </div>

                    {/* FAT - HIDDEN IF FIXED */}
                    {selectedFarmer.rateType !== 'FIXED' && (
                        <div className="space-y-3 animate-in zoom-in duration-300">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fat % Content</label>
                            <input 
                                type="number" step="0.1" required value={formData.fat}
                                onChange={(e) => setFormData({...formData, fat: e.target.value})}
                                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-4xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all placeholder:text-slate-200" 
                                placeholder="0.0"
                            />
                        </div>
                    )}

                    {/* SNF - ONLY SHOWN IF FAT_SNF */}
                    {selectedFarmer.rateType === 'FAT_SNF' && (
                        <div className="space-y-3 animate-in zoom-in duration-300">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SNF % Content</label>
                            <input 
                                type="number" step="0.1" required value={formData.snf}
                                onChange={(e) => setFormData({...formData, snf: e.target.value})}
                                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-4xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all placeholder:text-slate-200" 
                                placeholder="0.0"
                            />
                        </div>
                    )}
                </div>

                {/* CALCULATION RESULTS */}
                <div className="bg-[#064e3b] rounded-[2rem] p-10 text-white shadow-2xl shadow-emerald-200 flex flex-col md:flex-row justify-between items-center gap-10 border-b-8 border-emerald-900">
                  <div className="flex gap-16">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Calc. Rate</p>
                      <div className="text-5xl font-black tabular-nums">₹{liveCalc.rate}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Net Amount</p>
                      <div className="text-5xl font-black text-emerald-400 tabular-nums tracking-tighter">₹{liveCalc.total}</div>
                    </div>
                  </div>
                  <button type="submit" className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-6 rounded-2xl font-black shadow-lg flex items-center justify-center gap-4 transition-all active:scale-95 text-lg group">
                    <Save size={28} className="group-hover:rotate-12 transition-transform"/> SAVE ENTRY
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-32 text-center flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] border-4 border-dashed border-slate-100">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                    <User className="text-slate-200 w-16 h-16" />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Waiting for Selection</p>
                <p className="text-xs text-slate-300 mt-2 font-bold max-w-[200px]">Choose a farmer from the directory to start recording milk data</p>
              </div>
            )}
          </div>

          {/* HISTORY LOG */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <History size={20} className="text-blue-600" />
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Recent Logs (Real-time)</h3>
                </div>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/80 text-[10px] text-slate-400 uppercase font-black border-b border-slate-100 tracking-widest">
                        <th className="px-10 py-5">Farmer Profile</th>
                        <th className="px-10 py-5 text-center">Volume</th>
                        <th className="px-10 py-5 text-center">Quality (F/S)</th>
                        <th className="px-10 py-5 text-right">Net Value</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {recentEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-10 py-6">
                            <div className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{entry.farmer.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                {entry.shift} — {new Date(entry.date).toLocaleDateString()}
                            </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                            <span className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-xl font-black text-xs">
                                {entry.quantity.toFixed(2)} L
                            </span>
                        </td>
                        <td className="px-10 py-6 text-center">
                            <div className="text-xs font-black">
                                <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">F: {entry.fat}</span>
                                <span className="mx-1 text-slate-200">|</span>
                                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">S: {entry.snf}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                            <div className="font-black text-slate-900 text-xl tracking-tighter">₹{entry.totalAmount.toFixed(2)}</div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {recentEntries.length === 0 && (
                    <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">No transactions found for today</div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilkCollection;