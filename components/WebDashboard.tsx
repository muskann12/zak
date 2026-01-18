import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Referral } from '../types';
import { getUserDashboard, withdrawFunds, generateReferralCode, getNotifications, markNotificationsRead, WithdrawalRequest } from '../services/api';
import { generateExtensionZip } from '../services/extensionGenerator';
import { Wallet, Users, Copy, CheckCircle, ArrowRight, Smartphone, History, Loader2, LogOut, Chrome, Sun, Moon, Timer, Ticket, Download, ChevronDown, Bell, Search, MoreHorizontal, FileText, ArrowUp, ArrowDown, ShieldAlert, Info, Zap, AlertCircle, X } from 'lucide-react';

interface WebDashboardProps {
  user: User;
  onLogout: () => void;
  onLaunchExtension: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({ user: initialUser, onLogout, onLaunchExtension, isDarkMode, toggleTheme }) => {
  
  // 1. STRICT FRONTEND GUARD: Prevents rendering if local state is tampered or incorrect
  if (initialUser.role !== 'trainer') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white p-4">
              <div className="bg-white dark:bg-[#111] p-8 rounded-xl border border-red-100 dark:border-red-900/30 text-center shadow-lg max-w-sm w-full animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldAlert size={32} />
                  </div>
                  <h1 className="text-xl font-bold mb-2">Access Denied</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                      You do not have permission to view the Trainer Dashboard.
                  </p>
                  <button 
                    onClick={onLogout} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition"
                  >
                    Log Out
                  </button>
              </div>
          </div>
      );
  }

  // Use local state for user to allow immediate UI updates
  const [user, setUser] = useState<User>(initialUser);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // UI State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [processingWithdraw, setProcessingWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  // Table Logic
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Referral, direction: 'asc' | 'desc' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending'>('All');

  // Referral Code Logic
  const [generatedCode, setGeneratedCode] = useState<string | null>(user.activeReferralCode || null);
  const [codeExpiry, setCodeExpiry] = useState<number | null>(user.referralCodeExpiry || null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [downloadingExt, setDownloadingExt] = useState(false);

  // Load Data with Security Check
  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true);
            // 2. BACKEND GUARD VALIDATION
            // This API call hits /api/v1/user/dashboard which is now protected by 'trainerOnly' middleware.
            // If the token belongs to a 'user' role (even if frontend checks were bypassed), this will throw 403.
            const dashboardData = await getUserDashboard();
            
            setUser(prev => ({
                ...prev,
                walletBalance: dashboardData.walletBalance,
                referralCount: dashboardData.referralCount,
                activeReferralCode: dashboardData.activeReferralCode,
                referralCodeExpiry: dashboardData.referralCodeExpiry
            }));
            
            setReferrals(dashboardData.referrals || []);
            setGeneratedCode(dashboardData.activeReferralCode || null);
            // Fetch Notifications
            try {
                const notifData = await getNotifications();
                setNotifications(notifData.notifications || []);
                setUnreadCount(notifData.unreadCount || 0);
            } catch (e) {
                console.error('Failed to load notifications:', e);
            }

            setCodeExpiry(dashboardData.referralCodeExpiry || null);

        } catch (err: any) {
            console.error("Dashboard Load Error:", err);
            // 3. SECURITY FALLBACK
            // If API returns 403 (Forbidden) or 401 (Unauthorized), force immediate logout.
            // This handles cases where a user might manually manipulate URL or LocalStorage.
            onLogout(); 
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []); // eslint-disable-line

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
        if (codeExpiry) {
            const now = Date.now();
            const diff = codeExpiry - now;

            if (diff <= 0) {
                setGeneratedCode(null);
                setCodeExpiry(null);
                setTimeLeft('');
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [codeExpiry]);

  // Computed Referrals
  const filteredReferrals = useMemo(() => {
    let items = [...referrals];
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        items = items.filter(r => r.name.toLowerCase().includes(lower) || r.id.toLowerCase().includes(lower));
    }
    if (statusFilter !== 'All') {
        items = items.filter(r => r.status === statusFilter);
    }
    if (sortConfig) {
        items.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    return items;
  }, [referrals, searchTerm, statusFilter, sortConfig]);

  // Handle notification click
  const handleNotificationClick = async () => {
    if (unreadCount > 0) {
        try {
            await markNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error('Failed to mark read:', e);
        }
    }
    setShowNotifications(!showNotifications);
  };

  const requestSort = (key: keyof Referral) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
        const { code, expiry } = await generateReferralCode(user.id);
        setGeneratedCode(code);
        setCodeExpiry(expiry);
        setUser(prev => ({...prev, activeReferralCode: code, referralCodeExpiry: expiry}));
    } catch (e) {
        alert("Failed to generate code");
    } finally {
        setGeneratingCode(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
        navigator.clipboard.writeText(generatedCode);
        alert("Referral Code copied!");
    }
  };

  const handleDownloadZip = async () => {
      setDownloadingExt(true);
      try { await generateExtensionZip(); } catch (e) { alert("Failed to generate ZIP"); } finally { setDownloadingExt(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingWithdraw(true);
    setWithdrawError(null);
    
    try {
        const request: WithdrawalRequest = {
            amount: Number(withdrawAmount),
            accountNumber: withdrawAccount,
            paymentMethod: withdrawMethod
        };
        
        const result = await withdrawFunds(request);
        
        if (result.success) {
            setUser(prev => ({ ...prev, walletBalance: result.newBalance }));
            setWithdrawSuccess(true);
            setTimeout(() => {
                setShowWithdrawModal(false);
                setWithdrawSuccess(false);
                setWithdrawAmount('');
                setWithdrawAccount('');
                setWithdrawError(null);
            }, 3000);
        }
    } catch (error: any) {
        setWithdrawError(error.message || 'Withdrawal failed. Please try again.');
    } finally {
        setProcessingWithdraw(false);
    }
  };

  const nextDiscountTarget = 10;
  const progressPercent = Math.min(((user?.referralCount || 0) / nextDiscountTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] text-gray-900 dark:text-gray-200 transition-colors duration-300 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#222] sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 py-4">
                <div className="bg-brand text-white dark:text-black w-8 h-8 rounded flex items-center justify-center font-bold text-lg shadow-sm">Z</div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none text-gray-900 dark:text-white tracking-tight">Ex-<span className="text-brand">ZakVibe</span></span>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
                <a href="#" className="text-gray-900 dark:text-white font-bold px-2 py-6 border-b-2 border-brand">Overview</a>
                <a href="#" className="hover:text-brand transition px-2 py-6 border-b-2 border-transparent hover:border-gray-200">Students</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 pr-4 border-r border-gray-200 dark:border-[#333]">
                <button onClick={toggleTheme} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 transition">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="relative" ref={notificationRef}>
                    <button onClick={handleNotificationClick} className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition relative ${showNotifications ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 px-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0a0a0a]">{unreadCount}</span>}
                    </button>
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl shadow-2xl shadow-black/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-gray-200 dark:border-[#222] flex justify-between items-center bg-gray-50 dark:bg-[#151515]">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Notifications</h4>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-gray-400">No notifications</div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className={`p-4 border-b border-gray-100 dark:border-[#222] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition flex gap-3 group ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/5' : ''}`}>
                                           <div className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500">
                                               <Wallet size={14} />
                                           </div>
                                           <div className="flex-1">
                                               <div className="flex justify-between items-start mb-0.5">
                                                   <span className="text-xs font-bold text-gray-900 dark:text-white">Payment Update</span>
                                                   <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
                                               </div>
                                               <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{n.message}</p>
                                           </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
             </div>
             <div className="flex items-center gap-3 cursor-pointer group" onClick={onLogout}>
                 <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">{user.name.charAt(0)}</div>
                 <div className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition">{user.name}</div>
                 <ChevronDown size={14} className="text-gray-400"/>
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-10 border-b border-gray-200 dark:border-[#222] pb-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Partner Portal</h2>
                    <h1 className="text-3xl md:text-4xl font-medium text-gray-900 dark:text-white tracking-tight text-balance">
                        Good Afternoon, <span className="font-bold">{user.name}</span>
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-2xl text-sm leading-relaxed">
                        Here is your daily performance overview. You have <span className="text-gray-900 dark:text-white font-bold">{user?.referralCount || 0} active students</span>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onLaunchExtension} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-white text-sm font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition hover:border-gray-300 dark:hover:border-[#444] shadow-sm">
                        <Chrome size={16} className="text-gray-400"/> Web Simulator
                    </button>
                    <button onClick={handleDownloadZip} disabled={downloadingExt} className="bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-black dark:hover:bg-gray-200 transition flex items-center gap-2">
                        {downloadingExt ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} Download Extension
                    </button>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Available Funds</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{(user?.walletBalance || 0).toLocaleString()} <span className="text-sm font-medium text-gray-400">PKR</span></div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-brand"><Wallet size={20} strokeWidth={1.5} /></div>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-500">+12.5%</div>
                    <button onClick={() => setShowWithdrawModal(true)} className="text-xs font-bold text-gray-900 dark:text-white hover:underline flex items-center gap-1">Withdraw <ArrowRight size={12}/></button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Students</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{user?.referralCount || 0}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-500"><Users size={20} strokeWidth={1.5} /></div>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="text-xs text-gray-500">Lifetime: <span className="font-bold text-gray-900 dark:text-white">{((user?.referralCount || 0) * 300).toLocaleString()} PKR</span></div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Partner Tier</div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">GOLD</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-purple-500"><Zap size={20} strokeWidth={1.5} /></div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-1.5 mt-2 mb-2 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="text-xs text-gray-500"><span className="font-bold text-gray-900 dark:text-white">{progressPercent.toFixed(0)}%</span> to Platinum</div>
            </div>
        </div>

        {/* Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-[#222] bg-gray-50/50 dark:bg-[#151515]">
                     <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider mb-4"><Ticket size={14} /> Discount Engine</div>
                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Generate Student Code</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">Create a code for <span className="font-bold text-gray-900 dark:text-white">150 PKR discount</span>.</p>
                     
                     <div className="flex flex-col gap-3">
                         <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg">
                             <div className="text-xs font-bold text-gray-500">Student Pays</div>
                             <div className="text-sm font-bold text-gray-900 dark:text-white">1350 PKR</div>
                         </div>
                         <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg">
                             <div className="text-xs font-bold text-gray-500">Your Commission</div>
                             <div className="text-sm font-bold text-brand">+300 PKR</div>
                         </div>
                     </div>
                </div>

                <div className="p-8 md:w-1/2 flex flex-col justify-center items-center">
                    {!generatedCode ? (
                        <div className="text-center w-full">
                            <button onClick={handleGenerateCode} disabled={generatingCode} className="w-full bg-brand hover:bg-brand-dark text-white dark:text-black font-bold py-4 rounded-xl transition shadow-lg shadow-brand/10 flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                                {generatingCode ? <Loader2 className="animate-spin" /> : 'Generate New Code'}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full text-center">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Code</div>
                            <div onClick={copyCode} className="bg-gray-50 dark:bg-[#0f0f0f] border border-dashed border-gray-300 dark:border-[#333] rounded-xl p-6 mb-4 cursor-pointer hover:border-brand transition group relative">
                                <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-widest">{generatedCode}</div>
                                <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-black/90 opacity-0 group-hover:opacity-100 transition text-xs font-bold text-brand"><Copy size={16} className="mr-1"/> Click to Copy</div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 py-2 rounded-lg mb-4"><Timer size={14} /> Expires in: {timeLeft}</div>
                            <button onClick={() => { setGeneratedCode(null); setCodeExpiry(null); }} className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white underline decoration-dotted">Cancel & Generate New</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gradient-to-br from-brand to-brand-dark rounded-xl p-8 text-white flex flex-col justify-between shadow-lg shadow-brand/20">
                <div>
                    <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
                    <p className="text-white/80 text-sm leading-relaxed mb-6">Encourage students to complete their profile setup immediately.</p>
                </div>
                <button className="bg-white text-brand font-bold py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"><FileText size={16} /> View Resources</button>
            </div>
        </div>

        {/* Ledger */}
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#222] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"><History size={16} className="text-gray-400"/> Transaction Ledger</h3>
                    <div className="h-6 w-px bg-gray-200 dark:bg-[#333] hidden sm:block"></div>
                    <div className="relative w-full sm:w-64">
                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                         <input type="text" placeholder="Search by Name or ID..." className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-brand" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                        <option value="All">All Status</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-[#151515] text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:text-brand transition select-none" onClick={() => requestSort('name')}><div className="flex items-center gap-1">Transaction Details {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>)}</div></th>
                            <th className="px-6 py-4 cursor-pointer hover:text-brand transition select-none" onClick={() => requestSort('date')}><div className="flex items-center gap-1">Date {sortConfig?.key === 'date' && (sortConfig.direction === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>)}</div></th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right cursor-pointer hover:text-brand transition select-none" onClick={() => requestSort('commission')}><div className="flex items-center justify-end gap-1">Credit {sortConfig?.key === 'commission' && (sortConfig.direction === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>)}</div></th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#222]">
                        {filteredReferrals.length > 0 ? filteredReferrals.map((ref) => (
                            <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-[#161616] transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-gray-500">{ref.name.charAt(0)}</div>
                                        <div><div className="font-bold text-gray-900 dark:text-white text-xs">{ref.name}</div><div className="text-[10px] text-gray-500">ID: {ref.id.toUpperCase()}</div></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">{new Date(ref.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-500 border border-green-100 dark:border-green-900/20"><CheckCircle size={10} /> {ref.status}</span></td>
                                <td className="px-6 py-4 text-right"><span className="font-mono text-sm font-bold text-gray-900 dark:text-white">+{ref.commission} PKR</span></td>
                                <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><MoreHorizontal size={16} /></button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">{loading ? 'Loading...' : 'No transactions found.'}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#151515] border-t border-gray-200 dark:border-[#222] px-6 py-3 flex justify-between items-center">
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Displaying {filteredReferrals.length} of {referrals.length} Records</div>
            </div>
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
            <div className="fixed inset-0 bg-black/60 dark:bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#151515] rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-[#333]">
                    {withdrawSuccess ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={32} /></div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Withdrawal Submitted!</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Admin has been notified. Your payment will be processed shortly.</p>
                            <button onClick={() => setShowWithdrawModal(false)} className="text-sm font-bold text-brand hover:underline">Close Window</button>
                        </div>
                    ) : (
                        <>
                            <div className="px-6 py-5 border-b border-gray-200 dark:border-[#333] flex justify-between items-center bg-gray-50 dark:bg-[#1a1a1a]">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Wallet size={18} className="text-brand" /> Withdraw Funds
                                </h3>
                                <button onClick={() => { setShowWithdrawModal(false); setWithdrawError(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-[#222]">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            {/* Error Message */}
                            {withdrawError && (
                                <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-600 dark:text-red-400">{withdrawError}</p>
                                </div>
                            )}
                            
                            <form onSubmit={handleWithdraw} className="p-6 space-y-5">
                                {/* Amount Input */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (PKR)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            required 
                                            min="500" 
                                            max={user.walletBalance} 
                                            placeholder="Enter amount (min 500 PKR)"
                                            className="w-full bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white font-bold rounded-lg px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" 
                                            value={withdrawAmount} 
                                            onChange={(e) => setWithdrawAmount(e.target.value)} 
                                        />
                                        <span className="absolute right-4 top-3.5 text-xs font-medium text-gray-400">
                                            Balance: <span className="text-brand font-bold">{user.walletBalance.toLocaleString()} PKR</span>
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Payment Method Selection */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setWithdrawMethod('jazzcash')} 
                                            className={`py-3.5 px-4 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition ${
                                                withdrawMethod === 'jazzcash' 
                                                    ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400' 
                                                    : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${withdrawMethod === 'jazzcash' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-[#333] text-gray-500'}`}>J</div>
                                            JazzCash
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setWithdrawMethod('easypaisa')} 
                                            className={`py-3.5 px-4 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition ${
                                                withdrawMethod === 'easypaisa' 
                                                    ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
                                                    : 'border-gray-200 dark:border-[#333] text-gray-500 hover:border-gray-300 dark:hover:border-[#444]'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${withdrawMethod === 'easypaisa' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-[#333] text-gray-500'}`}>E</div>
                                            Easypaisa
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Account Number Input */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        {withdrawMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} Account Number
                                    </label>
                                    <input 
                                        type="tel" 
                                        required 
                                        placeholder="03XX XXXXXXX" 
                                        pattern="[0-9]{11}"
                                        maxLength={11}
                                        className="w-full bg-white dark:bg-[#0f0f0f] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white font-bold rounded-lg px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 tracking-wider" 
                                        value={withdrawAccount} 
                                        onChange={(e) => setWithdrawAccount(e.target.value.replace(/\D/g, '').slice(0, 11))} 
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1.5">Enter 11-digit mobile number (e.g., 03001234567)</p>
                                </div>
                                
                                {/* Summary */}
                                {withdrawAmount && Number(withdrawAmount) >= 500 && (
                                    <div className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#222]">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500">Amount</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{Number(withdrawAmount).toLocaleString()} PKR</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">To</span>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {withdrawMethod === 'jazzcash' ? '🔴 JazzCash' : '🟢 Easypaisa'} {withdrawAccount || '...'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                <button 
                                    type="submit" 
                                    disabled={processingWithdraw || !withdrawAmount || Number(withdrawAmount) < 500 || withdrawAccount.length !== 11} 
                                    className="w-full bg-brand hover:bg-brand-dark text-white dark:text-black font-bold py-3.5 rounded-lg shadow-lg shadow-brand/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processingWithdraw ? (
                                        <><Loader2 className="animate-spin" size={18}/> Processing...</>
                                    ) : (
                                        <>Confirm Withdrawal</>
                                    )}
                                </button>
                                
                                <p className="text-[10px] text-center text-gray-400">
                                    Admin will process your withdrawal manually via {withdrawMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}.
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};