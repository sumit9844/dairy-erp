import React from 'react';
import { 
  Users, 
  ClipboardList, 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  Beaker, 
  Landmark, 
  UserPlus, 
  FileText,
  Wallet,
  Truck,
  Package, // <--- ADDED
  ShoppingCart // <--- ADDED
} from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { id: 'farmers', label: 'Farmer Directory', icon: <Users size={20}/> },
    { id: 'register-farmer', label: 'New Registration', icon: <UserPlus size={20}/> },
    { id: 'collection', label: 'Milk Collection', icon: <ClipboardList size={20}/> },
    { id: 'production', label: 'Production / Batches', icon: <Beaker size={20}/> },
    { id: 'inventory', label: 'Inventory / Stock', icon: <Package size={20}/> }, // <--- NEW
    { id: 'sales', label: 'Sales & Dispatch', icon: <Truck size={20}/> },
    { id: 'settlement', label: 'Billing & Settlement', icon: <FileText size={20}/> },
    { id: 'advances', label: 'Advances/Loans', icon: <Landmark size={20}/> },
    { id: 'expenses', label: 'Expense Tracker', icon: <Wallet size={20}/> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20}/> },
  ];

  return (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col sticky top-0 h-screen shadow-xl z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700">
        <div className="bg-blue-500 p-2 rounded-lg shadow-lg">
          <Beaker className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight uppercase">Dairy<span className="text-blue-400">Pro</span></span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
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
        © 2025 DairyPro ERP
      </div>
    </aside>
  );
};

export default Sidebar;