const API_URL = "http://localhost:5001/api";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Auth State
    chrome.storage.local.get(['token', 'user'], (res) => {
        if (res.token && res.user) {
            showMain(res.user);
        } else {
            showAuth();
        }
    });

    // 2. Tab Check
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const url = tabs[0]?.url || "";
        const btnXray = document.getElementById('btn-xray');
        const status = document.getElementById('status');
        
        if (url.includes('amazon.com') || url.includes('amazon.co.uk') || url.includes('amazon.de')) {
            btnXray.disabled = false;
            status.innerText = "Online";
            status.className = "status-badge status-online";
        } else {
            status.innerText = "No Amazon";
            status.style.background = "#fee2e2";
            status.style.color = "#991b1b";
            status.className = "status-badge status-offline";
        }
    });

    // 3. Login
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
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || data.error || 'Login failed');

            const userData = data.data.user;
            const token = data.data.token;

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

    // 4. Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        chrome.storage.local.clear(() => {
            document.getElementById('email').value = "";
            document.getElementById('password').value = "";
            showAuth();
        });
    });

    // 5. LAUNCH XRAY (Improved with Auto-Injection)
    document.getElementById('btn-xray').addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if(tab && tab.id) {
            const btn = document.getElementById('btn-xray');
            btn.innerText = "Launching...";
            
            try {
                // Try sending message first
                await chrome.tabs.sendMessage(tab.id, { action: "INIT_XRAY" });
                window.close();
            } catch (e) {
                // If it fails (receiving end does not exist), inject the script manually
                console.log("Receiver not found. Injecting content script manually...");
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                    
                    // Give script a moment to init listener
                    setTimeout(() => {
                        chrome.tabs.sendMessage(tab.id, { action: "INIT_XRAY" });
                        window.close();
                    }, 500); // 500ms delay to be safe
                } catch (injectErr) {
                    console.error("Injection failed", injectErr);
                    btn.innerText = "Error";
                    alert("Please refresh the Amazon page and try again.");
                }
            }
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
}
