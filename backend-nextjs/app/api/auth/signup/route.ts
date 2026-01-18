
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      email, 
      password, 
      role, 
      referralCode, 
      instituteName, 
      instituteLocation 
    } = body;

    // 1. Validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 3. Hash Password (SHA-256)
    const passwordHash = createHash('sha256').update(password).digest('hex');

    // 4. Handle Referral Logic (If user signed up with a code)
    let usedCode = null;
    let referrerId = null;

    if (referralCode && role === 'user') {
        const referrer = await prisma.user.findFirst({ 
            where: { 
                activeReferralCode: referralCode
            } 
        });

        // Basic check: Ensure code exists. In production, check expiry time vs Date.now()
        if (referrer) {
            usedCode = referralCode;
            referrerId = referrer.id;
        }
    }

    // 5. Create New User
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'user',
        isApproved: role === 'user', // Users auto-approved, Trainers need manual approval
        instituteName: role === 'trainer' ? instituteName : null,
        instituteLocation: role === 'trainer' ? instituteLocation : null,
        usedReferralCode: usedCode,
        walletBalance: 0,
        referralCount: 0,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days Trial
        referralLink: `https://exzakvibe.com/join/${createHash('md5').update(email).digest('hex').substring(0,8)}`
      }
    });

    // 6. Process Commission if Referrer Exists
    if (referrerId && usedCode) {
        await prisma.$transaction([
            // Credit Referrer Wallet (300 PKR)
            prisma.user.update({
                where: { id: referrerId },
                data: { 
                    walletBalance: { increment: 300 },
                    referralCount: { increment: 1 }
                }
            }),
            // Log Referral
            prisma.referral.create({
                data: {
                    referrerId: referrerId,
                    name: newUser.name,
                    date: new Date().toISOString().split('T')[0],
                    status: 'Completed',
                    commission: 300
                }
            }),
            // Log Transaction
            prisma.transaction.create({
                data: {
                    userId: referrerId,
                    type: 'Commission',
                    amount: 300,
                    status: 'Completed',
                    date: new Date().toISOString()
                }
            })
        ]);
    }

    // 7. Return safe user object
    return NextResponse.json({ 
        success: true, 
        user: { 
            id: newUser.id, 
            email: newUser.email, 
            role: newUser.role,
            isApproved: newUser.isApproved 
        } 
    });

  } catch (error: any) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
