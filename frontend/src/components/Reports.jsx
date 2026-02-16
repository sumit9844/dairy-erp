import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatBS } from '../utils/dateHelper';
import { 
  FileText, Calendar, Printer, ArrowDownCircle, ArrowUpCircle, 
  ChevronLeft, ChevronRight, Filter 
} from 'lucide-react';

const Reports = () => {
  const [data, setData] = useState({ ledger: [], totals: { totalDebit: 0, totalCredit: 0 } });
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Shows 20 records per page

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    fetchLedger();
  }, [dateRange]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://dairy-erp-backend.onrender.com/api/dashboard/ledger?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      setData(res.data);
      setCurrentPage(1); // Reset to page 1 when data changes
    } catch (err) {
      console.error("Ledger error", err);
    } finally {
      setLoading(false);
    }
  };

  const netBalance = data.totals.totalCredit - data.totals.totalDebit;

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = data.ledger.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.ledger.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* 1. CONTROL PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <FileText className="text-blue-600" /> Financial Ledger
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                General Accounting Book ({data.ledger.length} Records)
            </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 px-2">
                <Calendar size={16} className="text-slate-400"/>
                <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="bg-transparent text-sm font-bold text-slate-700 outline-none w-32" />
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2 px-2">
                <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="bg-transparent text-sm font-bold text-slate-700 outline-none w-32" />
            </div>
            <button onClick={() => window.print()} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-black transition-all shadow-lg print:hidden">
                <Printer size={18} />
            </button>
        </div>
      </div>

      {/* 2. SUMMARY RIBBON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex justify-between items-center">
            <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Credit (In)</p>
                <h3 className="text-2xl font-black text-emerald-700">+ ₹{data.totals.totalCredit.toLocaleString()}</h3>
            </div>
            <ArrowUpCircle className="text-emerald-400" size={32} />
        </div>
        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex justify-between items-center">
            <div>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Total Debit (Out)</p>
                <h3 className="text-2xl font-black text-red-700">- ₹{data.totals.totalDebit.toLocaleString()}</h3>
            </div>
            <ArrowDownCircle className="text-red-400" size={32} />
        </div>
        <div className={`p-6 border rounded-3xl flex justify-between items-center ${netBalance >= 0 ? 'bg-slate-900 text-white border-slate-900' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Net Balance</p>
                <h3 className="text-3xl font-black">₹{netBalance.toLocaleString()}</h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-white/20 rounded-lg">{netBalance >= 0 ? 'PROFIT' : 'LOSS'}</span>
        </div>
      </div>

      {/* 3. THE LEDGER TABLE (Paginated) */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="px-8 py-4 w-32">Date</th>
                        <th className="px-8 py-4 w-32">Category</th>
                        <th className="px-8 py-4">Description</th>
                        <th className="px-8 py-4 text-right w-40">Debit</th>
                        <th className="px-8 py-4 text-right w-40">Credit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="5" className="py-20 text-center font-bold text-slate-300 animate-pulse">Calculating Ledger...</td></tr>
                    ) : data.ledger.length === 0 ? (
                        <tr><td colSpan="5" className="py-20 text-center font-bold text-slate-300 italic">No transactions found.</td></tr>
                    ) : (
                        currentRows.map((row) => (
                            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors even:bg-slate-50/30">
                                <td className="px-8 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700 text-xs">{formatBS(row.date)}</span>
                                        <span className="text-[9px] text-slate-400 font-mono">{new Date(row.date).toLocaleDateString()}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-3">
                                    <Badge type={row.type} />
                                </td>
                                <td className="px-8 py-3 text-xs font-bold text-slate-600 truncate max-w-xs">
                                    {row.description}
                                </td>
                                <td className="px-8 py-3 text-right text-sm font-bold text-red-500">
                                    {row.debit > 0 ? `₹${row.debit.toLocaleString()}` : '-'}
                                </td>
                                <td className="px-8 py-3 text-right text-sm font-bold text-emerald-600">
                                    {row.credit > 0 ? `₹${row.credit.toLocaleString()}` : '-'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        {data.ledger.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center print:hidden">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, data.ledger.length)} of {data.ledger.length}
                </p>
                <div className="flex gap-2">
                    <button 
                        onClick={prevPage} 
                        disabled={currentPage === 1}
                        className="p-2 border rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black flex items-center">
                        Page {currentPage}
                    </span>
                    <button 
                        onClick={nextPage} 
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// Helper Badge
const Badge = ({ type }) => {
    const styles = {
        'SALE': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'EXPENSE': 'bg-red-50 text-red-600 border-red-100',
        'PROCUREMENT': 'bg-orange-50 text-orange-600 border-orange-100'
    };
    return (
        <span className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider ${styles[type] || 'bg-gray-100'}`}>
            {type}
        </span>
    );
};

export default Reports;