import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../auth/middleware';
import JSZip from 'jszip';

const prisma = new PrismaClient();

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { 
        referrals: true, 
        transactions: { take: 10, orderBy: { createdAt: 'desc' } } 
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Calculate stats
    const totalCommission = user.transactions
        .filter(t => t.type === 'COMMISSION')
        .reduce((sum, t) => sum + t.amount, 0);

    res.json({ 
        wallet: user.walletBalance,
        referralCount: user.referralCount,
        lifetimeEarnings: totalCommission,
        recentActivity: user.referrals
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

export const downloadExtension = async (req: AuthRequest, res: Response) => {
    // REAL LOGIC: Generate Custom Extension with Embedded JWT
    const token = (req as any).headers?.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({error: "No Token"});

    const zip = new JSZip();
    
    // Add Manifest
    zip.file("manifest.json", JSON.stringify({
        name: "Ex-ZakVibe PRO (Licensed)",
        version: "2.0",
        manifest_version: 3,
        permissions: ["storage", "activeTab", "scripting"],
        background: { service_worker: "background.js" }
    }));

    // Inject User Token into Background Script
    const bgScript = `
        const USER_TOKEN = "${token}";
        chrome.runtime.onInstalled.addListener(() => {
            chrome.storage.local.set({ authToken: USER_TOKEN });
            console.log("License Activated");
        });
    `;
    zip.file("background.js", bgScript);

    // Generate
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=ex_zakvibe_licensed.zip');
    res.send(content);
};