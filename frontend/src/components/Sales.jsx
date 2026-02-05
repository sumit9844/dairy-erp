import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, PlusCircle, TrendingUp, Package } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]); // Added products list
  const [formData, setFormData] = useState({
    customerName: '', quantity: '', rate: '', productName: '', // Added productName
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { 
    fetchSales(); 
    fetchProducts(); 
  }, []);

  const fetchSales = async () => {
    const res = await axios.get('http://localhost:5000/api/sales');
    setSales(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products');
    setProducts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/sales', formData);
      alert("Sale Recorded & Stock Updated!");
      setFormData({ ...formData, customerName: '', quantity: '', rate: '', productName: '' });
      fetchSales();
    } catch (err) {
      alert(err.response?.data?.error || "Error recording sale. Ensure product is selected.");
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
          <Truck className="text-white w-6 h-6"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Sales & Dispatch</h1>
          <p className="text-sm text-slate-500 font-medium">Record revenue and update inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">New Sales Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* NEW: PRODUCT SELECTOR */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Item Being Sold</label>
              <select 
                required value={formData.productName} 
                onChange={e => setFormData({...formData, productName: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
              >
                <option value="">-- Select Product --</option>
                {products.map(p => <option key={p.id} value={p.name}>{p.name} ({p.stock} avail)</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</label>
              <input 
                type="text" required value={formData.customerName}
                onChange={e => setFormData({...formData, customerName: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none" 
                placeholder="e.g. Local Market"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Qty (Units)</label>
                    <input type="number" step="0.01" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Rate (₹)</label>
                    <input type="number" step="0.01" required value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-indigo-600" placeholder="0.00" />
                </div>
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg mt-4 flex items-center justify-center gap-2">
              <PlusCircle size={20}/> RECORD SALE
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500" /> Recent Sales Transactions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5 text-center">Volume</th>
                  <th className="px-8 py-5 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sales.map(s => (
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
    </div>
  );
};

export default Sales;