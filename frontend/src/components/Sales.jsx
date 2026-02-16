import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, PlusCircle, TrendingUp, Package, ShoppingCart, Trash2, Minus, Plus, Store, Receipt, User, Scale } from 'lucide-react';

const Sales = () => {
  const [mode, setMode] = useState('RETAIL'); // 'RETAIL' or 'WHOLESALE'
  const [salesHistory, setSalesHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- RETAIL STATE ---
  const [cart, setCart] = useState([]);

  // --- WHOLESALE STATE ---
  const [customerName, setCustomerName] = useState("");
  const [billItems, setBillItems] = useState([]); // List of items for the current hotel/person
  const [currentItem, setCurrentItem] = useState({ productName: '', quantity: '', rate: '' });

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, prodRes] = await Promise.all([
        axios.get('https://dairy-erp-backend.onrender.com/api/sales'),
        axios.get('https://dairy-erp-backend.onrender.com/api/products')
      ]);
      setSalesHistory(salesRes.data);
      setProducts(prodRes.data);
    } catch (err) { console.error(err); }
  };

  // ==============================
  // 1. RETAIL POS LOGIC (FAST)
  // ==============================
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]); // Default 1 unit
    }
  };

  const updateCartQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        // Prevent negative, allow decimals for grams
        const newQty = parseFloat((item.qty + delta).toFixed(3)); 
        return { ...item, qty: Math.max(0.05, newQty) }; // Min 50 grams
      }
      return item;
    }));
  };

  const setExactQty = (id, val) => {
    setCart(cart.map(item => item.id === id ? { ...item, qty: parseFloat(val) } : item));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const checkoutRetail = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);

    try {
      // Loop through cart and save each item as a sale
      for (const item of cart) {
        await axios.post('https://dairy-erp-backend.onrender.com/api/sales', {
            customerName: "Local Counter", // Auto-set for Retail
            productName: item.name,
            quantity: item.qty,
            rate: item.sellingPrice,
            date: new Date().toISOString().split('T')[0]
        });
      }
      alert("Retail Sale Recorded!");
      setCart([]);
      fetchData();
    } catch (err) {
      alert("Error processing sale. Check stock levels.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 2. WHOLESALE BILLING LOGIC
  // ==============================
  const addItemToBill = (e) => {
    e.preventDefault();
    if(!currentItem.productName || !currentItem.quantity || !currentItem.rate) return alert("Fill all fields");
    
    // Calculate total for this line item
    const lineTotal = parseFloat(currentItem.quantity) * parseFloat(currentItem.rate);
    const itemWithTotal = { ...currentItem, total: lineTotal, id: Date.now() };

    setBillItems([...billItems, itemWithTotal]);
    setCurrentItem({ productName: '', quantity: '', rate: '' }); // Reset form but keep customer name
  };

  const removeBillItem = (id) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const finalizeWholesaleBill = async () => {
    if(!customerName) return alert("Please enter Customer/Hotel Name");
    if(billItems.length === 0) return alert("Add items to the bill first");
    
    setLoading(true);
    try {
        for (const item of billItems) {
            await axios.post('https://dairy-erp-backend.onrender.com/api/sales', {
                customerName: customerName,
                productName: item.productName,
                quantity: item.quantity,
                rate: item.rate,
                date: new Date().toISOString().split('T')[0]
            });
        }
        alert(`Invoice Generated for ${customerName}!`);
        setBillItems([]);
        setCustomerName("");
        fetchData();
    } catch (err) {
        alert("Error saving bill. Check stock.");
    } finally {
        setLoading(false);
    }
  };

  // Calculations
  const retailTotal = cart.reduce((acc, item) => acc + (item.qty * item.sellingPrice), 0);
  const wholesaleTotal = billItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Sales Terminal</h1>
            <p className="text-sm text-slate-500 font-medium">Select mode of operation</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => setMode('RETAIL')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'RETAIL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <Store size={18} /> Retail POS
            </button>
            <button onClick={() => setMode('WHOLESALE')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'WHOLESALE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <Receipt size={18} /> Wholesale Billing
            </button>
        </div>
      </div>

      {mode === 'RETAIL' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. PRODUCT GRID (LEFT) */}
            <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map(p => (
                        <div key={p.id} onClick={() => addToCart(p)} 
                             className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase">{p.unit}</span>
                                <span className={`text-[10px] font-bold ${p.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{p.stock} left</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-800">{p.name}</h3>
                            <p className="text-xl font-bold text-indigo-600 mt-1">₹{p.sellingPrice}</p>
                            <div className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlusCircle size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. RETAIL CART (RIGHT) */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col h-[650px]">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <ShoppingCart className="text-indigo-600" />
                    <h3 className="font-black text-slate-800 uppercase tracking-widest">Walk-in Customer</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Package size={48} className="mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase">Select items to sell</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-black text-slate-700">{item.name}</p>
                                    <p className="text-[10px] font-bold text-slate-500">₹{item.sellingPrice} / {item.unit}</p>
                                </div>
                                
                                {/* QUANTITY CONTROL FOR GRAMS */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center bg-white rounded-lg border border-slate-200">
                                        <button onClick={() => updateCartQty(item.id, -0.5)} className="p-1.5 hover:bg-slate-100 text-slate-500"><Minus size={14}/></button>
                                        <input 
                                            type="number" 
                                            value={item.qty} 
                                            onChange={(e) => setExactQty(item.id, e.target.value)}
                                            className="w-12 text-center text-xs font-bold outline-none"
                                        />
                                        <button onClick={() => updateCartQty(item.id, 0.5)} className="p-1.5 hover:bg-slate-100 text-indigo-600"><Plus size={14}/></button>
                                    </div>

                                    {/* GRAM SHORTCUTS */}
                                    <div className="flex gap-1">
                                        <button onClick={() => setExactQty(item.id, 0.2)} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">200g</button>
                                        <button onClick={() => setExactQty(item.id, 0.5)} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">500g</button>
                                    </div>
                                    
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 pt-4 border-t-2 border-slate-100 bg-slate-50 p-4 rounded-3xl">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase">Total Payable</span>
                        <span className="text-3xl font-black text-indigo-600">₹{Math.round(retailTotal).toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={checkoutRetail} 
                        disabled={loading || cart.length === 0}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading ? "Processing..." : <><Check size={20}/> CONFIRM & PRINT</>}
                    </button>
                </div>
            </div>
        </div>
      ) : (
        /* --- WHOLESALE MODE --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. BILL BUILDER FORM */}
            <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 h-fit">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Create New Invoice</h3>
                
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><User size={12}/> Customer / Hotel Name</label>
                        <input 
                            type="text" 
                            value={customerName} 
                            onChange={e => setCustomerName(e.target.value)} 
                            className="w-full p-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl font-bold text-indigo-900 outline-none focus:border-indigo-500" 
                            placeholder="e.g. Hotel Grand"
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Add Line Item</p>
                        <select 
                            value={currentItem.productName} 
                            onChange={e => {
                                const prod = products.find(p => p.name === e.target.value);
                                setCurrentItem({...currentItem, productName: e.target.value, rate: prod ? prod.sellingPrice : '' });
                            }} 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none"
                        >
                            <option value="">-- Select Product --</option>
                            {products.map(p => <option key={p.id} value={p.name}>{p.name} (Stock: {p.stock})</option>)}
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" step="0.01" placeholder="Qty" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm" />
                            <input type="number" step="0.01" placeholder="Rate" value={currentItem.rate} onChange={e => setCurrentItem({...currentItem, rate: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-indigo-600" />
                        </div>
                        
                        <button onClick={addItemToBill} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition-all flex justify-center items-center gap-2">
                            <PlusCircle size={16}/> ADD TO LIST
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. INVOICE PREVIEW */}
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Draft Invoice</h3>
                        <p className="text-xs font-bold text-indigo-600">{customerName || "Unknown Customer"}</p>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">{billItems.length} Items</span>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b"><th className="px-8 py-5">Product</th><th className="px-8 py-5 text-center">Qty</th><th className="px-8 py-5 text-center">Rate</th><th className="px-8 py-5 text-right">Total</th><th className="px-8 py-5 text-right">Action</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {billItems.map(item => (
                                <tr key={item.id} className="hover:bg-indigo-50/10">
                                    <td className="px-8 py-4 font-bold text-slate-700">{item.productName}</td>
                                    <td className="px-8 py-4 text-center font-bold text-slate-600">{item.quantity}</td>
                                    <td className="px-8 py-4 text-center text-xs font-medium text-slate-500">₹{item.rate}</td>
                                    <td className="px-8 py-4 text-right font-black text-slate-800">₹{item.total.toLocaleString()}</td>
                                    <td className="px-8 py-4 text-right"><button onClick={() => removeBillItem(item.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button></td>
                                </tr>
                            ))}
                            {billItems.length === 0 && <tr><td colSpan="5" className="py-20 text-center text-slate-300 italic font-bold">No items added to bill yet.</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p>
                        <h2 className="text-3xl font-black">₹{Math.round(wholesaleTotal).toLocaleString()}</h2>
                    </div>
                    <button 
                        onClick={finalizeWholesaleBill} 
                        disabled={loading || billItems.length === 0}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Generating..." : <><Truck size={20}/> FINALIZE & DISPATCH</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Sales;