import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Printer, FileText, Search, Beaker, Info, 
  TrendingUp, Droplets, Landmark, Calculator, CheckCircle
} from 'lucide-react';

const Settlement = () => {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compSettings, setCompSettings] = useState(null);

  useEffect(() => {
    // Fetch farmers and company settings on load
    axios.get('https://dairy-erp-backend.onrender.com/api/farmers').then(res => setFarmers(res.data)).catch(e => console.log(e));
    axios.get('https://dairy-erp-backend.onrender.com/api/settings').then(res => setCompSettings(res.data)).catch(e => console.log(e));
  }, []);

  const generateStatement = async () => {
    if(!selectedFarmerId || !dateRange.start || !dateRange.end) return alert("Select Farmer and Date Range.");
    setLoading(true);
    try {
      const res = await axios.get(`https://dairy-erp-backend.onrender.com/api/settlements/statement?farmerId=${selectedFarmerId}&startDate=${dateRange.start}&endDate=${dateRange.end}`);
      setStatement(res.data);
    } catch (err) {
      alert("Error fetching data. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const currentFarmer = farmers.find(f => f.id === selectedFarmerId);

  const getFormulaDisplay = () => {
    if (!statement || !statement.farmerConfig) return "No configuration found";
    const { rateType, fatRate, snfRate, fixedRate } = statement.farmerConfig;
    // Map to summary keys
    const avgFat = statement.summary.avgFat ?? 0;
    const avgSnf = statement.summary.avgSnf ?? 0;
    const appliedRate = statement.summary.appliedRate ?? 0;

    if (rateType === 'FAT_ONLY') {
        return `Formula: Avg Fat (${avgFat}%) × Rate (₹${fatRate}) = ₹${appliedRate}/L`;
    } else if (rateType === 'FAT_SNF') {
        return `Formula: [Fat (${avgFat}%) × ₹${fatRate}] + [SNF (${avgSnf}%) × ₹${snfRate}] = ₹${appliedRate}/L`;
    } else {
        return `Formula: Fixed Price = ₹${fixedRate}/L`;
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* 1. SELECTION BOX */}
      <div className="print:hidden bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 mb-8">
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Start</label>
            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period End</label>
            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
          </div>
          <button onClick={generateStatement} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95">
            {loading ? "Processing..." : "GENERATE BILL"}
          </button>
        </div>
      </div>

      {statement && statement.summary && (
        <div className="space-y-6">
          
          {/* 2. ANALYTICS SUMMARY CARDS */}
          <div className="print:hidden grid grid-cols-1 md:grid-cols-4 gap-6">
             <SummaryCard label="Avg. Fat" value={`${statement.summary.avgFat ?? 0}%`} icon={<Droplets size={18}/>} color="text-orange-600" />
             <SummaryCard label="Avg. SNF" value={`${statement.summary.avgSnf ?? 0}%`} icon={<Calculator size={18}/>} color="text-indigo-600" />
             <SummaryCard label="Rate per Ltr" value={`₹${statement.summary.appliedRate ?? 0}`} icon={<TrendingUp size={18}/>} color="text-blue-600" />
             <div className="p-6 bg-emerald-600 rounded-3xl shadow-xl flex flex-col justify-center">
                <p className="text-[10px] font-black text-emerald-100 uppercase mb-1">Final Net Payable</p>
                <h3 className="text-2xl font-black text-white">₹{Math.round(statement.summary.netPayable || 0).toLocaleString()}</h3>
             </div>
          </div>

          {/* 3. THE ACTUAL INVOICE */}
          <div className="bg-white rounded-[2rem] print:rounded-none shadow-xl border border-slate-200 overflow-hidden">
            
            <div className="p-10 border-b-2 border-slate-100 flex justify-between items-start bg-slate-50/30 print:bg-white">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                    {compSettings?.companyName || "DAIRYPRO ERP"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 max-w-xs uppercase leading-relaxed">
                    {compSettings?.address || "Official Milk Settlement Statement"}
                  </p>
                  <p className="text-xs font-black text-blue-600 mt-2 uppercase">
                    PH: {compSettings?.phone || "AUTHORIZED COPY"}
                  </p>
               </div>
               <div className="text-right">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Payment Bill</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Issued: {new Date().toLocaleDateString()}</p>
                  <button onClick={() => window.print()} className="print:hidden mt-4 bg-slate-900 text-white px-6 py-2 rounded-xl hover:bg-black transition-all flex items-center gap-2 font-black text-xs">
                    <Printer size={16} /> PRINT PDF
                  </button>
               </div>
            </div>

            <div className="px-10 py-6 bg-slate-50/50 border-b border-slate-100 flex justify-between print:bg-white">
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Beneficiary</p>
                    <p className="text-lg font-black text-slate-800">{currentFarmer?.name} <span className="text-slate-300 ml-1 font-mono text-sm">ID: {currentFarmer?.farmerCode}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle</p>
                    <p className="text-sm font-bold text-slate-700">{dateRange.start} — {dateRange.end}</p>
                </div>
            </div>

            <div className="p-10">
                <table className="w-full text-left mb-10">
                    <thead className="border-b-2 border-slate-900">
                        <tr className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                            <th className="py-4">Collection Date</th>
                            <th className="py-4 text-center">Shift</th>
                            <th className="py-4 text-center">Volume (L)</th>
                            <th className="py-4 text-center">Quality (Fat/SNF) (%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {statement.transactions?.map((t) => (
                            <tr key={t.id} className="text-sm font-bold text-slate-700">
                                <td className="py-4">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="py-4 text-center text-[10px] uppercase text-slate-400 font-black">{t.shift}</td>
                                <td className="py-4 text-center font-black text-blue-600">{t.quantity?.toFixed(2)}</td>
                                <td className="py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-black">{t.fat}% / {t.snf}%</span>
                                        {t.isAutoFilled && (
                                            <span className="text-[9px] text-blue-500 font-black uppercase leading-none mt-1">(Auto-Filled)</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex flex-col md:flex-row justify-between items-start pt-10 border-t-2 border-slate-100 gap-10">
                    <div className="flex-1 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-3 text-blue-600">
                            <Calculator size={18} />
                            <h4 className="text-[11px] font-black uppercase tracking-widest">Calculation Basis</h4>
                        </div>
                        <p className="text-sm font-black text-slate-700 mb-2">{getFormulaDisplay()}</p>
                        <div className="space-y-1 text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                            <p>* Missing quality readings replaced by period average</p>
                            <p>* Settlement logic: 15-Day Quality Average Pricing</p>
                        </div>
                    </div>

                    <div className="w-full md:w-96 space-y-4">
                        <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            <span>Total Milk Volume:</span>
                            <span className="text-slate-900 text-sm font-black">{statement.summary.totalQty} L</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            <span>Avg Rate per Liter:</span>
                            <span className="text-slate-900 text-sm font-black">₹{statement.summary.appliedRate}</span>
                        </div>
                        <div className="h-px bg-slate-100"></div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-700 pt-2">
                            <span>Gross Milk Value:</span>
                            <span className="font-black">₹{statement.summary.grossAmount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-red-500">
                            <span>(-) Advances/Deductions:</span>
                            <span className="font-black">₹{statement.summary.advanceDeducted?.toFixed(2)}</span>
                        </div>
                        <div className="h-1 bg-slate-900 my-4"></div>
                        <div className="flex justify-between items-center text-2xl font-black text-slate-900">
                            <span>NET PAYABLE:</span>
                            <span className="underline decoration-emerald-500 decoration-4 underline-offset-8">
                                ₹{Math.round(statement.summary.netPayable || 0).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-right text-[10px] font-bold text-slate-400 italic">** Amount rounded to nearest whole number</p>
                    </div>
                </div>

                <div className="hidden print:flex justify-between mt-32">
                    <div className="text-center w-56 border-t border-slate-400 pt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Farmer Signature</div>
                    <div className="text-center w-56 border-t border-slate-400 pt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">For {compSettings?.companyName || "DAIRYPRO"}</div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color }) => (
    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all group">
        <div className={`p-3 rounded-2xl bg-slate-50 ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <h3 className={`text-lg font-black text-slate-800`}>{value || '0'}</h3>
        </div>
    </div>
);

export default Settlement;