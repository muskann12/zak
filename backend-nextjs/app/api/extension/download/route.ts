
import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { verifyJWT } from '@/lib/auth';

// This endpoint generates a unique extension ZIP for the user
// It embeds the user's API Token directly into the extension background script
export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  
  // Verify User Requesting Download
  const session = token ? await verifyJWT(token) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const zip = new JSZip();

  // 1. Manifest
  const manifest = {
    "manifest_version": 3,
    "name": "Ex-ZakVibe PRO (Personalized)",
    "version": "5.0",
    "permissions": ["storage", "activeTab", "scripting"],
    "host_permissions": ["*://*.amazon.com/*"],
    "background": { "service_worker": "background.js" },
    "action": { "default_popup": "popup.html" }
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  // 2. Background Script with EMBEDDED TOKEN
  // This is the critical security feature: The extension knows who downloaded it
  const backgroundJs = `
    const USER_TOKEN = "${token}"; 
    const API_URL = "http://localhost:3000/api";

    chrome.runtime.onInstalled.addListener(() => {
      chrome.storage.local.set({ authToken: USER_TOKEN });
      console.log('Ex-ZakVibe Authorized for user ID: ${session.id}');
    });
  `;
  zip.file("background.js", backgroundJs);

  // 3. Popup HTML (Minimal, relies on Token)
  zip.file("popup.html", `<h1>Ex-ZakVibe Active</h1><p>Logged in as: ${session.email}</p>`);

  // Generate Buffer
  const content = await zip.generateAsync({ type: 'nodebuffer' });

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=ex_zakvibe_pro.zip'
    }
  });
}
