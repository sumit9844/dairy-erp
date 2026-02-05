import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, PlusCircle, Receipt, Trash2, Calendar, Filter } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    category: 'Transport', amount: '', description: '', date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Transport', 'Electricity', 'Salary', 'Packaging', 'Maintenance', 'Medical', 'Other'];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await axios.get('http://localhost:5000/api/expenses');
    setExpenses(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/expenses', formData);
      alert("Expense Recorded!");
      setFormData({ ...formData, amount: '', description: '' });
      fetchExpenses();
    } catch (err) {
      alert("Error saving expense");
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-200">
          <Wallet className="text-white w-6 h-6"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Expense Tracker</h1>
          <p className="text-sm text-slate-500 font-medium">Manage daily operational costs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ADD EXPENSE FORM */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 h-fit">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Record New Cost</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
              <select 
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (₹)</label>
              <input 
                type="number" required value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 outline-none" 
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
              <input 
                type="date" value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
              <input 
                type="text" value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none" 
                placeholder="e.g. Diesel for generator"
              />
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              <PlusCircle size={20}/> SAVE EXPENSE
            </button>
          </form>
        </div>

        {/* EXPENSE LOGS */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Receipt size={18} className="text-red-500" /> Recent Expense Logs
            </h3>
            <span className="text-[10px] font-black bg-red-50 text-red-600 px-3 py-1 rounded-full uppercase">
                Total Records: {expenses.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Description</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase">{exp.category}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-700">{exp.description || '—'}</td>
                    <td className="px-8 py-5 text-right font-black text-red-600 text-lg">₹{exp.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
                <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs italic">No expenses recorded yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;