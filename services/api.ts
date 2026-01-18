import { User, Referral } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
    const session = localStorage.getItem('ex_zakvibe_session');
    const token = session ? JSON.parse(session).token : '';
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const loginUser = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Login failed');
    
    // Extract from data.data because of sendResponse wrapper
    const userData = data.data.user;
    const token = data.data.token;
    
    const user = { ...userData, token };
    localStorage.setItem('ex_zakvibe_session', JSON.stringify(user));
    return user;
};

export const registerUser = async (name: string, email: string, password: string, role: any, referralCode?: string, instituteName?: string, instituteLocation?: string) => {
    const payload = { name, email, password, role, referralCode, instituteName, instituteLocation };
    console.log('[API] Sending registration request with:', { ...payload, password: '***' });
    
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('[API] Registration response:', { status: res.status, data });
    
    if (!res.ok) throw new Error(data.message || data.error || 'Registration failed');
    
    return { id: data.data?.userId, name, email, role, isApproved: data.data?.isApproved };
};

export const getNotifications = async () => {
    const res = await fetch(`${API_URL}/notifications`, {
        headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
    return data.data;
};

export const markNotificationsRead = async () => {
    const res = await fetch(`${API_URL}/notifications/read`, {
        method: 'POST',
        headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to mark read');
    return data;
};

export const getSession = (): User | null => {
    const sess = localStorage.getItem('ex_zakvibe_session');
    return sess ? JSON.parse(sess) : null;
};

export const logout = () => {
    localStorage.removeItem('ex_zakvibe_session');
};

export const fetchDemoProducts = async (count: number) => {
    try {
        const res = await fetch(`${API_URL}/xray/demo-data?count=${count}`);
        if(!res.ok) throw new Error("Failed to fetch demo data");
        const json = await res.json();
        // Handle both wrapped response (sendResponse) and direct array response
        return Array.isArray(json) ? json : (json.data || []);
    } catch (e) {
        console.error(e);
        return [];
    }
};

// Client-side utility for marketplace comparisons (no backend endpoint needed for simple math)
export const getMarketplaceComparisons = (p: any) => [
    { name: 'eBay', price: p.price * 0.9, logo: 'EB', shipping: 'Free' },
    { name: 'Walmart', price: p.price * 0.95, logo: 'WM', shipping: '2-Day' },
    { name: 'AliExpress', price: p.price * 0.4, logo: 'AX', shipping: '15-Day' },
    { name: 'Alibaba', price: p.price * 0.3, logo: 'AL', shipping: 'Sea Freight' }
];

export const getUserDashboard = async () => {
    const res = await fetch(`${API_URL}/user/dashboard`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return data.data;
};

export interface WithdrawalRequest {
    amount: number;
    accountNumber: string;
    paymentMethod: 'jazzcash' | 'easypaisa';
}

export interface WithdrawalResponse {
    success: boolean;
    amount: number;
    paymentMethod: string;
    accountNumber: string;
    newBalance: number;
    status: string;
    message?: string;
}

export const withdrawFunds = async (request: WithdrawalRequest): Promise<WithdrawalResponse> => {
    const res = await fetch(`${API_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request)
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Withdrawal failed');
    }
    return { ...data.data, message: data.message };
};

export const getWalletBalance = async (): Promise<number> => {
    const res = await fetch(`${API_URL}/wallet/balance`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to fetch balance');
    return data.data.balance;
};

export const getTransactionHistory = async () => {
    const res = await fetch(`${API_URL}/wallet/transactions`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return data.data.transactions;
};

export const generateReferralCode = async (userId: string) => {
    const res = await fetch(`${API_URL}/user/generate-code`, {
        method: 'POST',
        headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate code");
    return { code: data.data.code, expiry: data.data.expiry };
};

export const validateReferralCode = async (code: string) => {
    try {
        const res = await fetch(`${API_URL}/user/validate-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await res.json();
        return { valid: data.data?.valid, message: data.data?.message || data.message };
    } catch (e) {
        return { valid: false, message: 'Server Error' };
    }
};

export const submitPayment = async (userId: string, senderName: string) => {
    const res = await fetch(`${API_URL}/user/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, senderName })
    });
    if (!res.ok) throw new Error('Payment submission failed');
};

export const pollApprovalStatus = async (userId: string) => {
    try {
        const res = await fetch(`${API_URL}/user/approval-status?userId=${userId}`);
        const data = await res.json();
        // Return status string if available, otherwise map boolean
        if (data.data?.status) return data.data.status; // 'approved' | 'rejected' | 'pending'
        return data.data?.approved ? 'approved' : 'pending';
    } catch (e) {
        return 'pending';
    }
};

export const calculateProfit = async (params: { sellPrice: number, costPrice: number, quantity: number, fbaFees: number, referralFeePct: number }) => {
    try {
        const res = await fetch(`${API_URL}/xray/profit-calculator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        return await res.json();
    } catch (e) {
        console.error("Profit calculation failed", e);
        return { refFee: 0, totalFees: 0, profitPerUnit: 0, totalProfit: 0, margin: 0, roi: 0 };
    }
};

// ==========================================
// MARKET ANALYSIS API (Backend-secured logic)
// ==========================================

export interface MarketAnalysisResult {
    keyword: string;
    revenue: number;
    demandScore: number;
    competitionScore: number;
    dominance: number;
    plViability: number;
    opportunityScore: number;
    verdict: 'HOT' | 'OK' | 'BAD';
    topSeller: {
        name: string;
        revenue: number;
        reviews: number;
    };
    marketData: Array<{
        position: number;
        name: string;
        price: number;
        reviews: number;
        revenue: number;
    }>;
}

export const analyzeMarket = async (keyword: string): Promise<MarketAnalysisResult> => {
    try {
        const res = await fetch(`${API_URL}/market/analyze`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ keyword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Market analysis failed');
        return data.data;
    } catch (error) {
        console.error('[API] Market analysis error:', error);
        throw error;
    }
};

export interface MarketActivity {
    id: string;
    keyword: string;
    verdict: 'HOT' | 'OK' | 'BAD';
    revenue: string;
    dominance: number;
    timestamp: Date;
    user: string;
}

export const getMarketActivity = async (limit?: number): Promise<MarketActivity[]> => {
    try {
        const url = limit ? `${API_URL}/market/activity?limit=${limit}` : `${API_URL}/market/activity`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch activity');
        return data.data;
    } catch (error) {
        console.error('[API] Market activity error:', error);
        return [];
    }
};

export interface PlatformStats {
    totalScans: number;
    hotMarkets: number;
    avgDominance: number;
    totalRevenue: string;
}

export const getPlatformStats = async (): Promise<PlatformStats> => {
    try {
        const res = await fetch(`${API_URL}/market/stats`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
        return data.data;
    } catch (error) {
        console.error('[API] Platform stats error:', error);
        return { totalScans: 0, hotMarkets: 0, avgDominance: 0, totalRevenue: '$0' };
    }
};

// ==========================================
// BLOG API
// ==========================================

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content?: string;
    author: string;
    authorRole: string;
    date: string;
    readTime: string;
    category: string;
    tags: string[];
    featured: boolean;
    image: string;
}

export interface BlogListResponse {
    posts: BlogPost[];
    categories: string[];
    total: number;
}

export const getBlogPosts = async (params?: { category?: string; search?: string; featured?: boolean }): Promise<BlogListResponse> => {
    try {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.append('category', params.category);
        if (params?.search) searchParams.append('search', params.search);
        if (params?.featured) searchParams.append('featured', 'true');
        
        const url = `${API_URL}/blog${searchParams.toString() ? `?${searchParams}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch blog posts');
        return data.data;
    } catch (error) {
        console.error('[API] Blog posts error:', error);
        return { posts: [], categories: [], total: 0 };
    }
};

export const getBlogPostBySlug = async (slug: string): Promise<{ post: BlogPost; relatedPosts: BlogPost[] } | null> => {
    try {
        const res = await fetch(`${API_URL}/blog/${slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch blog post');
        return data.data;
    } catch (error) {
        console.error('[API] Blog post error:', error);
        return null;
    }
};

export const getBlogCategories = async (): Promise<{ name: string; count: number }[]> => {
    try {
        const res = await fetch(`${API_URL}/blog/categories`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
        return data.data;
    } catch (error) {
        console.error('[API] Blog categories error:', error);
        return [];
    }
};
