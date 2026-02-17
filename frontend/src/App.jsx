import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FarmerManager from './components/FarmerManager';
import MilkCollection from './components/MilkCollection';
import Settlement from './components/Settlement';
import Advances from './components/Advances';
import FarmerDirectory from './components/FarmerDirectory';
import FarmerProfile from './components/FarmerProfile';
import Settings from './components/Settings';
import Expenses from './components/Expenses';
import Sales from './components/Sales';
import Login from './components/Login';
import Production from './components/Production'; // Ensure Production is imported if you are using it
import Inventory from './components/Inventory';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewedFarmer, setViewedFarmer] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const navigateToProfile = (farmer) => {
    setViewedFarmer(farmer);
    setCurrentView('farmer-profile');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setCurrentView('dashboard');
  };

  const renderView = () => {
    // 1. Security Check: Block Staff from Admin Pages
    if (user?.role === 'STAFF') {
        if (['settlement', 'advances', 'expenses', 'settings'].includes(currentView)) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
                        <h2 className="text-2xl font-black text-red-600 mb-2">ACCESS DENIED</h2>
                        <p className="text-slate-500 font-bold">You do not have permission to view this module.</p>
                    </div>
                </div>
            );
        }
    }

    switch(currentView) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'register-farmer': return <FarmerManager />;
      case 'farmers': return <FarmerDirectory onSelectFarmer={navigateToProfile} />;
      case 'farmer-profile': return <FarmerProfile farmer={viewedFarmer} onBack={() => setCurrentView('farmers')} user={user} />;
      case 'collection': return <MilkCollection />;
      case 'inventory': return <Inventory />;
      case 'sales': return <Sales />;
      // Admin Only Views
      case 'settlement': return <Settlement />;
      case 'advances': return <Advances />;
      case 'expenses': return <Expenses />;
      case 'settings': return <Settings />;
      default: return <Dashboard user={user} />;
    }
  };

  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'System Overview';
      case 'farmers': return 'Farmer Directory';
      case 'register-farmer': return 'New Farmer Registration';
      case 'farmer-profile': return `Profile: ${viewedFarmer?.name || 'Farmer Details'}`;
      case 'collection': return 'Milk Collection';
      case 'settlement': return 'Billing & Settlement';
      case 'advances': return 'Advance & Loan Tracking';
      case 'expenses': return 'Expense Management';
      case 'sales': return 'Sales Terminal';
      case 'inventory': return 'Inventory & Stock';
      case 'settings': return 'Business Configuration';
      default: return 'DairyPro ERP';
    }
  };

  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    // We pass 'user' to Layout here. Layout will handle the Sidebar.
    <Layout 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        title={getTitle()} 
        user={user} 
        onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
}

export default App;