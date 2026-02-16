import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, PlusCircle, TrendingUp, Package, ShoppingCart, Trash2, Minus, Plus, Store } from 'lucide-react';

const Sales = () => {
  const [mode, setMode] = useState('RETAIL'); // 'RETAIL' or 'WHOLESALE'
  const [salesHistory, setSalesHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Wholesale Form State
  const [bulkForm, setBulkForm] = useState({
    customerName: '', quantity: '', rate: '', productName: '', date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, prodRes] = await Promise.all([
        axios.get('https://dairy-erp-backend.onrender.com/api/sales'),
        axios.get('https://dairy-erp-backend.onrender.com/api/products')
      ]);
      setSalesHistory(salesRes.data);
      setProducts(prodRes.data);
    } catch (err) { console.error(err); }
  };

  // --- RETAIL POS LOGIC ---
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]); // Default 1 unit
    }
  };

  const updateCartQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0.5, item.qty + delta); // Min 0.5
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const checkoutRetail = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);

    try {
      // Loop through cart and save each item as a sale
      // In a real app, you'd have a bulk-sale endpoint, but this works fine for now.
      for (const item of cart) {
        await axios.post('https://dairy-erp-backend.onrender.com/api/sales', {
            customerName: "Local Walk-in", // Default Name
            productName: item.name,
            quantity: item.qty,
            rate: item.sellingPrice,
            date: new Date().toISOString().split('T')[0]
        });
      }
      alert("Bill Saved & Stock Reduced!");
      setCart([]);
      fetchData();
    } catch (err) {
      alert("Error processing sale.");
    } finally {
      setLoading(false);
    }
  };

  // --- WHOLESALE LOGIC ---
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://dairy-erp-backend.onrender.com/api/sales', bulkForm);
      alert("Bulk Dispatch Recorded!");
      setBulkForm({ customerName: '', quantity: '', rate: '', productName: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) { alert(err.response?.data?.error || "Error"); }
  };

  // Calculations
  const cartTotal = cart.reduce((acc, item) => acc + (item.qty * item.sellingPrice), 0);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Sales Counter</h1>
            <p className="text-sm text-slate-500 font-medium">Point of Sale & Distribution</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => setMode('RETAIL')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'RETAIL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <Store size={18} /> Retail POS
            </button>
            <button onClick={() => setMode('WHOLESALE')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'WHOLESALE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <Truck size={18} /> Bulk Dispatch
            </button>
        </div>
      </div>

      {mode === 'RETAIL' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. PRODUCT GRID (LEFT) */}
            <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map(p => (
                        <div key={p.id} onClick={() => addToCart(p)} 
                             className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase">{p.unit}</span>
                                <span className={`text-[10px] font-bold ${p.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{p.stock} left</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-800">{p.name}</h3>
                            <p className="text-xl font-bold text-indigo-600 mt-1">₹{p.sellingPrice}</p>
                            <div className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlusCircle size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. CART / BILL (RIGHT) */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col h-[600px]">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <ShoppingCart className="text-indigo-600" />
                    <h3 className="font-black text-slate-800 uppercase tracking-widest">Current Bill</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Package size={48} className="mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase">Cart is Empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-black text-slate-700">{item.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">₹{item.sellingPrice} / {item.unit}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-white rounded-lg border border-slate-200">
                                        <button onClick={() => updateCartQty(item.id, -0.5)} className="p-1 hover:bg-slate-100 text-slate-500"><Minus size={14}/></button>
                                        <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                                        <button onClick={() => updateCartQty(item.id, 0.5)} className="p-1 hover:bg-slate-100 text-indigo-600"><Plus size={14}/></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 pt-6 border-t-2 border-slate-100">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-xs font-bold text-slate-400 uppercase">Total Payable</span>
                        <span className="text-3xl font-black text-indigo-600">₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={checkoutRetail} 
                        disabled={loading || cart.length === 0}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "CONFIRM SALE"}
                    </button>
                </div>
            </div>
        </div>
      ) : (
        /* --- WHOLESALE MODE (Original Form) --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Bulk Dispatch Entry</h3>
                <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Select Product</label>
                        <select required value={bulkForm.productName} onChange={e => setBulkForm({...bulkForm, productName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none">
                            <option value="">-- Choose Item --</option>
                            {products.map(p => <option key={p.id} value={p.name}>{p.name} (Stock: {p.stock})</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</label>
                        <input type="text" required value={bulkForm.customerName} onChange={e => setBulkForm({...bulkForm, customerName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="e.g. Hotel Grand" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Qty</label><input type="number" step="0.01" required value={bulkForm.quantity} onChange={e => setBulkForm({...bulkForm, quantity: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Rate</label><input type="number" step="0.01" required value={bulkForm.rate} onChange={e => setBulkForm({...bulkForm, rate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-indigo-600" /></div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg mt-4 flex items-center justify-center gap-2"><Truck size={20}/> DISPATCH</button>
                </form>
            </div>

            <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500" /> Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b"><th className="px-8 py-5">Date</th><th className="px-8 py-5">Customer</th><th className="px-8 py-5 text-center">Volume</th><th className="px-8 py-5 text-right">Revenue</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {salesHistory.map(s => (
                                <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 font-black text-slate-800">{s.customerName}</td>
                                    <td className="px-8 py-5 text-center font-bold text-indigo-600">{s.quantity.toFixed(1)}</td>
                                    <td className="px-8 py-5 text-right font-black text-emerald-600 text-lg">₹{s.totalAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Sales;