import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatBS } from '../utils/dateHelper'; // <--- IMPORTED BS HELPER
import { 
  ClipboardList, Search, Save, History, 
  User, CheckCircle, Info, Edit3, Check, X, Calendar 
} from 'lucide-react';

const MilkCollection = () => {
  const [farmers, setFarmers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New States for Admin Editing & Date Filtering
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [formData, setFormData] = useState({
    quantity: '', fat: '', snf: '', shift: 'MORNING'
  });

  // 1. Fetch Initial Data (Farmers + Logs for selected Date)
  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [logDate]);

  const fetchFarmers = async () => {
    try {
      const res = await axios.get('https://dairy-erp-backend.onrender.com/api/farmers');
      setFarmers(res.data);
    } catch (err) { console.error("Farmer Fetch Error"); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://dairy-erp-backend.onrender.com/api/collections?date=${logDate}`);
      setEntries(res.data);
    } catch (err) { console.error("Logs Fetch Error"); }
    setLoading(false);
  };

  // 2. Handle New Entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarmer) return alert("Select a farmer first!");
    
    try {
      await axios.post('https://dairy-erp-backend.onrender.com/api/collections', {
        farmerId: selectedFarmer.id,
        quantity: formData.quantity,
        fat: formData.fat || 0, // Optional
        snf: formData.snf || 0, // Optional
        shift: formData.shift,
        date: logDate // Uses the date currently selected in the admin filter
      });
      
      setFormData({ quantity: '', fat: '', snf: '', shift: formData.shift });
      setSelectedFarmer(null);
      fetchLogs();
      alert("Milk Entry Saved!");
    } catch (err) { alert("Error saving transaction."); }
  };

  // 3. Handle Admin Edit
  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditData({ quantity: entry.quantity, fat: entry.fat, snf: entry.snf });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`https://dairy-erp-backend.onrender.com/api/collections/${id}`, editData);
      setEditingId(null);
      fetchLogs();
      alert("Record Updated!");
    } catch (err) { alert("Update Failed"); }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.farmerCode.includes(searchTerm)
  );

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
            <ClipboardList className="text-white w-6 h-6"/>
            </div>
            <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Milk Intake Terminal</h1>
            <p className="text-sm text-slate-500 font-medium italic">Record quantity now, test quality later</p>
            </div>
        </div>
        
        {/* Date Filter with BS Display */}
        <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <Calendar className="text-blue-500 ml-2" size={18} />
                <input 
                    type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)}
                    className="bg-transparent font-black text-slate-700 outline-none"
                />
                {/* BS DATE BADGE */}
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black border border-blue-100">
                    {formatBS(logDate)} BS
                </div>
            </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: FARMER SELECTION */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">1. Identify Farmer</h3>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Search by name or code..." 
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[400px]">
              {filteredFarmers.map(f => (
                <div key={f.id} onClick={() => setSelectedFarmer(f)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedFarmer?.id === f.id ? 'bg-blue-600 border-blue-600 shadow-xl text-white' : 'bg-white border-slate-50 hover:border-blue-100'}`}
                >
                  <div className="font-black">{f.farmerCode} — {f.name}</div>
                  <div className={`text-[10px] font-bold mt-1 ${selectedFarmer?.id === f.id ? 'text-blue-100' : 'text-slate-400'}`}>Type: {f.milkType}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: ENTRY FORM & LOGS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Quick Intake Entry</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['MORNING', 'EVENING'].map(s => (
                  <button key={s} onClick={() => setFormData({...formData, shift: s})} 
                    className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${formData.shift === s ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>{s}</button>
                ))}
              </div>
            </div>

            {selectedFarmer ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Liters</label>
                        <input type="number" step="0.01" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-4xl font-black text-slate-900 outline-none focus:border-emerald-600" placeholder="0.00" autoFocus />
                    </div>
                    {selectedFarmer.rateType !== 'FIXED' && (
                        <>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fat % (Optional)</label>
                            <input type="number" step="0.1" value={formData.fat} onChange={(e) => setFormData({...formData, fat: e.target.value})}
                                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-slate-900 outline-none focus:border-blue-500" placeholder="0.0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">SNF % (Optional)</label>
                            <input type="number" step="0.1" value={formData.snf} onChange={(e) => setFormData({...formData, snf: e.target.value})}
                                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black text-slate-900 outline-none focus:border-blue-500" placeholder="0.0" />
                        </div>
                        </>
                    )}
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-3xl font-black shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 text-lg">
                    <Save size={24}/> SAVE ENTRY FOR {selectedFarmer.name.toUpperCase()}
                </button>
              </form>
            ) : (
              <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-100">
                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Select a farmer to enable entry</p>
              </div>
            )}
          </div>

          {/* ADMIN EDITABLE HISTORY LOG */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Intake Logs: {logDate}</h3>
                    <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Nepali Date: {formatBS(logDate)}</p>
                </div>
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full">ADMIN EDIT MODE</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/80 text-[10px] text-slate-400 uppercase font-black border-b tracking-widest">
                        <th className="px-8 py-5">Farmer</th>
                        <th className="px-8 py-5">Shift</th>
                        <th className="px-8 py-5 text-center">Volume</th>
                        <th className="px-8 py-5 text-center">Quality (F/S)</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-8 py-5 font-black text-slate-800">{entry.farmer.name}</td>
                        <td className="px-8 py-5 text-[10px] font-black text-slate-400">{entry.shift}</td>
                        <td className="px-8 py-5 text-center">
                            {editingId === entry.id ? 
                                <input type="number" className="w-20 p-2 border rounded-lg font-bold" value={editData.quantity} onChange={e => setEditData({...editData, quantity: e.target.value})} /> : 
                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-black text-xs">{entry.quantity.toFixed(2)} L</span>
                            }
                        </td>
                        <td className="px-8 py-5 text-center">
                            {editingId === entry.id ? 
                                <div className="flex gap-2 justify-center">
                                    <input type="number" className="w-14 p-2 border rounded-lg text-xs" value={editData.fat} onChange={e => setEditData({...editData, fat: e.target.value})} />
                                    <input type="number" className="w-14 p-2 border rounded-lg text-xs" value={editData.snf} onChange={e => setEditData({...editData, snf: e.target.value})} />
                                </div> : 
                                <div className="text-xs font-black">
                                    <span className={entry.fat === 0 ? "text-red-400" : "text-orange-600"}>F: {entry.fat}</span> | <span>S: {entry.snf}</span>
                                </div>
                            }
                        </td>
                        <td className="px-8 py-5 text-right">
                            {editingId === entry.id ? (
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => saveEdit(entry.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200"><Check size={18}/></button>
                                    <button onClick={() => setEditingId(null)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><X size={18}/></button>
                                </div>
                            ) : (
                                <button onClick={() => startEdit(entry)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"><Edit3 size={18}/></button>
                            )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilkCollection;