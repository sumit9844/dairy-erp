import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserPlus, Users, Phone, Beaker, MapPin, 
  CheckCircle2, Search, Info
} from 'lucide-react';

// API BASE URL - Change this if testing locally
const API_BASE_URL = 'https://dairy-erp-backend.onrender.com';

const FarmerManager = () => {
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Available Locations
  const locations = ["Barahathawa", "Hajariya", "Rajghat"];

  const [formData, setFormData] = useState({
    farmerCode: '', 
    name: '', 
    phone: '', 
    address: 'Barahathawa', // Default
    milkType: 'COW', 
    rateType: 'FAT_SNF',
    fatRate: '', 
    snfRate: '', 
    fixedRate: ''
  });

  // Helper to generate a unique code based on location
  const generateCode = (location) => {
    const prefix = location.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000); // e.g. 4821
    return `${prefix}-${randomNum}`; // Result: BAR-4821
  };

  // Initialize code on load
  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        farmerCode: generateCode(prev.address)
    }));
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/farmers`);
      setFarmers(res.data);
    } catch (err) {
      console.error("Connection Error:", err);
    }
  };

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setFormData({
        ...formData,
        address: newLocation,
        farmerCode: generateCode(newLocation) // Regenerate code when location changes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/farmers`, formData);
      alert("Farmer Registered Successfully!");
      
      // Reset Form with new code
      const defaultLoc = 'Barahathawa';
      setFormData({ 
        farmerCode: generateCode(defaultLoc), 
        name: '', phone: '', 
        address: defaultLoc, 
        milkType: 'COW', rateType: 'FAT_SNF', 
        fatRate: '', snfRate: '', fixedRate: '' 
      });
      fetchFarmers();
    } catch (err) { 
      console.error(err);
      alert("Error: Backend connection failed or Duplicate ID."); 
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
        
        <div className="p-8 overflow-y-auto w-full">
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
                  
                  {/* LOCATION SELECTOR & AUTO CODE */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Select Location</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3.5 text-blue-500" />
                        <select 
                            name="address" 
                            value={formData.address} 
                            onChange={handleLocationChange}
                            className="w-full pl-9 p-3 bg-blue-50/50 border border-blue-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold appearance-none cursor-pointer"
                        >
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Auto ID (System)</label>
                      <input 
                        readOnly
                        value={formData.farmerCode}
                        className="w-full p-3 bg-slate-100 border-none rounded-xl text-slate-500 font-mono text-sm tracking-wider select-none" 
                      />
                    </div>
                  </div>

                  {/* NAME */}
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                      <input 
                        name="name" onChange={(e) => setFormData({...formData, name: e.target.value})} value={formData.name}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900 font-semibold" placeholder="Enter farmer name..." required 
                      />
                  </div>

                  {/* MILK TYPE SELECTION */}
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

                {/* SEARCH BAR */}
                <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                     <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Name or Location..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-blue-300"
                        />
                     </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="px-6 py-4">Location / ID</th>
                        <th className="px-6 py-4">Farmer Name</th>
                        <th className="px-6 py-4 text-center">Milk Type</th>
                        <th className="px-6 py-4 text-right">Unit Rates</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredFarmers.map(f => (
                        <tr key={f.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-blue-600 uppercase flex items-center gap-1">
                                    <MapPin size={10} /> {f.address || 'N/A'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                                    ID: {f.farmerCode}
                                </span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                                <div className="font-bold text-slate-800">{f.name}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium"><Phone size={10}/> {f.phone || 'NO CONTACT'}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${f.milkType === 'COW' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              {f.milkType}
                            </span>
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

export default FarmerManager;