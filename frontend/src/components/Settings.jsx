import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, Save, Building, Phone, MapPin, Notebook, Download, FileSpreadsheet, Database } from 'lucide-react';

const Settings = () => {
  const [formData, setFormData] = useState({
    companyName: '', ownerName: '', phone: '', address: '', email: '', billNote: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://dairy-erp-backend.onrender.com/api/settings').then(res => {
      setFormData(res.data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://dairy-erp-backend.onrender.com/api/settings', formData);
      alert("Business Settings Updated!");
    } catch (err) {
      alert("Error saving settings.");
    }
  };

  // Function 1: JSON (System Restore)
  const downloadJSON = () => {
    window.open('https://dairy-erp-backend.onrender.com/api/backup?type=json', '_blank');
  };

  // Function 2: CSV (Excel Reports)
  const downloadCSV = () => {
    window.open('https://dairy-erp-backend.onrender.com/api/backup?type=csv', '_blank');
  };

  if (loading) return <div className="p-10 font-bold text-slate-400">Loading Configuration...</div>;

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-slate-800 p-2.5 rounded-xl shadow-lg">
          <SettingsIcon className="text-white w-6 h-6"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">System Settings</h1>
          <p className="text-sm text-slate-500 font-medium">Configure your business identity and bill format</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* EDIT FORM */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Business Identity</h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase"><Building size={14}/> Company Name</label>
                <input 
                    value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">Owner Name</label>
                    <input value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" />
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase"><Phone size={14}/> Contact No</label>
                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase"><MapPin size={14}/> Full Address</label>
                <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 h-24" />
            </div>
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase"><Notebook size={14}/> Bill Footer Note</label>
                <input value={formData.billNote} onChange={e => setFormData({...formData, billNote: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900" />
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95">
                <Save size={20}/> SAVE CONFIGURATION
            </button>
          </form>
        </div>

        {/* PREVIEW BOX */}
        <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live Bill Preview</h3>
            <div className="bg-white p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <div className="border-b-2 border-slate-900 pb-6 mb-6">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{formData.companyName || "YOUR COMPANY NAME"}</h2>
                    <p className="text-sm font-bold text-slate-500 mt-2">{formData.address || "123 Dairy Road, Village Name"}</p>
                    <p className="text-sm font-bold text-slate-500">Contact: {formData.phone || "+91 00000 00000"}</p>
                </div>
                <div className="space-y-4 opacity-20">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                </div>
                <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-400 italic">{formData.billNote}</p>
                </div>
            </div>
            
            {/* --- EXPORT BUTTONS --- */}
            <div className="mt-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Data Export & Backup</h3>
                <div className="flex flex-col gap-4">
                    
                    {/* Button 1: CSV / Excel */}
                    <button 
                        onClick={downloadCSV}
                        className="w-full bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between group hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-200">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-emerald-900 uppercase text-sm">Download Excel Reports</h4>
                                <p className="text-xs font-bold text-emerald-600">Get CSVs for Farmers, Milk, Sales & Expenses</p>
                            </div>
                        </div>
                        <Download className="text-emerald-300 group-hover:text-emerald-600 transition-colors" />
                    </button>

                    {/* Button 2: JSON Backup */}
                    <button 
                        onClick={downloadJSON}
                        className="w-full bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center justify-between group hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-200">
                                <Database size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-blue-900 uppercase text-sm">Full System Backup</h4>
                                <p className="text-xs font-bold text-blue-600">Save raw database file (JSON) for restoration</p>
                            </div>
                        </div>
                        <Download className="text-blue-300 group-hover:text-blue-600 transition-colors" />
                    </button>

                </div>
            </div>

        </div>
      </div>      
    </div>
  );
};

export default Settings;