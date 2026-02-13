import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatBS } from '../utils/dateHelper';
import { 
  ArrowLeft, Droplets, Landmark, History, 
  Settings, Save, Phone, MapPin, CheckCircle2, 
  Edit3, Check, X, User, AlertTriangle, Trash2, Power, 
  Square, CheckSquare 
} from 'lucide-react';

const FarmerProfile = ({ farmer, onBack }) => {
  const [milkData, setMilkData] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [activeTab, setActiveTab] = useState('milk');
  const [loading, setLoading] = useState(true);
  
  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Local state to track active status
  const [isActive, setIsActive] = useState(farmer.active);

  // States for Editing Milk Records
  const [editingMilkId, setEditingMilkId] = useState(null);
  const [milkEditData, setMilkEditData] = useState({});

  // State for Editing Farmer Profile & Rates
  const [editForm, setEditForm] = useState({
    name: '', phone: '', address: '',
    rateType: '', fatRate: '', snfRate: '', fixedRate: ''
  });

  useEffect(() => {
    if (farmer) {
      setIsActive(farmer.active);
      setEditForm({
        name: farmer.name || '',
        phone: farmer.phone || '',
        address: farmer.address || '',
        rateType: farmer.rateType,
        fatRate: farmer.fatRate,
        snfRate: farmer.snfRate,
        fixedRate: farmer.fixedRate
      });
      fetchFarmerData();
    }
  }, [farmer]);

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  const fetchFarmerData = async () => {
    setLoading(true);
    try {
      const resMilk = await axios.get(`https://dairy-erp-backend.onrender.com/api/settlements/statement?farmerId=${farmer.id}&startDate=2024-01-01&endDate=2026-12-31`);
      const resAdv = await axios.get(`https://dairy-erp-backend.onrender.com/api/advances/${farmer.id}`);
      setMilkData(resMilk.data.transactions || []);
      setAdvanceData(resAdv.data || []);
    } catch (err) {
      console.error("Error loading profile data");
    }
    setLoading(false);
  };

  // --- BULK DELETE HANDLERS ---
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === milkData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(milkData.map(m => m.id));
    }
  };

  const handleBulkDelete = async () => {
    if(!window.confirm(`Are you sure you want to delete ${selectedIds.length} records? This cannot be undone.`)) return;

    try {
        await axios.post('https://dairy-erp-backend.onrender.com/api/collections/bulk-delete', { ids: selectedIds });
        alert("Records Deleted Successfully");
        setSelectedIds([]);
        fetchFarmerData();
    } catch (err) {
        alert("Delete failed");
    }
  };

  // --- DYNAMIC CALCULATION ENGINE ---
  const calculateItemTotal = (record) => {
    const isEditing = editingMilkId === record.id;
    const qty = parseFloat(isEditing ? milkEditData.quantity : record.quantity) || 0;
    const fat = parseFloat(isEditing ? milkEditData.fat : record.fat) || 0;
    const snf = parseFloat(isEditing ? milkEditData.snf : record.snf) || 0;

    const fRate = parseFloat(farmer.fatRate) || 0;
    const sRate = parseFloat(farmer.snfRate) || 0;
    const fixRate = parseFloat(farmer.fixedRate) || 0;

    let total = 0;
    if (farmer.rateType === 'FIXED') total = qty * fixRate;
    else if (farmer.rateType === 'FAT_ONLY') total = qty * (fat * fRate);
    else if (farmer.rateType === 'FAT_SNF') total = qty * ((fat * fRate) + (snf * sRate));

    return Math.round(total);
  };

  // --- EDIT HANDLERS ---
  const startMilkEdit = (record) => {
    setEditingMilkId(record.id);
    setMilkEditData({ quantity: record.quantity, fat: record.fat, snf: record.snf });
  };

  const saveMilkEdit = async (id) => {
    try {
      await axios.put(`https://dairy-erp-backend.onrender.com/api/collections/${id}`, milkEditData);
      setEditingMilkId(null);
      fetchFarmerData(); 
      alert("Milk record updated!");
    } catch (err) { alert("Update failed"); }
  };

  // --- PROFILE UPDATE HANDLERS ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://dairy-erp-backend.onrender.com/api/farmers/${farmer.id}`, editForm);
      alert("Farmer Profile Updated!");
      window.location.reload(); // Reload to reflect changes
    } catch (err) { alert("Failed to update profile."); }
  };

  const toggleStatus = async () => {
    try {
        await axios.patch(`https://dairy-erp-backend.onrender.com/api/farmers/${farmer.id}/status`, { active: !isActive });
        setIsActive(!isActive);
        alert(`Status changed!`);
    } catch (err) { alert("Error changing status"); }
  };

  const handleDelete = async () => {
    if(!window.confirm("WARNING: Permanent Delete. Are you sure?")) return;
    try {
        await axios.delete(`https://dairy-erp-backend.onrender.com/api/farmers/${farmer.id}`);
        alert("Farmer Deleted.");
        onBack();
    } catch (err) { alert("Cannot delete farmer with existing records."); }
  };

  const totalVolume = milkData.reduce((acc, curr) => acc + curr.quantity, 0);
  const grossEarnings = milkData.reduce((acc, curr) => acc + calculateItemTotal(curr), 0);
  const netOutstanding = advanceData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="w-full animate-in slide-in-from-right-10 duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-6 mb-10">
        <button onClick={onBack} className="p-4 bg-white border border-slate-200 rounded-3xl hover:bg-slate-50 transition-all shadow-sm group">
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black text-slate-800 tracking-tight">{farmer.name}</h1>
             {!isActive && <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">INACTIVE</span>}
             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${farmer.milkType === 'COW' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {farmer.milkType} Supplier
             </span>
          </div>
          <p className="text-sm text-slate-400 font-bold uppercase mt-1 tracking-widest">System UID: {farmer.farmerCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SIDEBAR STATS */}
        <div className="lg:col-span-3 space-y-6">
            <QuickStat label="Total Volume" value={`${totalVolume.toFixed(1)} L`} icon={<Droplets className="text-blue-500"/>} />
            <QuickStat label="Gross Earnings" value={`₹${grossEarnings.toLocaleString()}`} icon={<Landmark className="text-emerald-500"/>} />
            <QuickStat label="Net Outstanding" value={`₹${netOutstanding.toLocaleString()}`} icon={<History className="text-orange-500"/>} />
            
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-4">Contact Details</p>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Phone size={16} className="text-blue-400" />
                        <span className="text-sm font-bold">{editForm.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-blue-400 mt-1" />
                        <span className="text-sm font-bold opacity-80 leading-relaxed">{editForm.address || 'No Address'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT TABS */}
        <div className="lg:col-span-9 bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="flex bg-slate-50/50 border-b">
                <TabBtn active={activeTab === 'milk'} onClick={() => setActiveTab('milk')} label="Milk Records" icon={<Droplets size={16}/>} />
                <TabBtn active={activeTab === 'advances'} onClick={() => setActiveTab('advances')} label="Advances" icon={<History size={16}/>} />
                <TabBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Edit & Actions" icon={<Settings size={16}/>} />
            </div>

            <div className="p-10 flex-1 min-h-[500px]">
                
                {/* MILK TAB WITH BULK DELETE */}
                {activeTab === 'milk' && (
                    <div className="animate-in fade-in duration-300 relative">
                        
                        {/* BULK ACTION HEADER (Floating) */}
                        {selectedIds.length > 0 && (
                            <div className="absolute -top-6 right-0 bg-red-50 border border-red-100 p-2 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-2 shadow-lg z-10">
                                <span className="text-xs font-bold text-red-600 pl-2">{selectedIds.length} Selected</span>
                                <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-red-700 transition-all">
                                    <Trash2 size={14} /> DELETE SELECTED
                                </button>
                            </div>
                        )}

                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4">
                                    <th className="py-4 w-10">
                                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-blue-600">
                                            {milkData.length > 0 && selectedIds.length === milkData.length ? <CheckSquare size={18}/> : <Square size={18}/>}
                                        </button>
                                    </th>
                                    <th className="py-4">Date / Shift</th>
                                    <th className="py-4 text-center">Volume (L)</th>
                                    <th className="py-4 text-center">Fat/SNF</th>
                                    <th className="py-4 text-right">Total Amount</th>
                                    <th className="py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {milkData.map(m => (
                                    <tr key={m.id} className={`text-sm font-bold transition-colors group ${selectedIds.includes(m.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}>
                                        <td className="py-5">
                                            <button onClick={() => toggleSelect(m.id)} className={`${selectedIds.includes(m.id) ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
                                                {selectedIds.includes(m.id) ? <CheckSquare size={18}/> : <Square size={18}/>}
                                            </button>
                                        </td>
                                        
                                        <td className="py-5">
                                            <div className="flex flex-col">
                                                <span className="text-blue-700 font-black">{formatBS(m.date)} (BS)</span>
                                                <span className="text-[10px] text-slate-400 font-normal">
                                                    {new Date(m.date).toLocaleDateString()} • {m.shift}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        <td className="py-5 text-center">
                                            {editingMilkId === m.id ? (
                                                <input type="number" className="w-20 p-2 border rounded-xl text-center bg-blue-50 border-blue-200" 
                                                value={milkEditData.quantity} onChange={e => setMilkEditData({...milkEditData, quantity: e.target.value})} />
                                            ) : (
                                                <span className="text-blue-600 font-black">{m.quantity.toFixed(2)} L</span>
                                            )}
                                        </td>

                                        <td className="py-5 text-center">
                                            {editingMilkId === m.id ? (
                                                <div className="flex gap-2 justify-center">
                                                    <input type="number" className="w-14 p-2 border rounded-xl text-xs bg-blue-50 border-blue-200" 
                                                    value={milkEditData.fat} onChange={e => setMilkEditData({...milkEditData, fat: e.target.value})} placeholder="Fat" />
                                                    <input type="number" className="w-14 p-2 border rounded-xl text-xs bg-blue-50 border-blue-200" 
                                                    value={milkEditData.snf} onChange={e => setMilkEditData({...milkEditData, snf: e.target.value})} placeholder="SNF" />
                                                </div>
                                            ) : (
                                                <span className={`text-xs font-black ${m.fat === 0 && farmer.rateType !== 'FIXED' ? 'text-red-400 italic' : 'text-slate-400'}`}>
                                                    {farmer.rateType === 'FIXED' ? 'Fixed Rate' : (m.fat > 0 ? `${m.fat} / ${m.snf}` : 'Missing')}
                                                </span>
                                            )}
                                        </td>

                                        {/* DYNAMIC TOTAL */}
                                        <td className="py-5 text-right font-black text-lg">
                                            ₹{calculateItemTotal(m).toLocaleString()}
                                        </td>

                                        <td className="py-5 text-right">
                                            {editingMilkId === m.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => saveMilkEdit(m.id)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md"><Check size={16}/></button>
                                                    <button onClick={() => setEditingMilkId(null)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200"><X size={16}/></button>
                                                </div>
                                            ) : (
                                                !selectedIds.includes(m.id) && (
                                                    <button onClick={() => startMilkEdit(m)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                        <Edit3 size={16}/>
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {milkData.length === 0 && <tr><td colSpan="6" className="py-20 text-center text-slate-300 italic">No milk history found</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ADVANCES TAB (No Change) */}
                {activeTab === 'advances' && (
                    <div className="animate-in fade-in duration-300">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-4"><th className="py-4">Voucher Date</th><th className="py-4">Description</th><th className="py-4 text-right">Debit Amount</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {advanceData.map(a => (
                                    <tr key={a.id} className="text-sm font-bold text-slate-700 hover:bg-slate-50/50">
                                        <td className="py-5">{formatBS(a.date)} (BS)</td>
                                        <td className="py-5 text-slate-500 font-medium">{a.description || 'General Advance'}</td>
                                        <td className="py-5 text-right text-red-600 font-black text-lg">₹{a.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300 max-w-2xl">
                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="space-y-4 border-b border-slate-100 pb-8">
                                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><User size={16}/> Personal Info</h4>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Full Name</label><input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Phone</label><input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Address</label><input value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800" /></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Landmark size={16}/> Rate Configuration</h4>
                                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Calculation Method</label><select value={editForm.rateType} onChange={e => setEditForm({...editForm, rateType: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none"><option value="FAT_SNF">Fat + SNF Combined</option><option value="FAT_ONLY">Fat Based Only</option><option value="FIXED">Flat Fixed Rate / Liter</option></select></div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase">Fat Price (₹)</label><input type="number" step="0.01" value={editForm.fatRate} onChange={e => setEditForm({...editForm, fatRate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase">SNF Price (₹)</label><input type="number" step="0.01" value={editForm.snfRate} onChange={e => setEditForm({...editForm, snfRate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase">Fixed Price (₹)</label><input type="number" step="0.01" value={editForm.fixedRate} onChange={e => setEditForm({...editForm, fixedRate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-blue-600" /></div>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95">
                                <CheckCircle2 size={22} /> SAVE CHANGES
                            </button>
                        </form>

                        <div className="mt-12 pt-8 border-t-2 border-slate-100">
                            <h4 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2 mb-6"><AlertTriangle size={16}/> Danger Zone</h4>
                            <div className="flex gap-4">
                                <button onClick={toggleStatus} className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all ${isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                                    <div className="flex flex-col items-center gap-1"><Power size={20} /><span>{isActive ? 'DEACTIVATE ACCOUNT' : 'ACTIVATE ACCOUNT'}</span></div>
                                </button>
                                <button onClick={handleDelete} className="flex-1 py-4 rounded-2xl font-black border-2 border-red-100 text-red-600 hover:bg-red-50 transition-all">
                                    <div className="flex flex-col items-center gap-1"><Trash2 size={20} /><span>PERMANENT DELETE</span></div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// Internal Helper Components
const QuickStat = ({ label, value, icon }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-slate-50 rounded-xl">{icon}</div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p></div>
        <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
);

const TabBtn = ({ active, onClick, label, icon }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-3 py-6 font-black uppercase tracking-widest text-[10px] transition-all ${active ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50/50 text-slate-400 hover:bg-slate-100'}`}>{icon} {label}</button>
);

export default FarmerProfile;