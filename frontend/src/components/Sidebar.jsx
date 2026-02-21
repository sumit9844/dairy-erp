import React from 'react';
import { 
  Users, ClipboardList, LayoutDashboard, TrendingUp, Settings, 
  Beaker, Landmark, UserPlus, FileText, Wallet, Truck, Package, X 
} from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView, user, isOpen, onClose }) => { 
  
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20}/>, roles: ['OWNER', 'STAFF'] },
    { id: 'farmers', label: 'Farmer Directory', icon: <Users size={20}/>, roles: ['OWNER', 'STAFF'] },
    { id: 'register-farmer', label: 'New Registration', icon: <UserPlus size={20}/>, roles: ['OWNER', 'STAFF'] },
    { id: 'collection', label: 'Milk Collection', icon: <ClipboardList size={20}/>, roles: ['OWNER', 'STAFF'] },
    { id: 'inventory', label: 'Inventory / Stock', icon: <Package size={20}/>, roles: ['OWNER', 'STAFF'] },
    { id: 'sales', label: 'Sales & Dispatch', icon: <Truck size={20}/>, roles: ['OWNER', 'STAFF'] },
    { id: 'settlement', label: 'Billing & Settlement', icon: <FileText size={20}/>, roles: ['OWNER'] },
    { id: 'advances', label: 'Advances/Loans', icon: <Landmark size={20}/>, roles: ['OWNER'] },
    { id: 'expenses', label: 'Expense Tracker', icon: <Wallet size={20}/>, roles: ['OWNER'] },
    { id: 'settings', label: 'Settings', icon: <Settings size={20}/>, roles: ['OWNER'] },
  ];

  const allowedItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
        ></div>
      )}

      {/* SIDEBAR DRAWER */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] text-white flex flex-col h-screen shadow-2xl transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* LOGO AREA */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
                    <Beaker className="text-white w-6 h-6" />
                </div>
                <div>
                    <span className="text-xl font-bold tracking-tight uppercase">Dairy<span className="text-blue-400">Pro</span></span>
                    <p className="text-[9px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded w-fit mt-1">{user?.role || 'STAFF'}</p>
                </div>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                <X size={24} />
            </button>
        </div>
        
        {/* MENU */}
        <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
            {allowedItems.map((item) => (
            <div 
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                {item.icon}
                <span className="font-semibold text-sm">{item.label}</span>
            </div>
            ))}
        </nav>
        
        <div className="p-4 bg-[#0f172a] text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center">
            {user?.name}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
