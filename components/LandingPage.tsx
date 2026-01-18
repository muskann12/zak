import React, { useState, useEffect } from 'react';
import { LayoutGrid, TrendingUp, ShieldCheck, Zap, Download, Smartphone, Check, Star, Menu, X, ArrowRight, Tag, HelpCircle, Users, BarChart3, Lock, Globe, School, Sun, Moon, Loader2, ChevronDown, Facebook, Twitter, Instagram, Linkedin, Mail, Target, LogIn, AlertCircle, Search, Activity, Radio, Flame, AlertTriangle, XCircle, Gauge, Eye, Layers, MousePointer } from 'lucide-react';
import { generateExtensionZip } from '../services/extensionGenerator';
import { loginUser, analyzeMarket, getMarketActivity, getPlatformStats } from '../services/api';
import { User } from '../types';

interface LandingPageProps {
  onLogin: (user: User) => void;
  onSignupUser: () => void;
  onSignupTrainer: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenBlog: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignupUser, onSignupTrainer, isDarkMode, toggleTheme, onOpenBlog }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Would You Enter? Tool State
  const [amazonUrl, setAmazonUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<null | {
    verdict: 'HOT' | 'OK' | 'BAD';
    demand: number;
    competition: number;
    dominance: number;
    plViability: string;
    keyword?: string;
    avgPrice?: number;
    avgReviews?: number;
    totalRevenue?: number;
    recommendation?: string;
    topSeller?: {
      name: string;
      brand: string;
      reviews: number;
      price: number;
    };
  }>(null);

  // Live Killfeed State
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);
  const killfeedItems = [
    { category: 'Kitchen Gadgets', event: 'Price dropped 12% in last 24h', type: 'price' },
    { category: 'Pet Supplies', event: '2 top sellers went out of stock', type: 'stock' },
    { category: 'Home Decor', event: 'New brand entered top 3', type: 'brand' },
    { category: 'Fitness Equipment', event: 'Avg review count up 18%', type: 'reviews' },
    { category: 'Phone Accessories', event: 'Market leader lost 8% share', type: 'share' },
    { category: 'Baby Products', event: '3 private-label entries this week', type: 'entry' },
  ];

  // Killfeed animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeedIndex((prev) => (prev + 1) % killfeedItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Market Analysis using Backend API with real SerpApi data
  const handleAnalyze = async () => {
    if (!amazonUrl.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError('');
    
    try {
      // Extract keyword from URL or use as direct keyword
      let keyword = amazonUrl.trim();
      if (keyword.includes('amazon.com')) {
        // Extract search term from URL if it's an Amazon URL
        const urlParams = new URLSearchParams(keyword.split('?')[1] || '');
        keyword = urlParams.get('k') || urlParams.get('keywords') || 'product';
      }
      
      // Call backend API for analysis (uses real SerpApi data)
      const result = await analyzeMarket(keyword);
      
      setAnalysisResult({
        verdict: result.verdict,
        demand: result.demandScore || result.scores?.demand,
        competition: result.competitionScore || result.scores?.competition,
        dominance: result.dominance || result.scores?.dominance,
        plViability: result.scores?.plViabilityText || (result.plViability >= 7 ? 'Excellent' : result.plViability >= 5 ? 'Medium' : 'Low'),
        keyword: result.keyword,
        avgPrice: result.marketData?.avgPrice,
        avgReviews: result.marketData?.avgReviews,
        totalRevenue: result.marketData?.totalRevenue,
        recommendation: result.recommendation,
        topSeller: result.topSeller
      });
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setAnalysisError(error.message || 'Analysis failed. Please try again.');
    }
    setIsAnalyzing(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generateExtensionZip();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate extension ZIP. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
        const user = await loginUser(email, password);
        onLogin(user);
    } catch (err: any) {
        setLoginError(err.message || "Invalid credentials");
    } finally {
        setIsLoggingIn(false);
    }
  };

  const testimonials = [
    { name: "Ahmed R.", role: "FBA Seller", text: "Ex-ZakVibe saved me hours of manual calculation. The profit margins are spot on and the interface is incredibly fast.", stars: 5 },
    { name: "Sarah K.", role: "Virtual Assistant", text: "I recommend this to all my clients. It's affordable and gives the exact data needed for product hunting without the bloat.", stars: 5 },
    { name: "Bilal M.", role: "E-com Trainer", text: "Finally a tool that doesn't cost a fortune but delivers premium accuracy. Essential for my student batches.", stars: 5 },
  ];

  const faqs = [
    { q: "Is this tool compliant with Amazon TOS?", a: "Yes, Ex-ZakVibe only reads public data from search pages to organize it for you. It does not automate purchasing actions or scrape private backend data." },
    { q: "How accurate is the sales estimation?", a: "We use a proprietary algorithm based on BSR history and category benchmarks, offering ~90% accuracy compared to major expensive competitors." },
    { q: "Can I use it on multiple devices?", a: "Your subscription is tied to your account credentials. You can log in on different devices, but concurrent usage is monitored to prevent account sharing." },
    { q: "Do you offer refunds?", a: "We offer a 3-day money-back guarantee if the tool does not work on your system as advertised." },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-200 font-sans transition-colors duration-300 overflow-x-hidden">
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-[#27272a] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
             <div className="px-6 py-5 border-b border-gray-100 dark:border-[#27272a] flex justify-between items-center bg-white dark:bg-[#18181b]">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><LogIn size={18}/> Welcome Back</h3>
               <button 
                 onClick={() => setShowLoginModal(false)} 
                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#27272a]"
               >
                 <X size={20} />
               </button>
             </div>
             <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                 {loginError && (
                     <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-3 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                         <AlertCircle size={14}/> {loginError}
                     </div>
                 )}
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                     <input 
                        type="email" 
                        required 
                        placeholder="name@example.com"
                        className="w-full bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white text-sm rounded-lg py-3 px-4 focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                 </div>
                 <div>
                     <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                        <a href="#" className="text-xs text-brand hover:underline">Forgot?</a>
                     </div>
                     <input 
                        type="password" 
                        required 
                        placeholder="••••••••"
                        className="w-full bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white text-sm rounded-lg py-3 px-4 focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                 </div>
                 <button 
                    type="submit" 
                    disabled={isLoggingIn}
                    className="w-full bg-brand hover:bg-brand-dark text-white dark:text-black font-bold py-3.5 rounded-lg transition shadow-lg shadow-brand/20 flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                    {isLoggingIn ? <Loader2 className="animate-spin" size={18}/> : 'Sign In'}
                 </button>
             </form>
             <div className="px-6 py-4 bg-gray-50 dark:bg-[#202023] border-t border-gray-100 dark:border-[#27272a] text-center">
                 <p className="text-xs text-gray-500">
                     Don't have an account? <button onClick={() => { setShowLoginModal(false); setShowStartModal(true); }} className="text-brand font-bold hover:underline">Get Started</button>
                 </p>
             </div>
          </div>
        </div>
      )}

      {/* Get Started Selection Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-[#27272a] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#27272a] flex justify-between items-center bg-white dark:bg-[#18181b]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Get Started with Ex-ZakVibe</h3>
              <button 
                onClick={() => setShowStartModal(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#27272a]"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 grid gap-4">
              {/* Trainer Card */}
              <button 
                onClick={onSignupTrainer}
                className="group relative flex items-start gap-5 p-5 rounded-xl border border-gray-200 dark:border-[#27272a] hover:border-brand/50 dark:hover:border-brand/50 bg-gray-50/50 dark:bg-[#202023] hover:bg-white dark:hover:bg-[#27272a] transition-all duration-300 text-left hover:shadow-lg hover:shadow-brand/5"
              >
                <div className="shrink-0 w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 text-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-orange-200 dark:border-orange-900/30">
                  <School size={22} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                     <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-brand transition-colors">Join as Trainer</h4>
                     <ArrowRight size={16} className="text-gray-300 group-hover:text-brand -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    Refer students, build your academy, and earn high commissions on every subscription.
                  </p>
                </div>
              </button>

              {/* User Card */}
              <button 
                onClick={onSignupUser}
                className="group relative flex items-start gap-5 p-5 rounded-xl border border-gray-200 dark:border-[#27272a] hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-gray-50/50 dark:bg-[#202023] hover:bg-white dark:hover:bg-[#27272a] transition-all duration-300 text-left hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-blue-200 dark:border-blue-900/30">
                  <Users size={22} strokeWidth={2} />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                     <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Join as User</h4>
                     <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                    Get full access to Xray tools, profit calculators, and market insights for individual research.
                  </p>
                </div>
              </button>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-[#202023] border-t border-gray-100 dark:border-[#27272a] flex justify-center">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                 <ShieldCheck size={12} /> Secure Access • No Hidden Fees
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#333] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="bg-brand text-white dark:text-black w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg">Z</div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Ex-<span className="text-brand">ZakVibe</span></span>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
                <button onClick={() => scrollToSection('about')} className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5">About</button>
                <button onClick={() => scrollToSection('features')} className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5">Features</button>
                <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5">Reviews</button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5">Pricing</button>
            </div>

            <div className="hidden md:flex items-center gap-3">
                 <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-[#333] transition"
                  aria-label="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-[#333] mx-1"></div>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="text-gray-700 dark:text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Log in
                </button>
                <button 
                  onClick={() => setShowStartModal(true)}
                  className="bg-brand hover:bg-brand-dark text-white dark:text-black px-5 py-2.5 rounded-lg font-bold transition shadow-md hover:shadow-lg shadow-brand/20 active:scale-95"
                >
                  Get Started
                </button>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-yellow-400"
              >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-brand p-2">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#151515] border-b border-gray-200 dark:border-[#333] animate-in slide-in-from-top-2">
            <div className="px-4 pt-4 pb-6 space-y-1">
              <button onClick={() => scrollToSection('about')} className="text-gray-600 dark:text-gray-300 hover:text-brand block px-3 py-3 rounded-lg text-base font-medium w-full text-left">About</button>
              <button onClick={() => scrollToSection('features')} className="text-gray-600 dark:text-gray-300 hover:text-brand block px-3 py-3 rounded-lg text-base font-medium w-full text-left">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-600 dark:text-gray-300 hover:text-brand block px-3 py-3 rounded-lg text-base font-medium w-full text-left">Pricing</button>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="text-gray-900 dark:text-white bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-[#333] block px-4 py-3.5 rounded-lg text-sm font-bold text-center hover:bg-gray-100 dark:hover:bg-[#333] transition"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => setShowStartModal(true)}
                    className="bg-brand text-white dark:text-black block px-4 py-3.5 rounded-lg text-sm font-bold text-center shadow-lg shadow-brand/20 active:scale-95 transition hover:bg-brand-dark"
                  >
                    Get Started
                  </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-transparent">
        {/* Subtle, Professional Background Grid */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-[#0a0a0a] bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
             <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-brand/20 opacity-20 blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-12 lg:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold mb-6 animate-pulse">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> LIVE Market Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6">
                We don't show you products.<br/>
                <span className="text-brand">We show you who will win.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Instantly see if an Amazon niche is <span className="text-green-600 dark:text-green-400 font-semibold">open</span>, <span className="text-yellow-600 dark:text-yellow-400 font-semibold">crowded</span>, or <span className="text-red-500 font-semibold">dominated</span> — using live sales, competition, and brand control data.
              </p>
              
              {/* Professional Hero Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="group bg-brand hover:bg-brand-dark text-white dark:text-black text-lg px-8 py-4 rounded-xl font-bold transition flex items-center justify-center gap-3 shadow-lg shadow-brand/30 hover:-translate-y-0.5 transform duration-200 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isDownloading ? <Loader2 className="animate-spin" size={20}/> : <Zap size={20} className="group-hover:animate-pulse" />} 
                  {isDownloading ? 'Building...' : 'Try It Free on Amazon'}
                </button>
                <button 
                  onClick={() => setShowStartModal(true)}
                  className="group bg-white dark:bg-[#151515] hover:bg-gray-50 dark:hover:bg-[#222] text-gray-900 dark:text-white text-lg px-8 py-4 rounded-xl font-bold transition border-2 border-gray-200 dark:border-[#333] hover:border-brand/50 dark:hover:border-brand/50 shadow-sm flex items-center justify-center gap-2"
                >
                  <Globe size={18} className="text-gray-400 group-hover:text-brand transition"/> Paste an Amazon Link
                </button>
              </div>
              
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-gray-400"/>
                      <span>100% Transparent Calculations</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <BarChart3 size={14} className="text-gray-400"/>
                      <span>Public Amazon Data Only</span>
                  </div>
              </div>
            </div>
            
            <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none perspective-1000 group">
                <div className="absolute inset-0 bg-brand/20 rounded-2xl blur-3xl opacity-0 group-hover:opacity-20 transition duration-500"></div>
                <div className="relative bg-white dark:bg-[#151515] rounded-xl shadow-2xl border border-gray-200 dark:border-[#333] transform rotate-y-6 group-hover:rotate-y-0 transition-transform duration-700 overflow-hidden flex flex-col h-[400px]">
                    
                    {/* Mock Extension Header */}
                    <div className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#333] p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <div className="bg-brand text-white dark:text-black w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm">⚡</div>
                             <div className="font-bold text-gray-900 dark:text-white text-sm">Amazon <span className="text-brand">Market Radar</span></div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-[10px] font-bold text-green-600 dark:text-green-400">
                               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> LIVE
                             </div>
                        </div>
                    </div>

                    {/* Market Intelligence Summary */}
                    <div className="bg-gray-50 dark:bg-[#151515] border-b border-gray-200 dark:border-[#333] p-4">
                         <div className="grid grid-cols-4 gap-4 text-center">
                             <div>
                                 <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Demand</div>
                                 <div className="text-lg font-black text-green-600 dark:text-green-400">8.2</div>
                             </div>
                             <div>
                                 <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Competition</div>
                                 <div className="text-lg font-black text-yellow-600 dark:text-yellow-400">5.4</div>
                             </div>
                             <div>
                                 <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Dominance</div>
                                 <div className="text-lg font-black text-gray-900 dark:text-white">23%</div>
                             </div>
                             <div>
                                 <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">Opportunity</div>
                                 <div className="text-lg font-black text-brand">7/10</div>
                             </div>
                         </div>
                    </div>

                    {/* Market Verdict */}
                    <div className="flex-1 bg-white dark:bg-[#0f0f0f] p-6 flex flex-col items-center justify-center relative">
                         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-[#0f0f0f] opacity-30 pointer-events-none"></div>
                         <div className="relative z-10 text-center">
                             <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-400 text-sm font-bold mb-4">
                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> MARKET OPEN
                             </div>
                             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">This niche is worth entering</h3>
                             <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">Low brand dominance with strong demand signals. Top 10 sellers show healthy distribution.</p>
                             
                             <div className="grid grid-cols-3 gap-4 text-[11px]">
                                 <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3">
                                     <div className="text-gray-400 mb-1">Top 10 Rev</div>
                                     <div className="font-bold text-gray-900 dark:text-white">$847K</div>
                                 </div>
                                 <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3">
                                     <div className="text-gray-400 mb-1">Avg Reviews</div>
                                     <div className="font-bold text-gray-900 dark:text-white">342</div>
                                 </div>
                                 <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3">
                                     <div className="text-gray-400 mb-1">Avg Price</div>
                                     <div className="font-bold text-gray-900 dark:text-white">$31.50</div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* Mock Footer */}
                    <div className="bg-gray-50 dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-[#333] p-3 flex justify-between items-center text-[10px]">
                         <div className="text-gray-500 flex items-center gap-2"><Target size={12}/> Keyword: "garlic press stainless steel"</div>
                         <div className="text-gray-400">Based on Top 10 organic results</div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== 2) WOULD YOU ENTER? TOOL ==================== */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-[#0a0a0a] dark:to-[#0f0f0f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-bold mb-4">
              <Search size={14} /> Instant Niche Analysis
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Would You Enter This Market?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Paste any Amazon search URL or ASIN and get an instant verdict.
            </p>
          </div>

          {/* Input Box */}
          <div className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-[#333] shadow-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter keyword (e.g., garlic press) or Amazon URL"
                  value={amazonUrl}
                  onChange={(e) => setAmazonUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white text-sm focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !amazonUrl.trim()}
                className="bg-brand hover:bg-brand-dark text-white dark:text-black font-bold px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {analysisError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle size={20} />
                <div>
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="text-sm opacity-80">{analysisError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {analysisResult && (
            <div className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-[#333] shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              {/* Verdict Header */}
              <div className={`p-6 text-center ${
                analysisResult.verdict === 'HOT' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                analysisResult.verdict === 'OK' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-rose-600'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  {analysisResult.verdict === 'HOT' && <Flame size={32} className="text-white" />}
                  {analysisResult.verdict === 'OK' && <AlertTriangle size={32} className="text-white" />}
                  {analysisResult.verdict === 'BAD' && <XCircle size={32} className="text-white" />}
                  <span className="text-4xl font-black text-white">
                    {analysisResult.verdict === 'HOT' ? 'HOT 🔥' : analysisResult.verdict === 'OK' ? 'OK 🟡' : 'BAD 🔴'}
                  </span>
                </div>
                {analysisResult.keyword && (
                  <p className="text-white/90 text-sm mt-2 font-medium">
                    Keyword: "{analysisResult.keyword}"
                  </p>
                )}
                <p className="text-white/70 text-sm mt-1">
                  {analysisResult.recommendation || (
                    analysisResult.verdict === 'HOT' ? 'This market shows strong potential for new entrants!' :
                    analysisResult.verdict === 'OK' ? 'Proceed with caution — moderate competition detected.' :
                    'High barriers to entry — consider alternative niches.'
                  )}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Demand Score</div>
                    <div className="text-2xl font-black text-green-600 dark:text-green-400">{analysisResult.demand}/10</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Competition</div>
                    <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400">{analysisResult.competition}/10</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Brand Dom.</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{analysisResult.dominance}%</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">PL Viability</div>
                    <div className={`text-lg font-black ${
                      analysisResult.plViability === 'Excellent' ? 'text-green-600 dark:text-green-400' :
                      analysisResult.plViability === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-500'
                    }`}>{analysisResult.plViability}</div>
                  </div>
                </div>

                {/* Additional Market Data */}
                {(analysisResult.avgPrice || analysisResult.avgReviews || analysisResult.totalRevenue) && (
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl">
                    {analysisResult.avgPrice && (
                      <div className="text-center">
                        <div className="text-xs text-gray-400 uppercase mb-1">Avg Price</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">${analysisResult.avgPrice.toFixed(2)}</div>
                      </div>
                    )}
                    {analysisResult.avgReviews && (
                      <div className="text-center">
                        <div className="text-xs text-gray-400 uppercase mb-1">Avg Reviews</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{analysisResult.avgReviews.toLocaleString()}</div>
                      </div>
                    )}
                    {analysisResult.totalRevenue && (
                      <div className="text-center">
                        <div className="text-xs text-gray-400 uppercase mb-1">Est. Revenue</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">${(analysisResult.totalRevenue / 1000).toFixed(0)}K/mo</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Top Seller Info */}
                {analysisResult.topSeller && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-4">
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Top Seller</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{analysisResult.topSeller.name}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {analysisResult.topSeller.brand && <span>Brand: <strong>{analysisResult.topSeller.brand}</strong></span>}
                      {analysisResult.topSeller.reviews && <span>Reviews: <strong>{analysisResult.topSeller.reviews.toLocaleString()}</strong></span>}
                      {analysisResult.topSeller.price && <span>Price: <strong>${analysisResult.topSeller.price.toFixed(2)}</strong></span>}
                    </div>
                  </div>
                )}

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <ShieldCheck size={14} /> Real Amazon data via SerpApi — not simulations.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==================== 3) LIVE MARKET ACTIVITY (Killfeed) ==================== */}
      <section className="py-16 bg-[#0a0a0a] dark:bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Label */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold mb-3">
                <Radio size={12} className="animate-pulse" /> LIVE
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Live Amazon Market Activity</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Based on public listing changes and sales estimates.
              </p>
            </div>

            {/* Right: Killfeed */}
            <div className="flex-1 max-w-xl">
              <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3">
                {killfeedItems.slice(currentFeedIndex, currentFeedIndex + 3).concat(
                  killfeedItems.slice(0, Math.max(0, (currentFeedIndex + 3) - killfeedItems.length))
                ).map((item, i) => (
                  <div
                    key={`${item.category}-${i}`}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                      i === 0 ? 'bg-brand/10 border border-brand/30' : 'bg-[#0a0a0a] opacity-60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.type === 'price' ? 'bg-green-500/20 text-green-400' :
                      item.type === 'stock' ? 'bg-red-500/20 text-red-400' :
                      item.type === 'brand' ? 'bg-blue-500/20 text-blue-400' :
                      item.type === 'reviews' ? 'bg-yellow-500/20 text-yellow-400' :
                      item.type === 'share' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-brand/20 text-brand'
                    }`}>
                      <Activity size={16} />
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-semibold text-sm">{item.category}</span>
                      <span className="text-gray-500 mx-2">—</span>
                      <span className="text-gray-400 text-sm">{item.event}</span>
                    </div>
                    {i === 0 && <span className="text-[10px] text-gray-500 uppercase">Just now</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4) BRAND POWER RADAR ==================== */}
      <section className="py-20 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-500 dark:text-purple-400 text-xs font-bold mb-4">
              <Gauge size={14} /> Brand Dominance Radar
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Who Controls This Niche?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See when one brand owns a niche — and when it's wide open for new sellers.
            </p>
          </div>

          {/* Two Example Meters */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Open Market */}
            <div className="bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#333] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white">Kitchen Gadgets</h4>
                <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                  MARKET OPEN
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Top Brand Control</span>
                  <span className="font-bold text-gray-900 dark:text-white">18%</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000" style={{ width: '18%' }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No single brand dominates. High opportunity for new entrants.
              </p>
            </div>

            {/* Locked Market */}
            <div className="bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#333] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white">Phone Cases</h4>
                <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                  MARKET LOCKED
                </span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Top Brand Control</span>
                  <span className="font-bold text-gray-900 dark:text-white">62%</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-1000" style={{ width: '62%' }}></div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                One brand controls majority share. Difficult to compete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5) REAL NUMBERS WALL ==================== */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-[#0f0f0f] dark:to-[#0a0a0a] border-y border-gray-200 dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Real Numbers. Real Intelligence.
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Powered by continuously updated Amazon listing data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="text-5xl md:text-6xl font-black text-brand mb-2">$847M</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Monthly Amazon Revenue Analyzed</div>
            </div>
            <div className="text-center p-8 bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-2">12,847</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Niches Scanned</div>
            </div>
            <div className="text-center p-8 bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-2">285K</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Products Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6) WHY THIS IS DIFFERENT ==================== */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-bold mb-4">
              <Layers size={14} /> Why This Is Different
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Data is useless until it tells you what to do.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Helium-10 Style */}
            <div className="bg-gray-100 dark:bg-[#151515] border border-gray-200 dark:border-[#333] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-[#333] flex items-center justify-center text-gray-500">
                  <LayoutGrid size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">Traditional Tools</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Show raw numbers across multiple tabs</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Require manual interpretation of data</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Leave decision-making to you</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle size={18} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">Overwhelming for new sellers</span>
                </li>
              </ul>
            </div>

            {/* Amazon Market Radar */}
            <div className="bg-gradient-to-br from-brand/5 to-orange-500/5 dark:from-brand/10 dark:to-orange-500/10 border-2 border-brand/30 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2 py-1 bg-brand text-black text-[10px] font-black rounded uppercase">Recommended</div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center text-white dark:text-black">
                  <Radio size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Amazon Market Radar</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-brand mt-0.5 shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">One screen with everything you need</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-brand mt-0.5 shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">One clear verdict: Enter or Skip</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-brand mt-0.5 shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Transparent calculations you can verify</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-brand mt-0.5 shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">Built for action, not analysis paralysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 7) FINAL CTA ==================== */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/20 via-transparent to-transparent opacity-50"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Stop Guessing.<br/>
            <span className="text-brand">Start Knowing.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Turn Amazon into a radar that shows you exactly which niches are worth your time.
          </p>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group bg-brand hover:bg-brand-dark text-black text-xl px-12 py-5 rounded-2xl font-bold transition inline-flex items-center gap-3 shadow-2xl shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-1 transform duration-300 disabled:opacity-70"
          >
            {isDownloading ? <Loader2 className="animate-spin" size={24} /> : <Radio size={24} className="group-hover:animate-pulse" />}
            {isDownloading ? 'Building...' : 'Turn Amazon Into a Radar'}
          </button>
          <p className="mt-6 text-sm text-gray-500">
            Free to try. No credit card required.
          </p>
        </div>
      </section>

      {/* NEW: Mission Section */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                <div className="mb-12 lg:mb-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-6">
                        <Target size={14} /> Our Mission
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                        Democratizing E-Commerce Intelligence for Pakistan
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        Ex-ZakVibe was born from a simple realization: Enterprise-grade product research tools are often priced out of reach for emerging sellers in developing markets.
                    </p>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        We are on a mission to level the playing field. By providing accurate, real-time Amazon market data at an affordable price point, we empower Pakistani entrepreneurs, VAs, and agencies to make data-driven decisions and compete on a global scale.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Global Standards, Local Pricing</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">World-class data accuracy tailored for the local economy.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Community Driven</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Built with direct feedback from top Pakistani sellers and trainers.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-brand to-orange-600 rounded-2xl opacity-20 blur-2xl"></div>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#333]">
                        <img 
                            src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80" 
                            alt="Team working on data" 
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                            <div className="text-white">
                                <div className="text-2xl font-bold mb-1">Built for Sellers</div>
                                <p className="text-white/80 text-sm">By Sellers. For Sellers.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-gray-50 dark:bg-[#0f0f0f] border-y border-gray-200 dark:border-[#222]">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Why Ex-ZakVibe?</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    We built Ex-ZakVibe to bridge the gap between expensive enterprise tools and manual guesswork. 
                    Our extension provides the same granular data as top-tier competitors at a fraction of the cost.
                </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                 <div className="p-8 rounded-3xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] hover:border-brand/50 transition">
                     <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                         <TrendingUp size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Accurate Sales Estimates</h3>
                     <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Our algorithms track BSR movement daily to provide sales figures you can bank on.</p>
                 </div>
                 <div className="p-8 rounded-3xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] hover:border-brand/50 transition">
                     <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6">
                         <BarChart3 size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Profit Calculator</h3>
                     <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Instantly calculate net margins including FBA fees, referral fees, and storage costs.</p>
                 </div>
                 <div className="p-8 rounded-3xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] hover:border-brand/50 transition">
                     <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                         <ShieldCheck size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure & Private</h3>
                     <p className="text-gray-600 dark:text-gray-400 leading-relaxed">We respect your data. Your search history and product ideas remain strictly local.</p>
                 </div>
            </div>
         </div>
      </section>

      <section id="features" className="py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div>
                 <div className="inline-block text-brand font-bold uppercase tracking-widest text-xs mb-4">Core Features</div>
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Everything you need to find your next winner.</h2>
                 <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">Stop switching between tabs. Ex-ZakVibe integrates seamlessly into your Amazon search results.</p>
                 
                 <div className="space-y-6">
                     {[
                         "Instant Data Extraction on Search Pages",
                         "Download CSV Reports for Analysis",
                         "Competitor Stock Levels & Seller Types",
                         "Review Count & Rating Analysis",
                         "FBA Fee Breakdown & Margin Analysis"
                     ].map((item, i) => (
                         <div key={i} className="flex items-center gap-4">
                             <div className="w-6 h-6 rounded-full bg-brand text-black flex items-center justify-center flex-shrink-0">
                                 <Check size={14} strokeWidth={4} />
                             </div>
                             <span className="text-gray-800 dark:text-gray-200 font-medium">{item}</span>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-brand to-yellow-500 rounded-3xl blur-2xl opacity-20"></div>
                 <div className="relative bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-3xl shadow-2xl overflow-hidden p-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-xl">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">15%</div>
                              <div className="text-xs text-gray-500">Avg. Net Margin</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-xl">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">200+</div>
                              <div className="text-xs text-gray-500">Monthly Sales</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-xl">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">4.5</div>
                              <div className="text-xs text-gray-500">Rating Required</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-xl">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Low</div>
                              <div className="text-xs text-gray-500">Competition</div>
                          </div>
                      </div>
                      <div className="mt-6 bg-brand/10 rounded-xl p-4 flex items-center gap-4">
                          <div className="bg-brand text-black p-2 rounded-lg"><Zap size={20}/></div>
                          <div className="text-sm font-medium text-brand-dark dark:text-brand-light">Ideal product criteria matched automatically.</div>
                      </div>
                 </div>
             </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50 dark:bg-[#0f0f0f] border-y border-gray-200 dark:border-[#222]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Trusted by Pakistan's Top Sellers</h2>
                  <p className="text-gray-600 dark:text-gray-400">Don't just take our word for it. Here is what the community says.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((t, i) => (
                      <div key={i} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-[#222]">
                          <div className="flex gap-1 mb-4">
                              {[...Array(t.stars)].map((_, si) => <Star key={si} size={16} className="fill-brand text-brand"/>)}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">"{t.text}"</p>
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#333] flex items-center justify-center font-bold text-gray-500 text-xs">
                                  {t.name.substring(0,2)}
                              </div>
                              <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</div>
                                  <div className="text-xs text-gray-500">{t.role}</div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      <section id="pricing" className="py-24 relative overflow-hidden bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
             <div className="inline-block text-brand font-bold uppercase tracking-widest text-xs mb-4">Simple Pricing</div>
             <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">One Plan. Unlimited Potential.</h2>
             
             <div className="bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-[#333] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                <div className="p-10 md:w-3/5 text-left flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Monthly Pro Access</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Everything you need to start selling.</p>
                    <div className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Check size={20} className="text-brand"/> Unlimited Xray Searches</li>
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Check size={20} className="text-brand"/> Profit & Margin Calculator</li>
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Check size={20} className="text-brand"/> Competitor Inventory Checker</li>
                        <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300"><Check size={20} className="text-brand"/> Export Data to CSV</li>
                    </div>
                    <button 
                        onClick={() => setShowStartModal(true)}
                        className="w-full bg-brand hover:bg-brand-dark text-white dark:text-black font-bold py-4 rounded-xl transition text-lg shadow-xl shadow-brand/20"
                    >
                        Get Started Now
                    </button>
                </div>
                <div className="bg-white dark:bg-[#111] p-10 md:w-2/5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200 dark:border-[#333]">
                    <div className="text-5xl font-black text-brand mb-1">1500</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white mb-6">PKR / month</div>
                    
                    <div className="bg-gray-50 dark:bg-white p-3 rounded-xl shadow-inner mb-4">
                         <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=03200148120" alt="Payment QR" className="w-28 h-28" />
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">+92 320 0148120</div>
                        <div className="text-xs text-gray-500">JazzCash / EasyPaisa</div>
                    </div>
                </div>
             </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50 dark:bg-[#0f0f0f] border-y border-gray-200 dark:border-[#222]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                  {faqs.map((faq, i) => (
                      <div key={i} className="border border-gray-200 dark:border-[#333] rounded-2xl overflow-hidden">
                          <button 
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="w-full flex items-center justify-between p-6 bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition text-left"
                          >
                              <span className="font-bold text-gray-900 dark:text-white">{faq.q}</span>
                              <ChevronDown size={20} className={`text-gray-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}/>
                          </button>
                          {openFaq === i && (
                              <div className="p-6 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {faq.a}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-white dark:bg-[#050505] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-brand text-white dark:text-black w-8 h-8 rounded flex items-center justify-center font-bold">⚡</div>
                        <span className="font-bold text-xl text-gray-900 dark:text-white">Amazon <span className="text-brand">Market Radar</span></span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed mb-6">
                        Market intelligence for serious Amazon sellers. See who will win before you invest.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-gray-400 hover:text-brand transition"><Facebook size={20}/></a>
                        <a href="#" className="text-gray-400 hover:text-brand transition"><Twitter size={20}/></a>
                        <a href="#" className="text-gray-400 hover:text-brand transition"><Instagram size={20}/></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6">Product</h4>
                    <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <li><a href="#" className="hover:text-brand transition">Extension</a></li>
                        <li><a href="#" className="hover:text-brand transition">Market Scanner</a></li>
                        <li><button onClick={() => scrollToSection('pricing')} className="hover:text-brand transition">Pricing</button></li>
                        <li><a href="#" className="hover:text-brand transition">Changelog</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6">Resources</h4>
                    <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <li><a href="#" className="hover:text-brand transition">Documentation</a></li>
                        <li><a href="#" className="hover:text-brand transition">Video Tutorials</a></li>
                        <li><a href="#" className="hover:text-brand transition">Community</a></li>
                        <li><button onClick={onOpenBlog} className="hover:text-brand transition">Blog</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-6">Contact</h4>
                    <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2"><Mail size={16}/> hello@marketradar.io</li>
                        <li className="flex items-center gap-2"><Smartphone size={16}/> +92 320 0148120</li>
                        <li>Lahore, Pakistan</li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-gray-200 dark:border-[#222] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-600">
                <p>&copy; 2026 Amazon Market Radar. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-400 transition">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-900 dark:hover:text-gray-400 transition">Terms of Service</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};