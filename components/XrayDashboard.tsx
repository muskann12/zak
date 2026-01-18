import React, { useState, useEffect, useMemo } from 'react';
import { fetchDemoProducts, getMarketplaceComparisons, calculateProfit } from '../services/api';
import { Product, SortConfig, MarketplaceComparison } from '../types';
import { ArrowUpDown, Download, Filter, Star, RefreshCw, X, Search, Globe, ExternalLink, Calculator, TrendingUp, Info, ArrowRight, DollarSign, Package, Percent, Sun, Moon, BarChart2, Layers, Zap, MoreHorizontal, ArrowUpRight, ArrowDownRight, Printer, Share2 } from 'lucide-react';

interface XrayDashboardProps {
  onClose: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Helper: Custom Keepa-Style Chart Component
const KeepaChart = ({ priceHistory, bsrHistory }: { priceHistory: any[], bsrHistory: any[] }) => {
    // Safety Check
    if (!priceHistory || !Array.isArray(priceHistory) || priceHistory.length === 0 || !bsrHistory || !Array.isArray(bsrHistory)) {
        return (
            <div className="w-full h-40 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-400">No historical data available</span>
            </div>
        );
    }

    // Canvas dimensions: 100% width, 200px height. 
    // We normalize data to SVG coordinates (0-100 x, 0-100 y)
    
    // Guard against identical min/max to prevent division by zero
    const prices = priceHistory.map(d => d.value);
    let maxPrice = Math.max(...prices) * 1.1;
    let minPrice = Math.min(...prices) * 0.9;
    if (maxPrice === minPrice) { maxPrice += 10; minPrice -= 10; } // Fallback range

    const ranks = bsrHistory.map(d => d.value);
    let maxBsr = Math.max(...ranks) * 1.1;
    let minBsr = Math.min(...ranks) * 0.9;
    if (maxBsr === minBsr) { maxBsr += 100; minBsr -= 100; } // Fallback range

    const width = 100;
    const height = 60; 

    // Helper to map value to Y coordinate (inverted for SVG)
    const mapY = (val: number, min: number, max: number) => {
        if (max === min) return height / 2;
        return height - ((val - min) / (max - min) * height);
    };
    const mapX = (idx: number, length: number) => {
        if (length <= 1) return width / 2;
        return (idx / (length - 1)) * width;
    };

    const pricePoints = priceHistory.map((d, i) => `${mapX(i, priceHistory.length)},${mapY(d.value, minPrice, maxPrice)}`).join(' ');
    const bsrPoints = bsrHistory.map((d, i) => `${mapX(i, bsrHistory.length)},${mapY(d.value, minBsr, maxBsr)}`).join(' ');

    return (
        <div className="relative w-full h-40 bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden p-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="2"/>
                <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="2"/>
                
                {/* Price Line (Green) */}
                <polyline points={pricePoints} fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* BSR Line (Blue/Purple) */}
                <polyline points={bsrPoints} fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            </svg>
            
            {/* Legend Overlay */}
            <div className="absolute top-2 left-2 flex gap-3 text-[9px] font-bold bg-white/80 dark:bg-black/50 p-1 rounded backdrop-blur-sm">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Price</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Rank</div>
            </div>
            
            <div className="absolute bottom-1 right-2 text-[8px] text-gray-400 font-mono">Last 90 Days</div>
        </div>
    );
};

