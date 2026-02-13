import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, User, Eye, Phone, MapPin, 
  ChevronLeft, ChevronRight, Users, Filter
} from 'lucide-react';

// API BASE URL
const API_BASE_URL = 'https://dairy-erp-backend.onrender.com';

const FarmerDirectory = ({ onSelectFarmer }) => {
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL'); // 'ALL', 'Barahathawa', 'Hajariya', 'Rajghat'
  const [currentPage, setCurrentPage] = useState(1);
  const farmersPerPage = 10;

  useEffect(() => {
    fetchFarmers();
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLocation]);

  const fetchFarmers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/farmers`);
      setFarmers(res.data);
    } catch (err) {
      console.error("Error fetching farmers:", err);
    }
  };

  // 1. Calculate Counts for the Cards
  const getCount = (loc) => farmers.filter(f => f.address === loc).length;
  const totalCount = farmers.length;

  // 2. Filter Logic (Search + Location)
  const filtered = farmers.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.farmerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.phone?.includes(searchTerm);
    
    const matchesLocation = selectedLocation === 'ALL' || f.address === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  // 3. Pagination Logic
  const indexOfLast = currentPage * farmersPerPage;
  const indexOfFirst = indexOfLast - farmersPerPage;
  const currentFarmers = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / farmersPerPage);

  // Card Component Helper
  const LocationCard = ({ location, label, colorClass, iconColor }) => {
    const isActive = selectedLocation === location;
    const count = location === 'ALL' ? totalCount : getCount(location);

    return (
      <button 
        onClick={() => setSelectedLocation(location)}
        className={`relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-300 text-left group ${
          isActive 
            ? `bg-slate-800 text-white shadow-xl scale-[1.02] border-slate-800` 
            : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg'
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/10 text-white' : `bg-slate-50 ${iconColor}`}`}>
            <MapPin size={24} />
          </div>
          {isActive && <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm">Active</div>}
        </div>
        <div>
          <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>{label}</h3>
          <p className={`text-4xl font-black tracking-tight mt-1 ${isActive ? 'text-white' : 'text-slate-800'}`}>{count}</p>
        </div>
        {/* Background Decor */}
        <MapPin className={`absolute -right-6 -bottom-6 opacity-5 rotate-12 ${isActive ? 'text-white' : 'text-slate-900'}`} size={120} />
      </button>
    );
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* 1. LOCATION CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <LocationCard location="ALL" label="All Farmers" colorClass="bg-slate-800" iconColor="text-slate-600" />
        <LocationCard location="Barahathawa" label="Barahathawa" colorClass="bg-blue-600" iconColor="text-blue-600" />
        <LocationCard location="Hajariya" label="Hajariya" colorClass="bg-emerald-600" iconColor="text-emerald-600" />
        <LocationCard location="Rajghat" label="Rajghat" colorClass="bg-orange-600" iconColor="text-orange-600" />
      </div>

      {/* 2. TABLE SECTION */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header & Search */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" /> 
            {selectedLocation === 'ALL' ? 'Master Directory' : `${selectedLocation} Directory`}
          </h2>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" placeholder="Search by name, code or phone..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">S.N.</th>
                <th className="px-8 py-5">Farmer Code</th>
                <th className="px-8 py-5">Farmer Name</th>
                <th className="px-8 py-5">Location / Contact</th>
                <th className="px-8 py-5">Milk Type</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentFarmers.map((f, index) => (
                <tr key={f.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5 text-xs font-bold text-slate-400">{indexOfFirst + index + 1}</td>
                  <td className="px-8 py-5">
                     <span className="font-mono font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">
                        {f.farmerCode}
                     </span>
                  </td>
                  <td 
                    className="px-8 py-5 font-black text-slate-800 text-base cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => onSelectFarmer(f)}
                  >
                    {f.name}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <MapPin size={12} className={
                            f.address === 'Barahathawa' ? 'text-blue-500' : 
                            f.address === 'Hajariya' ? 'text-emerald-500' : 
                            f.address === 'Rajghat' ? 'text-orange-500' : 'text-slate-400'
                        }/> 
                        {f.address || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold"><Phone size={10}/> {f.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${f.milkType === 'COW' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {f.milkType}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => onSelectFarmer(f)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      View Profile <Eye size={12}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {currentFarmers.length === 0 && (
             <div className="py-20 text-center">
                <div className="inline-flex p-4 bg-slate-50 rounded-full mb-3 text-slate-300">
                    <Filter size={24} />
                </div>
                <p className="text-slate-400 font-bold">No farmers found in {selectedLocation}.</p>
             </div>
          )}
        </div>

        {/* Pagination Footer */}
        {filtered.length > 0 && (
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p className="text-xs font-bold text-slate-400">Showing {indexOfFirst + 1}-{Math.min(indexOfLast, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
                <button 
                disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                ><ChevronLeft size={16}/></button>
                <button 
                disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                ><ChevronRight size={16}/></button>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDirectory;