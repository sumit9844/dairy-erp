import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, PlusCircle, TrendingUp, Package, ShoppingCart, 
  Trash2, Minus, Plus, Store, Receipt, User, Check, 
  Printer, X, History, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Sales = () => {
  const [mode, setMode] = useState('RETAIL'); // 'RETAIL', 'WHOLESALE', 'HISTORY'
  const [salesHistory, setSalesHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- RETAIL STATE ---
  const [cart, setCart] = useState([]);

  // --- WHOLESALE STATE ---
  const [customerName, setCustomerName] = useState("");
  const [billItems, setBillItems] = useState([]); 
  const [currentItem, setCurrentItem] = useState({ productName: '', quantity: '', rate: '' });
  
  // --- INVOICE PRINT STATE ---
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, prodRes, settingsRes] = await Promise.all([
        axios.get('https://dairy-erp-backend.onrender.com/api/sales'),
        axios.get('https://dairy-erp-backend.onrender.com/api/products'),
        axios.get('https://dairy-erp-backend.onrender.com/api/settings')
      ]);
      setSalesHistory(salesRes.data);
      setProducts(prodRes.data);
      setCompanyInfo(settingsRes.data);
    } catch (err) { console.error(err); }
  };

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistory = salesHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salesHistory.length / itemsPerPage);

  // --- REPRINT LOGIC ---
  const handleReprint = (saleItem) => {
    // Convert single sale record into invoice format
    setCurrentInvoice({
        customer: saleItem.customerName,
        items: [{ 
            productName: saleItem.productName || "Product", // Fallback if name missing
            quantity: saleItem.quantity, 
            rate: saleItem.rate, 
            total: saleItem.totalAmount 
        }],
        total: saleItem.totalAmount,
        date: new Date(saleItem.date).toLocaleDateString()
    });
    setShowInvoice(true);
  };

  // ==============================
  // 1. RETAIL POS LOGIC
  // ==============================
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]); 
    }
  };

  const updateCartQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = parseFloat((item.qty + delta).toFixed(3)); 
        return { ...item, qty: Math.max(0.05, newQty) }; 
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
      for (const item of cart) {
        await axios.post('https://dairy-erp-backend.onrender.com/api/sales', {
            customerName: "Local Counter", 
            productName: item.name,
            quantity: item.qty,
            rate: item.sellingPrice,
            date: new Date().toISOString().split('T')[0]
        });
      }
      
      setCurrentInvoice({
        customer: "Local Counter",
        items: cart.map(i => ({ productName: i.name, quantity: i.qty, rate: i.sellingPrice, total: i.qty * i.sellingPrice })),
        total: cart.reduce((acc, item) => acc + (item.qty * item.sellingPrice), 0),
        date: new Date().toLocaleDateString()
      });
      setShowInvoice(true);

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
    
    const lineTotal = parseFloat(currentItem.quantity) * parseFloat(currentItem.rate);
    const itemWithTotal = { ...currentItem, total: lineTotal, id: Date.now() };

    setBillItems([...billItems, itemWithTotal]);
    setCurrentItem({ productName: '', quantity: '', rate: '' }); 
  };

  const removeBillItem = (id) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const finalizeWholesaleBill = async () => {
    if(!customerName) return alert("Enter Customer Name");
    if(billItems.length === 0) return alert("Add items first");
    
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
        
        setCurrentInvoice({
            customer: customerName,
            items: billItems,
            total: billItems.reduce((acc, item) => acc + item.total, 0),
            date: new Date().toLocaleDateString()
        });
        setShowInvoice(true);

        setBillItems([]);
        setCustomerName("");
        fetchData();
    } catch (err) {
        alert("Error saving bill.");
    } finally {
        setLoading(false);
    }
  };

  const retailTotal = cart.reduce((acc, item) => acc + (item.qty * item.sellingPrice), 0);
  const wholesaleTotal = billItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
        <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Sales Terminal</h1>
            <p className="text-sm text-slate-500 font-medium">Select mode of operation</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => setMode('RETAIL')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'RETAIL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <Store size={18} /> Retail
            </button>
            <button onClick={() => setMode('WHOLESALE')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'WHOLESALE' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <Receipt size={18} /> Wholesale
            </button>
            <button onClick={() => setMode('HISTORY')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${mode === 'HISTORY' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <History size={18} /> History
            </button>
        </div>
      </div>

      {/* --- RETAIL MODE --- */}
      {mode === 'RETAIL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
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
                            <div className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity"><PlusCircle size={20} /></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-200 flex flex-col h-[650px]">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <ShoppingCart className="text-indigo-600" />
                    <h3 className="font-black text-slate-800 uppercase tracking-widest">Cart</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-black text-slate-700">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-500">₹{item.sellingPrice}</p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center bg-white rounded-lg border border-slate-200">
                                    <button onClick={() => updateCartQty(item.id, -0.5)} className="p-1.5 hover:bg-slate-100 text-slate-500"><Minus size={14}/></button>
                                    <input type="number" value={item.qty} onChange={(e) => setExactQty(item.id, e.target.value)} className="w-12 text-center text-xs font-bold outline-none"/>
                                    <button onClick={() => updateCartQty(item.id, 0.5)} className="p-1.5 hover:bg-slate-100 text-indigo-600"><Plus size={14}/></button>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => setExactQty(item.id, 0.2)} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">200g</button>
                                    <button onClick={() => setExactQty(item.id, 0.5)} className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">500g</button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t-2 border-slate-100 bg-slate-50 p-4 rounded-3xl">
                    <div className="flex justify-between items-end mb-4"><span className="text-xs font-bold text-slate-400 uppercase">Total Payable</span><span className="text-3xl font-black text-indigo-600">₹{Math.round(retailTotal).toLocaleString()}</span></div>
                    <button onClick={checkoutRetail} disabled={loading || cart.length === 0} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">{loading ? "Processing..." : <><Check size={20}/> PAY & PRINT</>}</button>
                </div>
            </div>
        </div>
      )}

      {/* --- WHOLESALE MODE --- */}
      {mode === 'WHOLESALE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
            <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 h-fit">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Create New Invoice</h3>
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2"><User size={12}/> Customer / Hotel Name</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl font-bold text-indigo-900 outline-none focus:border-indigo-500" placeholder="e.g. Hotel Grand" /></div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Add Line Item</p>
                        <select value={currentItem.productName} onChange={e => {const prod = products.find(p => p.name === e.target.value); setCurrentItem({...currentItem, productName: e.target.value, rate: prod ? prod.sellingPrice : '' });}} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none"><option value="">-- Select Product --</option>{products.map(p => <option key={p.id} value={p.name}>{p.name} (Stock: {p.stock})</option>)}</select>
                        <div className="grid grid-cols-2 gap-3"><input type="number" step="0.01" placeholder="Qty" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm" /><input type="number" step="0.01" placeholder="Rate" value={currentItem.rate} onChange={e => setCurrentItem({...currentItem, rate: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-indigo-600" /></div>
                        <button onClick={addItemToBill} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition-all flex justify-center items-center gap-2"><PlusCircle size={16}/> ADD TO LIST</button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center"><div><h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Draft Invoice</h3><p className="text-xs font-bold text-indigo-600">{customerName || "Unknown Customer"}</p></div><span className="text-[10px] bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">{billItems.length} Items</span></div>
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left"><thead><tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest border-b"><th className="px-8 py-5">Product</th><th className="px-8 py-5 text-center">Qty</th><th className="px-8 py-5 text-center">Rate</th><th className="px-8 py-5 text-right">Total</th><th className="px-8 py-5 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-50">{billItems.map(item => (<tr key={item.id} className="hover:bg-indigo-50/10"><td className="px-8 py-4 font-bold text-slate-700">{item.productName}</td><td className="px-8 py-4 text-center font-bold text-slate-600">{item.quantity}</td><td className="px-8 py-4 text-center text-xs font-medium text-slate-500">₹{item.rate}</td><td className="px-8 py-4 text-right font-black text-slate-800">₹{item.total.toLocaleString()}</td><td className="px-8 py-4 text-right"><button onClick={() => removeBillItem(item.id)} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button></td></tr>))}</tbody></table>
                </div>
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total</p><h2 className="text-3xl font-black">₹{Math.round(wholesaleTotal).toLocaleString()}</h2></div><button onClick={finalizeWholesaleBill} disabled={loading || billItems.length === 0} className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50">{loading ? "Generating..." : <><Truck size={20}/> FINALIZE & DISPATCH</>}</button></div>
            </div>
        </div>
      )}

      {/* --- HISTORY MODE (With Pagination & Reprint) --- */}
      {mode === 'HISTORY' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden print:hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><History size={18} /> Transaction History</h3>
                <span className="text-xs font-bold text-slate-400">{salesHistory.length} Records Found</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Customer</th>
                            <th className="px-8 py-5">Product (Item)</th>
                            <th className="px-8 py-5 text-center">Volume</th>
                            <th className="px-8 py-5 text-right">Revenue</th>
                            <th className="px-8 py-5 text-right">Reprint</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentHistory.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                                <td className="px-8 py-5 font-black text-slate-800 uppercase">{s.customerName}</td>
                                <td className="px-8 py-5 text-sm font-medium text-slate-600">
                                    {s.quantity} {s.productName ? `x ${s.productName}` : 'x Item'}
                                </td>
                                <td className="px-8 py-5 text-center font-bold text-indigo-600">{s.quantity.toFixed(2)}</td>
                                <td className="px-8 py-5 text-right font-black text-emerald-600">₹{s.totalAmount.toLocaleString()}</td>
                                <td className="px-8 py-5 text-right">
                                    <button 
                                        onClick={() => handleReprint(s)}
                                        className="p-2 bg-slate-100 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-all text-slate-400"
                                    >
                                        <Printer size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* PAGINATION CONTROLS */}
                {salesHistory.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-100">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="p-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-all"
                        >
                            <ChevronLeft size={16}/>
                        </button>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                        <button 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="p-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-slate-100 transition-all"
                        >
                            <ChevronRight size={16}/>
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- INVOICE MODAL (PRINT PREVIEW) --- */}
      {showInvoice && currentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-lg uppercase tracking-tight">Invoice Generated</h3>
                    <button onClick={() => setShowInvoice(false)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X size={18}/></button>
                </div>
                
                {/* RECEIPT CONTENT */}
                <div className="p-8" id="print-receipt">
                    <div className="text-center mb-6 border-b-2 border-dashed border-slate-200 pb-6">
                        <h2 className="text-xl font-black text-slate-900 uppercase">{companyInfo?.companyName || "DAIRY ERP"}</h2>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{companyInfo?.address}</p>
                        <p className="text-[10px] font-bold text-slate-400">PH: {companyInfo?.phone}</p>
                    </div>
                    
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-4">
                        <span>{currentInvoice.date}</span>
                        <span className="uppercase">{currentInvoice.customer}</span>
                    </div>

                    <div className="space-y-2 mb-6">
                        {currentInvoice.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm border-b border-slate-50 pb-1">
                                <span className="text-slate-800 font-medium">{item.productName} <span className="text-[10px] text-slate-400">x{item.quantity}</span></span>
                                <span className="font-black text-slate-900">₹{item.total.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-end">
                        <span className="text-xs font-bold text-slate-500 uppercase">Grand Total</span>
                        <span className="text-2xl font-black text-slate-900">₹{Math.round(currentInvoice.total).toLocaleString()}</span>
                    </div>
                    
                    <p className="text-center text-[9px] font-bold text-slate-300 mt-8 uppercase italic">Thank you for your business</p>
                </div>

                <div className="p-4 bg-slate-50 flex gap-4">
                    <button onClick={() => setShowInvoice(false)} className="flex-1 py-3 text-xs font-black text-slate-500 hover:text-slate-800">CLOSE</button>
                    <button onClick={() => window.print()} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg">
                        <Printer size={16} /> PRINT RECEIPT
                    </button>
                </div>
            </div>
            
            {/* CSS to ensure only the receipt prints */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-receipt, #print-receipt * { visibility: visible; }
                    #print-receipt { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 20px; }
                }
            `}</style>
        </div>
      )}

    </div>
  );
};

export default Sales;