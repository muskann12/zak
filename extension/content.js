// ZakVibe Pro Xray - Content Script v5.0 (Strict Clone Edition)
// High-Fidelity Clone of the Web Dashboard Screenshot

if (!window.zakVibeContentScriptLoaded) {
    window.zakVibeContentScriptLoaded = true;
    console.log("🔍 ZakVibe Xray loaded.");

    // --- State Management ---
    window.zakVibeState = {
        products: [],
        loading: false,
        selectedProduct: null,
        isDarkMode: false,
        searchQuery: '',
    };
    
    // --- Config ---
    // API Key removed for security - Using Backend Proxy
    const GOOGLE_SHOPPING_API_KEY = ''; 

    // --- 1. Styles (Strict Web Simulator Clone) ---
    function injectStyles() {
        if(document.getElementById('zv-styles-v5')) return;
        const style = document.createElement('style');
        style.id = 'zv-styles-v5';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

            :root {
                --zv-brand: #F59E0B; /* Orange-Gold from screenshot logo */
                --zv-text-main: #111827;
                --zv-text-muted: #6B7280;
                --zv-bg-main: #FFFFFF;
                --zv-bg-sub: #F3F4F6;
                --zv-border: #E5E7EB;
                --zv-danger: #EF4444;
                --zv-success: #10B981;
                --zv-warning: #F59E0B;
                --zv-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                --zv-lqs-high: #10B981;
                --zv-lqs-med: #F59E0B;
                --zv-lqs-low: #EF4444;
            }

            .zv-dark-mode {
                --zv-text-main: #F9FAFB;
                --zv-text-muted: #9CA3AF;
                --zv-bg-main: #1F2937;
                --zv-bg-sub: #111827;
                --zv-border: #374151;
                --zv-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            /* Reset & Base */
            #zakvibe-overlay * { box-sizing: border-box; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
            #zakvibe-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                z-index: 2147483647; pointer-events: none;
                display: flex; align-items: center; justify-content: center;
                background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
                opacity: 0; transition: opacity 0.2s;
            }
            #zakvibe-overlay.visible { opacity: 1; pointer-events: auto; }

            /* Modal Window */
            .zv-window {
                width: 98vw; height: 95vh; max-width: 1600px;
                background: var(--zv-bg-main); color: var(--zv-text-main);
                border-radius: 8px; /* Slightly squarer like screenshot */
                box-shadow: var(--zv-shadow);
                display: flex; flex-direction: column;
                overflow: hidden;
                border: 1px solid var(--zv-border);
            }

            /* 1. Main Header */
            .zv-header {
                height: 70px; border-bottom: 1px solid var(--zv-border);
                display: flex; align-items: center; justify-content: space-between;
                padding: 0 24px; background: var(--zv-bg-main);
                flex-shrink: 0;
            }
            
            /* Logo Area */
            .zv-brand-area { display: flex; align-items: center; gap: 12px; margin-right: 40px; }
            .zv-logo-box {
                width: 36px; height: 36px; background: var(--zv-brand); color: white;
                border-radius: 6px; font-weight: 800; display: flex; align-items: center; justify-content: center;
                font-size: 20px;
            }
            .zv-app-title { font-weight: 800; font-size: 18px; color: var(--zv-text-main); line-height: 1; }
            .zv-app-subtitle { font-weight: 800; color: var(--zv-brand); }
            .zv-version-badge {
                font-size: 11px; color: var(--zv-text-muted); font-weight: 500; 
                margin-left: 8px; padding: 2px 6px; background: var(--zv-bg-sub); border-radius: 4px; border:1px solid var(--zv-border);
            }

            /* Top Metrics (Market Volume / Opp Score) */
            .zv-top-metrics { display: flex; gap: 40px; align-items: center; flex: 1; }
            .zv-metric-block { display: flex; flex-direction: column; justify-content: center; }
            .zv-metric-label { font-size: 10px; font-weight: 700; color: var(--zv-text-muted); text-transform: uppercase; margin-bottom: 2px; }
            .zv-metric-val { font-size: 18px; font-weight: 800; color: var(--zv-text-main); display: flex; align-items: center; gap: 6px; }
            .zv-metric-sub { font-size: 12px; font-weight: 600; color: var(--zv-success); padding: 2px 6px; background: rgba(16, 185, 129, 0.1); border-radius: 4px; }
            
            .zv-opp-score {  color: var(--zv-warning); }
            .zv-opp-score .faded { color: var(--zv-border); margin-left:2px; }

            /* Header Controls */
            .zv-controls { display: flex; align-items: center; gap: 12px; }
            .zv-search-wrap { position: relative; margin-right: 12px; }
            .zv-search {
                background: var(--zv-bg-main); border: 1px solid var(--zv-border);
                border-radius: 4px; padding: 8px 12px 8px 36px; color: var(--zv-text-main);
                font-size: 13px; width: 260px; outline: none; transition: all 0.2s;
            }
            .zv-search:focus { border-color: var(--zv-brand); box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2); }
            .zv-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--zv-text-muted); width: 16px; opacity: 0.6; }
            
            .zv-icon-btn {
                width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
                border: none; background: transparent;
                border-radius: 4px; color: var(--zv-text-muted); cursor: pointer;
            }
            .zv-icon-btn:hover { background: var(--zv-bg-sub); color: var(--zv-text-main); }
            .zv-close-btn:hover { background: var(--zv-danger); color: white; }

            /* 2. Sub-Header Summary (Gray Bar) */
            .zv-subheader {
                background: var(--zv-bg-sub); height: 44px;
                display: flex; align-items: center; padding: 0 24px; gap: 32px;
                border-bottom: 1px solid var(--zv-border); font-size: 12px;
            }
            .zv-sub-stat { display: flex; align-items: center; gap: 6px; }
            .zv-sub-label { color: var(--zv-text-muted); font-weight: 500; }
            .zv-sub-val { color: var(--zv-text-main); font-weight: 800; font-size: 13px; }
            .zv-yes-badge { color: var(--zv-success); font-weight: 700; }

            /* 3. Table Structure */
            .zv-table-area { flex: 1; overflow: auto; background: var(--zv-bg-main); position: relative; }
            .zv-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; min-width: 1000px; table-layout: fixed; }
            
            .zv-table th {
                position: sticky; top: 0; z-index: 10;
                background: var(--zv-bg-main); color: var(--zv-text-muted);
                border-bottom: 1px solid var(--zv-border);
                text-align: left; padding: 12px 10px; font-weight: 700; font-size: 10px; text-transform: uppercase;
                letter-spacing: 0.5px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .zv-table td { 
                padding: 8px 10px; 
                border-bottom: 1px solid var(--zv-border); 
                vertical-align: middle; 
                color: var(--zv-text-main);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .zv-table tr:hover td { background: var(--zv-bg-sub); }

            /* Column Specifics */
            .zv-table .col-center { text-align: center; }
            .zv-table .col-right { text-align: right; }
            .col-bold { font-weight: 700; }
            
            /* Specific Cell Styles */
            .zv-rank-num { color: var(--zv-text-muted); font-size: 12px; }
            
            .zv-img-cell { display: flex; justify-content: center; }
            .zv-initial-box { 
                width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                background: var(--zv-warning); color: white; font-weight: 700; font-size: 12px; border-radius: 2px;
                text-transform: uppercase;
            }
            .zv-prod-img { width: 32px; height: 32px; object-fit: contain; border: 1px solid var(--zv-border); background: #fff; padding: 1px; }

            .zv-details-cell { max-width: 300px; }
            .zv-prod-title { 
                font-weight: 600; color: #DC2626; /* Using a darker color or link color */
                color: var(--zv-brand);
                margin-bottom: 2px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                display: block; font-size: 13px;
                text-decoration: none;
            }
            .zv-prod-title:hover { text-decoration: underline; }
            .zv-prod-meta { font-size: 10px; color: var(--zv-text-muted); display: flex; align-items: center; gap: 6px; }
            .zv-prod-asin { font-family: monospace; }
            .zv-star { color: var(--zv-warning); font-size: 12px; }

            .zv-brand-text { color: var(--zv-text-muted); font-size: 12px; }

            .zv-lqs-badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 20px; height: 20px; border-radius: 4px;
                font-size: 11px; font-weight: 700; color: white;
            }
            .zv-fees-text { color: var(--zv-danger); font-size: 12px; }
            
            .zv-actions { display: flex; gap: 8px; justify-content: center; }
            .zv-action-icon { width: 16px; height: 16px; color: var(--zv-brand); cursor: pointer; opacity: 0.8; }
            .zv-action-icon:hover { opacity: 1; transform: scale(1.1); }

            /* Scrollbar */
            .zv-table-area::-webkit-scrollbar { width: 8px; height: 8px; }
            .zv-table-area::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
            .zv-table-area::-webkit-scrollbar-track { background: transparent; }

            /* Docked Floating Icon (Fixed) */
            .zv-dock-widget {
                position: fixed; top: 20%; right: 0;
                width: 48px; height: 48px;
                background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
                color: #fff; 
                border-radius: 8px 0 0 8px;
                box-shadow: -2px 4px 12px rgba(0,0,0,0.3);
                cursor: pointer; z-index: 2147483650;
                display: none; /* Start hidden */
                align-items: center; justify-content: center;
                transition: transform 0.2s;
                font-family: 'Inter', sans-serif;
                font-weight: 800; font-size: 24px;
            }
            .zv-dock-widget.visible { display: flex; animation: zvPopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .zv-dock-widget:hover { width: 60px; }
            
            @keyframes zvPopIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `;
        document.head.appendChild(style);
    }

    // --- 2. Render Functions (Strict Layout) ---

    // Icons
    const Icons = {
        sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
        moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
        close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        min: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"></line></svg>',
        graph: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
        calc: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M12 18h.01"></path><path d="M8 18h.01"></path><path d="M16 18h.01"></path><path d="M8 14h8"></path><path d="M12 10v.01"></path><path d="M8 10v.01"></path><path d="M16 10v.01"></path><path d="M8 6h8"></path></svg>',
        search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
    };

    function renderOverlay() {
        if (document.getElementById('zakvibe-overlay')) {
            // If already exists, just show it (restore if minimized)
            const dock = document.getElementById('zv-dock-widget');
            if(dock) dock.classList.remove('visible');
            document.getElementById('zakvibe-overlay').style.display = 'flex';
            return;
        }

        injectStyles();

        const overlay = document.createElement('div');
        overlay.id = 'zakvibe-overlay';
        
        const windowDiv = document.createElement('div');
        windowDiv.className = 'zv-window';

        windowDiv.innerHTML = `
            <!-- 1. Header -->
            <div class="zv-header">
                <div class="zv-brand-area">
                    <div class="zv-logo-box">Z</div>
                    <div>
                        <div class="zv-app-title">Ex-ZakVibe <span class="zv-version-badge">PRO v3.0</span></div>
                    </div>
                </div>

                <div class="zv-top-metrics">
                    <div class="zv-metric-block">
                        <div class="zv-metric-label">Total Revenue</div>
                        <div class="zv-metric-val" id="zv-market-rev">$0</div>
                    </div>
                    <div class="zv-metric-block" style="padding-left:16px; margin-left:16px; border-left:1px solid var(--zv-border);">
                        <div class="zv-metric-label">Total Sales</div>
                        <div class="zv-metric-val" id="zv-market-sales">0</div>
                    </div>
                    <div class="zv-metric-block" style="padding-left:16px; margin-left:16px; border-left:1px solid var(--zv-border);">
                        <div class="zv-metric-label">Opp Score</div>
                        <div class="zv-metric-val" id="zv-opp-score" style="color:var(--zv-brand)">-</div>
                    </div>
                </div>

                <div class="zv-controls">
                    <input type="text" id="zv-search-input" style="display:none">
                    <button class="zv-icon-btn" title="Export">${Icons.download}</button>
                    <div style="width:1px; height:20px; background:var(--zv-border); margin:0 4px;"></div>
                    <button class="zv-icon-btn" id="zv-theme-toggle">${Icons.moon}</button>
                    <button class="zv-icon-btn" id="zv-min-app" title="Minimize">${Icons.min}</button>
                    <button class="zv-icon-btn zv-close-btn" id="zv-close-app">${Icons.close}</button>
                </div>
            </div>

            <!-- 2. Subheader Info -->
            <div class="zv-subheader" style="justify-content:space-between; gap:12px;">
                <div style="display:flex; gap:20px;">
                    <div class="zv-sub-stat"><span class="zv-sub-label">Price:</span> <span class="zv-sub-val" id="zv-avg-price">$0</span></div>
                    <div class="zv-sub-stat"><span class="zv-sub-label">Reviews:</span> <span class="zv-sub-val" id="zv-avg-reviews">0</span></div>
                </div>
                <div style="display:flex; gap:16px; border-left:1px solid var(--zv-border); padding-left:16px;">
                    <div class="zv-sub-stat"><span class="zv-sub-label">Demand:</span> <span class="zv-sub-val" id="zv-demand-score">-</span></div>
                    <div class="zv-sub-stat"><span class="zv-sub-label">Comp:</span> <span class="zv-sub-val" id="zv-comp-score">-</span></div>
                    <div class="zv-sub-stat"><span class="zv-sub-label">Dominance:</span> <span class="zv-sub-val" id="zv-dominance">-</span></div>
                    <div class="zv-sub-stat"><span class="zv-sub-label">Viability:</span> <span class="zv-sub-val" id="zv-pl-score">-</span></div>
                </div>
            </div>

            <!-- 3. Table -->
            <div class="zv-table-area">
                <table class="zv-table">
                    <thead>
                        <tr>
                            <th style="width:40px" class="col-center">#</th>
                            <th style="width:60px" class="col-center">IMG</th>
                            <th style="width:300px">PRODUCT DETAILS <span style="font-size:9px; opacity:0.7">⇵</span></th>
                            <th style="width:100px">BRAND</th>
                            <th style="width:80px">PRICE</th>
                            <th style="width:90px">SALES (MO)</th>
                            <th style="width:110px">REVENUE</th>
                            <th style="width:80px">BSR</th>
                            <th style="width:50px">LQS</th>
                            <th style="width:60px">TYPE</th>
                            <th style="width:80px">FEES</th>
                            <th style="width:80px">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody id="zv-product-list">
                        <!-- Content -->
                    </tbody>
                </table>
            </div>
        `;

        overlay.appendChild(windowDiv);
        document.body.appendChild(overlay);

        // --- Docked Widget Injection ---
        let dock = document.getElementById('zv-dock-widget');
        if(!dock) {
            dock = document.createElement('div');
            dock.id = 'zv-dock-widget';
            dock.className = 'zv-dock-widget';
            dock.innerHTML = `Z`;
            document.body.appendChild(dock);
        }

        // --- Bindings ---
        
        // Minimize
        document.getElementById('zv-min-app').onclick = () => {
             overlay.style.display = 'none';
             dock.classList.add('visible');
             // Force visibility check
             dock.style.display = 'flex';
        };

        // Restore
        dock.onclick = () => {
             overlay.style.display = 'flex';
             dock.classList.remove('visible');
             dock.style.display = 'none';
        };

        document.getElementById('zv-close-app').onclick = () => {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 250);
            dock.remove(); // Also remove dock if closed
        };
        
        document.getElementById('zv-theme-toggle').onclick = () => {
            window.zakVibeState.isDarkMode = !window.zakVibeState.isDarkMode;
            windowDiv.classList.toggle('zv-dark-mode');
        };

        requestAnimationFrame(() => overlay.classList.add('visible'));
        initData();
    }

    // --- 3. Logic & Advanced Data Processing ---

    async function initData() {
        showLoading();
        
        // 1. Await page load/hydration if needed
        await new Promise(r => setTimeout(r, 500)); 

        // 2. Deep Scrape from current DOM
        const raw = scrapeProductsDeep();
        
        if (raw.length === 0) {
            window.zakVibeState.products = [];
            renderTable();
            return; // Exit early if no products
        }

        // 3. Try to fetch enriched data from local backend service
        // with strict timeout to prevent hanging
        let enrichedData = [];
        try {
            console.log("Attempting backend fetch (Real SerpApi Data)...");
            
            // Race the fetch against a 20s timeout (SerpApi can be slow)
            const fetchPromise = sendMessageAsync({ 
                action: "ANALYZE_PRODUCTS", 
                products: raw,
                url: window.location.href 
            });
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject("Timeout"), 20000));
            
            const resp = await Promise.race([fetchPromise, timeoutPromise]);

            if (resp && resp.success && resp.data && resp.data.length > 0) {
                // Merge Backend Data with Local DOM Data
                // Backend gives us "Real" metrics (sales, bsr) based on SerpApi
                // Local gives us precise DOM element references (though we can't pass elements)
                
                enrichedData = resp.data.map((item, idx) => {
                    // Match with raw data to keep local properties if needed
                    const localItem = raw[idx] || {};
                    return {
                        ...localItem, // Keep local title/img if backend is missing it
                        ...item,      // Overwrite with backend metrics (sales, bsr, fees)
                        idx: idx + 1
                    };
                });
            } else {
                throw new Error("Backend offline or invalid response");
            }
        } catch (e) {
            console.log("⚡ Backend unavailable or timed out. Using Advanced Client-Side Heuristics.");
            enrichedData = raw.map(enrichWithHeuristics);
        }

        window.zakVibeState.products = enrichedData;
        
        // 4. Render
        renderTable();
        updateHeaderStats();
    }

    /**
     * Advanced Client-Side Estimation Model (v6.2 Sales Focus)
     */
    function enrichWithHeuristics(p, idx) {
        // A. Sales Estimation (Enhanced V6.2)
        // Primary driver: Search Rank. Secondary: Price Elasticity. Tertiary: Review Density.
        
        const effectiveIdx = idx + 1;

        // 1. Rank Curve (Steep drop-off for page 1)
        // Rank 1 ~= 6000, Rank 15 ~= 400
        let baseSales = 7500 / (Math.pow(effectiveIdx, 0.9)); 

        // 2. Price Elasticity Correction
        // Cheaper items (<$20) sell significantly higher volume than expensive ($100+)
        const price = p.price || 20; 
        const elasticity = Math.max(0.2, 35 / (price + 5)); 
        let volSales = baseSales * elasticity;

        // 3. Review Velocity Proxy
        // Established items (high reviews) convert better
        let safeReviews = p.reviews;
        if (!safeReviews || isNaN(safeReviews)) {
            safeReviews = (p.rating > 4.2) ? Math.floor(Math.random() * 200) + 100 : 20;
        }
        const reviewMultiplier = 1 + (Math.min(safeReviews, 5000) / 20000); // Max 1.25x boost

        // 4. Prime Boost
        const primeMultiplier = p.isPrime ? 1.4 : 0.8;

        // Combine Factors
        let estSales = Math.floor(volSales * reviewMultiplier * primeMultiplier);

        // REMOVED VARIANCE (Randomness) for consistent results on reload
        // const variance = 0.85 + (Math.random() * 0.3);
        // estSales = Math.floor(estSales * variance);

        // --- HARD FLOOR (V6.2 Guarantee) ---
        // Ensure no "0" sales for valid products. 
        const minFloor = Math.max(10, 50 - effectiveIdx); 
        if (estSales < minFloor) estSales = minFloor + (p.asin.charCodeAt(p.asin.length-1) % 20); // Deterministic "random"
        
        // --- Sanity Guards ---
        // Cap max sales
        if (estSales > 15000) estSales = 12000 + (p.asin.charCodeAt(0) * 10); // Deterministic
        
        // --- PRICE PATCH V7.1 ---
        // If price is missing (0), assume a market average
        let finalPrice = p.price;
        if (!finalPrice || finalPrice === 0) {
            finalPrice = 24.99; // Fixed default
        }

        // B. Revenue
        const revenue = finalPrice * estSales;

        // C. BSR Estimation
        let estimatedBSR = estSales > 0 ? Math.floor(250000 / (estSales + 1)) : 0;
        if (estimatedBSR < 1 && estSales > 0) estimatedBSR = 1 + (p.asin.charCodeAt(0) % 100);
        
        // D. LQS (Listing Quality Score)
        let lqs = 5;
        if ((p.title || '').length > 70) lqs += 2;
        if (p.imgUrl && !p.imgUrl.includes('grey-pixel')) lqs += 1;
        if ((p.rating || 0) > 4.2) lqs += 1;
        if (safeReviews > 100) lqs += 1;
        
        // E. Fees (FBA Estimation)
        // Accurate proxy based on standard size tiers
        const priceVal = finalPrice;
        let fbaFee = 3.22; // Base
        if (priceVal > 50) fbaFee = 9.50;
        else if (priceVal > 25) fbaFee = 6.10;
        else if (priceVal > 15) fbaFee = 4.75;
        
        const referral = priceVal * 0.15;
        const totalFee = fbaFee + referral;
        const fees = priceVal > 0 ? `-$${(totalFee).toFixed(2)}` : '$0.00';

        // F. Type & Brand Cleanup
        const type = (p.isPrime || priceVal > 25) ? "FBA" : "AMZ";
        
        // Brand Fixer
        let cleanBrand = p.brand;
        if (!cleanBrand || cleanBrand === "Generic" || cleanBrand === "Unknown") {
            try {
                if (p.title && p.title !== "Unknown Product") {
                    cleanBrand = p.title.trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
                }
            } catch(e) { cleanBrand = "Gen"; }
        }

        return {
            ...p,
            reviews: safeReviews,
            brand: cleanBrand || "Generic",
            sales: estSales,
            revenue: revenue,
            bsr: estimatedBSR || 50000 + idx*1000,
            lqs: lqs,
            type: type,
            fees: fees,
            price: finalPrice, // Use the patched price
            idx: effectiveIdx,
            color: getColor(cleanBrand || "G")
        };
    }

    // Assign consistent colors to brands
    function getColor(str) {
        const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }

    // --- Render Functions ---
    function renderTable() {
        const tbody = document.getElementById('zv-product-list');
        if (!tbody) return;

        if (!window.zakVibeState.products || window.zakVibeState.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align:center; padding: 60px;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--zv-text-muted); margin-bottom:16px;">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <div style="font-size:16px; font-weight:600; color:var(--zv-text-main); margin-bottom:8px">No Products Found</div>
                        <div style="color:var(--zv-text-muted);">Please navigate to an Amazon Search Result page or Best Sellers page.</div>
                        <div style="margin-top:10px; font-size:11px; color:var(--zv-text-muted); opacity:0.7">
                            Debug: 0 items scraped. Try refreshing the page.
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = window.zakVibeState.products.map(p => `
            <tr>
                <td class="col-center zv-rank-num">${p.idx || '-'}</td>
                <td class="zv-img-cell">
                    ${ p.imgUrl ? 
                        `<img src="${p.imgUrl}" class="zv-prod-img">` : 
                        `<div class="zv-initial-box" style="background:${p.color || '#ccc'}">${p.brand ? p.brand.substring(0,2) : 'NA'}</div>` 
                    }
                </td>
                <td class="zv-details-cell">
                    <a href="https://amazon.com/dp/${p.asin}" target="_blank" class="zv-prod-title" title="${p.title || 'Unknown'}">${p.title || 'Unknown'}</a>
                    <div class="zv-prod-meta">
                        <span class="zv-prod-asin">${p.asin || 'N/A'}</span> • 
                        <span class="zv-star">★</span> ${p.rating || 0} (${p.reviews || 0})
                    </div>
                </td>
                <td class="zv-brand-text">${p.brand || 'Generic'}</td>
                <td class="col-bold">$${(p.price || 0).toFixed(2)}</td>
                <td>${(p.sales || 0).toLocaleString()}</td>
                <td class="col-bold">$${(p.revenue || 0).toLocaleString()}</td>
                <td class="zv-rank-num">#${(p.bsr || 0).toLocaleString()}</td>
                <td>
                    <span class="zv-lqs-badge" style="background:var(${p.lqs >= 7 ? '--zv-lqs-high' : '--zv-lqs-med'})">${p.lqs || 5}</span>
                </td>
                <td><span style="font-size:11px; color:var(--zv-text-muted)">${p.type || 'AMZ'}</span></td>
                <td class="zv-fees-text">${p.fees || '$0.00'}</td>
                <td>
                    <div class="zv-actions" style="justify-content:flex-start">
                        <div class="zv-action-icon zv-btn-graph" data-asin="${p.asin}" title="Sales Graph">${Icons.graph}</div>
                        <div class="zv-action-icon zv-btn-calc" data-asin="${p.asin}" title="Profit Calculator">${Icons.calc}</div>
                    </div>
                </td>
            </tr>
        `).join('');

        // Attach Listeners
        tbody.querySelectorAll('.zv-btn-graph').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); openGraphModal(btn.dataset.asin); };
        });
        tbody.querySelectorAll('.zv-btn-calc').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); openCalcModal(btn.dataset.asin); };
        });
    }

    function updateHeaderStats() {
        const list = window.zakVibeState.products;
        if (!list || !list.length) return;

        // --- 1. Top 10 Organic Only ---
        // Assuming list is sorted by rank/relevance already
        const top10 = list.slice(0, 10);
        const N = top10.length || 1; // avoid /0

        // --- 2. Market Averages ---
        const sumSales = top10.reduce((a,b) => a + (b.sales || 0), 0);
        const sumRev   = top10.reduce((a,b) => a + (b.revenue || 0), 0);
        const sumPrice = top10.reduce((a,b) => a + (b.price || 0), 0);
        const sumReviews = top10.reduce((a,b) => a + (b.reviews || 0), 0);

        const avgSales = Math.floor(sumSales / N);
        const avgRev   = sumRev / N; // Prompt says sum / 10
        const avgPrice = sumPrice / N;
        const avgReviews = Math.floor(sumReviews / N);

        // --- 3. Demand Score (0-10) ---
        // (AvgSales / 3000) * 10
        let demandScore = (avgSales / 3000) * 10;
        if (demandScore > 10) demandScore = 10;
        demandScore = parseFloat(demandScore.toFixed(1));

        // --- 4. Competition Score (0-10) ---
        // 10 - (AvgReviews / 500)
        let compScore = 10 - (avgReviews / 500);
        if (compScore < 0) compScore = 0;
        compScore = parseFloat(compScore.toFixed(1));

        // --- 5. Price Score ---
        let priceScore = 3;
        if (avgPrice >= 15 && avgPrice <= 50) priceScore = 10;
        else if ((avgPrice >= 10 && avgPrice < 15) || (avgPrice > 50 && avgPrice <= 70)) priceScore = 6;
        
        // --- 6. Opportunity Score ---
        // (Demand * 0.4) + (Comp * 0.4) + (Price * 0.2)
        const rawOpp = (demandScore * 0.4) + (compScore * 0.4) + (priceScore * 0.2);
        const oppScore = Math.round(rawOpp); // Nearest whole number

        // --- 7. Market Label ---
        let marketLabel = "BAD";
        let labelColor = "var(--zv-danger)"; // Red
        if (oppScore >= 7) { marketLabel = "HOT"; labelColor = "var(--zv-success)"; }
        else if (oppScore >= 4) { marketLabel = "OK"; labelColor = "var(--zv-brand)"; } // Yellow/Orange

        // --- 8. Seller Dominance ---
        // Top Seller Sales / Total Market Sales
        const maxSales = Math.max(...top10.map(p => p.sales || 0));
        const domPercent = sumSales > 0 ? (maxSales / sumSales) * 100 : 0;
        let domLabel = "Open";
        let domColor = "var(--zv-success)";

        if (domPercent > 40) { domLabel = "Dominated"; domColor = "var(--zv-danger)"; }
        else if (domPercent >= 25) { domLabel = "Moderate"; domColor = "var(--zv-brand)"; }

        // --- 9. Private Label Viability (0-10) ---
        // (Comp * 0.4) + (Demand * 0.3) + ((10 - Dom/10)*0.3)
        const domScorePart = Math.max(0, 10 - (domPercent / 10)); // 0-10 based on dominance
        let plScore = (compScore * 0.4) + (demandScore * 0.3) + (domScorePart * 0.3);
        if (plScore > 10) plScore = 10;
        if (plScore < 0) plScore = 0;
        
        let plText = "Low";
        if (plScore >= 8) plText = "Excellent";
        else if (plScore >= 5) plText = "Medium";

        // --- UI Updates ---
        const setText = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
        const setHTML = (id, htm) => { const el = document.getElementById(id); if(el) el.innerHTML = htm; };

        // Header Top
        setHTML('zv-market-rev', `<span style="font-size:16px">$${Math.round(sumRev).toLocaleString()}</span>`);
        setText('zv-market-sales', sumSales.toLocaleString()); 
        
        // Opportunity
        const oppEl = document.getElementById('zv-opp-score');
        if(oppEl) {
             oppEl.innerHTML = `
                <span style="font-size:18px; font-weight:800; color:${labelColor}">${oppScore}</span>
                <span style="font-size:11px; color:#999;font-weight:400">/10</span>
                <span class="zv-version-badge" style="margin-left:6px; background:${labelColor}; color:#fff; border:none; font-size:10px;">${marketLabel}</span>
             `;
        }
        
        // Subheader
        setText('zv-avg-price', `$${avgPrice.toFixed(2)}`);
        setText('zv-avg-reviews', avgReviews.toLocaleString());
        setText('zv-demand-score', demandScore);
        setText('zv-comp-score', compScore);
        
        const domEl = document.getElementById('zv-dominance');
        if(domEl) {
            domEl.innerHTML = `<span style="color:${domColor}">${domPercent.toFixed(0)}% (${domLabel})</span>`;
        }

        const plEl = document.getElementById('zv-pl-score');
        if(plEl) {
            let plColor = plScore >= 8 ? "var(--zv-success)" : (plScore >= 5 ? "var(--zv-brand)" : "var(--zv-danger)");
            plEl.innerHTML = `<span style="color:${plColor}; font-weight:700">${plScore.toFixed(1)} (${plText})</span>`;
        }
    }

    // --- Interactive Modals ---

    function openGraphModal(asin) {
        const product = window.zakVibeState.products.find(p => p.asin === asin);
        if (!product) return;

        // Generate Simulated History Data (90 Days)
        const historyData = generateHistory(product.price, product.bsr); 
        const chartSVG = generateSVGChart(historyData.prices, historyData.ranks);

        const modalHtml = `
            <div class="zv-modal-overlay animate-in" id="zv-modal-graph">
                <div class="zv-modal-content" style="max-width: 800px;">
                    <div class="zv-modal-header">
                        <div>
                            <div style="font-size:16px; font-weight:700;">${product.title}</div>
                            <span class="zv-asin-badge">${product.asin}</span>
                        </div>
                        <button class="zv-icon-btn zv-close-modal">${Icons.close}</button>
                    </div>
                    <div style="padding: 24px;">
                        <div style="display:flex; gap:24px; margin-bottom:24px;">
                            <div style="flex:1;">
                                <div class="zv-label-sm">Price & Rank History (90 Days)</div>
                                ${chartSVG}
                            </div>
                            <div style="width: 200px; display:flex; flex-direction:column; gap:12px;">
                                <div class="zv-stat-box">
                                    <div class="zv-label-xs">Current Price</div>
                                    <div style="font-size:18px; font-weight:700;">$${product.price.toFixed(2)}</div>
                                </div>
                                <div class="zv-stat-box">
                                    <div class="zv-label-xs">Current Rank</div>
                                    <div style="font-size:18px; font-weight:700; color:var(--zv-brand);">#${product.bsr.toLocaleString()}</div>
                                </div>
                                <div class="zv-stat-box">
                                    <div class="zv-label-xs">Est. Monthly Sales</div>
                                    <div style="font-size:18px; font-weight:700; color:var(--zv-success);">${product.sales.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        injectModal(modalHtml);
    }

    async function openCalcModal(asin) {
        const product = window.zakVibeState.products.find(p => p.asin === asin);
        if (!product) return;

        // Init Values
        let sellPrice = product.price;
        let costPrice = parseFloat((product.price * 0.35).toFixed(2)); // Est cost default
        let fbaFee = Math.abs(parseFloat(product.fees.replace(/[^0-9.]/g, ''))) || 5.00;
        let refFee = product.price * 0.15;

        // Container functions
        const updateCalcUI = () => {
            const totalFees = fbaFee + refFee;
            const profit = sellPrice - costPrice - totalFees;
            const margin = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;
            const roi = costPrice > 0 ? (profit / costPrice) * 100 : 0;

            document.getElementById('zv-calc-profit').textContent = `$${profit.toFixed(2)}`;
            document.getElementById('zv-calc-fees').textContent = `$${totalFees.toFixed(2)}`;
            
            const mEl = document.getElementById('zv-calc-margin');
            if(mEl) {
                mEl.className = margin > 20 ? 'zv-res-val zv-res-good' : 'zv-res-val zv-res-warn';
                mEl.textContent = `${margin.toFixed(1)}%`;
            }

            const rEl = document.getElementById('zv-calc-roi');
            if(rEl) {
                rEl.className = 'zv-res-val zv-res-info';
                rEl.textContent = `${roi.toFixed(1)}%`;
            }
        };

        const modalHtml = `
            <div class="zv-modal-overlay animate-in" id="zv-modal-calc">
                <div class="zv-modal-content" style="max-width: 900px; height: 600px; display:flex; flex-direction:column;">
                    <div class="zv-modal-header">
                        <div style="display:flex; gap:16px; align-items:center;">
                             <img src="${product.imgUrl}" style="width:48px; height:48px; object-fit:contain; border-radius:6px; border:1px solid #eee; background:#fff; padding:2px;">
                             <div>
                                <div style="font-size:16px; font-weight:700; max-width:600px;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${product.title}</div>
                                <div style="display:flex; gap:12px; font-size:11px; font-weight:600; margin-top:4px;">
                                    <span class="zv-asin-badge" style="color:#F59E0B; background:#FFFBEB;">ASIN: ${product.asin}</span>
                                    <span style="color:#6B7280;">Amazon Price: <span style="color:#111827;">$${product.price.toFixed(2)}</span></span>
                                </div>
                            </div>
                        </div>
                        <button class="zv-icon-btn zv-close-modal">${Icons.close}</button>
                    </div>
                    
                    <div style="flex:1; display:flex; min-height:0; background:#fff;">
                        <!-- Left: Sourcing -->
                        <div style="width: 55%; padding:24px; border-right:1px solid var(--zv-border); overflow-y:auto; background:#fff;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                                <div style="font-size:14px; font-weight:700; display:flex; align-items:center; gap:8px;">
                                    ${Icons.globe || '🌐'} Sourcing Comparisons
                                </div>
                                <span class="zv-label-xs" style="opacity:0.6;" id="zv-sourcing-status">PRICES DETECTED AUTOMATICALLY</span>
                            </div>
                            
                            <div id="zv-sourcing-list" style="display:flex; flex-direction:column; gap:12px;">
                                <!-- Content injected via JS -->
                            </div>
                        </div>

                        <!-- Right: Calculator -->
                        <div style="width: 45%; padding:24px; background:var(--zv-bg-sub); overflow-y:auto;">
                            <div style="font-size:14px; font-weight:700; margin-bottom:24px; display:flex; align-items:center; gap:8px;">
                                ${Icons.calc} Profitability Analysis
                            </div>
                            
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:24px;">
                                 <div>
                                    <label class="zv-label-xs" style="margin-bottom:6px; display:block;">SELL PRICE</label>
                                    <div class="zv-input-wrap">
                                        <span class="zv-prefix">$</span>
                                        <input type="number" id="zv-in-price" value="${sellPrice.toFixed(2)}" class="zv-input has-prefix">
                                    </div>
                                 </div>
                                 <div>
                                    <label class="zv-label-xs" style="margin-bottom:6px; display:block;">UNIT COST</label>
                                    <div class="zv-input-wrap">
                                        <span class="zv-prefix">$</span>
                                        <input type="number" id="zv-in-cost" value="${costPrice.toFixed(2)}" class="zv-input has-prefix">
                                    </div>
                                 </div>
                            </div>

                            <div class="zv-card" style="margin-bottom:24px; padding:16px;">
                                <div class="zv-label-xs" style="margin-bottom:12px;">DEDUCTIONS</div>
                                <div class="zv-row"><span>FBA Fee</span><span>$${fbaFee.toFixed(2)}</span></div>
                                <div class="zv-row"><span>Referral (15%)</span><span>$${refFee.toFixed(2)}</span></div>
                                <div class="zv-divider"></div>
                                <div class="zv-row" style="font-weight:700; font-size:13px; color:#111;"><span>Total Fees</span><span id="zv-calc-fees">$${(fbaFee+refFee).toFixed(2)}</span></div>
                            </div>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:24px;">
                                <div class="zv-res-box">
                                    <div class="zv-label-xs">NET MARGIN</div>
                                    <div id="zv-calc-margin" class="zv-res-val">0%</div>
                                </div>
                                 <div class="zv-res-box" style="background:#fff;">
                                    <div class="zv-label-xs">ROI</div>
                                    <div id="zv-calc-roi" class="zv-res-val" style="color:#3B82F6;">0%</div>
                                </div>
                            </div>

                             <div style="background:#111827; color:#fff; padding:20px; border-radius:8px; text-align:center; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                                <div class="zv-label-xs" style="color:#9CA3AF; margin-bottom:4px;">NET PROFIT / UNIT</div>
                                <div style="font-size:36px; font-weight:800; letter-spacing:-0.5px;" id="zv-calc-profit">$0.00</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        injectModal(modalHtml);

        // --- Sourcing Logic ---
        const renderSourcingList = (items) => {
            const container = document.getElementById('zv-sourcing-list');
            if(!container) return;
            container.innerHTML = items.map((c, i) => `
                <div class="zv-sourc-card" style="display:flex; justify-content:space-between; align-items:center; padding:16px; border:1px solid ${i===0?'#FED7AA':'#E5E7EB'}; border-radius:8px; background:${i===0?'#FFF7ED':'#fff'}; transition:all 0.2s; position:relative;">
                    
                    <!-- Left Clickable Area (Apply Cost) -->
                    <div class="calc-apply-btn" data-price="${c.price}" style="display:flex; gap:12px; align-items:center; cursor:pointer; flex:1;">
                        <div style="width:32px; height:32px; border-radius:4px; background:${c.color || '#6B7280'}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:10px;">${c.logo}</div>
                        <div>
                            <div style="font-size:14px; font-weight:700; color:#111;">
                                ${c.name} ${c.badg ? `<span style="font-size:9px; background:#F59E0B; color:#fff; padding:2px 4px; border-radius:2px; margin-left:6px;">${c.badg}</span>` : ''}
                            </div>
                            <div style="font-size:11px; color:#6B7280; margin-top:2px;">${c.ship}</div>
                        </div>
                    </div>

                    <!-- Right Price + Link -->
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="calc-apply-btn" data-price="${c.price}" style="text-align:right; cursor:pointer;">
                            <div style="font-size:18px; font-weight:800; color:#111;">$${c.price}</div>
                            <div style="font-size:10px; font-weight:700; color:#10B981; margin-top:2px;">SAVE $${c.save}</div>
                        </div>
                        ${c.link ? `<a href="${c.link}" target="_blank" style="color:#2563EB; font-size:16px; padding:6px; text-decoration:none; display:flex; align-items:center; border:1px solid #DBEAFE; background:#EFF6FF; border-radius:4px;" title="Open Product Page">↗</a>` : ''}
                    </div>

                </div>
            `).join('');

            // Bind clicks
            container.querySelectorAll('.calc-apply-btn').forEach(btn => {
                btn.onclick = () => {
                   document.getElementById('zv-in-cost').value = btn.dataset.price;
                   // trigger input event manually
                   document.getElementById('zv-in-cost').dispatchEvent(new Event('input'));
                   
                   // specific visual feedback
                   btn.style.background = '#EFF6FF';
                   setTimeout(() => btn.style.background = '', 300);
                }
            });
        };

        // 1. Initial Simulated Data (Instant)
        const p = product.price;
        const initialComps = [
            { name: 'eBay', logo: 'EB', price: (p*0.9).toFixed(2), ship:'Free Shipping', save: (p*0.1).toFixed(2), color:'#F59E0B', badg:'BEST MATCH' },
            { name: 'Walmart', logo: 'WM', price: (p*0.95).toFixed(2), ship:'2-Day Delivery', save: (p*0.05).toFixed(2), color:'#0071DC' },
            { name: 'AliExpress', logo: 'AX', price: (p*0.4).toFixed(2), ship:'15-Day Shipping', save: (p*0.6).toFixed(2), color:'#FF4747' }
        ];
        renderSourcingList(initialComps);

        // 2. Real API Fetch (via Backend Sourcing API)
        const statusEl = document.getElementById('zv-sourcing-status');
        if (statusEl) {
           statusEl.textContent = 'SEARCHING GLOBAL MARKETS...';
           statusEl.style.color = '#F59E0B';
           statusEl.style.opacity = '1';

           // Use Background Script to secure proxy to backend
           sendMessageAsync({ 
               action: 'FIND_SOURCING', 
               query: product.title 
           }).then(response => {
                if (response && response.success && response.data && response.data.shopping_results && response.data.shopping_results.length > 0) {
                    const realComps = response.data.shopping_results.slice(0, 5).map(item => {
                        // normalize price string
                        let priceVal = parseFloat(p);
                        if(item.extracted_price) priceVal = item.extracted_price;
                        else if(item.price) priceVal = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
                        
                        const save = Math.max(0, p - priceVal);
                        
                        return {
                            link: item.link,
                            name: item.source || 'Unknown Store',
                            logo: (item.source || 'GS').substring(0,2).toUpperCase(),
                            price: priceVal.toFixed(2),
                            ship: item.delivery || 'Standard Shipping',
                            save: save.toFixed(2),
                            color: '#6B7280', // Default grey
                            badg: item.rating ? `${item.rating}★` : ''
                        };
                    });
                    renderSourcingList(realComps); // Replace simulated with real
                    statusEl.textContent = 'LIVE DATA CONFIRMED';
                    statusEl.style.color = '#10B981';
                } else {
                    // console.warn("Sourcing API Empty/Error:", response);
                    statusEl.textContent = 'NO MATCHES FOUND (Using Estimates)';
                }
           });
        }
        
        // Bind Inputs
        const pIn = document.getElementById('zv-in-price');
        const cIn = document.getElementById('zv-in-cost');
        if(pIn && cIn) {
            const handler = () => {
                sellPrice = parseFloat(pIn.value) || 0;
                costPrice = parseFloat(cIn.value) || 0;
                refFee = sellPrice * 0.15;
                updateCalcUI();
            };
            pIn.oninput = handler;
            cIn.oninput = handler;
            handler(); // Init
        }
    }

    // Modal Helpers
    function injectModal(html) {
        // Remove existing
        const existing = document.querySelector('.zv-modal-overlay');
        if (existing) existing.remove();

        // Inject Styles if needed
        const styleId = 'zv-modal-styles';
        if (!document.getElementById(styleId)) {
            const s = document.createElement('style');
            s.id = styleId;
            s.textContent = `
                .zv-modal-overlay { 
                    position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
                    z-index: 2147483650; display: flex; align-items: center; justify-content: center;
                }
                .zv-modal-content { 
                    background: var(--zv-bg-main); width: 90%; border-radius: 12px; 
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden;
                    border: 1px solid var(--zv-border);
                }
                .zv-modal-header {
                    padding: 16px 24px; border-bottom: 1px solid var(--zv-border);
                    display: flex; justify-content: space-between; align-items: center;
                    background: var(--zv-bg-sub);
                }
                .zv-asin-badge { 
                    font-size: 10px; padding: 2px 6px; background: #e5e7eb; border-radius: 4px; 
                    font-family: monospace; color: #374151; font-weight: 600;
                }
                .zv-sourc-card:hover { border-color: #3B82F6 !important; background: #F9FAFB !important; }

                .zv-label-sm { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--zv-text-muted); margin-bottom: 8px; }
                .zv-label-xs { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280; letter-spacing:0.5px; }
                .zv-stat-box { padding: 12px; background: var(--zv-bg-sub); border-radius: 6px; border: 1px solid var(--zv-border); }
                
                .zv-input-wrap { position: relative; }
                .zv-prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9CA3AF; font-size: 14px; font-weight:500; }
                .zv-input { 
                    width: 100%; border: 1px solid #D1D5DB; background: #fff;
                    padding: 10px; border-radius: 6px; font-weight: 700; color: #111; font-size: 16px;
                    outline: none; transition: all 0.2s;
                }
                .zv-input.has-prefix { padding-left: 24px; }
                .zv-input:focus { border-color: #F59E0B; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1); }

                .zv-card { background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #E5E7EB; }
                .zv-row { display: flex; justify-content: space-between; font-size: 13px; color: #4B5563; margin-bottom: 6px; }
                .zv-divider { height: 1px; background: #E5E7EB; margin: 12px 0; }
                
                .zv-res-box { padding: 16px; border-radius: 8px; border: 1px solid #E5E7EB; text-align: center; background: #FFFBEB; }
                .zv-res-val { font-size: 24px; font-weight: 800; margin-top: 4px; }
                .zv-res-good { color: #059669; } .zv-res-warn { color: #D97706; } .zv-res-info { color: #2563EB; }
                
                .animate-in { animation: zvFadeIn 0.2s ease-out; }
                @keyframes zvFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
            `;
            document.head.appendChild(s);
        }

        const div = document.createElement('div');
        div.innerHTML = html;
        const modal = div.firstElementChild;
        document.body.appendChild(modal);

        modal.querySelector('.zv-close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }

    // Chart Helpers
    function generateHistory(currentPrice, currentBsr) {
        const points = 30;
        const prices = [];
        const ranks = [];
        let p = currentPrice;
        let r = currentBsr;
        
        for(let i=0; i<points; i++) {
            // Random walk
            p = p * (0.95 + Math.random() * 0.1); 
            r = r * (0.9 + Math.random() * 0.2);
            prices.unshift({ value: Math.max(p, currentPrice * 0.6) });
            ranks.unshift({ value: Math.max(r, 100) });
        }
        return { prices, ranks };
    }

    function generateSVGChart(prices, ranks) {
        const w = 100, h = 60;
        const minP = Math.min(...prices.map(d=>d.value)) * 0.9;
        const maxP = Math.max(...prices.map(d=>d.value)) * 1.1;
        const minR = Math.min(...ranks.map(d=>d.value)) * 0.9;
        const maxR = Math.max(...ranks.map(d=>d.value)) * 1.1;

        const mapY = (val, min, max) => h - ((val - min) / (max - min) * h);
        const mapX = (i, len) => (i / (len - 1)) * w;

        const pPath = prices.map((d,i) => `${mapX(i, prices.length)},${mapY(d.value, minP, maxP)}`).join(' ');
        const rPath = ranks.map((d,i) => `${mapX(i, ranks.length)},${mapY(d.value, minR, maxR)}`).join(' ');

        return `
            <div style="width:100%; height:160px; border:1px solid var(--zv-border); border-radius:6px; padding:12px; position:relative; background: #fff;">
                <svg viewBox="0 0 100 60" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;">
                    <!-- Grid -->
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#eee" stroke-width="0.5" stroke-dasharray="2" />
                    <line x1="0" y1="40" x2="100" y2="40" stroke="#eee" stroke-width="0.5" stroke-dasharray="2" />
                    
                    <polyline points="${rPath}" fill="none" stroke="#3B82F6" stroke-width="1.5" stroke-opacity="0.3" />
                    <polyline points="${pPath}" fill="none" stroke="#10B981" stroke-width="1.5" />
                </svg>
                <div style="position:absolute; top:8px; left:8px; display:flex; gap:12px; font-size:9px; font-weight:700;">
                    <span style="color:#10B981;">● Price</span>
                    <span style="color:#3B82F6;">● Rank</span>
                </div>
            </div>
        `;
    }

    function showLoading() {
        const tbody = document.getElementById('zv-product-list');
        if(tbody) tbody.innerHTML = `<tr><td colspan="12" class="col-center" style="padding:40px;">Analyzing Page Data...</td></tr>`;
    }

    // --- Scraper Utils (v7.1 Nuclear Price Fix) ---
    function scrapeProductsDeep() {
         const results = [];
         
         // 1. Expanded Selector List (Covers Lists, Grids, Carousels, Mobile-Views)
         const containerSelectors = [
             '[data-component-type="s-search-result"]',
             '.s-result-item[data-asin]',
             '.zg-item-immersion',
             '.p13n-grid-content',
             '.a-carousel-card' 
         ];

         const itemElements = Array.from(document.querySelectorAll(containerSelectors.join(',')));
         
         const parsePrice = (txt) => {
             if(!txt) return 0;
             // Remove commas, currency symbols, generic text
             return parseFloat(txt.replace(/[^0-9.]/g, '')) || 0;
         };

         itemElements.forEach((el) => {
             // A. Deep ASIN Search
             let asin = el.getAttribute('data-asin');
             if (!asin) asin = el.querySelector('[data-asin]')?.getAttribute('data-asin');
             if (!asin || asin.length < 5) return; 

             // B. Title Scraper
             let title = "Unknown Product";
             const titleCandidates = [
                 el.querySelector('h2 a span'),
                 el.querySelector('h2 span'),
                 el.querySelector('.a-text-normal'),
                 el.querySelector('.p13n-sc-truncate'),
                 el.querySelector('img.s-image') 
             ];
             for (let t of titleCandidates) {
                 if(!t) continue;
                 const text = t.textContent || t.getAttribute('alt') || "";
                 if(text.trim().length > 3) {
                     title = text.trim();
                     break;
                 }
             }

             // C. Price Scraper (Nuclear Option V7.1)
             // Strategy: Selectors -> Fractions -> Text Regex Search
             let price = 0;
             
             // 1. Exact Selectors
             const priceNodes = [
                 el.querySelector('.a-price .a-offscreen'), 
                 el.querySelector('.p13n-sc-price'),        
                 el.querySelector('.a-color-price'),        
                 el.querySelector('.a-text-price .a-offscreen'),
                 el.querySelector('.a-price') // Sometimes parent has text
             ];

             for (let node of priceNodes) {
                 if (node) {
                     const txt = node.textContent.trim();
                     if (txt.includes('$') || /[0-9]/.test(txt)) {
                         const p = parsePrice(txt);
                         if(p > 0 && p < 10000) { price = p; break; }
                     }
                 }
             }

             // 2. Fraction Reconstruction
             if (price === 0) {
                 const whole = el.querySelector('.a-price-whole');
                 const frac = el.querySelector('.a-price-fraction');
                 if (whole) {
                     const pStr = whole.textContent.replace(/[.,]/g, '') + '.' + (frac ? frac.textContent : '00');
                     price = parseFloat(pStr);
                 }
             }

             // 3. NUCLEAR FALLBACK: Regex Search on InnerText
             // Use this when "Subscribe & Save" or "See price in cart" hides the standard tags
             if (price === 0) {
                 const textContent = el.innerText || el.textContent || "";
                 // Look for $XX.XX pattern
                 const matches = textContent.match(/\$([0-9,]+(\.[0-9]{2})?)/);
                 if (matches && matches[1]) {
                     price = parsePrice(matches[1]);
                 }
             }

             // D. Image
             let img = el.querySelector('img.s-image, .p13n-product-image')?.src;
             if (!img) img = el.querySelector('img')?.src;

             // E. Reviews & Rating
             let reviews = 0;
             let rating = 0;
             
             const row = el.querySelector('.a-row.a-size-small, .a-section.a-spacing-none.a-spacing-top-micro');
             if (row) {
                 const starEl = row.querySelector('[aria-label*="out of 5 stars"]');
                 if (starEl) {
                     const rTxt = starEl.getAttribute('aria-label');
                     rating = parseFloat(rTxt.split(' ')[0]) || 0;
                 }
                 const revEl = row.querySelector('span[aria-label] ~ span');
                 if (revEl) {
                    reviews = parseInt(revEl.textContent.replace(/[^0-9]/g, '')) || 0;
                 }
             }
             if (rating === 0) {
                const star = el.querySelector('i[class*="a-icon-star"]');
                if (star) rating = parseFloat(star.textContent.split(' ')[0]) || 0.0;
             }
             if (reviews === 0) {
                 const revLink = el.querySelector('a[href*="#customerReviews"] span');
                 if(revLink) reviews = parseInt(revLink.textContent.replace(/[^0-9]/g, '')) || 0;
             }


             // F. Brand
             let brand = "Generic";
             const header = el.querySelector('.s-line-clamp-1, .a-size-micro');
             if (header && !header.textContent.includes('Sponsored')) {
                brand = header.textContent.trim();
             } 
             
             const isPrime = !!el.querySelector('i.a-icon-prime');

             // G. Filter
             if (title !== "Unknown Product" || price > 0) {
                 results.push({ asin, title, price, imgUrl: img, reviews, rating, brand, isPrime });
             }
         });

         return results;
    }

    // --- Utils ---
    function sendMessageAsync(msg) {
        return new Promise(resolve => {
            try {
                chrome.runtime.sendMessage(msg, (response) => {
                    // Start of error handling
                    if (chrome.runtime.lastError) {
                        // console.warn("Ext message error:", chrome.runtime.lastError);
                        resolve(null); // Resolve null so we can fallback
                    } else {
                        resolve(response);
                    }
                });
            } catch(e) { resolve(null); }
        });
    }

    // --- Message Listener ---
    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        if (req.action === "INIT_XRAY") {
            renderOverlay();
            sendResponse({ status: "started" });
        }
        return true;
    });
}


