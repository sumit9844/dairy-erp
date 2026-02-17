import React from 'react';
import Sidebar from './Sidebar'; // <--- Sidebar is imported HERE, not in App.jsx
import { LogOut } from 'lucide-react';

const Layout = ({ children, currentView, setCurrentView, title, user, onLogout }) => {
  return (
    <div className="flex w-full min-w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* Sidebar handles the menu logic */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} user={user} />
      
      <div className="flex-1 w-full flex flex-col min-w-0 h-screen">
        {/* Header */}
        <header className="h-16 w-full bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider">{title}</h2>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 border-l pl-6">
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

        {/* Page Content */}
        <main className="p-8 w-full flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;