import { User, Referral } from '../types';

const API_URL = 'http://localhost:5000/api/v1';

const getHeaders = () => {
    const session = localStorage.getItem('ex_zakvibe_session');
    const token = session ? JSON.parse(session).token : '';
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const initializeMockDatabase = () => {
    console.log(`✅ Connecting to Backend at ${API_URL}`);
};

export const loginUser = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    const user = { ...data.user, token: data.token };
    localStorage.setItem('ex_zakvibe_session', JSON.stringify(user));
    return user;
};

export const registerUser = async (name: string, email: string, password: string, role: any, referralCode?: string, instituteName?: string, instituteLocation?: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, referralCode, instituteName, instituteLocation })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    
    return { id: data.userId, name, email, role, isApproved: data.isApproved };
};

export const getSession = (): User | null => {
    const sess = localStorage.getItem('ex_zakvibe_session');
    return sess ? JSON.parse(sess) : null;
};

export const logout = () => {
    localStorage.removeItem('ex_zakvibe_session');
};

export const generateMockProducts = async (count: number) => {
    try {
        const res = await fetch(`${API_URL}/xray/demo-data?count=${count}`);
        if(!res.ok) throw new Error("Failed to fetch demo data");
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const getMarketplaceComparisons = (p: any) => [
    { name: 'eBay', price: p.price * 0.9, logo: 'EB', shipping: 'Free' },
    { name: 'Walmart', price: p.price * 0.95, logo: 'WM', shipping: '2-Day' },
    { name: 'AliExpress', price: p.price * 0.4, logo: 'AX', shipping: '15-Day' },
    { name: 'Alibaba', price: p.price * 0.3, logo: 'AL', shipping: 'Sea Freight' }
];

export const getMockReferrals = async (id: string): Promise<Referral[]> => {
    try {
        const res = await fetch(`${API_URL}/user/dashboard`, { headers: getHeaders() });
        const data = await res.json();
        return data.referrals || [];
    } catch (e) {
        return [];
    }
};

export const withdrawFunds = async (amount: number, account: string) => {
    try {
        const res = await fetch(`${API_URL}/wallet/withdraw`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount, account })
        });
        const data = await res.json();
        return data.success;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const generateReferralCode = async (userId: string) => {
    try {
        const res = await fetch(`${API_URL}/user/generate-code`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = await res.json();
        return { code: data.code, expiry: data.expiry };
    } catch (e) {
        throw new Error("Failed to generate code");
    }
};

export const validateReferralCode = async (code: string) => {
    try {
        const res = await fetch(`${API_URL}/user/validate-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        return await res.json();
    } catch (e) {
        return { valid: false, message: 'Server Error' };
    }
};

export const submitPayment = async (userId: string) => {
    await fetch(`${API_URL}/user/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
};

export const pollApprovalStatus = async (userId: string) => {
    try {
        const res = await fetch(`${API_URL}/user/approval-status?userId=${userId}`);
        const data = await res.json();
        return data.approved;
    } catch (e) {
        return false;
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

export const mockAdminApprove = async (userId: string) => {
    console.warn("Admin approval is not available via API in this version.");
};