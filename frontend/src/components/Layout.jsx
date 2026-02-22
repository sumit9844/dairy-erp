import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { LogOut, Menu, X } from 'lucide-react';

const Layout = ({ children, currentView, setCurrentView, title, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex w-full min-w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* SIDEBAR with Mobile Props */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
            setCurrentView(view);
            setIsMobileMenuOpen(false); // Close menu on click
        }} 
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex-1 w-full flex flex-col min-w-0 h-screen transition-all duration-300">
        
        {/* HEADER */}
        <header className="h-16 w-full bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm flex-shrink-0 z-20">
          
          <div className="flex items-center gap-3">
             {/* Hamburger Button (Mobile Only) */}
             <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
             >
                <Menu size={24} />
             </button>
             
             <h2 className="text-sm md:text-lg font-bold text-slate-700 uppercase tracking-wider truncate">
                {title}
             </h2>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
             <div className="flex items-center gap-3 border-l pl-4 md:pl-6">
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-slate-800">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">{user?.role || 'STAFF'}</p>
                </div>
                <button 
                    onClick={onLogout} 
                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors" 
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
             </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-4 md:p-8 w-full flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;