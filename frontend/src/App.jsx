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
//import Production from './components/Production';
import Inventory from './components/Inventory'; // <--- ADDED
import Reports from './components/Reports'; // 1. Import

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
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard />;
      case 'register-farmer': return <FarmerManager />;
      case 'farmers': return <FarmerDirectory onSelectFarmer={navigateToProfile} />;
      case 'farmer-profile': return <FarmerProfile farmer={viewedFarmer} onBack={() => setCurrentView('farmers')} />;
      case 'collection': return <MilkCollection />;
      case 'settlement': return <Settlement />;
      case 'advances': return <Advances />;
      case 'expenses': return <Expenses />;
      case 'sales': return <Sales />;
      //case 'production': return <Production />;
      case 'inventory': return <Inventory />; // <--- ADDED
      case 'settings': return <Settings />;
      case 'reports': return <Reports />; // 2. Add Case
      default: return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'System Overview';
      case 'farmers': return 'Farmer Directory';
      case 'inventory': return 'Inventory & Stock Management'; // <--- ADDED
      default: return 'DairyPro ERP';
    }
  };

  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} title={getTitle()} user={user} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
}

export default App;