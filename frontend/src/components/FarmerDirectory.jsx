import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Eye, ArrowRight, ChevronLeft, ChevronRight, Phone, MapPin } from 'lucide-react';

const FarmerDirectory = ({ onSelectFarmer }) => {
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const farmersPerPage = 10;

  useEffect(() => {
    axios.get('http://localhost:5000/api/farmers').then(res => setFarmers(res.data));
  }, []);

  const filtered = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.farmerCode.includes(searchTerm)
  );

  // Pagination Logic
  const indexOfLast = currentPage * farmersPerPage;
  const indexOfFirst = indexOfLast - farmersPerPage;
  const currentFarmers = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / farmersPerPage);

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header / Search */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <User className="text-blue-600" /> Farmer Master List
          </h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search by name, code or phone..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Professional Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5">S.N.</th>
                <th className="px-8 py-5">Code</th>
                <th className="px-8 py-5">Farmer Name</th>
                <th className="px-8 py-5">Contact Details</th>
                <th className="px-8 py-5">Milk Type</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentFarmers.map((f, index) => (
                <tr key={f.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">{indexOfFirst + index + 1}</td>
                  <td className="px-8 py-5 font-mono font-black text-blue-600">{f.farmerCode}</td>
                  <td 
                    className="px-8 py-5 font-black text-slate-800 cursor-pointer hover:text-blue-600 transition-colors underline decoration-dotted underline-offset-4"
                    onClick={() => onSelectFarmer(f)}
                  >
                    {f.name}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600"><Phone size={12}/> {f.phone || 'N/A'}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium"><MapPin size={12}/> {f.address || 'Village Area'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${f.milkType === 'COW' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {f.milkType}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onSelectFarmer(f)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-all group-hover:shadow-md"
                    >
                      VIEW PROFILE <Eye size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} Farmers</p>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
            ><ChevronLeft size={20}/></button>
            <button 
              disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all"
            ><ChevronRight size={20}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDirectory;