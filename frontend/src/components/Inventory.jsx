import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, AlertTriangle, CheckCircle2, PackageCheck } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({ name: '', unit: 'KG' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/products', newP);
    setNewP({ name: '', unit: 'KG' });
    setShowAdd(false);
    fetchProducts();
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <Package className="text-white w-6 h-6"/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Inventory Control</h1>
            <p className="text-sm text-slate-500 font-medium">Monitor finished goods and stock levels</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all"
        >
          <Plus size={18} /> DEFINE NEW PRODUCT
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-3xl border-2 border-blue-100 mb-8 flex gap-4 animate-in slide-in-from-top-4">
            <input placeholder="Product Name (e.g. Paneer)" className="flex-1 p-3 bg-slate-50 rounded-xl font-bold outline-none border border-transparent focus:border-blue-500" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} required />
            <select className="p-3 bg-slate-50 rounded-xl font-bold" value={newP.unit} onChange={e => setNewP({...newP, unit: e.target.value})}>
                <option value="KG">Kilograms (KG)</option>
                <option value="LTR">Liters (LTR)</option>
                <option value="PKT">Packets (PKT)</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-8 rounded-xl font-bold">SAVE</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 group hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${p.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {p.stock > 0 ? <PackageCheck size={28}/> : <AlertTriangle size={28}/>}
                </div>
                <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">{p.unit}</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">{p.name}</h3>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${p.stock > 0 ? 'text-slate-900' : 'text-red-500'}`}>{p.stock}</span>
                <span className="text-sm font-bold text-slate-400 uppercase">Available</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${p.stock > 5 ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{p.stock > 5 ? 'Healthy Stock' : 'Low Stock'}</span>
                </div>
                <CheckCircle2 size={16} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;