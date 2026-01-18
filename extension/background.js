chrome.runtime.onInstalled.addListener(() => {
    console.log("ZakVibe Pro Extension Installed");
});

// Proxy for External APIs to avoid CORS issues in content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 1. SerpApi Direct Proxy (Legacy/Direct) - REMOVED FOR SECURITY
    // We now route everything through the backend to protect API keys.

    // 2. Backend Analysis Proxy (The Real Data Integration)
    if (request.action === 'ANALYZE_PRODUCTS') {
        // We use the backend API provided in popup.js logic (localhost:5001)
        const API_URL = "http://localhost:5001/api"; 
        
        const analyze = async () => {
            try {
                const response = await fetch(`${API_URL}/market/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // If products are sent, we can use them, but backend prefers keyword/url to use SerpApi
                        url: request.url, 
                        keyword: request.keyword,
                        products: request.products 
                    })
                });

                const json = await response.json();
                
                if (json.success) {
                    // Backend returns { marketData: { products: [...] } } or similar
                    // We need to match the structure content.js expects
                    // content.js expects { success: true, data: [productModals] }
                    
                    // The backend API returns: { success: true, data: { products: [], ... } }
                    sendResponse({ success: true, data: json.data.products });
                } else {
                    sendResponse({ success: false, error: json.message });
                }
            } catch (error) {
                console.error("Backend error:", error);
                sendResponse({ success: false, error: "Connection to ZakVibe Backend failed" });
            }
        };

        analyze();
        return true; // Async
    }

    if (request.action === 'FIND_SOURCING') {
        const API_URL = "http://localhost:5001/api"; 
        fetch(`${API_URL}/market/sourcing`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ query: request.query })
        })
        .then(r => r.json())
        .then(json => sendResponse(json))
        .catch(e => {
            console.error("Sourcing Error:", e);
            sendResponse({ success: false, error: e.message });
        });
        return true;
    }
});
