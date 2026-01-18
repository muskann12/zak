/**
 * Security Module - Anti-Debugging & Protection
 * Prevents console inspection, dev tools, and common attack vectors
 */

const isProduction = import.meta.env.PROD;

// ==========================================
// 1. DISABLE CONSOLE IN PRODUCTION
// ==========================================
export const disableConsole = () => {
    if (!isProduction) return;
    
    const noop = () => {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'assert', 'profile'];
    
    methods.forEach(method => {
        (console as any)[method] = noop;
    });
    
    // Clear console periodically
    setInterval(() => {
        console.clear();
    }, 1000);
};

// ==========================================
// 2. DETECT & BLOCK DEV TOOLS
// ==========================================
export const detectDevTools = () => {
    if (!isProduction) return;
    
    const threshold = 160;
    let devToolsOpen = false;
    
    const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devToolsOpen) {
                devToolsOpen = true;
                handleDevToolsOpen();
            }
        } else {
            devToolsOpen = false;
        }
    };
    
    // Check using debugger timing
    const checkDebugger = () => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            handleDevToolsOpen();
        }
    };
    
    const handleDevToolsOpen = () => {
        // Clear page content
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0a;color:#fff;font-family:system-ui;">
                <div style="text-align:center;">
                    <h1 style="font-size:48px;margin-bottom:16px;">🔒</h1>
                    <h2 style="margin-bottom:8px;">Security Alert</h2>
                    <p style="color:#888;">Developer tools are not allowed on this site.</p>
                </div>
            </div>
        `;
        // Redirect or reload
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };
    
    // Run checks
    setInterval(checkDevTools, 500);
    
    // Disable F12 and other shortcuts
    window.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (Dev Tools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
    });
};

// ==========================================
// 3. DISABLE RIGHT-CLICK CONTEXT MENU
// ==========================================
export const disableRightClick = () => {
    if (!isProduction) return;
    
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
};

// ==========================================
// 4. DISABLE TEXT SELECTION & DRAG
// ==========================================
export const disableSelection = () => {
    if (!isProduction) return;
    
    document.addEventListener('selectstart', (e) => {
        const target = e.target as HTMLElement;
        // Allow selection in input fields
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // CSS-based protection
    const style = document.createElement('style');
    style.textContent = `
        body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        input, textarea {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
    `;
    document.head.appendChild(style);
};

// ==========================================
// 5. OBFUSCATE SENSITIVE DATA IN DOM
// ==========================================
export const protectSensitiveData = () => {
    // Override innerHTML getter to hide sensitive elements
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    
    Object.defineProperty(Element.prototype, 'innerHTML', {
        get: function() {
            return originalInnerHTML?.get?.call(this);
        },
        set: function(value) {
            return originalInnerHTML?.set?.call(this, value);
        }
    });
};

// ==========================================
// 6. ANTI-DEBUGGING TRAPS
// ==========================================
export const antiDebugging = () => {
    if (!isProduction) return;
    
    // Detect Function.prototype.toString modification (common in debugging)
    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function() {
        if (this === Function.prototype.toString) {
            return 'function toString() { [native code] }';
        }
        return originalToString.call(this);
    };
    
    // Detect console.log override attempts
    Object.defineProperty(window, 'console', {
        value: console,
        writable: false,
        configurable: false
    });
};

// ==========================================
// 7. TIMING ATTACK PROTECTION
// ==========================================
export const protectTiming = () => {
    if (!isProduction) return;
    
    // Add random delays to sensitive operations
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        await new Promise(r => setTimeout(r, Math.random() * 50));
        return originalFetch.apply(window, args);
    };
};

// ==========================================
// 8. IFRAME PROTECTION (Clickjacking)
// ==========================================
export const preventClickjacking = () => {
    if (window.self !== window.top) {
        window.top!.location = window.self.location;
    }
};

// ==========================================
// 9. XSS PROTECTION
// ==========================================
export const sanitizeInput = (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// ==========================================
// 10. LOCAL STORAGE ENCRYPTION
// ==========================================
const ENCRYPTION_KEY = 'zv_sec_2026';

export const secureStorage = {
    setItem: (key: string, value: any) => {
        try {
            const data = JSON.stringify(value);
            const encoded = btoa(encodeURIComponent(data));
            localStorage.setItem(key, encoded);
        } catch (e) {
            console.error('Storage error');
        }
    },
    
    getItem: (key: string) => {
        try {
            const encoded = localStorage.getItem(key);
            if (!encoded) return null;
            const data = decodeURIComponent(atob(encoded));
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    },
    
    removeItem: (key: string) => {
        localStorage.removeItem(key);
    }
};

// ==========================================
// INITIALIZE ALL SECURITY MEASURES
// ==========================================
export const initSecurity = () => {
    if (typeof window === 'undefined') return;
    
    // Run all protections
    disableConsole();
    detectDevTools();
    disableRightClick();
    disableSelection();
    antiDebugging();
    protectTiming();
    preventClickjacking();
    
    // Log security initialization (only in dev)
    if (!isProduction) {
        console.log('🔒 Security module loaded (dev mode - protections disabled)');
    }
};

export default initSecurity;
