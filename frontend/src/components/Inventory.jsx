import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatBS } from '../utils/dateHelper';
import { Package, Plus, History, ArrowUpCircle, PackageCheck, AlertTriangle } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Toggle for "Define New Product" vs "Add Stock"
  const [view, setView] = useState('stock'); // 'stock' or 'define'
  
  // Forms
  const [newProduct, setNewProduct] = useState({ name: '', unit: 'KG' });
  const [stockForm, setStockForm] = useState({ 
    productName: '', 
    quantity: '', 
    date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, histRes] = await Promise.all([
        axios.get('https://dairy-erp-backend.onrender.com/api/products'),
        axios.get('https://dairy-erp-backend.onrender.com/api/products/history')
      ]);
      setProducts(prodRes.data);
      setHistory(histRes.data);
      if (prodRes.data.length > 0 && !stockForm.productName) {
        setStockForm(prev => ({ ...prev, productName: prodRes.data[0].name }));
      }
    } catch (err) { console.error(err); }
  };

  const handleDefineProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://dairy-erp-backend.onrender.com/api/products', newProduct);
      alert("New Product Defined!");
      setNewProduct({ name: '', unit: 'KG' });
      fetchData();
    } catch (err) { alert("Error: Product might already exist"); }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://dairy-erp-backend.onrender.com/api/products/add-stock', stockForm);
      alert("Stock Added Successfully!");
      setStockForm({ ...stockForm, quantity: '' });
      fetchData();
    } catch (err) { alert("Error adding stock"); }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <Package className="text-white w-6 h-6"/>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Inventory & Stock</h1>
            <p className="text-sm text-slate-500 font-medium">Manage products and daily production</p>
          </div>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200">
            <button onClick={() => setView('stock')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'stock' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>ADD STOCK</button>
            <button onClick={() => setView('define')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'define' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>NEW ITEM</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: ACTION FORM */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                {view === 'stock' ? (
                    <form onSubmit={handleAddStock} className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Record Daily Production</h3>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Product</label>
                            <select 
                                value={stockForm.productName} 
                                onChange={e => setStockForm({...stockForm, productName: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                            >
                                {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity Made</label>
                            <input 
                                type="number" step="0.01" required 
                                value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl text-slate-900 outline-none" 
                                placeholder="0.0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                            <input 
                                type="date" required 
                                value={stockForm.date} onChange={e => setStockForm({...stockForm, date: e.target.value})}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none" 
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                            <ArrowUpCircle size={20} /> ADD TO STOCK
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleDefineProduct} className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Define New Item</h3>
                        <input placeholder="Item Name (e.g. Lassi)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                        <select value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                            <option value="KG">Kilograms (KG)</option>
                            <option value="LTR">Liters (LTR)</option>
                            <option value="PKT">Packets (PKT)</option>
                        </select>
                        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2">
                            <Plus size={20} /> CREATE ITEM
                        </button>
                    </form>
                )}
            </div>

            {/* RECENT LOGS */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <History size={16} className="text-slate-400"/>
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Recent Production</h3>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                    {history.map(log => (
                        <div key={log.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <div>
                                <p className="text-xs font-black text-slate-700">{log.productName}</p>
                                <p className="text-[9px] font-bold text-slate-400">{formatBS(log.date)}</p>
                            </div>
                            <span className="text-xs font-black text-emerald-600">+{log.outputQty}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT: CURRENT STOCK GRID */}
        <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(p => (
                    <div key={p.id} className={`p-6 rounded-[2rem] border transition-all ${p.stock <= 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${p.stock <= 0 ? 'bg-red-200 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {p.stock <= 0 ? <AlertTriangle size={20}/> : <PackageCheck size={20}/>}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{p.unit}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-1">{p.name}</h3>
                        <p className={`text-3xl font-black ${p.stock <= 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            {p.stock}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Current Stock</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;