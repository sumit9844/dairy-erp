import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IndianRupee, Printer, FileText, Search, Beaker, CheckCircle, ArrowLeft } from 'lucide-react';

const Settlement = () => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compSettings, setCompSettings] = useState(null);

  useEffect(() => {
    axios.get('https://dairy-erp-backend.onrender.com/api/farmers').then(res => setFarmers(res.data));
    axios.get('https://dairy-erp-backend.onrender.com/api/settings').then(res => setCompSettings(res.data)); // Fetch this
  }, []);

  const generateStatement = async () => {
    if(!selectedFarmerId || !dateRange.start || !dateRange.end) {
        return alert("Please select Farmer and Date Range.");
    }
    setLoading(true);
    try {
      const res = await axios.get(`https://dairy-erp-backend.onrender.com/api/settlements/statement?farmerId=${selectedFarmerId}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
      setStatement(res.data);
    } catch (err) {
      alert("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const currentFarmer = farmers.find(f => f.id === selectedFarmerId);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* 1. SELECTION BOX (Hidden on Print) */}
      <div className="print:hidden bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Farmer</label>
            <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedFarmerId} onChange={(e) => setSelectedFarmerId(e.target.value)}
            >
              <option value="">Choose Farmer...</option>
              {farmers.map(f => <option key={f.id} value={f.id}>{f.farmerCode} - {f.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
          </div>
          <button onClick={generateStatement} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100">
            {loading ? "Processing..." : "CALCULATE BILL"}
          </button>
        </div>
      </div>

      {statement && (
        <div className="space-y-6">
          
          {/* 2. SUMMARY CARDS (Hidden on Print) */}
          <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Milk Value</p>
                <h3 className="text-3xl font-black text-slate-700">₹{statement.summary.grossAmount.toFixed(2)}</h3>
             </div>
             <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Advance Deducted</p>
                <h3 className="text-3xl font-black text-red-500">₹{statement.summary.advanceDeducted.toFixed(2)}</h3>
             </div>
             <div className="p-8 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-200">
                <p className="text-[10px] font-black text-emerald-100 uppercase mb-1">Final Net Payable</p>
                <h3 className="text-3xl font-black text-white">₹{statement.summary.netPayable.toFixed(2)}</h3>
             </div>
          </div>

          {/* 3. PRINTABLE INVOICE AREA */}
          <div id="print-area" className="bg-white rounded-[2rem] print:rounded-none shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Bill Header */}
                <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 print:bg-white">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                        {compSettings?.companyName || "DAIRYPRO ERP"}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 mt-1 max-w-xs uppercase">
                        {compSettings?.address || "System Settlement Bill"}
                    </p>
                    <p className="text-xs font-black text-blue-600 mt-2">
                        CONTACT: {compSettings?.phone || "OFFICIAL COPY"}
                    </p>
                </div>
                <button onClick={() => window.print()} className="print:hidden bg-white text-slate-700 border-2 border-slate-100 p-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 font-black">
                    <Printer size={20} /> PRINT INVOICE
                </button>
                </div>

            {/* Table Area */}
            <div className="p-10">
                <table className="w-full text-left mb-10">
                    <thead className="border-b-2 border-slate-900">
                        <tr className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                            <th className="py-4">Date / Shift</th>
                            <th className="py-4 text-center">Qty (L)</th>
                            <th className="py-4 text-center">Quality (F/S)</th>
                            <th className="py-4 text-right">Rate</th>
                            <th className="py-4 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {statement.transactions.map((t) => (
                            <tr key={t.id} className="text-sm font-bold text-slate-700">
                                <td className="py-4">{new Date(t.date).toLocaleDateString()} <span className="text-[10px] uppercase text-slate-300 ml-2">{t.shift}</span></td>
                                <td className="py-4 text-center font-black text-blue-600">{t.quantity.toFixed(2)}</td>
                                <td className="py-4 text-center text-xs text-slate-400">{t.fat} / {t.snf}</td>
                                <td className="py-4 text-right text-slate-400 font-medium">₹{t.rate.toFixed(2)}</td>
                                <td className="py-4 text-right font-black text-slate-900">₹{t.totalAmount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals Section */}
                <div className="flex flex-col items-end pt-10 border-t-2 border-slate-100">
                    <div className="w-full md:w-96 space-y-4">
                        <div className="flex justify-between text-slate-500 font-bold uppercase text-xs">
                            <span>Total Milk Supplied:</span>
                            <span className="text-slate-900">{statement.summary.totalQty.toFixed(2)} Liters</span>
                        </div>
                        <div className="flex justify-between text-slate-500 font-bold uppercase text-xs">
                            <span>Gross Milk Amount:</span>
                            <span className="text-slate-900">₹{statement.summary.grossAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-500 font-black uppercase text-xs">
                            <span>(-) Advance Deducted:</span>
                            <span>₹{statement.summary.advanceDeducted.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-slate-900 my-4"></div>
                        <div className="flex justify-between text-2xl font-black text-slate-900">
                            <span>NET PAYABLE:</span>
                            <span className="underline decoration-emerald-500 decoration-4 underline-offset-8">₹{statement.summary.netPayable.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Print Signatures */}
                <div className="hidden print:flex justify-between mt-32">
                    <div className="text-center w-48 border-t border-slate-400 pt-2 text-[10px] font-black uppercase tracking-widest">Farmer Signature</div>
                    <div className="text-center w-48 border-t border-slate-400 pt-2 text-[10px] font-black uppercase tracking-widest">For DairyPro Management</div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settlement;