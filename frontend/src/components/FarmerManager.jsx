import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, Users, Phone, Beaker, 
  LayoutDashboard, ClipboardList, TrendingUp, Settings,
  MapPin, CheckCircle2, Search, Info
} from 'lucide-react';

const FarmerManager = () => {
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    farmerCode: '', name: '', phone: '', address: '',
    milkType: 'COW', rateType: 'FAT_SNF',
    fatRate: '', snfRate: '', fixedRate: ''
  });

  const fetchFarmers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/farmers');
      setFarmers(res.data);
    } catch (err) {
      console.error("Connection Error:", err);
    }
  };

  useEffect(() => { fetchFarmers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/farmers', formData);
      alert("Farmer Registered Successfully!");
      // Reset Form
      setFormData({ 
        farmerCode: '', name: '', phone: '', address: '', 
        milkType: 'COW', rateType: 'FAT_SNF', 
        fatRate: '', snfRate: '', fixedRate: '' 
      });
      fetchFarmers();
    } catch (err) { 
      alert("Error: Check if Farmer Code is unique or if Backend is running."); 
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.farmerCode.includes(searchTerm)
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      

        {/* DASHBOARD CONTENT */}
        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* REGISTRATION FORM (LEFT) */}
            <div className="xl:col-span-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider text-sm">
                    <UserPlus className="text-blue-600" size={18} /> New Farmer Entry
                  </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* CODE & NAME */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Farmer Code</label>
                      <input 
                        name="farmerCode" onChange={(e) => setFormData({...formData, farmerCode: e.target.value})} value={formData.farmerCode}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900 font-semibold" placeholder="F-101" required 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                      <input 
                        name="name" onChange={(e) => setFormData({...formData, name: e.target.value})} value={formData.name}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900 font-semibold" placeholder="John Doe" required 
                      />
                    </div>
                  </div>

                  {/* MILK TYPE SELECTION (NEW BUTTONS) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Milk Type</label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, milkType: 'COW'})}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-bold text-sm ${
                                formData.milkType === 'COW' 
                                ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm' 
                                : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            🐄 Cow
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, milkType: 'BUFFALO'})}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-bold text-sm ${
                                formData.milkType === 'BUFFALO' 
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                                : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            🐃 Buffalo
                        </button>
                    </div>
                  </div>

                  {/* BILLING METHOD */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Calculation Method</label>
                    <select 
                      value={formData.rateType} onChange={(e) => setFormData({...formData, rateType: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold"
                    >
                      <option value="FAT_SNF">Fat + SNF (Standard)</option>
                      <option value="FAT_ONLY">Fat Only</option>
                      <option value="FIXED">Fixed Price (Per Liter)</option>
                    </select>
                  </div>

                  {/* PRICE CONFIGURATION */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Info size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-wider">Set Purchase Rates</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {formData.rateType !== 'FIXED' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Fat Rate</label>
                          <input type="number" step="0.01" value={formData.fatRate} onChange={(e) => setFormData({...formData, fatRate: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 font-bold" placeholder="0.00" />
                        </div>
                      )}
                      {formData.rateType === 'FAT_SNF' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">SNF Rate</label>
                          <input type="number" step="0.01" value={formData.snfRate} onChange={(e) => setFormData({...formData, snfRate: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 font-bold" placeholder="0.00" />
                        </div>
                      )}
                      {formData.rateType === 'FIXED' && (
                        <div className="space-y-1 col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Rate Per Liter</label>
                          <input type="number" step="0.01" value={formData.fixedRate} onChange={(e) => setFormData({...formData, fixedRate: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 font-bold" placeholder="0.00" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900" placeholder="+91 00000 00000" />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} /> REGISTER FARMER
                  </button>
                </form>
              </div>
            </div>

            {/* DIRECTORY LIST (RIGHT) */}
            <div className="xl:col-span-8">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Users className="text-emerald-500" size={18} /> Active Farmer Directory
                  </h3>
                  <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    Count: {farmers.length}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="px-6 py-4">Farmer Details</th>
                        <th className="px-6 py-4 text-center">Milk Type</th>
                        <th className="px-6 py-4">Billing Logic</th>
                        <th className="px-6 py-4 text-right">Unit Rates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredFarmers.map(f => (
                        <tr key={f.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                {f.farmerCode}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800">{f.name}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Phone size={10}/> {f.phone || 'NO CONTACT'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${f.milkType === 'COW' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              {f.milkType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-bold text-slate-600">{f.rateType.replace('_', ' ')}</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase">Settlement: Weekly</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              {f.rateType === 'FAT_SNF' && (
                                <div className="text-xs font-black text-slate-700">F: {f.fatRate} | S: {f.snfRate}</div>
                              )}
                              {f.rateType === 'FAT_ONLY' && (
                                <div className="text-xs font-black text-slate-700">F: {f.fatRate}</div>
                              )}
                              {f.rateType === 'FIXED' && (
                                <div className="text-xs font-black text-slate-700">₹{f.fixedRate} / L</div>
                              )}
                              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Current Base</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredFarmers.length === 0 && (
                    <div className="p-20 text-center text-slate-300 italic flex flex-col items-center gap-2">
                      <Search size={40} className="text-slate-100" />
                      No matches found in directory.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
    
    </div>
  );
};

// Sub-component for Sidebar Items
const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
    active 
    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
  }`}>
    {icon}
    <span className="font-semibold text-sm">{label}</span>
  </div>
);

export default FarmerManager;