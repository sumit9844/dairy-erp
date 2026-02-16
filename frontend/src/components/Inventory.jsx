import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatBS } from '../utils/dateHelper';
import { 
    Package, Plus, History, ArrowUpCircle, PackageCheck, AlertTriangle, 
    Loader2, Trash2, Edit3, Check, X 
} from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('stock'); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [newProduct, setNewProduct] = useState({ name: '', unit: 'KG', sellingPrice: '' });
  const [stockForm, setStockForm] = useState({ 
    productName: '', 
    quantity: '', 
    date: new Date().toISOString().split('T')[0] 
  });

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [prodRes, histRes] = await Promise.all([
        axios.get('https://dairy-erp-backend.onrender.com/api/products'),
        axios.get('https://dairy-erp-backend.onrender.com/api/products/history')
      ]);
      setProducts(prodRes.data);
      setHistory(histRes.data);
      
      // Auto-select first product if available
      if (prodRes.data.length > 0 && !stockForm.productName) {
        setStockForm(prev => ({ ...prev, productName: prodRes.data[0].name }));
      }
    } catch (err) { console.error("Fetch Error:", err); }
  };

  const handleDefineProduct = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axios.post('https://dairy-erp-backend.onrender.com/api/products', newProduct);
      alert("New Product Defined!");
      setNewProduct({ name: '', unit: 'KG', sellingPrice: '' });
      fetchData(); // Refresh list
    } catch (err) { 
        alert(err.response?.data?.error || "Error creating product"); 
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axios.post('https://dairy-erp-backend.onrender.com/api/products/add-stock', stockForm);
      alert("Stock Added Successfully!");
      setStockForm({ ...stockForm, quantity: '' });
      fetchData();
    } catch (err) { 
        alert(err.response?.data?.error || "Error adding stock"); 
    } finally { 
        setIsSubmitting(false); 
    }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
        await axios.delete(`https://dairy-erp-backend.onrender.com/api/products/${id}`);
        fetchData();
    } catch (err) {
        alert(err.response?.data?.error || "Delete failed.");
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ name: product.name, unit: product.unit, sellingPrice: product.sellingPrice });
  };

  const saveEdit = async (id) => {
    try {
        await axios.put(`https://dairy-erp-backend.onrender.com/api/products/${id}`, editForm);
        setEditingId(null);
        fetchData();
    } catch (err) { alert("Update failed"); }
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
                                {products.length === 0 && <option>Loading products...</option>}
                                {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Quantity Made</label>
                            <input type="number" step="0.01" required value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-2xl text-slate-900 outline-none" placeholder="0.0" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                            <input type="date" required value={stockForm.date} onChange={e => setStockForm({...stockForm, date: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black text-white'}`}>
                            {isSubmitting ? <Loader2 className="animate-spin"/> : <><ArrowUpCircle size={20} /> ADD TO STOCK</>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleDefineProduct} className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Define New Item</h3>
                        <input placeholder="Item Name (e.g. Lassi)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                        <input type="number" placeholder="Selling Price (₹)" value={newProduct.sellingPrice} onChange={e => setNewProduct({...newProduct, sellingPrice: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" required />
                        <select value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                            <option value="KG">Kilograms (KG)</option>
                            <option value="LTR">Liters (LTR)</option>
                            <option value="PKT">Packets (PKT)</option>
                            <option value="PCS">Pieces (PCS)</option>
                        </select>
                        <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 transition-all ${isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                            {isSubmitting ? <Loader2 className="animate-spin"/> : <><Plus size={20} /> CREATE ITEM</>}
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
                            <div><p className="text-xs font-black text-slate-700">{log.productName}</p><p className="text-[9px] font-bold text-slate-400">{formatBS(log.date)}</p></div>
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
                    <div key={p.id} className={`p-6 rounded-[2rem] border transition-all relative ${p.stock <= 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${p.stock <= 0 ? 'bg-red-200 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {p.stock <= 0 ? <AlertTriangle size={20}/> : <PackageCheck size={20}/>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(p)} className="text-slate-300 hover:text-blue-600"><Edit3 size={16}/></button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="text-slate-300 hover:text-red-600"><Trash2 size={16}/></button>
                            </div>
                        </div>

                        {editingId === p.id ? (
                            <div className="space-y-2 animate-in fade-in">
                                <input className="w-full p-2 text-sm font-bold border rounded-lg" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                                <input className="w-full p-2 text-sm font-bold border rounded-lg" type="number" value={editForm.sellingPrice} onChange={e => setEditForm({...editForm, sellingPrice: e.target.value})} placeholder="Price" />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => saveEdit(p.id)} className="flex-1 bg-emerald-500 text-white p-2 rounded-lg"><Check size={16}/></button>
                                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-200 text-slate-500 p-2 rounded-lg"><X size={16}/></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-black text-slate-800 mb-1">{p.name}</h3>
                                <p className={`text-3xl font-black ${p.stock <= 0 ? 'text-red-600' : 'text-slate-800'}`}>{p.stock}</p>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Stock ({p.unit})</p>
                                    <p className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">₹{p.sellingPrice}</p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;