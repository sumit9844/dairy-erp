import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Beaker, PlusCircle, Activity, AlertCircle, Loader2 } from 'lucide-react';

const Production = () => {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]); // Real products from DB
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    productName: '', milkUsed: '', milkType: 'BUFFALO', outputQty: '', notes: ''
  });

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, histRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/production')
      ]);
      setProducts(prodRes.data);
      setHistory(histRes.data);
      
      // Auto-select first product if available
      if (prodRes.data.length > 0) {
        setFormData(prev => ({ ...prev, productName: prodRes.data[0].name }));
      }
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName) return alert("Please select a product first!");

    try {
      await axios.post('http://localhost:5000/api/production', formData);
      alert("Batch Recorded & Stock Updated!");
      setFormData({ ...formData, milkUsed: '', outputQty: '', notes: '' });
      fetchInitialData(); // Refresh history and stock counts
    } catch (err) {
      alert(err.response?.data?.error || "Error recording production");
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-200">
          <Beaker className="text-white w-6 h-6"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Processing & Yield</h1>
          <p className="text-sm text-slate-500 font-medium">Link raw milk consumption to finished goods</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">New Batch Entry</h3>
          
          {products.length === 0 && !loading ? (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-700 text-xs font-bold flex flex-col gap-2">
                <div className="flex items-center gap-2"><AlertCircle size={16}/> NO PRODUCTS DEFINED</div>
                <p>You must add products (like Paneer or Ghee) in the Inventory tab before recording production.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Product to Make</label>
                <select 
                  required
                  value={formData.productName} 
                  onChange={e => setFormData({...formData, productName: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Milk Used (L)</label>
                      <input type="number" required value={formData.milkUsed} onChange={e => setFormData({...formData, milkUsed: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="0.0" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Output (KG)</label>
                      <input type="number" step="0.01" required value={formData.outputQty} onChange={e => setFormData({...formData, outputQty: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-purple-600" placeholder="0.0" />
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Input Milk Source</label>
                  <div className="flex gap-2">
                      {['COW', 'BUFFALO'].map(type => (
                          <button key={type} type="button" onClick={() => setFormData({...formData, milkType: type})} 
                          className={`flex-1 py-3 rounded-xl font-bold text-xs border-2 transition-all ${formData.milkType === type ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                              {type}
                          </button>
                      ))}
                  </div>
              </div>

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-lg mt-4 flex items-center justify-center gap-2 transition-all active:scale-95">
                <PlusCircle size={20}/> START PRODUCTION
              </button>
            </form>
          )}
        </div>

        {/* LOGS */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          {/* ... Table logic stays exactly the same as previous code ... */}
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Activity size={18} className="text-purple-500" /> Batch Processing Logs
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-[10px] font-black text-slate-400 uppercase border-b">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5 text-center">Input / Output</th>
                  <th className="px-8 py-5 text-right">Yield %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map(h => (
                  <tr key={h.id} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-black text-slate-800">{h.productName}</td>
                    <td className="px-8 py-5 text-center font-bold text-slate-500">
                        {h.milkUsed}L <span className="mx-1">→</span> <span className="text-purple-600">{h.outputQty}kg</span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-emerald-600 text-lg">
                        {h.yield?.toFixed(1)}%
                    </td>
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

export default Production;