export const XrayDashboard: React.FC<XrayDashboardProps> = ({ onClose, isDarkMode, toggleTheme }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<any | null>(null); // State for charts
  const [filterText, setFilterText] = useState('');

  // Live Calculator State
  const [calcValues, setCalcValues] = useState({
    sellPrice: 0,
    costPrice: 0,
    quantity: 1,
    fbaFees: 0,
    referralFeePct: 15,
  });

  // Profit Data from Backend
  const [profitData, setProfitData] = useState({
    refFee: 0,
    totalFees: 0,
    profitPerUnit: 0,
    totalProfit: 0,
    margin: 0,
    roi: 0
  });

  // Calculate Niche Score based on visible data
  const nicheScore = useMemo(() => {
     if (products.length === 0) return 0;
     const avgRev = products.reduce((a,b) => a + b.revenue, 0) / products.length;
     const avgRevScore = Math.min(avgRev / 10000, 10);
     const competitionScore = 10 - Math.min(products.reduce((a,b) => a + b.reviewCount, 0) / products.length / 100, 10);
     return Math.min(Math.max(((avgRevScore * 0.6) + (competitionScore * 0.4)), 1), 10).toFixed(1);
  }, [products]);

  const comparisons = useMemo(() => {
    return selectedProduct ? getMarketplaceComparisons(selectedProduct) : [];
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      setCalcValues({
        sellPrice: selectedProduct.price,
        costPrice: comparisons[0]?.price || selectedProduct.price * 0.4,
        quantity: 1,
        fbaFees: selectedProduct.fees,
        referralFeePct: 15,
      });
    }
  }, [selectedProduct, comparisons]);

  // Backend Profit Calculation Effect
  useEffect(() => {
    const fetchProfit = async () => {
        if (!selectedProduct) return;
        const data = await calculateProfit(calcValues);
        setProfitData(data);
    };

    // Debounce to prevent too many API calls
    const timer = setTimeout(fetchProfit, 300);
    return () => clearTimeout(timer);
  }, [calcValues, selectedProduct]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchDemoProducts(60);
        if (Array.isArray(data)) {
            setProducts(data);
        } else {
            console.error('Data format invalid:', data);
            setProducts([]);
        }
      } catch (e) {
          console.error("Failed to load demo products", e);
          setProducts([]);
      } finally {
          setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    let items = [...products];
    if (filterText) {
      const lower = filterText.toLowerCase();
      items = items.filter(p => 
        p.title.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.asin.toLowerCase().includes(lower)
      );
    }
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [products, sortConfig, filterText]);

  const stats = useMemo(() => {
    if (sortedProducts.length === 0) return { total: 0, avgPrice: 0, avgRating: 0, avgReviews: 0, totalRev: 0, avgLqs: 0 };
    const total = sortedProducts.length;
    const avgPrice = sortedProducts.reduce((acc, curr) => acc + curr.price, 0) / total;
    const avgRating = sortedProducts.reduce((acc, curr) => acc + curr.rating, 0) / total;
    const avgReviews = sortedProducts.reduce((acc, curr) => acc + curr.reviewCount, 0) / total;
    const avgLqs = sortedProducts.reduce((acc, curr) => acc + (curr.lqs || 0), 0) / total;
    const totalRev = sortedProducts.reduce((acc, curr) => acc + curr.revenue, 0);
    return { total, avgPrice, avgRating, avgReviews, totalRev, avgLqs };
  }, [sortedProducts]);

  const handleExportCSV = () => {
    if (sortedProducts.length === 0) return;
    const headers = ["ASIN", "Title", "Brand", "Price", "Est. Sales", "Revenue", "BSR", "Rating", "Review Count", "Seller Type", "LQS", "Fees", "Image URL"];
    const csvContent = [
      headers.join(','),
      ...sortedProducts.map(p => [p.asin, `"${p.title.replace(/"/g, '""')}"`, `"${p.brand.replace(/"/g, '""')}"`, p.price.toFixed(2), p.estSales, p.revenue.toFixed(2), p.bsr, p.rating, p.reviewCount, p.sellerType, p.lqs, p.fees.toFixed(2), p.imgUrl].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ex_zakvibe_pro_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
        <div className="fixed inset-0 bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center z-50">
            <div className="relative">
                <div className="w-20 h-20 border-t-2 border-b-2 border-brand rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-brand text-2xl tracking-tighter">ZV</div>
            </div>
            <p className="text-gray-900 dark:text-white mt-6 font-medium text-sm tracking-widest uppercase">Initializing Xray Engine...</p>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-[#050505] z-40 flex flex-col text-sm overflow-hidden animate-in fade-in duration-300 transition-colors duration-300 font-sans">
      
      {/* 1. Pro Header - Financial Terminal Style */}
      <div className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#222] shadow-sm z-20">
          <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                      <div className="bg-brand text-white dark:text-black w-7 h-7 rounded flex items-center justify-center font-bold text-sm shadow-sm">Z</div>
                      <span className="font-bold text-base text-gray-900 dark:text-white tracking-tight">Ex-<span className="text-brand">ZakVibe</span> <span className="text-xs text-gray-400 font-medium ml-1 bg-gray-100 dark:bg-[#222] px-1.5 py-0.5 rounded">PRO v2.4</span></span>
                  </div>
                  <div className="h-6 w-px bg-gray-200 dark:bg-[#333]"></div>
                  <div className="flex gap-4">
                      <div className="hidden lg:block">
                          <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Market Volume</div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                              ${stats.totalRev.toLocaleString()} <span className="text-[10px] text-green-500 font-medium bg-green-50 dark:bg-green-900/20 px-1 rounded">+12%</span>
                          </div>
                      </div>
                      <div className="hidden lg:block">
                          <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Opportunity Score</div>
                          <div className={`text-sm font-bold flex items-center gap-1 ${Number(nicheScore) > 7 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {nicheScore} / 10
                              <div className="flex gap-0.5">
                                  {[...Array(5)].map((_,i) => <div key={i} className={`w-1 h-2 rounded-sm ${i < Number(nicheScore)/2 ? (Number(nicheScore) > 7 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-gray-200 dark:bg-[#333]'}`}></div>)}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                  <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={14} />
                      <input 
                        type="text" 
                        placeholder="Filter Results..." 
                        value={filterText} 
                        onChange={(e) => setFilterText(e.target.value)} 
                        className="bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#333] rounded-md text-xs text-gray-900 dark:text-white pl-9 pr-3 py-1.5 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none w-48 transition-all" 
                      />
                  </div>
                  <div className="h-6 w-px bg-gray-200 dark:bg-[#333] mx-1"></div>
                  <button onClick={handleExportCSV} className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222] rounded transition" title="Export CSV"><Download size={18}/></button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222] rounded transition" title="Print Report"><Printer size={18}/></button>
                  <button onClick={toggleTheme} className="p-1.5 text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-[#222] rounded transition">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                  <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition ml-2"><X size={18}/></button>
              </div>
          </div>
          
          {/* Sub-Header / Summary Stats Bar */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#222] flex gap-6 overflow-x-auto">
               <div className="flex items-center gap-2 text-xs">
                   <span className="text-gray-500 font-medium">Avg Price:</span>
                   <span className="font-bold text-gray-900 dark:text-white">${stats.avgPrice.toFixed(2)}</span>
               </div>
               <div className="flex items-center gap-2 text-xs">
                   <span className="text-gray-500 font-medium">Avg Reviews:</span>
                   <span className="font-bold text-gray-900 dark:text-white">{Math.round(stats.avgReviews).toLocaleString()}</span>
               </div>
               <div className="flex items-center gap-2 text-xs">
                   <span className="text-gray-500 font-medium">Avg LQS:</span>
                   <span className="font-bold text-gray-900 dark:text-white">{stats.avgLqs.toFixed(1)}</span>
               </div>
               <div className="flex items-center gap-2 text-xs">
                   <span className="text-gray-500 font-medium">High Demand:</span>
                   <span className="font-bold text-green-600 dark:text-green-500">Yes</span>
               </div>
          </div>
      </div>

      {/* 2. Main Data Table - Dense Financial Look */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#050505] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#333]">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-[#111] sticky top-0 z-10 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shadow-sm">
                <tr>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-center w-12">#</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] w-14">Img</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] cursor-pointer hover:text-brand transition" onClick={() => handleSort('title')}>Product Details <ArrowUpDown size={10} className="inline ml-1 opacity-50"/></th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-center cursor-pointer hover:text-brand transition" onClick={() => handleSort('brand')}>Brand</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-right cursor-pointer hover:text-brand transition" onClick={() => handleSort('price')}>Price</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-right cursor-pointer hover:text-brand transition" onClick={() => handleSort('estSales')}>Sales (Mo)</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-right cursor-pointer hover:text-brand transition" onClick={() => handleSort('revenue')}>Revenue</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-center cursor-pointer hover:text-brand transition" onClick={() => handleSort('bsr')}>BSR</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-center">LQS</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-center">Type</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-right">Fees</th>
                    <th className="px-3 py-3 border-b border-gray-200 dark:border-[#222] text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1a1a1a] text-gray-700 dark:text-gray-300 text-[11px] font-medium">
                {sortedProducts.map((p, idx) => (
                    <tr key={p.asin} className="hover:bg-blue-50/50 dark:hover:bg-[#111] transition group">
                        <td className="px-3 py-2 text-center text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <div className="w-8 h-8 bg-white rounded border border-gray-200 dark:border-[#333] p-0.5 relative group-hover:scale-150 transition-transform origin-left z-0 group-hover:z-10 shadow-sm">
                            <img src={p.imgUrl} className="w-full h-full object-contain" />
                          </div>
                        </td>
                        <td className="px-3 py-2 max-w-[240px]">
                            <div className="truncate text-gray-900 dark:text-white hover:text-brand cursor-pointer mb-0.5" title={p.title}>{p.title}</div>
                            <div className="flex gap-2 text-[10px] text-gray-400 font-mono">
                                <span>{p.asin}</span>
                                <span className="text-gray-300 dark:text-[#333]">•</span>
                                <span className="flex items-center gap-0.5 text-yellow-600 dark:text-yellow-500"><Star size={8} fill="currentColor"/> {p.rating} ({p.reviewCount})</span>
                            </div>
                        </td>
                        <td className="px-3 py-2 text-center text-gray-500 truncate max-w-[80px]" title={p.brand}>{p.brand}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">${p.price.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{p.estSales.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">${p.revenue.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center font-mono text-gray-500">#{p.bsr.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.lqs >= 7 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
                                {p.lqs}
                            </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">{p.sellerType}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-red-500 dark:text-red-400">-${p.fees.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <button 
                                    onClick={() => setShowHistoryModal(p)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded text-blue-500 transition" 
                                    title="View History Graph"
                                >
                                    <BarChart2 size={14} />
                                </button>
                                <button 
                                    onClick={() => setSelectedProduct(p)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#333] rounded text-brand transition" 
                                    title="Profit Calculator"
                                >
                                    <Calculator size={14} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      {/* 3. History Modal (Keepa Style) */}
      {showHistoryModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#333] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-[#333] flex justify-between items-center bg-gray-50 dark:bg-[#151515]">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              {showHistoryModal.title}
                              <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-[#333] rounded text-gray-600 dark:text-gray-300 font-mono">{showHistoryModal.asin}</span>
                          </h3>
                      </div>
                      <button onClick={() => setShowHistoryModal(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6">
                      <div className="flex gap-8 mb-6">
                          <div className="flex-1">
                              <div className="text-[10px] text-gray-500 uppercase font-bold mb-2">Price & Rank History (90 Days)</div>
                              <KeepaChart priceHistory={showHistoryModal.priceHistory} bsrHistory={showHistoryModal.bsrHistory} />
                          </div>
                          <div className="w-64 space-y-4">
                              <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-100 dark:border-[#222]">
                                  <div className="text-xs text-gray-500 mb-1">Current Price</div>
                                  <div className="text-xl font-bold text-gray-900 dark:text-white">${showHistoryModal.price}</div>
                              </div>
                              <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-100 dark:border-[#222]">
                                  <div className="text-xs text-gray-500 mb-1">Current Rank</div>
                                  <div className="text-xl font-bold text-brand">#{showHistoryModal.bsr.toLocaleString()}</div>
                              </div>
                              <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border border-gray-100 dark:border-[#222]">
                                  <div className="text-xs text-gray-500 mb-1">Est. Monthly Sales</div>
                                  <div className="text-xl font-bold text-green-600 dark:text-green-500">{showHistoryModal.estSales}</div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-[#222]">
                          <div>
                              <div className="text-[10px] text-gray-400 uppercase font-bold">Review Velocity</div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">+{showHistoryModal.reviewVelocity} / mo</div>
                          </div>
                          <div>
                              <div className="text-[10px] text-gray-400 uppercase font-bold">Listing Quality</div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{showHistoryModal.lqs} / 10</div>
                          </div>
                          <div>
                              <div className="text-[10px] text-gray-400 uppercase font-bold">Seller Country</div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">CN (China)</div>
                          </div>
                          <div>
                              <div className="text-[10px] text-gray-400 uppercase font-bold">Buy Box Share</div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">92%</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 4. Profit Calculator Modal (Matches previous upgrade but with consistent theme) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/90 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-gray-200 dark:border-[#222] flex justify-between items-center bg-gray-50 dark:bg-[#151515]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 border border-gray-200 dark:border-[#333]">
                            <img src={selectedProduct.imgUrl} className="object-contain max-h-full" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">{selectedProduct.title}</h3>
                            <div className="flex items-center gap-3 text-[10px] font-bold">
                                <span className="text-brand bg-brand/10 px-1.5 py-0.5 rounded">ASIN: {selectedProduct.asin}</span>
                                <span className="text-gray-500 dark:text-gray-400">Amazon Price: <span className="text-gray-900 dark:text-white">${selectedProduct.price}</span></span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-[#222] rounded-full text-gray-500 hover:text-white transition">
                      <X size={20}/>
                    </button>
                </div>
                
                <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-white dark:bg-[#0a0a0a]">
                    {/* Left: Sourcing Comparisons */}
                    <div className="lg:w-3/5 p-6 border-r border-gray-200 dark:border-[#222] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <Globe size={16} className="text-brand"/> Sourcing Comparisons
                            </h4>
                            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Prices detected automatically</span>
                        </div>
                        
                        <div className="space-y-3">
                            {comparisons.map((comp, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border transition-all flex items-center justify-between group ${idx === 0 ? 'bg-orange-50 dark:bg-[#1a1500] border-orange-200 dark:border-orange-900/30' : 'bg-white dark:bg-[#111] border-gray-200 dark:border-[#222] hover:border-gray-300 dark:hover:border-[#444]'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center font-black text-[10px] ${idx === 0 ? 'bg-brand text-white dark:text-black' : 'bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400'}`}>
                                            {comp.logo}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                                {comp.name}
                                                {idx === 0 && <span className="text-[9px] bg-brand text-white dark:text-black px-1.5 rounded-sm font-black uppercase">Best Match</span>}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-medium">Shipping: {comp.shipping}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">${comp.price}</div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] text-green-600 dark:text-green-500 font-bold uppercase">Save ${(selectedProduct.price - comp.price).toFixed(2)}</span>
                                            <button 
                                                onClick={() => setCalcValues({ ...calcValues, costPrice: comp.price })}
                                                className="opacity-0 group-hover:opacity-100 text-[9px] bg-gray-900 dark:bg-white text-white dark:text-black px-2 py-0.5 rounded font-bold transition"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Live Profit Calculator */}
                    <div className="lg:w-2/5 p-6 bg-gray-50 dark:bg-[#111] overflow-y-auto">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Calculator size={16} className="text-brand"/> Profitability Analysis
                        </h4>
                        
                        <div className="space-y-4">
                            {/* Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] text-gray-500 mb-1 uppercase font-bold tracking-wider">Sell Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                        <input type="number" className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#333] rounded-lg p-2 pl-6 text-sm font-bold text-gray-900 dark:text-white focus:border-brand outline-none" value={calcValues.sellPrice} onChange={(e) => setCalcValues({...calcValues, sellPrice: Number(e.target.value)})}/>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] text-gray-500 mb-1 uppercase font-bold tracking-wider">Unit Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                        <input type="number" className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-[#333] rounded-lg p-2 pl-6 text-sm font-bold text-gray-900 dark:text-white focus:border-brand outline-none" value={calcValues.costPrice} onChange={(e) => setCalcValues({...calcValues, costPrice: Number(e.target.value)})}/>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Breakdown */}
                            <div className="bg-white dark:bg-[#0a0a0a] rounded-lg p-3 border border-gray-200 dark:border-[#333]">
                                <h5 className="text-[9px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Deductions</h5>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>FBA Fee</span><span>${calcValues.fbaFees.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Referral (15%)</span><span>${profitData.refFee.toFixed(2)}</span></div>
                                    <div className="h-px bg-gray-100 dark:bg-[#222] my-1"></div>
                                    <div className="flex justify-between font-bold text-gray-900 dark:text-white"><span>Total Fees</span><span>${profitData.totalFees.toFixed(2)}</span></div>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-3 rounded-lg border text-center ${profitData.margin > 20 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'}`}>
                                    <div className="text-[9px] uppercase font-bold opacity-60">Net Margin</div>
                                    <div className={`text-lg font-black ${profitData.margin > 20 ? 'text-green-600 dark:text-green-500' : 'text-yellow-600 dark:text-yellow-500'}`}>{profitData.margin.toFixed(1)}%</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] text-center">
                                    <div className="text-[9px] uppercase font-bold text-gray-500">ROI</div>
                                    <div className="text-lg font-black text-blue-600 dark:text-blue-500">{profitData.roi.toFixed(1)}%</div>
                                </div>
                            </div>

                            {/* Total Profit */}
                            <div className="bg-gray-900 dark:bg-white text-white dark:text-black p-4 rounded-xl text-center shadow-lg">
                                <div className="text-[9px] uppercase font-bold opacity-70 mb-1">Net Profit / Unit</div>
                                <div className="text-3xl font-black">${profitData.profitPerUnit.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
