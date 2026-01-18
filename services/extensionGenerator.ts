import JSZip from 'jszip';

export const generateExtensionZip = async () => {
  const zip = new JSZip();

  // 1. Manifest.json
  const manifest = {
    "manifest_version": 3,
    "name": "ZakVibe Pro Xray",
    "version": "1.0.0",
    "description": "Professional Amazon Product Research Tool. Connects to ZakVibe Backend.",
    "permissions": [
      "storage",
      "activeTab",
      "scripting"
    ],
    "host_permissions": [
      "*://*.amazon.com/*",
      "*://*.amazon.co.uk/*",
      "*://*.amazon.de/*",
      "http://localhost:5001/*"
    ],
    "action": {
      "default_popup": "popup.html"
    },
    "background": {
      "service_worker": "background.js"
    },
    "content_scripts": [
      {
        "matches": ["*://*.amazon.com/*", "*://*.amazon.co.uk/*", "*://*.amazon.de/*"],
        "js": ["content.js"]
      }
    ]
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 2. CSS (For Popup Only)
  const stylesCss = `/* POPUP STYLES ONLY */
body {
    width: 340px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f3f4f6;
    color: #1f2937;
}

.header {
    background: #fff;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-weight: 800;
    font-size: 16px;
    color: #111;
}

.highlight {
    color: #FF9900;
}

.status-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
    text-transform: uppercase;
}

.status-offline { background: #fee2e2; color: #991b1b; }
.status-online { background: #d1fae5; color: #065f46; }

#auth-view, #main-view {
    padding: 20px;
}

h3 {
    margin-top: 0;
    font-size: 18px;
    margin-bottom: 15px;
}

input {
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    box-sizing: border-box;
    font-size: 13px;
}

button {
    width: 100%;
    padding: 12px;
    border: none;
    background: #FF9900;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
    font-size: 13px;
    transition: background 0.2s;
}

button:hover:not(:disabled) {
    background: #e68a00;
}

button:disabled {
    background: #d1d5db;
    cursor: not-allowed;
}

.link-btn {
    background: none;
    color: #6b7280;
    text-decoration: underline;
    font-size: 12px;
    margin-top: 10px;
    padding: 0;
    width: auto;
    display: inline-block;
}

.error {
    color: #dc2626;
    font-size: 12px;
    margin-top: 10px;
    font-weight: 500;
}

.user-panel {
    background: white;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-bottom: 16px;
    font-size: 12px;
}

.action-card {
    background: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    text-align: center;
}

.action-card p {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 16px;
}`;
  zip.file("styles.css", stylesCss);

  // 3. Popup HTML
  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="header">
      <div class="logo">ZakVibe <span class="highlight">PRO</span></div>
      <div id="status" class="status-badge status-offline">Not Connected</div>
  </div>
  
  <div id="auth-view">
      <h3>Welcome Back</h3>
      <input type="email" id="email" placeholder="Email Address" />
      <input type="password" id="password" placeholder="Password" />
      <button id="btn-login">Sign In</button>
      <div id="error-msg" class="error"></div>
  </div>

  <div id="main-view" style="display:none;">
      <div class="user-panel">
          <div>Logged in as:</div>
          <strong id="user-email" style="display:block; margin-bottom:5px;">...</strong>
          <button id="btn-logout" class="link-btn">Logout</button>
      </div>
      
      <div class="action-card">
          <p>Go to an Amazon search results page to enable Xray analysis.</p>
          <button id="btn-xray" disabled>Launch Xray</button>
      </div>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;
  zip.file("popup.html", popupHtml);

  // 4. Popup JS
  const popupJs = `const API_URL = "http://localhost:5001/api";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Auth State from Local Storage
    chrome.storage.local.get(['token', 'user'], (res) => {
        if (res.token && res.user) {
            showMain(res.user);
        } else {
            showAuth();
        }
    });

    // 2. Check active tab to enable/disable Xray button
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const url = tabs[0]?.url || "";
        const btnXray = document.getElementById('btn-xray');
        const status = document.getElementById('status');
        
        if (url.includes('amazon.com') || url.includes('amazon.co.uk') || url.includes('amazon.de')) {
            btnXray.disabled = false;
            status.innerText = "Ready";
            status.className = "status-badge status-online";
        } else {
            status.innerText = "No Amazon";
            status.className = "status-badge status-offline";
        }
    });

    // 3. Login Handler
    document.getElementById('btn-login').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById('btn-login');
        const errorMsg = document.getElementById('error-msg');

        if(!email || !password) return;

        btn.disabled = true;
        btn.innerText = "Verifying...";
        errorMsg.innerText = "";

        try {
            const res = await fetch(\`\${API_URL}/auth/login\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || data.error || 'Login failed');

            // Extract from standard API response wrapper
            const userData = data.data.user;
            const token = data.data.token;

            // Save Token securely
            chrome.storage.local.set({ token: token, user: userData }, () => {
                showMain(userData);
            });
        } catch (err) {
            errorMsg.innerText = err.message || "Connection failed";
        } finally {
            btn.disabled = false;
            btn.innerText = "Sign In";
        }
    });

    // 4. Logout Handler
    document.getElementById('btn-logout').addEventListener('click', () => {
        chrome.storage.local.clear(() => {
            document.getElementById('email').value = "";
            document.getElementById('password').value = "";
            showAuth();
        });
    });

    // 5. Launch Xray
    document.getElementById('btn-xray').addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if(tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: "INIT_XRAY" });
            window.close();
        }
    });
});

function showAuth() {
    document.getElementById('auth-view').style.display = 'block';
    document.getElementById('main-view').style.display = 'none';
}

function showMain(user) {
    document.getElementById('auth-view').style.display = 'none';
    document.getElementById('main-view').style.display = 'block';
    document.getElementById('user-email').innerText = user.email;
}`;
  zip.file("popup.js", popupJs);

  // 5. Background JS
  const backgroundJs = `chrome.runtime.onInstalled.addListener(() => {
    console.log("ZakVibe Pro Extension Installed");
});`;
  zip.file("background.js", backgroundJs);

  // 6. Content Script
  const contentJs = `const API_URL = "http://localhost:5001/api";

// 1. Inject Styles Dynamically (To avoid manifest CSS issues)
const style = document.createElement('style');
style.textContent = \`
    #zakvibe-overlay {
        position: fixed; bottom: 20px; right: 20px; width: 350px;
        background: white; border-radius: 8px; z-index: 2147483647;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-family: sans-serif;
        border: 1px solid #e5e7eb; overflow: hidden; display: flex; flex-direction: column;
        animation: zv-slide-in 0.3s ease-out;
    }
    @keyframes zv-slide-in { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .zv-header {
        background: #232f3e; color: white; padding: 12px 16px;
        font-weight: bold; font-size: 14px; display: flex; justify-content: space-between;
        align-items: center;
    }
    .zv-close { cursor: pointer; opacity: 0.8; }
    .zv-close:hover { opacity: 1; }
    .zv-content { padding: 0; max-height: 400px; overflow-y: auto; background: #f9fafb; }
    .zv-row {
        background: white; padding: 12px; border-bottom: 1px solid #eee;
        display: flex; justify-content: space-between; align-items: center;
    }
    .zv-row:last-child { border-bottom: none; }
    .zv-title { font-size: 12px; color: #333; width: 60%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .zv-price { font-weight: bold; font-size: 12px; color: #111; }
    .zv-loading { padding: 20px; text-align: center; color: #666; font-size: 13px; }
    .zv-summary { padding: 12px; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #555; }
    .zv-val { color: #10b981; }
\`;
document.head.appendChild(style);

// 2. Message Listener
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "INIT_XRAY") {
        runXray();
    }
});

async function runXray() {
    showOverlay("Initializing...", null);

    // Scrape Data
    const products = [];
    document.querySelectorAll('[data-component-type="s-search-result"]').forEach(el => {
        const asin = el.getAttribute('data-asin');
        const titleEl = el.querySelector('h2 a span');
        const priceWhole = el.querySelector('.a-price-whole');
        const priceFraction = el.querySelector('.a-price-fraction');
        
        if (asin && titleEl && priceWhole) {
            const price = parseFloat(\`\${priceWhole.innerText}.\${priceFraction ? priceFraction.innerText : '00'}\`);
            // Mock BSR for demo purposes as it requires deeper DOM scraping
            const bsr = Math.floor(Math.random() * 50000) + 500; 
            
            products.push({
                asin,
                title: titleEl.innerText,
                price,
                bsr,
                category: "General" 
            });
        }
    });

    if (products.length === 0) {
        showOverlay("No products found on this page.", null);
        return;
    }

    showOverlay(\`Analyzing \${products.length} products...\`, null);

    // Get Token & Call Backend
    chrome.storage.local.get(['token'], async (res) => {
        if (!res.token) {
            showOverlay("Error: Please log in via the extension popup.", null);
            return;
        }

        try {
            const response = await fetch(\`\${API_URL}/xray/analyze\`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${res.token}\`
                },
                body: JSON.stringify({ rawItems: products })
            });

            if (!response.ok) throw new Error("Analysis failed");
            
            const result = await response.json();
            showOverlay(null, result.data);

        } catch (e) {
            showOverlay("Server Connection Error.", null);
            console.error(e);
        }
    });
}

function showOverlay(status, data) {
    const existing = document.getElementById('zakvibe-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'zakvibe-overlay';

    let contentHtml = '';

    if (status) {
        contentHtml = \`<div class="zv-loading">\${status}</div>\`;
    } else if (data) {
        const totalRev = data.reduce((acc, curr) => acc + curr.revenue, 0);
        
        contentHtml += \`
            <div class="zv-summary">
                <span>Est. Revenue</span>
                <span class="zv-val">$\${totalRev.toLocaleString()}</span>
            </div>
            <div class="zv-content">
        \`;
        
        data.forEach(p => {
            contentHtml += \`
                <div class="zv-row">
                    <div class="zv-title" title="\${p.title}">\${p.title}</div>
                    <div class="zv-price">$\${p.revenue.toLocaleString()}</div>
                </div>
            \`;
        });
        
        contentHtml += \`</div>\`;
    }

    overlay.innerHTML = \`
        <div class="zv-header">
            <span>ZakVibe Xray</span>
            <span class="zv-close" id="zv-close-btn">✕</span>
        </div>
        \${contentHtml}
    \`;

    document.body.appendChild(overlay);
    document.getElementById('zv-close-btn').onclick = () => overlay.remove();
}`;
  zip.file("content.js", contentJs);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ExZakVibe_PRO_Extension.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};