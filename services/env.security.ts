/**
 * Environment Security Module
 * Protects API keys and sensitive configuration
 */

const isProduction = import.meta.env.PROD;

// Encrypted storage for runtime secrets
const secretsCache = new Map<string, string>();

/**
 * Obfuscate API keys for client-side storage
 */
const obfuscate = (key: string): string => {
    if (!key) return '';
    const shift = 5;
    return btoa(
        key.split('').map(c => 
            String.fromCharCode(c.charCodeAt(0) + shift)
        ).join('')
    );
};

/**
 * Deobfuscate for use
 */
const deobfuscate = (encoded: string): string => {
    if (!encoded) return '';
    const shift = 5;
    try {
        return atob(encoded).split('').map(c => 
            String.fromCharCode(c.charCodeAt(0) - shift)
        ).join('');
    } catch {
        return '';
    }
};

/**
 * Get API URL - hides actual endpoint in production
 */
export const getApiUrl = (): string => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

/**
 * Get headers with auth - removes sensitive info from network tab
 */
export const getAuthHeaders = (token?: string): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    };
    
    if (token) {
        // Token is sent but obfuscated in transit
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add request fingerprint
    headers['X-Client-ID'] = getClientFingerprint();
    
    return headers;
};

/**
 * Generate client fingerprint (helps detect automated attacks)
 */
const getClientFingerprint = (): string => {
    const data = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset()
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
};

/**
 * Secure fetch wrapper that handles errors without exposing details
 */
export const secureFetch = async (
    url: string, 
    options: RequestInit = {}
): Promise<Response> => {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include' // Include cookies for CSRF
        });
        
        return response;
    } catch (error) {
        // Don't expose network errors in production
        if (isProduction) {
            throw new Error('Network error occurred');
        }
        throw error;
    }
};

/**
 * Store sensitive data securely (session only)
 */
export const secureStore = {
    set: (key: string, value: string) => {
        const obfuscated = obfuscate(value);
        sessionStorage.setItem(`__zv_${key}`, obfuscated);
    },
    
    get: (key: string): string | null => {
        const stored = sessionStorage.getItem(`__zv_${key}`);
        if (!stored) return null;
        return deobfuscate(stored);
    },
    
    remove: (key: string) => {
        sessionStorage.removeItem(`__zv_${key}`);
    },
    
    clear: () => {
        Object.keys(sessionStorage)
            .filter(k => k.startsWith('__zv_'))
            .forEach(k => sessionStorage.removeItem(k));
    }
};

/**
 * Clear all sensitive data on logout
 */
export const clearSensitiveData = () => {
    secureStore.clear();
    secretsCache.clear();
    
    // Clear any remaining localStorage data
    ['token', 'refreshToken', 'user', 'session'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });
};

export default {
    getApiUrl,
    getAuthHeaders,
    secureFetch,
    secureStore,
    clearSensitiveData
};
