import React from 'react';
import Sidebar from './Sidebar';
import { Search } from 'lucide-react';

const Layout = ({ children, currentView, setCurrentView, title }) => {
  return (
    // Changed: Added w-full and min-w-full
    <div className="flex w-full min-w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      {/* Changed: Added w-full and flex-1 */}
      <div className="flex-1 w-full flex flex-col min-w-0">
        
        {/* HEADER BAR */}
        <header className="h-16 w-full bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm sticky top-0 z-40">
          <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider">{title}</h2>
          
          <div className="flex items-center gap-6">
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Global Search..." 
                  className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-72 outline-none text-slate-900"
                />
             </div>
             <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">AD</div>
          </div>
        </header>

        {/* PAGE CONTENT - Removed max-w constraints */}
        <main className="p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;